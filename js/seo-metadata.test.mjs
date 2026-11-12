import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  DEFAULT_CANONICAL_DOMAIN,
  DEFAULT_PORTFOLIO_URL,
  SLIDE_METADATA,
  resolveCanonicalDomain,
  resolveSlideRouteKey,
  getSlideMetadata,
  buildCanonicalUrl,
  buildAbsoluteAssetUrl,
  generateSchemaOrgJsonLd,
  buildOpenGraphSnippet,
  injectServerRenderedMetadata,
} = require('../seo-metadata.cjs');

test('resolveCanonicalDomain defaults to montesquieu.anavanzin.com and trims trailing slashes', () => {
  assert.equal(resolveCanonicalDomain(), 'https://montesquieu.anavanzin.com');
  assert.equal(DEFAULT_PORTFOLIO_URL, 'https://www.anavanzin.com/projetos');
  assert.equal(
    resolveCanonicalDomain('https://custom-domain.org/'),
    'https://custom-domain.org'
  );
});

test('resolveSlideRouteKey correctly identifies deep-linked slide paths and special views', () => {
  assert.equal(resolveSlideRouteKey('/'), 'deck');
  assert.equal(resolveSlideRouteKey('/index.html'), 'deck');
  assert.equal(resolveSlideRouteKey('/slide/1'), '1');
  assert.equal(resolveSlideRouteKey('/slide/5'), '5');
  assert.equal(resolveSlideRouteKey('/slide/7'), '7');
  assert.equal(resolveSlideRouteKey('/sources'), 'sources');
  assert.equal(resolveSlideRouteKey('/landing'), 'landing');
  assert.equal(resolveSlideRouteKey('/stories'), 'stories');
  assert.equal(resolveSlideRouteKey('/slide/99'), null);
});

test('SLIDE_METADATA covers all 7 slides, sources, landing, and stories with high-fidelity assets', () => {
  for (let i = 1; i <= 7; i++) {
    const meta = SLIDE_METADATA[i];
    assert.ok(meta, `Slide ${i} metadata must exist`);
    assert.equal(meta.slideNumber, i);
    assert.equal(meta.canonicalPath, `/slide/${i}`);
    assert.ok(meta.title.includes(`Slide ${i}:`));
    assert.ok(meta.description.length >= 80, `Slide ${i} description must be substantial`);
    assert.ok(meta.image.startsWith('/'), `Slide ${i} image must have a valid path`);
  }

  // Slide 5 must specifically reference pedra de Petrópolis and never granite
  const s5 = SLIDE_METADATA[5];
  assert.ok(
    s5.description.toLowerCase().includes('pedra de petrópolis'),
    'Slide 5 must cite pedra de Petrópolis'
  );
  assert.ok(
    !s5.description.toLowerCase().includes('granite') &&
      !s5.subtitle.toLowerCase().includes('granite'),
    'Slide 5 must never use granite'
  );

  // Slide 7 must reference two questions for Serge Dauchy
  const s7 = SLIDE_METADATA[7];
  assert.ok(
    s7.description.toLowerCase().includes('renegotiating legal boundaries') ||
      s7.description.toLowerCase().includes('two'),
    'Slide 7 must cover discussant questions for Serge Dauchy'
  );

  // Stories must use 9:16 vertical poster
  const stories = SLIDE_METADATA.stories;
  assert.equal(stories.imageWidth, 1080);
  assert.equal(stories.imageHeight, 1920);
});

test('buildCanonicalUrl and buildAbsoluteAssetUrl produce fully-qualified URLs', () => {
  const url = buildCanonicalUrl('https://montesquieu.anavanzin.com', '/slide/3');
  assert.equal(url, 'https://montesquieu.anavanzin.com/slide/3');

  const assetUrl = buildAbsoluteAssetUrl('https://montesquieu.anavanzin.com', '/assets/report/justica.jpg');
  assert.equal(assetUrl, 'https://montesquieu.anavanzin.com/assets/report/justica.jpg');
});

test('generateSchemaOrgJsonLd includes PresentationDigitalDocument, UFSC affiliation, and event details', () => {
  const meta = SLIDE_METADATA[3];
  const schema = generateSchemaOrgJsonLd(meta, 'https://montesquieu.anavanzin.com');

  assert.equal(schema['@context'], 'https://schema.org');
  assert.ok(Array.isArray(schema['@graph']));
  const doc = schema['@graph'][0];
  assert.equal(doc['@type'], 'PresentationDigitalDocument');
  assert.equal(doc.url, 'https://montesquieu.anavanzin.com/slide/3');
  assert.equal(doc.author.name, 'Ana Vitória Vanzin Mendes');
  assert.ok(doc.author.sameAs.includes('https://www.anavanzin.com/projetos'));
  assert.ok(doc.author.affiliation.name.includes('UFSC'));
  assert.ok(doc.isPartOf.name.includes('A circulação das ideias e saberes'));
  assert.equal(doc.isPartOf.performer[0].name, 'Serge Dauchy');
});

test('injectServerRenderedMetadata transforms HTML with server-rendered tags and initial slide attributes', () => {
  const mockHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Old description">
  <title>Old title</title>
</head>
<body><h1>Deck</h1></body>
</html>`;

  const transformed = injectServerRenderedMetadata(
    mockHtml,
    '/slide/4',
    'https://montesquieu.anavanzin.com'
  );

  assert.ok(transformed.includes('<base href="/">'), 'Must inject base href');
  assert.ok(
    transformed.includes('<title>Slide 4: Making Legal Authority Visible'),
    'Must inject slide 4 title'
  );
  assert.ok(
    transformed.includes('<link rel="canonical" href="https://montesquieu.anavanzin.com/slide/4">'),
    'Must inject slide 4 canonical tag'
  );
  assert.ok(
    transformed.includes('<meta property="og:title" content="Slide 4: Making Legal Authority Visible'),
    'Must inject Open Graph title'
  );
  assert.ok(
    transformed.includes('<meta property="og:url" content="https://montesquieu.anavanzin.com/slide/4">'),
    'Must inject Open Graph URL'
  );
  assert.ok(
    transformed.includes('<meta name="twitter:card" content="summary_large_image">'),
    'Must inject Twitter card'
  );
  assert.ok(
    transformed.includes('data-initial-slide="4"'),
    'Must set data-initial-slide attribute on html element'
  );
  assert.ok(
    transformed.includes('data-curtain-bypassed="true"'),
    'Must bypass curtain for deep-linked slide'
  );
  assert.ok(!transformed.includes('Old title'), 'Old title must be removed');
  assert.ok(!transformed.includes('Old description'), 'Old description must be removed');
});
