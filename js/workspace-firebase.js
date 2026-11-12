import {
  DEFAULT_SESSION_CODE,
  normalizeSessionCode,
  buildValidatedSyncPayload,
  shouldApplyRemoteSlideUpdate,
  buildAudienceShareUrl,
  parseSyncParamsFromSearch
} from './audience-sync-logic.mjs';
import { WORKSPACE_SCOPES } from './google-slides-logic.mjs';

const REVISIONS_STORAGE_KEY = 'three-powers-revisions-v1';
const LEGACY_KEYS = [
  'whose-liberty-edits-v2',
  'whose-liberty-edits-v1',
  'whose-liberty-revisions-v1'
];

let app = null;
let db = null;
let rtdb = null;
let auth = null;
let fbFirestoreMod = null;
let fbRtdbMod = null;
let fbAuthMod = null;
let ensureFirebaseBootFn = null;

// Strictly in-memory OAuth access token cache for Google Workspace APIs (NEVER stored in localStorage/sessionStorage)
let isSigningInWorkspace = false;
let cachedWorkspaceAccessToken = null;
const workspaceAuthListeners = new Set();

function notifyWorkspaceAuthListeners() {
  const user = auth?.currentUser || null;
  const snapshot = {
    user,
    accessToken: cachedWorkspaceAccessToken,
    needsAuth: !user || !cachedWorkspaceAccessToken
  };
  workspaceAuthListeners.forEach((fn) => {
    try {
      fn(snapshot);
    } catch (e) {}
  });
}

export async function ensureFirebaseReady() {
  if (typeof ensureFirebaseBootFn === 'function') {
    await ensureFirebaseBootFn();
  }
  return { app, auth, db, rtdb };
}

export function subscribeWorkspaceAuth(listener) {
  if (typeof listener !== 'function') return () => {};
  workspaceAuthListeners.add(listener);
  listener({
    user: auth?.currentUser || null,
    accessToken: cachedWorkspaceAccessToken,
    needsAuth: !auth?.currentUser || !cachedWorkspaceAccessToken
  });
  return () => workspaceAuthListeners.delete(listener);
}

export async function getWorkspaceAccessToken() {
  return cachedWorkspaceAccessToken;
}

export function clearWorkspaceAccessToken() {
  cachedWorkspaceAccessToken = null;
  notifyWorkspaceAuthListeners();
}

export async function googleWorkspaceSignIn() {
  await ensureFirebaseReady();
  if (!auth || !fbAuthMod) {
    throw new Error('Firebase Authentication is not available. Check your network connection.');
  }
  try {
    isSigningInWorkspace = true;
    const provider = new fbAuthMod.GoogleAuthProvider();
    WORKSPACE_SCOPES.forEach((scope) => provider.addScope(scope));
    provider.setCustomParameters({ prompt: 'consent' });
    const result = await fbAuthMod.signInWithPopup(auth, provider);
    const credential = fbAuthMod.GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Sign-In completed without returning a Workspace OAuth access token.');
    }
    cachedWorkspaceAccessToken = credential.accessToken;
    notifyWorkspaceAuthListeners();
    return { user: result.user, accessToken: cachedWorkspaceAccessToken };
  } finally {
    isSigningInWorkspace = false;
  }
}

export async function workspaceSignOut() {
  await ensureFirebaseReady();
  cachedWorkspaceAccessToken = null;
  if (auth && fbAuthMod) {
    await fbAuthMod.signOut(auth);
  }
  notifyWorkspaceAuthListeners();
}

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write'
};

export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid ?? null,
      email: auth?.currentUser?.email ?? null,
      emailVerified: auth?.currentUser?.emailVerified ?? null,
      isAnonymous: auth?.currentUser?.isAnonymous ?? null,
      tenantId: auth?.currentUser?.tenantId ?? null,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function sanitizeEditsMap(rawEdits) {
  const clean = {};
  if (!rawEdits || typeof rawEdits !== 'object') return clean;
  const keys = Object.keys(rawEdits).slice(0, 100);
  for (const k of keys) {
    if (typeof rawEdits[k] === 'string') {
      clean[k] = rawEdits[k].slice(0, 4000);
    }
  }
  return clean;
}

export function showConfirmDialog({ title, message, confirmLabel = 'Confirm' }) {
  return new Promise((resolve) => {
    const dialog = $('#confirm-dialog');
    const titleEl = $('#confirm-dialog-title');
    const msgEl = $('#confirm-dialog-message');
    const confirmBtn = $('#confirm-dialog-accept');
    const cancelBtn = $('#confirm-dialog-cancel');

    if (!dialog || !confirmBtn || !cancelBtn) {
      resolve(false);
      return;
    }

    if (titleEl) titleEl.textContent = title || 'Confirm action';
    if (msgEl) msgEl.textContent = message || 'Are you sure you want to proceed?';
    confirmBtn.textContent = confirmLabel;

    const cleanup = (result) => {
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
      dialog.removeEventListener('cancel', onCancel);
      if (dialog.open) dialog.close();
      resolve(result);
    };

    const onConfirm = () => cleanup(true);
    const onCancel = () => cleanup(false);

    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
    dialog.addEventListener('cancel', onCancel);
    dialog.showModal();
  });
}

