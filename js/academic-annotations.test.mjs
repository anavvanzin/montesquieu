import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACADEMIC_ANNOTATIONS,
  ANNOTATION_KEYS,
  normalizeAnnotationText,
  findAnnotationForSelection,
  getAnnotationsForSlide,
  formatAnnotationCitation
} from './academic-annotations.mjs';

test('normalizeAnnotationText strips diacritics, punctuation, and trims excess whitespace', () => {
  assert.equal(normalizeAnnotationText('« l’esprit général d’une nation »'), 'l esprit general d une nation');
  assert.equal(normalizeAnnotationText('Poder Moderador (Art. 10)'), 'poder moderador art 10');
  assert.equal(normalizeAnnotationText('pedra de Petrópolis...'), 'pedra de petropolis');
});

test('findAnnotationForSelection matches exact terms and diacritic-free variants', () => {
  const match1 = findAnnotationForSelection('esprit général');
  assert.ok(match1);
  assert.equal(match1.key, 'esprit-general');

  const match1b = findAnnotationForSelection('esprit general');
  assert.ok(match1b);
  assert.equal(match1b.key, 'esprit-general');

  const match2 = findAnnotationForSelection('Moderating power');
  assert.ok(match2);
  assert.equal(match2.key, 'moderating-power');

  const match2b = findAnnotationForSelection('poder moderador');
  assert.ok(match2b);
  assert.equal(match2b.key, 'moderating-power');
});

test('findAnnotationForSelection handles phrase selections containing annotated terms', () => {
  const phrase1 = findAnnotationForSelection('this reflects the esprit général across nineteenth-century Brazil');
  assert.ok(phrase1);
  assert.equal(phrase1.key, 'esprit-general');

  const phrase2 = findAnnotationForSelection('exercise of the Moderating power under the 1824 Constitution');
  assert.ok(phrase2);
  assert.equal(phrase2.key, 'moderating-power');

  const phrase3 = findAnnotationForSelection('carved in white pedra de Petrópolis by Alfredo Ceschiatti');
  assert.ok(phrase3);
  assert.equal(phrase3.key, 'pedra-de-petropolis');

  const phrase4 = findAnnotationForSelection('debate on transplantes jurídicos and Clóvis Beviláqua');
  assert.ok(phrase4);
  assert.equal(phrase4.key, 'transplantes-juridicos');
});

test('Slide 5 guardrail: Ceschiatti stone material is strictly pedra de Petrópolis and never granite', () => {
  const entry = ACADEMIC_ANNOTATIONS['pedra-de-petropolis'];
  assert.ok(entry);
  assert.match(entry.term, /pedra de petrópolis/i);
  assert.match(entry.scholarlyFootnote, /never granite/i);
  assert.match(entry.scholarlyFootnote, /pedra de Petrópolis/i);
});

test('Slide 7 guardrail: Discussant Question 1 focuses on renegotiation of legal boundaries', () => {
  const entry = ACADEMIC_ANNOTATIONS['frontieres-renegociees'];
  assert.ok(entry);
  assert.equal(entry.primarySlide, 7);
  assert.match(entry.discussantIntervention, /Question 1/i);
  assert.match(entry.discussantIntervention, /renegotiated/i);
});

test('getAnnotationsForSlide returns relevant entries for given slide', () => {
  const slide2Items = getAnnotationsForSlide(2);
  assert.ok(slide2Items.some((item) => item.key === 'esprit-general'));
  assert.ok(slide2Items.some((item) => item.key === 'system-of-liberty'));

  const slide3Items = getAnnotationsForSlide(3);
  assert.ok(slide3Items.some((item) => item.key === 'moderating-power'));

  const slide5Items = getAnnotationsForSlide(5);
  assert.ok(slide5Items.some((item) => item.key === 'pedra-de-petropolis'));
});

test('formatAnnotationCitation produces ABNT and Chicago citations', () => {
  const entry = ACADEMIC_ANNOTATIONS['esprit-general'];
  const abnt = formatAnnotationCitation(entry, 'abnt');
  const chicago = formatAnnotationCitation(entry, 'chicago');

  assert.match(abnt, /MENDES, Ana Vitória Vanzin/);
  assert.match(abnt, /De l’esprit des lois/);
  assert.match(chicago, /Discussing Dauchy’s Montesquieu/);
  assert.match(chicago, /November 11, 2026/);
});

test('all registered academic annotations have complete citations, translations, and discussant interventions', () => {
  const requiredKeys = [
    'esprit-general',
    'moderating-power',
    'system-of-liberty',
    'pedra-de-petropolis',
    'transplantes-juridicos',
    'compromisso-constitucional',
    'frontieres-renegociees'
  ];

  for (const key of requiredKeys) {
    assert.ok(ANNOTATION_KEYS.includes(key), `Missing required key: ${key}`);
    const entry = ACADEMIC_ANNOTATIONS[key];
    assert.ok(entry, `Entry for ${key} must exist`);
    assert.ok(entry.term && entry.term.length > 0, `${key} term must be defined`);
    assert.ok(entry.category && entry.category.length > 0, `${key} category must be defined`);
    assert.ok(entry.sourceCitation && entry.sourceCitation.length > 0, `${key} citation must be defined`);
    assert.ok(entry.quoteOriginal && entry.quoteOriginal.length > 0, `${key} quote must be defined`);
    assert.ok(entry.quoteTranslation && entry.quoteTranslation.length > 0, `${key} translation must be defined`);
    assert.ok(entry.scholarlyFootnote && entry.scholarlyFootnote.length > 0, `${key} footnote must be defined`);
    assert.ok(entry.discussantIntervention && entry.discussantIntervention.length > 0, `${key} discussant reading must be defined`);
    assert.ok(entry.dauchyParagraph && entry.dauchyParagraph.startsWith('¶'), `${key} dauchyParagraph must be a ¶ reference`);
  }
});

