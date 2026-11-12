import {
  parseGoogleSlidesId,
  buildGoogleSlidesUrl,
  buildGoogleSlidesDeckSpec,
  buildSlidesBatchUpdateRequests,
  buildSpeakerNotesBatchRequests,
  buildSheetsExportValues
} from './google-slides-logic.mjs';
import {
  ensureFirebaseReady,
  subscribeWorkspaceAuth,
  googleWorkspaceSignIn,
  getWorkspaceAccessToken,
  clearWorkspaceAccessToken,
  workspaceSignOut,
  showConfirmDialog
} from './workspace-firebase.js';
import { perfMonitor } from './perf-monitor.mjs';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

async function googleApiFetch(url, accessToken, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  });

  if (res.status === 401) {
    clearWorkspaceAccessToken();
    throw new Error('Your Google Workspace session expired. Please sign in with Google again.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const apiMsg =
      data?.error?.message ||
      data?.error_description ||
      `Google Workspace API request failed (HTTP ${res.status}).`;
    throw new Error(apiMsg);
  }

  return data;
}

function extractSlideTitleFromApiPage(slidePage, index) {
  const elements = Array.isArray(slidePage?.pageElements) ? slidePage.pageElements : [];
  for (let i = 0; i < elements.length; i++) {
    const textElements = elements[i]?.shape?.text?.textElements;
    if (Array.isArray(textElements)) {
      const combined = textElements
        .map((te) => te?.textRun?.content || '')
        .join('')
        .trim();
      if (combined) {
        const firstLine = combined.split('\n').map((l) => l.trim()).filter(Boolean)[0];
        if (firstLine && firstLine.length > 3) {
          return firstLine.slice(0, 96);
        }
      }
    }
  }
  return `Slide ${index + 1}`;
}