function loadLocalRevisions() {
  try {
    const raw = localStorage.getItem(REVISIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveLocalRevisions(list) {
  try {
    localStorage.setItem(REVISIONS_STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  } catch (e) {}
}

function renderRevisionsList() {
  const listEl = $('#revisions-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  const revisions = loadLocalRevisions();
  if (!revisions.length) {
    const li = document.createElement('li');
    li.className = 'revision-empty';
    li.textContent =
      'No saved snapshots yet. Use "Save Snapshot" above to checkpoint your current slide wording.';
    listEl.appendChild(li);
    return;
  }

  revisions.forEach((rev) => {
    const li = document.createElement('li');
    li.className = 'revision-item';

    const info = document.createElement('div');
    info.className = 'revision-item__info';

    const title = document.createElement('strong');
    title.textContent = rev.label || 'Untitled snapshot';

    const meta = document.createElement('span');
    meta.className = 't-meta';
    const editCount = Object.keys(rev.edits || {}).length;
    const dateStr = new Date(rev.createdAtMs || Date.now()).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    meta.textContent = `${dateStr} · ${editCount} customized field${editCount === 1 ? '' : 's'}`;

    info.append(title, meta);

    const actions = document.createElement('div');
    actions.className = 'revision-item__actions';

    const restoreBtn = document.createElement('button');
    restoreBtn.type = 'button';
    restoreBtn.className = 'action-btn t-ui';
    restoreBtn.textContent = 'Restore';
    restoreBtn.addEventListener('click', async () => {
      const confirmed = await showConfirmDialog({
        title: 'Restore slide revision?',
        message: `Restore "${rev.label}"? This will replace your current slide wording with the saved snapshot.`,
        confirmLabel: 'Restore Revision'
      });
      if (!confirmed) return;
      window.WhoseLibertyDeck?.applyEditsMap(rev.edits || {}, { notifyCloud: false });
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'action-btn t-ui';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', async () => {
      const confirmed = await showConfirmDialog({
        title: 'Delete revision snapshot?',
        message: `Permanently delete snapshot "${rev.label}" from your revision history?`,
        confirmLabel: 'Delete Snapshot'
      });
      if (!confirmed) return;
      const next = loadLocalRevisions().filter((item) => item.id !== rev.id);
      saveLocalRevisions(next);
      renderRevisionsList();
    });

    actions.append(restoreBtn, deleteBtn);
    li.append(info, actions);
    listEl.appendChild(li);
  });
}

function handleSaveRevisionSnapshot() {
  const labelInput = $('#revision-label-input');
  const rawLabel =
    (labelInput?.value || '').trim() ||
    `Draft · ${new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  const label = rawLabel.slice(0, 160);
  const edits = sanitizeEditsMap(window.WhoseLibertyDeck?.getEditsMap() || {});
  const next = [
    {
      id: `rev_${Date.now()}`,
      label,
      edits,
      createdAtMs: Date.now()
    },
    ...loadLocalRevisions()
  ];
  saveLocalRevisions(next);
  if (labelInput) labelInput.value = '';
  renderRevisionsList();
}

function exportRevisionsAsJson() {
  const preservedLegacy = {};
  try {
    LEGACY_KEYS.forEach((k) => {
      const raw = localStorage.getItem(k);
      if (raw) {
        try {
          preservedLegacy[k] = JSON.parse(raw);
        } catch {
          preservedLegacy[k] = raw;
        }
      }
    });
  } catch (e) {}

  const payload = {
    deck: 'Whose liberty? Montesquieu in Brazil',
    exportedAt: new Date().toISOString(),
    activeEdits: sanitizeEditsMap(window.WhoseLibertyDeck?.getEditsMap() || {}),
    revisions: loadLocalRevisions(),
    preservedLegacyStorage: preservedLegacy
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `montesquieu-three-powers-revisions-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importRevisionsFromJson(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(String(reader.result || '{}'));
      const confirmed = await showConfirmDialog({
        title: 'Import slide edits and revisions?',
        message: `Apply the imported slide edits from "${file.name}" and merge its revision snapshots?`,
        confirmLabel: 'Import Backup'
      });
      if (!confirmed) return;

      if (parsed.activeEdits && typeof parsed.activeEdits === 'object') {
        window.WhoseLibertyDeck?.applyEditsMap(sanitizeEditsMap(parsed.activeEdits), {
          notifyCloud: false
        });
      } else if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        !parsed.revisions
      ) {
        window.WhoseLibertyDeck?.applyEditsMap(sanitizeEditsMap(parsed), { notifyCloud: false });
      }

      if (Array.isArray(parsed.revisions)) {
        const existing = loadLocalRevisions();
        const existingIds = new Set(existing.map((r) => r.id));
        const merged = [
          ...parsed.revisions.filter((r) => r && r.id && !existingIds.has(r.id)),
          ...existing
        ];
        saveLocalRevisions(merged);
      }
      renderRevisionsList();
    } catch (e) {}
  };
  reader.readAsText(file);
}

// ============================================================================
// SYNC AUDIENCE CONTROLLER (Firebase Realtime Database + Firestore + Live SSE)
// ============================================================================
const CALLOUT_LABELS = {
  '': 'Default slide view',
  constitutional: 'Slide 02 · Constitutional arrangements (¶6)',
  'civil-criminal': 'Slide 02 · Civil and criminal laws (¶7)',
  judicial: 'Slide 02 · Judicial frame « surtout judiciaire » (¶7)',
  'three-powers': 'Slide 03 · Montesquieu Tripartite Reference (XI.6)',
  'four-powers': 'Slide 03 · 1824 Art. 10 Four Powers (¶6)',
  deodoro: 'Slide 04 · Compromisso Constitucional · Executive Oath',
  prudente: 'Slide 04 · Compromisso Constitucional · Prudente de Moraes at Centre',
  gallery: 'Slide 04 · Compromisso Constitucional · Galleries & Public Witness',
  'sword-detail': 'Slide 05 · A Justiça (1961) · Detail: Sword on lap',
  whole: 'Slide 05 · A Justiça (1961) · Whole stone sculpture',
  'pause-5s': '10-Second Visual Pause Spotlight',
  watson: 'Slide 06 · Alan Watson (1974): Legal Transplants (¶11)',
  legrand: 'Slide 06 · Pierre Legrand (1997): Impossibility of Transplants (¶12)',
  code1916: 'Slide 06 · Dauchy ¶13–14: Hybridity & 1916 Brazilian Civil Code',
  q1: 'Slide 07 · Question 1: Renegotiation of Legal Boundaries (¶10–14)',
  q2: 'Slide 07 · Question 2: Circulation, Appropriation & Authority (¶6–7)'
};

function initAudienceSyncUI() {
  const syncDialog = $('#sync-audience-dialog');
  const syncOpenBtn = $('#sync-audience-btn');
  const syncOpenLabel = $('#sync-audience-label');
  const mobileSyncBtn = $('#mobile-sync-toggle');
  const mobileSyncLabel = $('#mobile-sync-label');
  const syncCloseBtn = $('#sync-audience-dialog-close');

  const statusCard = $('#sync-status-card');
  const modeBadge = $('#sync-dialog-mode-badge');
  const rtdbPathEl = $('#sync-dialog-rtdb-path');
  const slideReadout = $('#sync-dialog-slide-readout');
  const detailReadout = $('#sync-dialog-detail-readout');
  const viewersCountEl = $('#sync-dialog-viewers-count');
  const validationErrorEl = $('#sync-validation-error');

  const joinInput = $('#sync-join-code-input');
  const joinBtn = $('#sync-join-btn');
  const viewerActiveControls = $('#sync-viewer-active-controls');
  const autoFollowCheckbox = $('#sync-autofollow-checkbox');
  const jumpNowBtn = $('#sync-jump-now-btn');
  const leaveBtn = $('#sync-leave-btn');

  const hostInput = $('#sync-host-code-input');
  const hostBtn = $('#sync-host-btn');
  const shareUrlInput = $('#sync-share-url-input');
  const copyLinkBtn = $('#sync-copy-link-btn');
  const quickSlideBtns = $$('[data-sync-push-slide]');
  const authStatusText = $('#sync-auth-status-text');
  const googleAuthBtn = $('#sync-google-auth-btn');

  const followBar = $('#audience-follow-bar');
  const followBarBadge = $('#follow-bar-badge');
  const followBarSlide = $('#follow-bar-slide');
  const followBarJumpBtn = $('#follow-bar-jump-btn');
  const followBarAutoFollowBtn = $('#follow-bar-autofollow-btn');
  const followBarCopyLinkBtn = $('#follow-bar-copy-link-btn');
  const followBarDisconnectBtn = $('#follow-bar-disconnect-btn');

  let syncMode = 'idle'; // 'idle' | 'host' | 'viewer'
  let activeSessionCode = DEFAULT_SESSION_CODE;
  let autoFollow = true;
  let lastRemoteState = null;
  let viewerCount = 0;
  let firestoreDocCreated = false;

  // Active subscriptions cleanup handles
  let rtdbUnsub = null;
  let firestoreUnsub = null;
  let sseSource = null;
  let localBroadcastChannel = null;

  try {
    if (typeof BroadcastChannel === 'function') {
      localBroadcastChannel = new BroadcastChannel('dauchy-audience-sync');
      localBroadcastChannel.onmessage = (ev) => {
        if (
          syncMode === 'viewer' &&
          ev.data &&
          ev.data.sessionCode === activeSessionCode
        ) {
          handleIncomingRemoteState(ev.data, 'broadcast-channel');
        }
      };
    }
  } catch (e) {}

  function setValidationError(msg) {
    if (!validationErrorEl) return;
    if (!msg) {
      validationErrorEl.hidden = true;
      validationErrorEl.textContent = '';
    } else {
      validationErrorEl.hidden = false;
      validationErrorEl.textContent = msg;
    }
  }

  function refreshShareUrlInput(code = activeSessionCode) {
    if (!shareUrlInput) return;
    try {
      shareUrlInput.value = buildAudienceShareUrl(window.location.href, code);
    } catch {
      shareUrlInput.value = `${window.location.origin}/?sync=${DEFAULT_SESSION_CODE}`;
    }
  }

  function updateSyncStatusDisplay(stateObj) {
    const slideNum = stateObj?.currentSlide || window.dauchyDeckBridge?.getCurrentSlide() || 1;
    const padded = String(slideNum).padStart(2, '0');
    const slideTitle = stateObj?.slideTitle || 'Discussing Dauchy’s Montesquieu';
    const calloutKey = stateObj?.activeCallout ?? (window.dauchyDeckBridge?.getCurrentCallout() || '');
    const calloutText = CALLOUT_LABELS[calloutKey] || CALLOUT_LABELS[''];
    const code = stateObj?.sessionCode || activeSessionCode || DEFAULT_SESSION_CODE;

    if (typeof stateObj?.viewerCount === 'number') {
      viewerCount = stateObj.viewerCount;
    }

    if (rtdbPathEl) {
      rtdbPathEl.textContent = `RTDB Path: syncSessions/${code}`;
    }
    if (slideReadout) {
      slideReadout.textContent = `Slide ${padded} / 07 · ${slideTitle}`;
    }
    if (detailReadout) {
      detailReadout.textContent = `Presenter: Ana Vitória Vanzin Mendes · PPGD/UFSC · Focus: ${calloutText}`;
    }
    if (viewersCountEl) {
      viewersCountEl.textContent = `${viewerCount} Linked Viewer${viewerCount === 1 ? '' : 's'}`;
    }
    if (statusCard) {
      statusCard.setAttribute('data-sync-state', syncMode);
    }

    if (syncMode === 'host') {
      if (modeBadge) modeBadge.textContent = `BROADCASTING LIVE · ${code}`;
      if (syncOpenBtn) syncOpenBtn.setAttribute('data-sync-mode', 'host');
      if (syncOpenLabel) syncOpenLabel.textContent = `Broadcasting · ${code}`;
      if (mobileSyncLabel) mobileSyncLabel.textContent = `Broadcasting (${code})`;
      if (hostBtn) {
        hostBtn.textContent = 'Stop Broadcast';
        hostBtn.setAttribute('aria-pressed', 'true');
      }
      if (joinBtn) joinBtn.textContent = 'Link Browser';
      if (viewerActiveControls) viewerActiveControls.hidden = true;
      if (followBar) {
        followBar.hidden = false;
        if (followBarBadge) followBarBadge.textContent = `BROADCASTING LIVE · ${code}`;
        if (followBarSlide) {
          followBarSlide.textContent = `Slide ${padded} / 07 · ${slideTitle} (${viewerCount} viewer${viewerCount === 1 ? '' : 's'})`;
        }
        if (followBarJumpBtn) followBarJumpBtn.hidden = true;
        if (followBarAutoFollowBtn) followBarAutoFollowBtn.hidden = true;
        if (followBarCopyLinkBtn) followBarCopyLinkBtn.hidden = false;
        if (followBarDisconnectBtn) followBarDisconnectBtn.textContent = 'Stop Broadcast ×';
      }
    } else if (syncMode === 'viewer') {
      if (modeBadge) modeBadge.textContent = `FOLLOWING PRESENTER · ${code}`;
      if (syncOpenBtn) syncOpenBtn.setAttribute('data-sync-mode', 'viewer');
      if (syncOpenLabel) syncOpenLabel.textContent = `Following · ${padded}/07`;
      if (mobileSyncLabel) mobileSyncLabel.textContent = `Following (${code})`;
      if (hostBtn) {
        hostBtn.textContent = 'Start Broadcast';
        hostBtn.setAttribute('aria-pressed', 'false');
      }
      if (joinBtn) joinBtn.textContent = 'Linked ✓';
      if (viewerActiveControls) viewerActiveControls.hidden = false;
      if (followBar) {
        followBar.hidden = false;
        if (followBarBadge) followBarBadge.textContent = `FOLLOWING PRESENTER · ${code}`;
        if (followBarSlide) {
          followBarSlide.textContent = `Presenter on Slide ${padded} / 07: ${slideTitle}`;
        }
        if (followBarJumpBtn) followBarJumpBtn.hidden = false;
        if (followBarAutoFollowBtn) {
          followBarAutoFollowBtn.hidden = false;
          followBarAutoFollowBtn.classList.toggle('is-active', autoFollow);
          followBarAutoFollowBtn.setAttribute('aria-pressed', String(autoFollow));
          followBarAutoFollowBtn.textContent = autoFollow ? 'Auto-Follow: ON' : 'Auto-Follow: PAUSED';
        }
        if (followBarCopyLinkBtn) followBarCopyLinkBtn.hidden = true;
        if (followBarDisconnectBtn) followBarDisconnectBtn.textContent = 'Unlink ×';
      }
    } else {
      if (modeBadge) modeBadge.textContent = 'STATUS · STANDING BY';
      if (syncOpenBtn) syncOpenBtn.setAttribute('data-sync-mode', 'idle');
      if (syncOpenLabel) syncOpenLabel.textContent = 'Sync Audience';
      if (mobileSyncLabel) mobileSyncLabel.textContent = 'Open Sync';
      if (hostBtn) {
        hostBtn.textContent = 'Start Broadcast';
        hostBtn.setAttribute('aria-pressed', 'false');
      }
      if (joinBtn) joinBtn.textContent = 'Link Browser';
      if (viewerActiveControls) viewerActiveControls.hidden = true;
      if (followBar) followBar.hidden = true;
    }

    window.dauchyDeckBridge?.syncHeaderOffset?.();
  }

  function cleanupSubscriptions() {
    if (typeof rtdbUnsub === 'function') {
      try {
        rtdbUnsub();
      } catch (e) {}
      rtdbUnsub = null;
    }
    if (typeof firestoreUnsub === 'function') {
      try {
        firestoreUnsub();
      } catch (e) {}
      firestoreUnsub = null;
    }
    if (sseSource) {
      try {
        sseSource.close();
      } catch (e) {}
      sseSource = null;
    }
  }

  async function publishPresenterState({ status = 'live' } = {}) {
    if (syncMode !== 'host' && status !== 'ended') return;
    const currentSlide = window.dauchyDeckBridge?.getCurrentSlide() || 1;
    const activeCallout = window.dauchyDeckBridge?.getCurrentCallout() || '';

    let payload;
    try {
      payload = buildValidatedSyncPayload({
        sessionCode: activeSessionCode,
        currentSlide,
        activeCallout,
        status,
        ownerId: auth?.currentUser?.uid || 'presenter'
      });
    } catch (err) {
      setValidationError(err.message);
      return;
    }

    lastRemoteState = payload;
    updateSyncStatusDisplay(payload);

    // 1. Broadcast to same-origin tabs via BroadcastChannel
    try {
      localBroadcastChannel?.postMessage(payload);
    } catch (e) {}

    // 2. Publish to Firebase Realtime Database (ref(rtdb, 'syncSessions/' + sessionCode)) non-blockingly
    if (rtdb && fbRtdbMod) {
      try {
        const sessionRef = fbRtdbMod.ref(rtdb, `syncSessions/${payload.sessionCode}`);
        Promise.resolve(
          fbRtdbMod.set(sessionRef, {
            ...payload,
            updatedAt: fbRtdbMod.serverTimestamp()
          })
        ).catch(() => {});
      } catch (e) {}
    }

    // 3. Publish to Cloud Firestore (/syncSessions/{sessionId}) when signed in with verified email
    if (db && fbFirestoreMod && auth?.currentUser?.emailVerified) {
      const docPath = `syncSessions/${payload.sessionCode}`;
      const docRef = fbFirestoreMod.doc(db, 'syncSessions', payload.sessionCode);
      const firestoreData = {
        ownerId: auth.currentUser.uid,
        sessionCode: payload.sessionCode,
        presenterName: payload.presenterName,
        currentSlide: payload.currentSlide,
        slideTitle: payload.slideTitle,
        activeCallout: payload.activeCallout,
        status: payload.status,
        updatedAt: fbFirestoreMod.serverTimestamp()
      };
      try {
        if (!firestoreDocCreated) {
          await fbFirestoreMod.setDoc(docRef, firestoreData);
          firestoreDocCreated = true;
        } else {
          await fbFirestoreMod.updateDoc(
            docRef,
            payload.status === 'ended'
              ? { status: 'ended', updatedAt: fbFirestoreMod.serverTimestamp() }
              : {
                  currentSlide: payload.currentSlide,
                  slideTitle: payload.slideTitle,
                  activeCallout: payload.activeCallout,
                  presenterName: payload.presenterName,
                  updatedAt: fbFirestoreMod.serverTimestamp()
                }
          );
        }
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.WRITE, docPath);
        } catch (loggedErr) {}
      }
    }

    // 4. Publish to server-authoritative real-time broker (/api/audience-sync/publish)
    try {
      const res = await fetch('/api/audience-sync/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const serverState = await res.json();
        if (typeof serverState.viewerCount === 'number') {
          viewerCount = serverState.viewerCount;
          updateSyncStatusDisplay(serverState);
        }
      }
    } catch (e) {}
  }

  function handleIncomingRemoteState(incoming, sourceName = 'rtdb') {
    if (!incoming || typeof incoming !== 'object') return;
    if (incoming.sessionCode && incoming.sessionCode !== activeSessionCode) return;

    const decision = shouldApplyRemoteSlideUpdate(lastRemoteState, incoming);
    lastRemoteState = {
      ...incoming,
      sessionCode: activeSessionCode
    };

    updateSyncStatusDisplay(lastRemoteState);

    if (syncMode !== 'viewer') return;

    if (decision.isEnded) {
      if (modeBadge) {
        modeBadge.textContent = `SESSION ENDED BY PRESENTER · ${activeSessionCode}`;
      }
      return;
    }

    if (autoFollow) {
      if (decision.shouldScroll) {
        window.dauchyDeckBridge?.goToSlide(Number(incoming.currentSlide), {
          smooth: true,
          fromRemoteSync: true
        });
      }
      if (decision.shouldUpdateCallout) {
        window.dauchyDeckBridge?.applySlideCallout(
          Number(incoming.currentSlide),
          String(incoming.activeCallout || ''),
          { fromRemoteSync: true }
        );
      }
    }
  }

  function subscribeToSessionRoom(sessionCode) {
    cleanupSubscriptions();

    // 1. Subscribe via Firebase Realtime Database (onValue)
    if (rtdb && fbRtdbMod) {
      try {
        const sessionRef = fbRtdbMod.ref(rtdb, `syncSessions/${sessionCode}`);
        rtdbUnsub = fbRtdbMod.onValue(
          sessionRef,
          (snapshot) => {
            const val = snapshot.val();
            if (val && typeof val === 'object') {
              handleIncomingRemoteState(val, 'firebase-rtdb');
            }
          },
          () => {}
        );
      } catch (e) {}
    }

    // 2. Subscribe via Cloud Firestore (onSnapshot on single document)
    if (db && fbFirestoreMod) {
      try {
        const docRef = fbFirestoreMod.doc(db, 'syncSessions', sessionCode);
        firestoreUnsub = fbFirestoreMod.onSnapshot(
          docRef,
          (snap) => {
            if (snap.exists()) {
              handleIncomingRemoteState(snap.data(), 'firebase-firestore');
            }
          },
          () => {}
        );
      } catch (e) {}
    }

    // 3. Subscribe via Server-Sent Events (/api/audience-sync/events) for instant cross-browser delivery & viewerCount
    if (typeof EventSource === 'function') {
      try {
        sseSource = new EventSource(
          `/api/audience-sync/events?session=${encodeURIComponent(sessionCode)}`
        );
        sseSource.addEventListener('sync-state', (ev) => {
          try {
            const parsed = JSON.parse(ev.data);
            handleIncomingRemoteState(parsed, 'server-sse');
          } catch (e) {}
        });
      } catch (e) {}
    }
  }

  async function startPresenterBroadcast() {
    setValidationError('');
    const check = normalizeSessionCode(hostInput?.value);
    if (!check.valid) {
      setValidationError(check.error);
      hostInput?.focus();
      return;
    }

    cleanupSubscriptions();
    activeSessionCode = check.code;
    if (hostInput) hostInput.value = activeSessionCode;
    if (joinInput) joinInput.value = activeSessionCode;
    refreshShareUrlInput(activeSessionCode);

    syncMode = 'host';
    firestoreDocCreated = false;
    lastRemoteState = null;

    // Register Firebase Realtime Database onDisconnect handler when available
    if (rtdb && fbRtdbMod) {
      try {
        const sessionRef = fbRtdbMod.ref(rtdb, `syncSessions/${activeSessionCode}`);
        fbRtdbMod.onDisconnect(sessionRef).update({
          status: 'ended',
          updatedAt: fbRtdbMod.serverTimestamp()
        });
      } catch (e) {}
    }

    await publishPresenterState({ status: 'live' });

    // Also subscribe to SSE in host mode so presenter sees live viewerCount updates
    if (typeof EventSource === 'function') {
      try {
        sseSource = new EventSource(
          `/api/audience-sync/events?session=${encodeURIComponent(activeSessionCode)}`
        );
        sseSource.addEventListener('sync-state', (ev) => {
          try {
            const parsed = JSON.parse(ev.data);
            if (typeof parsed.viewerCount === 'number') {
              viewerCount = Math.max(0, parsed.viewerCount - 1);
              updateSyncStatusDisplay(lastRemoteState);
            }
          } catch (e) {}
        });
      } catch (e) {}
    }
  }

  async function stopPresenterBroadcast() {
    if (syncMode === 'host') {
      await publishPresenterState({ status: 'ended' });
    }
    cleanupSubscriptions();
    syncMode = 'idle';
    viewerCount = 0;
    updateSyncStatusDisplay(null);
  }

  async function startViewerFollow(rawCodeInput) {
    setValidationError('');
    const check = normalizeSessionCode(rawCodeInput ?? joinInput?.value);
    if (!check.valid) {
      setValidationError(check.error);
      joinInput?.focus();
      return;
    }

    activeSessionCode = check.code;
    if (joinInput) joinInput.value = activeSessionCode;
    if (hostInput) hostInput.value = activeSessionCode;
    refreshShareUrlInput(activeSessionCode);

    syncMode = 'viewer';
    lastRemoteState = null;
    updateSyncStatusDisplay(null);

    // Fetch current state immediately, then attach live listeners
    try {
      const res = await fetch(
        `/api/audience-sync/state?session=${encodeURIComponent(activeSessionCode)}`
      );
      if (res.ok) {
        const initialState = await res.json();
        handleIncomingRemoteState(initialState, 'initial-fetch');
      }
    } catch (e) {}

    subscribeToSessionRoom(activeSessionCode);
  }

  function disconnectViewerFollow() {
    cleanupSubscriptions();
    syncMode = 'idle';
    lastRemoteState = null;
    updateSyncStatusDisplay(null);
  }

  // Open / close dialog handlers
  const openSyncModal = () => {
    setValidationError('');
    refreshShareUrlInput(activeSessionCode);
    updateSyncStatusDisplay(lastRemoteState);
    if (syncDialog && typeof syncDialog.showModal === 'function') {
      syncDialog.showModal();
    } else if (syncDialog) {
      syncDialog.setAttribute('open', '');
    }
  };

  const closeSyncModal = () => {
    if (!syncDialog) return;
    if (typeof syncDialog.close === 'function') syncDialog.close();
    else syncDialog.removeAttribute('open');
  };

  syncOpenBtn?.addEventListener('click', openSyncModal);
  mobileSyncBtn?.addEventListener('click', () => {
    const mobileMenu = $('#mobile-contents');
    const contentsToggle = $('#contents-toggle');
    if (mobileMenu && contentsToggle) {
      mobileMenu.hidden = true;
      contentsToggle.setAttribute('aria-expanded', 'false');
    }
    openSyncModal();
  });
  syncCloseBtn?.addEventListener('click', closeSyncModal);
  syncDialog?.addEventListener('click', (e) => {
    if (e.target === syncDialog) closeSyncModal();
  });

  // Viewer controls
  joinBtn?.addEventListener('click', () => startViewerFollow(joinInput?.value));
  joinInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      startViewerFollow(joinInput.value);
    }
  });

  autoFollowCheckbox?.addEventListener('change', () => {
    autoFollow = Boolean(autoFollowCheckbox.checked);
    updateSyncStatusDisplay(lastRemoteState);
    if (autoFollow && lastRemoteState?.currentSlide) {
      window.dauchyDeckBridge?.goToSlide(Number(lastRemoteState.currentSlide), {
        smooth: true,
        fromRemoteSync: true
      });
    }
  });

  const jumpToPresenterSlideNow = () => {
    const targetSlide = Number(lastRemoteState?.currentSlide || 1);
    window.dauchyDeckBridge?.goToSlide(targetSlide, { smooth: true, fromRemoteSync: true });
    if (lastRemoteState?.activeCallout !== undefined) {
      window.dauchyDeckBridge?.applySlideCallout(
        targetSlide,
        String(lastRemoteState.activeCallout || ''),
        { fromRemoteSync: true }
      );
    }
  };

  jumpNowBtn?.addEventListener('click', jumpToPresenterSlideNow);
  followBarJumpBtn?.addEventListener('click', jumpToPresenterSlideNow);

  followBarAutoFollowBtn?.addEventListener('click', () => {
    autoFollow = !autoFollow;
    if (autoFollowCheckbox) autoFollowCheckbox.checked = autoFollow;
    updateSyncStatusDisplay(lastRemoteState);
    if (autoFollow) jumpToPresenterSlideNow();
  });

  leaveBtn?.addEventListener('click', disconnectViewerFollow);
  followBarDisconnectBtn?.addEventListener('click', () => {
    if (syncMode === 'host') {
      stopPresenterBroadcast();
    } else {
      disconnectViewerFollow();
    }
  });

  // Presenter controls
  hostBtn?.addEventListener('click', () => {
    if (syncMode === 'host') {
      stopPresenterBroadcast();
    } else {
      startPresenterBroadcast();
    }
  });

  hostInput?.addEventListener('input', () => {
    const check = normalizeSessionCode(hostInput.value);
    if (check.valid) {
      refreshShareUrlInput(check.code);
    }
  });

  const copyShareUrl = async (btnEl) => {
    refreshShareUrlInput(activeSessionCode);
    const urlText = shareUrlInput?.value || `${window.location.origin}/?sync=${activeSessionCode}`;
    try {
      await navigator.clipboard.writeText(urlText);
      if (btnEl) {
        const orig = btnEl.textContent;
        btnEl.textContent = 'Copied ✓';
        setTimeout(() => {
          btnEl.textContent = orig;
        }, 1600);
      }
    } catch {
      shareUrlInput?.select();
    }
  };

  copyLinkBtn?.addEventListener('click', () => copyShareUrl(copyLinkBtn));
  followBarCopyLinkBtn?.addEventListener('click', () => copyShareUrl(followBarCopyLinkBtn));

  quickSlideBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const targetNum = Number(btn.dataset.syncPushSlide);
      if (!targetNum) return;
      if (syncMode !== 'host') {
        await startPresenterBroadcast();
      }
      if (syncMode === 'host') {
        window.dauchyDeckBridge?.goToSlide(targetNum, { smooth: true, fromRemoteSync: false });
        await publishPresenterState({ currentSlide: targetNum, status: 'live' });
      }
    });
  });

  // Listen to local presenter slide/callout changes and broadcast when in host mode
  window.addEventListener('dauchy:presenter-state-changed', () => {
    if (syncMode === 'host') {
      publishPresenterState({ status: 'live' });
    } else if (syncMode === 'idle') {
      updateSyncStatusDisplay(null);
    }
  });

  // Optional Google Sign-In for authenticated cloud lock & Workspace scopes
  googleAuthBtn?.addEventListener('click', async () => {
    try {
      await ensureFirebaseReady();
      if (!auth || !fbAuthMod) return;
      if (auth.currentUser) {
        await workspaceSignOut();
      } else {
        await googleWorkspaceSignIn();
      }
    } catch (e) {}
  });

  refreshShareUrlInput(DEFAULT_SESSION_CODE);
  updateSyncStatusDisplay(null);

  // Check if URL has ?sync=SESSION_CODE to automatically link viewer browser
  const urlSync = parseSyncParamsFromSearch(window.location.search);
  if (urlSync.autoJoin) {
    startViewerFollow(urlSync.sessionCode);
  }

  return {
    onFirebaseReady() {
      if (auth && fbAuthMod) {
        fbAuthMod.onAuthStateChanged(auth, (user) => {
          if (user) {
            if (!cachedWorkspaceAccessToken && !isSigningInWorkspace) {
              cachedWorkspaceAccessToken = null;
            }
          } else {
            cachedWorkspaceAccessToken = null;
          }
          notifyWorkspaceAuthListeners();

          if (authStatusText) {
            authStatusText.textContent = user
              ? `Signed in as ${user.email || user.displayName || 'Presenter'} · Cloud Firestore & Workspace active`
              : 'Firebase Realtime Sync ready · Optional Google Sign-In for Firestore lock';
          }
          if (googleAuthBtn) {
            googleAuthBtn.textContent = user ? 'Sign out' : 'Sign in with Google';
          }
        });
      }
      if (syncMode === 'viewer') {
        subscribeToSessionRoom(activeSessionCode);
      } else if (syncMode === 'host') {
        publishPresenterState({ status: 'live' });
      }
    }
  };
}

