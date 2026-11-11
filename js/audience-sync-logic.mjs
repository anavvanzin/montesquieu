import { PRINCIPAL_SLIDES, getSlideByNumber } from './presentation-data.mjs';

export const DEFAULT_SESSION_CODE = 'UFSC-2026';
export const SESSION_CODE_REGEX = /^[A-Z0-9_-]{4,32}$/;

export const ALLOWED_CALLOUTS = new Set([
  '',
  'court',
  'spirit',
  'liberty',
  'legislative',
  'executive',
  'judicial',
  'three-powers',
  'four-powers',
  'congress',
  'planalto',
  'stf',
  'deodoro',
  'prudente',
  'gallery',
  'pause-5s',
  'sword-detail',
  'whole',
  'q1',
  'q2',
  'toggle-tip',
  'toggle-music',
  'toggle-powers',
  'toggle-sword',
  'toggle-curtain',
  'curtain-on',
  'curtain-off'
]);

/**
 * Normalizes and validates a session code for Firebase Realtime Database & Firestore paths.
 * Returns { valid: true, code } or { valid: false, code: '', error: string }.
 */
export function normalizeSessionCode(rawInput) {
  const trimmed = String(rawInput ?? '')
    .trim()
    .toUpperCase();

  if (!trimmed) {
    return {
      valid: false,
      code: '',
      error: 'Please enter a session code (4–32 letters, numbers, hyphens, or underscores).'
    };
  }

  if (trimmed.length < 4 || trimmed.length > 32) {
    return {
      valid: false,
      code: '',
      error: 'Session code must be between 4 and 32 characters.'
    };
  }

  if (!SESSION_CODE_REGEX.test(trimmed)) {
    return {
      valid: false,
      code: '',
      error: 'Session code may only contain letters, digits, hyphens (-), and underscores (_).'
    };
  }

  return {
    valid: true,
    code: trimmed,
    error: ''
  };
}

/**
 * Validates and sanitizes an outgoing or incoming audience sync state payload.
 */
export function buildValidatedSyncPayload({
  sessionCode,
  currentSlide,
  activeCallout = '',
  status = 'live',
  presenterName = 'Ana Vitória Vanzin Mendes · UFSC',
  ownerId = 'presenter',
  updatedAtMs = Date.now()
} = {}) {
  const codeCheck = normalizeSessionCode(sessionCode);
  if (!codeCheck.valid) {
    throw new Error(codeCheck.error);
  }

  const totalSlides = PRINCIPAL_SLIDES.length; // 7
  const slideNum = Number(currentSlide);
  if (!Number.isInteger(slideNum) || slideNum < 1 || slideNum > totalSlides) {
    throw new Error(`Slide number must be an integer between 1 and ${totalSlides}.`);
  }

  const slideMeta = getSlideByNumber(slideNum) || PRINCIPAL_SLIDES[0];
  const slideTitle = String(slideMeta.title || `Slide ${slideNum}`).slice(0, 160);

  const normalizedCallout = ALLOWED_CALLOUTS.has(String(activeCallout || ''))
    ? String(activeCallout || '')
    : '';

  const normalizedStatus = status === 'ended' ? 'ended' : 'live';
  const cleanPresenter =
    String(presenterName || 'Ana Vitória Vanzin Mendes · UFSC')
      .trim()
      .slice(0, 120) || 'Ana Vitória Vanzin Mendes · UFSC';

  const cleanOwnerId =
    String(ownerId || 'presenter')
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 128) || 'presenter';

  return {
    sessionCode: codeCheck.code,
    currentSlide: slideNum,
    slideTitle,
    activeCallout: normalizedCallout,
    status: normalizedStatus,
    presenterName: cleanPresenter,
    ownerId: cleanOwnerId,
    rtdbPath: `syncSessions/${codeCheck.code}`,
    updatedAtMs: Number.isFinite(Number(updatedAtMs)) ? Number(updatedAtMs) : Date.now()
  };
}

/**
 * Determines whether an incoming remote state requires updating the viewer's slide or callout.
 * Guards against infinite sync loops and redundant scroll animations.
 */
export function shouldApplyRemoteSlideUpdate(previousState, incomingState) {
  if (!incomingState || typeof incomingState !== 'object') {
    return { shouldScroll: false, shouldUpdateCallout: false, isEnded: false };
  }

  if (incomingState.status === 'ended') {
    return { shouldScroll: false, shouldUpdateCallout: false, isEnded: true };
  }

  const nextSlide = Number(incomingState.currentSlide);
  if (!Number.isInteger(nextSlide) || nextSlide < 1 || nextSlide > PRINCIPAL_SLIDES.length) {
    return { shouldScroll: false, shouldUpdateCallout: false, isEnded: false };
  }

  const prevSlide = previousState ? Number(previousState.currentSlide) : null;
  const prevCallout = previousState ? String(previousState.activeCallout || '') : null;
  const nextCallout = String(incomingState.activeCallout || '');

  return {
    shouldScroll: prevSlide !== nextSlide,
    shouldUpdateCallout: prevCallout !== nextCallout || prevSlide !== nextSlide,
    isEnded: false
  };
}

/**
 * Builds a shareable viewer URL with ?sync=SESSION_CODE.
 */
export function buildAudienceShareUrl(baseUrl, sessionCode) {
  const codeCheck = normalizeSessionCode(sessionCode);
  if (!codeCheck.valid) {
    throw new Error(codeCheck.error);
  }
  const url = new URL(baseUrl, 'http://localhost:3000');
  url.searchParams.set('sync', codeCheck.code);
  url.hash = '';
  return url.toString();
}

/**
 * Parses URL search string for ?sync=SESSION_CODE auto-linking.
 */
export function parseSyncParamsFromSearch(searchString) {
  const params = new URLSearchParams(String(searchString || ''));
  const rawSync = params.get('sync') || params.get('session') || '';
  if (!rawSync) {
    return { autoJoin: false, sessionCode: DEFAULT_SESSION_CODE, error: '' };
  }
  const check = normalizeSessionCode(rawSync);
  if (!check.valid) {
    return { autoJoin: false, sessionCode: DEFAULT_SESSION_CODE, error: check.error };
  }
  return { autoJoin: true, sessionCode: check.code, error: '' };
}

/**
 * Builds a shareable phone remote controller URL with ?role=remote&session=SESSION_CODE.
 */
export function buildRemoteShareUrl(baseUrl, sessionCode) {
  const codeCheck = normalizeSessionCode(sessionCode);
  if (!codeCheck.valid) {
    throw new Error(codeCheck.error);
  }
  const url = new URL(baseUrl, 'http://localhost:3000');
  url.searchParams.set('role', 'remote');
  url.searchParams.set('session', codeCheck.code);
  url.hash = '';
  return url.toString();
}

/**
 * Parses URL search string for ?role=remote smartphone controller mode.
 */
export function parseRemoteParamsFromSearch(searchString) {
  const params = new URLSearchParams(String(searchString || ''));
  const role = (params.get('role') || '').toLowerCase();
  const isRemote = role === 'remote' || params.has('remote');
  const rawCode = params.get('session') || params.get('sync') || DEFAULT_SESSION_CODE;
  const check = normalizeSessionCode(rawCode);
  return {
    isRemote,
    sessionCode: check.valid ? check.code : DEFAULT_SESSION_CODE
  };
}
