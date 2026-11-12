import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PRESENTATION_META,
  VOICE_CODE_KEY,
  DAUCHY_PARAGRAPH_MAP,
  PRINCIPAL_SLIDES,
  CITATION_VERIFICATION_ITEMS,
  PRIVATE_MANUSCRIPT_NOTES,
  VERIFIED_SOURCES,
  getSlideByNumber,
  getLecternScriptPages,
  computeLecternScriptMetrics,
  getConstellationCoordinates,
  clampMusicVolume,
  formatMusicStatusLabel,
  shouldBypassOpeningPoster,
  getPresenterTipForSlide,
  resolvePresenterTipState,
  computeSlideTransitionSpec
} from './presentation-data.mjs';

test('PRESENTATION_META defines the v3 Discussing Dauchy’s Montesquieu deck', () => {
  assert.equal(PRESENTATION_META.title, 'Discussing Dauchy’s Montesquieu');
  assert.equal(PRESENTATION_META.subtitle, 'Context, reception and the representation of powers');
  assert.equal(PRESENTATION_META.deckVersion, 'v3');
  assert.match(PRESENTATION_META.presenter, /Ana Vitória Vanzin Mendes/);
  assert.equal(PRESENTATION_META.dauchyBlue, '#1F35FF');
  assert.equal(
    PRESENTATION_META.handoutPdfUrl,
    './public/assets/aistudio/Discussing-Dauchy-handout_b097f5ac.pdf'
  );
});

test('VOICE_CODE_KEY and DAUCHY_PARAGRAPH_MAP define the 4-voice key and 5 manuscript paragraph bands', () => {
  assert.equal(VOICE_CODE_KEY.length, 4);
  assert.deepEqual(
    VOICE_CODE_KEY.map((v) => v.id),
    ['dauchy', 'montesquieu', 'other-source', 'my-reading']
  );

  assert.equal(DAUCHY_PARAGRAPH_MAP.length, 5);
  assert.deepEqual(
    DAUCHY_PARAGRAPH_MAP.map((m) => m.paraRef),
    ['¶6', '¶7', '¶8–10', '¶11–12', '¶13–14']
  );
});

test('PRINCIPAL_SLIDES contains 7 v3 slides with Dauchy ¶7, 1824 Art. 10, Figueiredo, Ceschiatti stone, Transplants/1916 Code, and Renegotiated Legal Boundaries', () => {
  assert.equal(PRINCIPAL_SLIDES.length, 7);

  for (let i = 0; i < 7; i++) {
    const slide = PRINCIPAL_SLIDES[i];
    assert.equal(slide.number, i + 1);
    assert.equal(slide.id, `slide-${i + 1}`);
    assert.ok(slide.title.length > 0);
    assert.ok(slide.montesquieuAnchor.length > 10);
    assert.ok(slide.keyPoint.length > 10);
  }

  // Slide 1: Opening
  const s1 = getSlideByNumber(1);
  assert.match(s1.title, /Discussing Dauchy’s Montesquieu/i);
  assert.match(s1.montesquieuAnchor, /Enfermer Montesquieu dans une vision purement/);

  // Slide 2: Political liberty beyond the constitutional formula
  const s2 = getSlideByNumber(2);
  assert.match(s2.title, /Political liberty beyond the constitutional formula/i);
  assert.match(s2.keyPoint, /système de liberté/);

  // Slide 3: Brazil, 1824
  const s3 = getSlideByNumber(3);
  assert.match(s3.title, /Brazil, 1824: circulation, correction, and four powers/i);

  // Slide 4: Compromisso Constitucional (1896)
  const s4 = getSlideByNumber(4);
  assert.match(s4.title, /Compromisso Constitucional/i);

  // Slide 5: A Justiça (1961) — stone ("pedra de Petrópolis"), never granite in artwork/script
  const s5 = getSlideByNumber(5);
  assert.match(s5.title, /A Justiça.*null.*power/i);
  assert.match(s5.artwork.material, /pedra de Petrópolis/);
  assert.doesNotMatch(JSON.stringify(s5.artwork), /granite/i);
  assert.doesNotMatch(JSON.stringify(s5.lecternScript), /granite/i);

  // Slide 6: Transplants, hybridity, and the Code of 1916
  const s6 = getSlideByNumber(6);
  assert.match(s6.title, /Transplants, hybridity, and the Code of 1916/i);

  // Slide 7: Two questions for Serge — Question 1 explicitly reflects Dauchy's renegotiation of legal boundaries
  const s7 = getSlideByNumber(7);
  assert.equal(s7.questions.length, 2);
  assert.match(s7.montesquieuAnchor, /leurs frontières sont constamment renégociées/);
  assert.match(s7.questions[0].text, /constantly renegotiated/i);
  assert.match(s7.questions[0].text, /imposed transfers, assumed receptions, and direct contact between legal orders/i);
  assert.match(s7.questions[0].subtext, /1916 Civil Code/i);
  assert.match(s7.questions[1].text, /political authority/i);
});

