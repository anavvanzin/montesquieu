import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LEGAL_CIRCULATION_TIMELINE,
  filterTimelineByTheme,
  getTimelineMilestoneById,
  formatMilestoneCitationNote
} from './timeline-data.mjs';

test('LEGAL_CIRCULATION_TIMELINE contains 5 verified milestones mapped to Slides 2–6', () => {
  assert.equal(LEGAL_CIRCULATION_TIMELINE.length, 5);
  assert.deepEqual(
    LEGAL_CIRCULATION_TIMELINE.map((m) => m.slideId),
    ['slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6']
  );
});

test('Slide 5 milestone uses stone ("pedra de Petrópolis") for Ceschiatti’s A Justiça and never granite', () => {
  const m1961 = getTimelineMilestoneById('milestone-ceschiatti-1961');
  assert.ok(m1961);
  assert.equal(m1961.slideId, 'slide-5');
  assert.match(m1961.citation.primaryQuote, /pedra de Petrópolis/);
  assert.doesNotMatch(JSON.stringify(m1961.brazilian), /granite/i);
});

test('Slide 6 milestone covers Transplants, Hybridity & the 1916 Civil Code (Dauchy ¶10–14)', () => {
  const m1916 = getTimelineMilestoneById('milestone-transplants-1916');
  assert.ok(m1916);
  assert.equal(m1916.slideId, 'slide-6');
  assert.match(m1916.french.institution, /Watson.*Legrand/);
  assert.match(m1916.brazilian.summary, /transplantations imposées.*réceptions assumées/);
});

test('filterTimelineByTheme and formatMilestoneCitationNote work accurately', () => {
  const all = filterTimelineByTheme('all');
  assert.equal(all.length, 5);
  const circulation = filterTimelineByTheme('circulation');
  assert.equal(circulation.length, 2);

  const note = formatMilestoneCitationNote(all[0]);
  assert.match(note, /1748/);
  assert.match(note, /Source Citation/);
});