function initGoogleSlidesIntegration() {
  const dialog = $('#google-slides-dialog');
  if (!dialog) return;

  const openBtns = [
    $('#header-google-slides-btn'),
    $('#prep-google-slides-btn'),
    $('#mobile-google-slides-toggle')
  ].filter(Boolean);
  const closeBtn = $('#google-slides-dialog-close');

  // Auth UI elements
  const authUnconnectedWrap = $('#gslides-auth-needed');
  const authConnectedWrap = $('#gslides-auth-connected');
  const signInBtn = $('#gslides-google-signin-btn');
  const signOutBtn = $('#gslides-signout-btn');
  const userReadout = $('#gslides-user-readout');

  // Status & Result banner
  const statusAlert = $('#gslides-status-banner');
  const resultCard = $('#gslides-result-card');
  const resultTitle = $('#gslides-result-title');
  const resultMeta = $('#gslides-result-meta');
  const resultEditLink = $('#gslides-result-edit-link');
  const resultPresentLink = $('#gslides-result-present-link');
  const resultCopyBtn = $('#gslides-result-copy-btn');

  // Export new deck controls
  const deckTitleInput = $('#gslides-deck-title-input');
  const includeNotesCheckbox = $('#gslides-include-notes');
  const includeEditsCheckbox = $('#gslides-include-edits');
  const createDeckBtn = $('#gslides-create-btn');
  const exportSheetBtn = $('#gslides-export-sheet-btn');

  // Existing deck sync & Drive picker controls
  const existingIdInput = $('#gslides-existing-id-input');
  const inspectDeckBtn = $('#gslides-inspect-btn');
  const syncExistingBtn = $('#gslides-sync-existing-btn');
  const loadDriveBtn = $('#gslides-load-drive-btn');
  const driveListEl = $('#gslides-drive-list');
  const inspectorCard = $('#gslides-inspector-card');
  const inspectorTitle = $('#gslides-inspector-title');
  const inspectorSlidesList = $('#gslides-inspector-slides');
  const inspectorEmbedLink = $('#gslides-inspector-open-link');

  // Local 7-slide payload & speaker notes preview
  const previewTabs = $$('[data-gslides-preview-tab]', dialog);
  const previewKicker = $('#gslides-preview-kicker');
  const previewTitle = $('#gslides-preview-title');
  const previewSubtitle = $('#gslides-preview-subtitle');
  const previewBullets = $('#gslides-preview-bullets');
  const previewNotes = $('#gslides-preview-notes');
  const copyNotesBtn = $('#gslides-copy-notes-btn');

  let activePreviewSlide = 1;
  let isBusy = false;
  let lastCreatedOrSyncedUrl = '';

  function setStatus(message, tone = 'info') {
    if (!statusAlert) return;
    if (!message) {
      statusAlert.hidden = true;
      statusAlert.textContent = '';
      statusAlert.removeAttribute('data-tone');
      return;
    }
    statusAlert.hidden = false;
    statusAlert.setAttribute('data-tone', tone);
    statusAlert.textContent = message;
  }

  function setBusy(busy) {
    isBusy = busy;
    [createDeckBtn, exportSheetBtn, inspectDeckBtn, syncExistingBtn, loadDriveBtn, signInBtn].forEach(
      (btn) => {
        if (btn) btn.disabled = busy;
      }
    );
  }

  function showResultBanner({ title, meta, editUrl, presentUrl }) {
    if (!resultCard) return;
    lastCreatedOrSyncedUrl = editUrl || '';
    resultCard.hidden = false;
    if (resultTitle) resultTitle.textContent = title || 'Google Workspace file ready';
    if (resultMeta) resultMeta.textContent = meta || '';
    if (resultEditLink && editUrl) {
      resultEditLink.href = editUrl;
      resultEditLink.textContent = editUrl.includes('/spreadsheets/')
        ? 'Open in Google Sheets ↗'
        : 'Open in Google Slides ↗';
    }
    if (resultPresentLink) {
      if (presentUrl) {
        resultPresentLink.hidden = false;
        resultPresentLink.href = presentUrl;
      } else {
        resultPresentLink.hidden = true;
      }
    }
  }

  function getCurrentDeckSpec() {
    const editsMap =
      includeEditsCheckbox && !includeEditsCheckbox.checked
        ? {}
        : window.dauchyDeckBridge?.getEditsMap?.() || {};
    const includeSpeakerNotes = includeNotesCheckbox ? Boolean(includeNotesCheckbox.checked) : true;
    const customTitle = (deckTitleInput?.value || '').trim();
    return buildGoogleSlidesDeckSpec({
      editsMap,
      includeSpeakerNotes,
      customTitle
    });
  }

  function renderLocalSlidePreview(slideNumber = activePreviewSlide) {
    activePreviewSlide = Math.max(1, Math.min(7, Number(slideNumber) || 1));
    const spec = getCurrentDeckSpec();
    const slide = spec.slides.find((s) => s.number === activePreviewSlide) || spec.slides[0];
    if (!slide) return;

    previewTabs.forEach((btn) => {
      const match = Number(btn.dataset.gslidesPreviewTab) === activePreviewSlide;
      btn.classList.toggle('is-active', match);
      btn.setAttribute('aria-selected', String(match));
    });

    if (previewKicker) previewKicker.textContent = slide.kicker;
    if (previewTitle) previewTitle.textContent = slide.title;
    if (previewSubtitle) previewSubtitle.textContent = slide.subtitle || '';
    if (previewBullets) {
      previewBullets.textContent = '';
      slide.bullets.forEach((b) => {
        const li = document.createElement('li');
        li.textContent = b;
        previewBullets.appendChild(li);
      });
    }
    if (previewNotes) {
      previewNotes.textContent =
        slide.speakerNotes || '(Speaker notes disabled — check "Include Lectern Script" above to attach.)';
    }
  }

  async function requireAccessTokenOrPrompt() {
    const token = await getWorkspaceAccessToken();
    if (!token) {
      setStatus(
        'Sign in with Google above to authorize Google Slides, Drive, and Sheets access.',
        'warn'
      );
      signInBtn?.focus();
      return null;
    }
    return token;
  }

  async function populatePresentationWithDeckSpec(presentationId, existingPresentation, token) {
    const spec = getCurrentDeckSpec();
    const { requests } = buildSlidesBatchUpdateRequests(spec, existingPresentation);

    await googleApiFetch(
      `https://slides.googleapis.com/v1/presentations/${encodeURIComponent(presentationId)}:batchUpdate`,
      token,
      {
        method: 'POST',
        body: JSON.stringify({ requests })
      }
    );

    if (spec.slides.some((s) => s.speakerNotes)) {
      const refreshed = await googleApiFetch(
        `https://slides.googleapis.com/v1/presentations/${encodeURIComponent(presentationId)}`,
        token
      );
      const notesRequests = buildSpeakerNotesBatchRequests(spec, refreshed);
      if (notesRequests.length > 0) {
        await googleApiFetch(
          `https://slides.googleapis.com/v1/presentations/${encodeURIComponent(presentationId)}:batchUpdate`,
          token,
          {
            method: 'POST',
            body: JSON.stringify({ requests: notesRequests })
          }
        );
      }
    }

    return spec;
  }

  // 1. Create Brand-New 7-Slide Google Slides Presentation
  async function handleCreateNewPresentation() {
    if (isBusy) return;
    const rawTitle = (deckTitleInput?.value || '').trim();
    if (!rawTitle) {
      setStatus('Please enter a presentation title before exporting to Google Slides.', 'error');
      deckTitleInput?.focus();
      return;
    }

    const token = await requireAccessTokenOrPrompt();
    if (!token) return;

    setBusy(true);
    setStatus('Creating 7-slide Google Slides presentation and attaching Lectern Script speaker notes…', 'info');

    try {
      const created = await googleApiFetch(
        'https://slides.googleapis.com/v1/presentations',
        token,
        {
          method: 'POST',
          body: JSON.stringify({ title: rawTitle })
        }
      );

      const presentationId = created.presentationId;
      await populatePresentationWithDeckSpec(presentationId, created, token);

      const editUrl = buildGoogleSlidesUrl(presentationId, 'edit');
      const presentUrl = buildGoogleSlidesUrl(presentationId, 'present');
      if (existingIdInput) existingIdInput.value = presentationId;

      showResultBanner({
        title: rawTitle,
        meta: `Created 7 slides${includeNotesCheckbox?.checked ? ' + 7 Lectern Script speaker note pages' : ''} · ID: ${presentationId}`,
        editUrl,
        presentUrl
      });
      setStatus('Exported 7-slide deck to Google Slides.', 'ok');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setBusy(false);
    }
  }

  // 2. Inspect Existing Google Slides Deck
  async function handleInspectPresentation() {
    if (isBusy) return;
    const parsed = parseGoogleSlidesId(existingIdInput?.value || '');
    if (!parsed.valid) {
      setStatus(parsed.error, 'error');
      existingIdInput?.focus();
      return;
    }

    const token = await requireAccessTokenOrPrompt();
    if (!token) return;

    setBusy(true);
    setStatus('Fetching presentation structure from Google Slides…', 'info');

    try {
      const pres = await googleApiFetch(
        `https://slides.googleapis.com/v1/presentations/${encodeURIComponent(parsed.presentationId)}`,
        token
      );
      const slides = Array.isArray(pres.slides) ? pres.slides : [];

      if (inspectorCard) inspectorCard.hidden = false;
      if (inspectorTitle) {
        inspectorTitle.textContent = `${pres.title || 'Untitled presentation'} (${slides.length} slide${slides.length === 1 ? '' : 's'})`;
      }
      if (inspectorEmbedLink) {
        inspectorEmbedLink.href = buildGoogleSlidesUrl(parsed.presentationId, 'edit');
      }
      if (inspectorSlidesList) {
        inspectorSlidesList.textContent = '';
        slides.slice(0, 14).forEach((s, idx) => {
          const li = document.createElement('li');
          li.textContent = `${String(idx + 1).padStart(2, '0')} · ${extractSlideTitleFromApiPage(s, idx)}`;
          inspectorSlidesList.appendChild(li);
        });
      }

      setStatus(`Loaded "${pres.title || parsed.presentationId}" (${slides.length} slides).`, 'ok');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setBusy(false);
    }
  }

  // 3. Overwrite / Sync Existing Google Slides Deck (Gated by Mandatory Explicit Confirmation Modal)
  async function handleSyncExistingPresentation() {
    if (isBusy) return;
    const parsed = parseGoogleSlidesId(existingIdInput?.value || '');
    if (!parsed.valid) {
      setStatus(parsed.error, 'error');
      existingIdInput?.focus();
      return;
    }

    const token = await requireAccessTokenOrPrompt();
    if (!token) return;

    setBusy(true);
    setStatus('Checking target Google Slides presentation before confirmation…', 'info');

    let targetPres = null;
    try {
      targetPres = await googleApiFetch(
        `https://slides.googleapis.com/v1/presentations/${encodeURIComponent(parsed.presentationId)}`,
        token
      );
    } catch (err) {
      setBusy(false);
      setStatus(err instanceof Error ? err.message : String(err), 'error');
      return;
    }

    setBusy(false);
    const existingCount = Array.isArray(targetPres?.slides) ? targetPres.slides.length : 0;
    const targetTitle = targetPres?.title || parsed.presentationId;

    // Mandatory explicit confirmation dialog before mutating user-owned Google Slides content
    const confirmed = await showConfirmDialog({
      title: `Update Google Slides deck "${targetTitle}"?`,
      message: `This will replace all ${existingCount} existing slide(s) in "${targetTitle}" (${parsed.presentationId}) with your current 7 Montesquieu UFSC slides${
        includeNotesCheckbox?.checked ? ' and verbatim Lectern Script speaker notes' : ''
      }. Do you want to proceed?`,
      confirmLabel: 'Overwrite 7 Slides'
    });

    if (!confirmed) {
      setStatus('Update cancelled. No changes were made to your Google Slides presentation.', 'info');
      return;
    }

    setBusy(true);
    setStatus(`Updating "${targetTitle}" in Google Slides…`, 'info');
    try {
      await populatePresentationWithDeckSpec(parsed.presentationId, targetPres, token);
      const editUrl = buildGoogleSlidesUrl(parsed.presentationId, 'edit');
      const presentUrl = buildGoogleSlidesUrl(parsed.presentationId, 'present');

      showResultBanner({
        title: targetTitle,
        meta: `Replaced ${existingCount} slide(s) with updated 7-slide UFSC deck · ID: ${parsed.presentationId}`,
        editUrl,
        presentUrl
      });
      setStatus(`Updated "${targetTitle}" in Google Slides.`, 'ok');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setBusy(false);
    }
  }

  // 4. Browse Recent Google Slides Presentations from Google Drive
  async function handleLoadRecentDriveDecks() {
    if (isBusy) return;
    const token = await requireAccessTokenOrPrompt();
    if (!token) return;

    setBusy(true);
    setStatus('Loading recent Google Slides presentations from Google Drive…', 'info');

    try {
      const q = encodeURIComponent(
        "mimeType='application/vnd.google-apps.presentation' and trashed=false"
      );
      const fields = encodeURIComponent('files(id,name,modifiedTime,webViewLink)');
      const data = await googleApiFetch(
        `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime%20desc&pageSize=8&fields=${fields}`,
        token
      );
      const files = Array.isArray(data?.files) ? data.files : [];

      if (driveListEl) {
        driveListEl.hidden = false;
        driveListEl.textContent = '';

        if (!files.length) {
          const emptyLi = document.createElement('li');
          emptyLi.className = 'revision-empty';
          emptyLi.textContent = 'No Google Slides presentations found in your Google Drive yet.';
          driveListEl.appendChild(emptyLi);
        } else {
          files.forEach((f) => {
            const li = document.createElement('li');
            li.className = 'gslides-drive-item';

            const info = document.createElement('div');
            info.className = 'gslides-drive-item__info';

            const strong = document.createElement('strong');
            strong.textContent = f.name || 'Untitled presentation';

            const meta = document.createElement('span');
            meta.className = 't-meta';
            const modDate = f.modifiedTime
              ? new Date(f.modifiedTime).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : '';
            meta.textContent = modDate ? `Modified ${modDate}` : f.id;
            info.append(strong, meta);

            const actions = document.createElement('div');
            actions.className = 'gslides-drive-item__actions';

            const selectBtn = document.createElement('button');
            selectBtn.type = 'button';
            selectBtn.className = 'action-btn t-ui';
            selectBtn.textContent = 'Select';
            selectBtn.addEventListener('click', () => {
              if (existingIdInput) existingIdInput.value = f.id;
              setStatus(`Selected "${f.name}" (${f.id}). Click Inspect or Update Selected Deck.`, 'info');
            });

            const openLink = document.createElement('a');
            openLink.className = 'text-link-sm';
            openLink.href = f.webViewLink || buildGoogleSlidesUrl(f.id, 'edit');
            openLink.target = '_blank';
            openLink.rel = 'noopener noreferrer';
            openLink.textContent = 'Open ↗';

            actions.append(selectBtn, openLink);
            li.append(info, actions);
            driveListEl.appendChild(li);
          });
        }
      }
      setStatus(`Loaded ${files.length} Google Slides deck(s) from Google Drive.`, 'ok');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setBusy(false);
    }
  }

  // 5. Export Rehearsal Pacing & Transition Latency Log to Google Sheets
  async function handleExportPacingToSheets() {
    if (isBusy) return;
    const token = await requireAccessTokenOrPrompt();
    if (!token) return;

    setBusy(true);
    setStatus('Creating Google Sheets rehearsal & performance log…', 'info');

    try {
      const spec = getCurrentDeckSpec();
      const perfReport = perfMonitor.getReport();
      const { pacingRows, perfRows } = buildSheetsExportValues(spec, perfReport);

      const sheetTitle = `${spec.deckTitle} — Pacing & Perf Log`;
      const createdSheet = await googleApiFetch(
        'https://sheets.googleapis.com/v4/spreadsheets',
        token,
        {
          method: 'POST',
          body: JSON.stringify({
            properties: { title: sheetTitle },
            sheets: [
              { properties: { title: 'Lectern Pacing' } },
              { properties: { title: 'Transition Perf' } }
            ]
          })
        }
      );

      const spreadsheetId = createdSheet.spreadsheetId;
      const actualSheets = Array.isArray(createdSheet.sheets) ? createdSheet.sheets : [];
      const tab1Title = actualSheets[0]?.properties?.title || 'Lectern Pacing';
      const tab2Title = actualSheets[1]?.properties?.title || 'Transition Perf';

      await googleApiFetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values:batchUpdate`,
        token,
        {
          method: 'POST',
          body: JSON.stringify({
            valueInputOption: 'USER_ENTERED',
            data: [
              {
                range: `'${tab1Title}'!A1`,
                values: pacingRows
              },
              {
                range: `'${tab2Title}'!A1`,
                values: perfRows
              }
            ]
          })
        }
      );

      const sheetUrl =
        createdSheet.spreadsheetUrl ||
        `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/edit`;

      showResultBanner({
        title: sheetTitle,
        meta: `Exported 7-slide pacing schedule & ${perfReport.transitions.length} recorded transition sample(s)`,
        editUrl: sheetUrl,
        presentUrl: ''
      });
      setStatus('Exported pacing & performance log to Google Sheets.', 'ok');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setBusy(false);
    }
  }

  // Open / close dialog handlers
  function openGoogleSlidesDialog() {
    ensureFirebaseReady().catch(() => {});
    renderLocalSlidePreview(window.dauchyDeckBridge?.getCurrentSlide?.() || 1);
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  function closeGoogleSlidesDialog() {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  openBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mobileMenu = $('#mobile-contents');
      const contentsToggle = $('#contents-toggle');
      if (mobileMenu && contentsToggle) {
        mobileMenu.hidden = true;
        contentsToggle.setAttribute('aria-expanded', 'false');
      }
      openGoogleSlidesDialog();
    });
  });

  closeBtn?.addEventListener('click', closeGoogleSlidesDialog);
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) closeGoogleSlidesDialog();
  });

  // Subscribe to Workspace OAuth state
  subscribeWorkspaceAuth(({ user, needsAuth }) => {
    if (authUnconnectedWrap) authUnconnectedWrap.hidden = !needsAuth;
    if (authConnectedWrap) authConnectedWrap.hidden = needsAuth;
    if (userReadout && user) {
      userReadout.textContent = `Connected as ${user.email || user.displayName || 'Google Account'} · Token cached in memory only`;
    }
  });

  signInBtn?.addEventListener('click', async () => {
    setStatus('Opening Google Sign-In to authorize Google Slides, Drive, and Sheets…', 'info');
    try {
      const res = await googleWorkspaceSignIn();
      if (res?.user) {
        setStatus(
          `Signed in as ${res.user.email || res.user.displayName}. Ready to export or sync Google Slides.`,
          'ok'
        );
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Google Sign-In was cancelled or blocked.', 'error');
    }
  });

  signOutBtn?.addEventListener('click', async () => {
    try {
      await workspaceSignOut();
      setStatus('Signed out and cleared in-memory Google Workspace access token.', 'info');
    } catch (e) {}
  });

  createDeckBtn?.addEventListener('click', handleCreateNewPresentation);
  inspectDeckBtn?.addEventListener('click', handleInspectPresentation);
  syncExistingBtn?.addEventListener('click', handleSyncExistingPresentation);
  loadDriveBtn?.addEventListener('click', handleLoadRecentDriveDecks);
  exportSheetBtn?.addEventListener('click', handleExportPacingToSheets);

  resultCopyBtn?.addEventListener('click', async () => {
    if (!lastCreatedOrSyncedUrl) return;
    try {
      await navigator.clipboard.writeText(lastCreatedOrSyncedUrl);
      const orig = resultCopyBtn.textContent;
      resultCopyBtn.textContent = 'Copied ✓';
      setTimeout(() => {
        resultCopyBtn.textContent = orig;
      }, 1600);
    } catch (e) {}
  });

  previewTabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      renderLocalSlidePreview(Number(btn.dataset.gslidesPreviewTab));
    });
  });

  includeNotesCheckbox?.addEventListener('change', () => renderLocalSlidePreview(activePreviewSlide));
  includeEditsCheckbox?.addEventListener('change', () => renderLocalSlidePreview(activePreviewSlide));
  window.addEventListener('dauchy:edits-changed', () => {
    if (dialog.open) renderLocalSlidePreview(activePreviewSlide);
  });

  copyNotesBtn?.addEventListener('click', async () => {
    const spec = getCurrentDeckSpec();
    const slide = spec.slides.find((s) => s.number === activePreviewSlide);
    if (!slide?.speakerNotes) return;
    try {
      await navigator.clipboard.writeText(slide.speakerNotes);
      const orig = copyNotesBtn.textContent;
      copyNotesBtn.textContent = 'Speaker Notes Copied ✓';
      setTimeout(() => {
        copyNotesBtn.textContent = orig;
      }, 1600);
    } catch (e) {}
  });

  renderLocalSlidePreview(1);
  window.openGoogleSlidesDialog = openGoogleSlidesDialog;
}

initGoogleSlidesIntegration();