async function initFirebaseAndRevisions() {
  const revDialog = $('#revisions-dialog');
  $('#revisions-button')?.addEventListener('click', () => {
    renderRevisionsList();
    revDialog?.showModal();
  });
  $('#revisions-dialog-close')?.addEventListener('click', () => revDialog?.close());
  $('#save-revision-btn')?.addEventListener('click', () => handleSaveRevisionSnapshot());
  $('#export-revisions-json-btn')?.addEventListener('click', () => exportRevisionsAsJson());

  const fileInput = $('#import-revisions-file-input');
  $('#import-revisions-json-btn')?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) importRevisionsFromJson(file);
    fileInput.value = '';
  });

  renderRevisionsList();
  const syncController = initAudienceSyncUI();

  let firebaseBootPromise = null;
  async function bootFirebaseSdkIfNeeded() {
    if (firebaseBootPromise) return firebaseBootPromise;
    if (!navigator.onLine) return;
    firebaseBootPromise = (async () => {
      try {
        const res = await fetch('./firebase-applet-config.json');
        if (!res.ok) return;
        const firebaseConfig = await res.json();
        const [appMod, authMod, firestoreMod, rtdbMod] = await Promise.all([
          import('firebase/app'),
          import('firebase/auth'),
          import('firebase/firestore'),
          import('firebase/database').catch(() => null)
        ]);

        fbAuthMod = authMod;
        fbFirestoreMod = firestoreMod;
        fbRtdbMod = rtdbMod;

        app = appMod.initializeApp(firebaseConfig);
        db = firestoreMod.getFirestore(app, firebaseConfig.firestoreDatabaseId);
        auth = authMod.getAuth(app);

        if (rtdbMod && typeof rtdbMod.getDatabase === 'function' && firebaseConfig.databaseURL) {
          try {
            rtdb = rtdbMod.getDatabase(app, firebaseConfig.databaseURL);
          } catch (e) {}
        }

        syncController.onFirebaseReady();
      } catch (e) {}
    })();
    return firebaseBootPromise;
  }

  ensureFirebaseBootFn = bootFirebaseSdkIfNeeded;

  // Boot immediately only if URL has ?sync=; otherwise load on demand or during idle time
  if ((window.location.search || '').includes('sync=')) {
    bootFirebaseSdkIfNeeded();
  } else {
    [
      '#sync-audience-btn',
      '#mobile-sync-toggle',
      '#header-google-slides-btn',
      '#prep-google-slides-btn',
      '#mobile-google-slides-toggle'
    ].forEach((sel) => {
      $(sel)?.addEventListener('click', bootFirebaseSdkIfNeeded, { once: true });
    });
    const scheduleIdle =
      typeof window.requestIdleCallback === 'function'
        ? (cb) => window.requestIdleCallback(cb, { timeout: 3500 })
        : (cb) => setTimeout(cb, 2200);
    scheduleIdle(() => bootFirebaseSdkIfNeeded());
  }
}

initFirebaseAndRevisions();

