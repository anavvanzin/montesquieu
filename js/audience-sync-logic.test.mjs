import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SESSION_CODE,
  normalizeSessionCode,
  buildValidatedSyncPayload,
  shouldApplyRemoteSlideUpdate,
  buildAudienceShareUrl,
  parseSyncParamsFromSearch
} from './audience-sync-logic.mjs';

test('normalizeSessionCode validates and normalizes session codes', () => {
  const ok = normalizeSessionCode('  ufsc-2026  ');
  assert.equal(ok.valid, true);
  assert.equal(ok.code, 'UFSC-2026');

  const empty = normalizeSessionCode('   ');
  assert.equal(empty.valid, false);
  assert.match(empty.error, /Please enter a session code/);

  const tooShort = normalizeSessionCode('ab');
  assert.equal(tooShort.valid, false);
  assert.match(tooShort.error, /between 4 and 32/);

  const invalidChars = normalizeSessionCode('ufsc 2026!');
  assert.equal(invalidChars.valid, false);
  assert.match(invalidChars.error, /only contain letters, digits/);
});

test('buildValidatedSyncPayload maps slide number to verified presentation metadata', () => {
  const payload = buildValidatedSyncPayload({
    sessionCode: 'ufsc-2026',
    currentSlide: 5,
    activeCallout: 'gallery',
    updatedAtMs: 1762700000000
  });

  assert.equal(payload.sessionCode, 'UFSC-2026');
  assert.equal(payload.currentSlide, 5);
  assert.equal(payload.slideTitle, 'A Justiça: the « null » power and the judicial frame');
  assert.equal(payload.activeCallout, 'gallery');
  assert.equal(payload.rtdbPath, 'syncSessions/UFSC-2026');
  assert.equal(payload.status, 'live');

  const slide7 = buildValidatedSyncPayload({
    sessionCode: 'UFSC-2026',
    currentSlide: 7,
    activeCallout: 'q2'
  });
  assert.equal(slide7.currentSlide, 7);
  assert.equal(slide7.slideTitle, 'Two questions for Serge');

  assert.throws(
    () => buildValidatedSyncPayload({ sessionCode: 'UFSC-2026', currentSlide: 9 }),
    /Slide number must be an integer between 1 and 7/
  );
});

test('shouldApplyRemoteSlideUpdate prevents redundant scroll loops and detects callout changes', () => {
  const first = shouldApplyRemoteSlideUpdate(null, {
    currentSlide: 2,
    activeCallout: 'congress',
    status: 'live'
  });
  assert.equal(first.shouldScroll, true);
  assert.equal(first.shouldUpdateCallout, true);
  assert.equal(first.isEnded, false);

  const duplicate = shouldApplyRemoteSlideUpdate(
    { currentSlide: 2, activeCallout: 'congress', status: 'live' },
    { currentSlide: 2, activeCallout: 'congress', status: 'live' }
  );
  assert.equal(duplicate.shouldScroll, false);
  assert.equal(duplicate.shouldUpdateCallout, false);

  const calloutChanged = shouldApplyRemoteSlideUpdate(
    { currentSlide: 4, activeCallout: 'whole', status: 'live' },
    { currentSlide: 4, activeCallout: 'sword-detail', status: 'live' }
  );
  assert.equal(calloutChanged.shouldScroll, false);
  assert.equal(calloutChanged.shouldUpdateCallout, true);

  const ended = shouldApplyRemoteSlideUpdate(
    { currentSlide: 4, activeCallout: 'whole', status: 'live' },
    { currentSlide: 4, activeCallout: '', status: 'ended' }
  );
  assert.equal(ended.isEnded, true);
  assert.equal(ended.shouldScroll, false);
});

test('buildAudienceShareUrl and parseSyncParamsFromSearch round-trip session links', () => {
  const url = buildAudienceShareUrl('https://example.edu/index.html#slide-3', 'panel_xi_6');
  assert.equal(url, 'https://example.edu/index.html?sync=PANEL_XI_6');

  const parsed = parseSyncParamsFromSearch('?sync=panel_xi_6');
  assert.equal(parsed.autoJoin, true);
  assert.equal(parsed.sessionCode, 'PANEL_XI_6');

  const invalid = parseSyncParamsFromSearch('?sync=bad%20code!');
  assert.equal(invalid.autoJoin, false);
  assert.equal(invalid.sessionCode, DEFAULT_SESSION_CODE);
  assert.ok(invalid.error.length > 0);
});

test('buildRemoteShareUrl and parseRemoteParamsFromSearch generate and parse phone controller links', async () => {
  const { buildRemoteShareUrl, parseRemoteParamsFromSearch } = await import('./audience-sync-logic.mjs');
  const remoteUrl = buildRemoteShareUrl('https://example.edu/', 'ufsc-2026');
  assert.equal(remoteUrl, 'https://example.edu/?role=remote&session=UFSC-2026');

  const parsed = parseRemoteParamsFromSearch('?role=remote&session=UFSC-2026');
  assert.equal(parsed.isRemote, true);
  assert.equal(parsed.sessionCode, 'UFSC-2026');

  const notRemote = parseRemoteParamsFromSearch('?sync=UFSC-2026');
  assert.equal(notRemote.isRemote, false);
});