test('getLecternScriptPages and computeLecternScriptMetrics support cutting the Slide 5 XI.6 sentence', () => {
  const fullPages = getLecternScriptPages({ excludeCuttable: false });
  const cutPages = getLecternScriptPages({ excludeCuttable: true });
  assert.equal(fullPages.length, 7);
  assert.equal(cutPages.length, 7);

  // Slide 5 has 5 paragraphs normally and 4 when the cuttable XI.6 sentence is excluded
  assert.equal(fullPages[4].paragraphs.length, 5);
  assert.equal(cutPages[4].paragraphs.length, 4);

  const fullMetrics = computeLecternScriptMetrics({ excludeCuttable: false });
  const cutMetrics = computeLecternScriptMetrics({ excludeCuttable: true });
  assert.ok(fullMetrics.totalWords > cutMetrics.totalWords);
  assert.ok(fullMetrics.cuttableWords >= 25);
  assert.ok(fullMetrics.totalWords >= 1000 && fullMetrics.totalWords <= 1150);
});

test('CITATION_VERIFICATION_ITEMS, PRIVATE_MANUSCRIPT_NOTES, and VERIFIED_SOURCES are complete', () => {
  assert.equal(CITATION_VERIFICATION_ITEMS.length, 11);
  assert.equal(PRIVATE_MANUSCRIPT_NOTES.length, 6);
  assert.equal(VERIFIED_SOURCES.length, 6);

  // Verify Slide 5 citation item explicitly notes stone ("pedra de Petrópolis")
  const ceschiattiCheck = CITATION_VERIFICATION_ITEMS.find((c) => /A Justiça/.test(c.item));
  assert.ok(ceschiattiCheck);
  assert.match(ceschiattiCheck.item, /pedra de Petrópolis/);
});

test('Helper functions (constellation, music, curtain bypass, presenter tips, slide transitions) work accurately', () => {
  const c1 = getConstellationCoordinates(1);
  assert.equal(c1.mode, 'triad');
  assert.deepEqual(c1.leg, [50, 18]);
  assert.equal(clampMusicVolume(1.5), 0.35);
  assert.equal(clampMusicVolume(-0.2), 0);
  assert.match(formatMusicStatusLabel({ playing: true, volume: 0.25 }).shortLabel, /Nocturne/);
  assert.equal(shouldBypassOpeningPoster('?sync=UFSC-2026', ''), true);
  assert.equal(shouldBypassOpeningPoster('', '#slide-3'), true);
  assert.equal(shouldBypassOpeningPoster('', ''), false);

  const tip4 = getPresenterTipForSlide(4);
  assert.equal(tip4.slideNumber, 4);

  const tipState = resolvePresenterTipState(
    { activeSlide: null, mode: 'closed' },
    { type: 'click-toggle', slide: 2 }
  );
  assert.equal(tipState.activeSlide, 2);
  assert.equal(tipState.mode, 'pinned');

  const spec = computeSlideTransitionSpec(1, 2, { reducedMotion: false, smooth: true });
  assert.equal(spec.animate, true);
  assert.equal(spec.direction, 1);
});
