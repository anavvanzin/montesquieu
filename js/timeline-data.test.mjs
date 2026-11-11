import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEGAL_CIRCULATION_TIMELINE,
  filterTimelineByTheme,
  getTimelineMilestoneById,
  formatMilestoneCitationNote
} from './timeline-data.mjs';

test('LEGAL_CIRCULATION_TIMELINE links all 5 parallel milestones to active slides 2 through 6 with zero married-women references', () => {
  assert.equal(LEGAL_CIRCULATION_TIMELINE.length, 5);
  assert.deepEqual(
    LEGAL_CIRCULATION_TIMELINE.map((m) => m.slideId),
    ['slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6']
  );
  assert.equal(/married women/i.test(JSON.stringify(LEGAL_CIRCULATION_TIMELINE)), false);
});

test('filterTimelineByTheme filters aligned constitutional, iconography, and circulation milestones accurately', () => {
  const all = filterTimelineByTheme('all');
  assert.equal(all.length, 5);

  const constitutionalOnly = filterTimelineByTheme('constitutional');
  assert.equal(constitutionalOnly.length, 2);
  assert.ok(constitutionalOnly.every((m) => m.theme === 'constitutional'));

  const iconographyOnly = filterTimelineByTheme('iconography');
  assert.equal(iconographyOnly.length, 2);
  assert.ok(iconographyOnly.every((m) => m.theme === 'iconography'));

  const circulationOnly = filterTimelineByTheme('circulation');
  assert.equal(circulationOnly.length, 1);
  assert.equal(circulationOnly[0].id, 'milestone-bordeaux-spirit');
});

test('getTimelineMilestoneById returns matching entry or falls back to first milestone', () => {
  const mFigueiredo = getTimelineMilestoneById('milestone-figueiredo-1896');
  assert.equal(mFigueiredo.id, 'milestone-figueiredo-1896');
  assert.equal(mFigueiredo.slideId, 'slide-5');
  assert.match(mFigueiredo.citation.heading, /FIGUEIREDO \(1896\)/);

  const mCeschiatti = getTimelineMilestoneById('milestone-ceschiatti-1961');
  assert.equal(mCeschiatti.id, 'milestone-ceschiatti-1961');
  assert.equal(mCeschiatti.slideId, 'slide-6');
  assert.match(mCeschiatti.citation.heading, /CESCHIATTI’S JUSTICE \(1961\)/);

  const fallback = getTimelineMilestoneById('non-existent-id');
  assert.equal(fallback.id, LEGAL_CIRCULATION_TIMELINE[0].id);
});

test('formatMilestoneCitationNote includes Dauchy and Brazilian constitutional details', () => {
  const m1824 = getTimelineMilestoneById('milestone-1748-1824');
  const formatted = formatMilestoneCitationNote(m1824);
  assert.match(formatted, /CONSTITUTION OF 1824, ARTICLE 10/);
  assert.match(formatted, /S1 · S3/);
});
