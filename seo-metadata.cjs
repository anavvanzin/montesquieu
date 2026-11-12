/**
 * SEO & OpenGraph Server-Side Metadata Engine
 *
 * Provides canonical URLs, Open Graph tags, Twitter summary cards, and Schema.org
 * structured data (JSON-LD) for deep-linked slide views (/slide/1..7), sources,
 * event landing, and 9:16 vertical stories preview.
 *
 * Configurable via SITE_URL or CANONICAL_DOMAIN environment variables, defaulting
 * to the personal website domain.
 */

const DEFAULT_CANONICAL_DOMAIN = 'https://montesquieu.anavanzin.com';
const DEFAULT_PORTFOLIO_URL = 'https://www.anavanzin.com/projetos';

const SLIDE_METADATA = {
  deck: {
    key: 'deck',
    path: '/',
    canonicalPath: '/',
    slideNumber: null,
    title: 'Whose Liberty? Montesquieu in Brazil | Ana Vitória Vanzin Mendes · PPGD/UFSC',
    description: 'Archival record of the 10-minute discussant intervention by Ana Vitória Vanzin Mendes following Serge Dauchy at PPGD/UFSC (11 Nov. 2026) on Montesquieu, legal transfers, and the representation of powers.',
    kicker: 'ARCHIVAL RECORD · PRESENTED 11 NOVEMBER 2026 · PPGD/UFSC',
    subtitle: 'Context, reception and the representation of powers',
    image: '/public/assets/aistudio/c9c1d695-f5e3-4da2-b7dc-d4a3788e04bf_3353c5b9.png',
    imageWidth: 1600,
    imageHeight: 900,
    imageAlt: 'Oil-impasto painted maps of France and Brazil integrated on archival parchment',
  },
  1: {
    key: '1',
    path: '/slide/1',
    canonicalPath: '/slide/1',
    slideNumber: 1,
    title: 'Slide 1: Whose Liberty? Montesquieu in Brazil | Ana Vitória Vanzin Mendes · PPGD/UFSC',
    description: 'Intervention opening: Montesquieu’s De l’esprit des lois (1748), Dauchy’s wider system of liberty, and the Franco-Brazilian circulation of legal ideas at PPGD/UFSC.',
    kicker: 'SLIDE 01 / 07 · INTERVENTION OPENING (0:00–1:07)',
    subtitle: 'Context, reception and the representation of powers (Dauchy ¶7, ¶13–14)',
    image: '/public/assets/aistudio/c9c1d695-f5e3-4da2-b7dc-d4a3788e04bf_3353c5b9.png',
    imageWidth: 1600,
    imageHeight: 900,
    imageAlt: 'Oil-impasto painted flags of France and Brazil integrated on archival parchment',
  },
  2: {
    key: '2',
    path: '/slide/2',
    canonicalPath: '/slide/2',
    slideNumber: 2,
    title: 'Slide 2: A “System of Liberty” (¶7–10) | Montesquieu in Brazil',
    description: 'Beyond the three-branch formula: Serge Dauchy on Montesquieu’s system of liberty linking constitutional structures, criminal law, and institutional climate.',
    kicker: 'SLIDE 02 / 07 · LIBERTY IN MONTESQUIEU (1:07–2:35)',
    subtitle: 'Political liberty beyond the constitutional formula (Dauchy ¶7–10)',
    image: '/assets/report/montesquieu-oval.webp',
    imageWidth: 1365,
    imageHeight: 1615,
    imageAlt: 'Oval portrait medal of Charles-Louis de Secondat, Baron de Montesquieu',
  },
  3: {
    key: '3',
    path: '/slide/3',
    canonicalPath: '/slide/3',
    slideNumber: 3,
    title: 'Slide 3: Brazil, 1824 — Four Powers & Constitutional Circulation | Montesquieu in Brazil',
    description: 'Brazil’s 1824 Constitution, Article 10: Legislative, Moderating, Executive, and Judicial. Creative adaptation, Benjamin Constant, and European circulation.',
    kicker: 'SLIDE 03 / 07 · BRAZILIAN CONSTITUTIONAL RECEPTION (2:35–4:03)',
    subtitle: 'Circulation, correction, and four powers (Dauchy ¶6 & 1824 Art. 10)',
    image: '/assets/report/compromisso.jpg',
    imageWidth: 1920,
    imageHeight: 1080,
    imageAlt: 'Archival record of Brazilian constitutional assembly and deliberation',
  },
  4: {
    key: '4',
    path: '/slide/4',
    canonicalPath: '/slide/4',
    slideNumber: 4,
    title: 'Slide 4: Making Legal Authority Visible — 1896 Oath | Montesquieu in Brazil',
    description: 'Aurélio de Figueiredo’s 1896 Compromisso Constitucional: staging republican legality, the 1891 oath, and civic memory at the Câmara dos Deputados.',
    kicker: 'SLIDE 04 / 07 · VISUAL AUTHORITY IN 1896 (4:03–5:31)',
    subtitle: 'Compromisso Constitucional (Aurélio de Figueiredo, 1896) & 1891 Const.',
    image: '/assets/report/compromisso.jpg',
    imageWidth: 1920,
    imageHeight: 1080,
    imageAlt: 'Aurélio de Figueiredo, Compromisso Constitucional, 1896. Deodoro da Fonseca taking the oath of 26 February 1891',
  },
  5: {
    key: '5',
    path: '/slide/5',
    canonicalPath: '/slide/5',
    slideNumber: 5,
    title: 'Slide 5: 1961 Justice — A Justiça in Pedra de Petrópolis | Montesquieu in Brazil',
    description: 'Alfredo Ceschiatti’s 1961 A Justiça in pedra de Petrópolis at the Supremo Tribunal Federal: blindfolded, seated, sword at rest, engaging Dauchy ¶7 and XI.6.',
    kicker: 'SLIDE 05 / 07 · MONUMENTAL JUSTICE IN 1961 (5:31–6:59)',
    subtitle: 'A Justiça (pedra de Petrópolis), XI.6 & Dauchy ¶7 (Brasília, 1961)',
    image: '/assets/report/justica.jpg',
    imageWidth: 1200,
    imageHeight: 1600,
    imageAlt: 'Alfredo Ceschiatti, A Justiça, 1961 in pedra de Petrópolis (3.30m seated figure) at the Supremo Tribunal Federal, Brasília',
  },
  6: {
    key: '6',
    path: '/slide/6',
    canonicalPath: '/slide/6',
    slideNumber: 6,
    title: 'Slide 6: Transplants & Historical Hybridity (¶11–14) | Montesquieu in Brazil',
    description: 'Comparative legal transfers: Alan Watson, Pierre Legrand, Günther Teubner, and the 1916 Brazilian Civil Code. Legal hybridity as a lived historical reality.',
    kicker: 'SLIDE 06 / 07 · LEGAL TRANSFERS & HYBRIDITY (6:59–8:27)',
    subtitle: 'Watson, Legrand, hybridity & 1916 Civil Code (Dauchy ¶11–14)',
    image: '/public/assets/aistudio/c9c1d695-f5e3-4da2-b7dc-d4a3788e04bf_3353c5b9.png',
    imageWidth: 1600,
    imageHeight: 900,
    imageAlt: 'Impasto map depicting Franco-Brazilian legal circulation across the Atlantic',
  },
  7: {
    key: '7',
    path: '/slide/7',
    canonicalPath: '/slide/7',
    slideNumber: 7,
    title: 'Slide 7: Two Questions for Serge Dauchy | Montesquieu in Brazil',
    description: 'Concluding intervention questions: renegotiating legal boundaries under domestic constraints, and whether visual depictions of justice confirm or question liberty.',
    kicker: 'SLIDE 07 / 07 · TWO QUESTIONS FOR SERGE DAUCHY (8:27–9:55)',
    subtitle: 'Renegotiated boundaries & the visual staging of legal authority',
    image: '/assets/report/montesquieu-oval.webp',
    imageWidth: 1365,
    imageHeight: 1615,
    imageAlt: 'Archival medallion portrait of Montesquieu and discussant dialogue',
  },
  sources: {
    key: 'sources',
    path: '/sources',
    canonicalPath: '/sources',
    slideNumber: null,
    title: 'Sources & Archival References | Discussing Dauchy’s Montesquieu · PPGD/UFSC',
    description: 'Complete verified documentary corpus, historical treatises, primary constitutional editions (1824 and 1891), and comparative legal historiography.',
    kicker: 'ARCHIVAL HERITAGE · VERIFIED SOURCES',
    subtitle: 'Full primary editions and secondary comparative bibliography',
    image: '/assets/report/montesquieu-oval.webp',
    imageWidth: 1365,
    imageHeight: 1615,
    imageAlt: 'Documentary sources and Montesquieu critical editions',
  },
  landing: {
    key: 'landing',
    path: '/landing',
    canonicalPath: '/landing',
    slideNumber: null,
    title: 'Event Poster & Archival Record | A circulação das ideias e saberes franceses · PPGD/UFSC',
    description: 'Official conference poster and presentation portal: Serge Dauchy (CNRS/Lille) and Ana Vitória Vanzin Mendes (UFSC), 11 November 2026 at CCJ/UFSC Florianópolis.',
    kicker: 'PPGD-UFSC · 11 NOV 2026 · FLORIANÓPOLIS',
    subtitle: 'Colóquio Internacional: A circulação das ideias e saberes franceses',
    image: '/public/assets/aistudio/c9c1d695-f5e3-4da2-b7dc-d4a3788e04bf_3353c5b9.png',
    imageWidth: 1600,
    imageHeight: 900,
    imageAlt: 'PPGD-UFSC official conference poster art and presentation portal',
  },
  stories: {
    key: 'stories',
    path: '/stories',
    canonicalPath: '/stories',
    slideNumber: null,
    title: 'Archival Stories Walkthrough (9:16 HD) | Discussing Dauchy’s Montesquieu',
    description: 'Full 7-slide guided sequence in 9:16 vertical mobile stories format with high-definition visuals, Chopin Nocturne accompaniment, and interactive callouts.',
    kicker: 'MOBILE STORIES PREVIEW · 9:16 HD (1080×1920)',
    subtitle: 'Full 7-slide archival intervention walkthrough with audio',
    image: '/public/assets/stories-poster.jpg',
    imageWidth: 1080,
    imageHeight: 1920,
    imageAlt: 'High-definition 9:16 vertical stories preview poster of Discussing Dauchy’s Montesquieu',
  },
};

function resolveCanonicalDomain(customDomain) {
  const candidate = (
    customDomain ||
    process.env.CANONICAL_DOMAIN ||
    process.env.SITE_URL ||
    DEFAULT_CANONICAL_DOMAIN
  ).trim();
  return candidate.replace(/\/+$/, '');
}

function resolveSlideRouteKey(pathname) {
  const clean = String(pathname || '').trim().replace(/\/+$/, '') || '/';
  if (clean === '/' || clean === '/index.html') return 'deck';
  const slideMatch = clean.match(/^\/slide\/([1-7])$/);
  if (slideMatch) return slideMatch[1];
  if (clean === '/sources' || clean === '/sources.html') return 'sources';
  if (clean === '/landing' || clean === '/landing.html') return 'landing';
  if (clean === '/stories' || clean === '/stories.html') return 'stories';
  return null;
}

function getSlideMetadata(routeKeyOrPath) {
  const key = resolveSlideRouteKey(routeKeyOrPath) || String(routeKeyOrPath);
  return SLIDE_METADATA[key] || SLIDE_METADATA.deck;
}

function buildCanonicalUrl(baseDomain, canonicalPath) {
  const domain = resolveCanonicalDomain(baseDomain);
  const path = canonicalPath.startsWith('/') ? canonicalPath : '/' + canonicalPath;
  return `${domain}${path}`;
}

function buildAbsoluteAssetUrl(baseDomain, relativeOrAbsolute) {
  const domain = resolveCanonicalDomain(baseDomain);
  if (/^https?:\/\//i.test(relativeOrAbsolute)) {
    return relativeOrAbsolute;
  }
  const clean = relativeOrAbsolute.startsWith('/') ? relativeOrAbsolute : '/' + relativeOrAbsolute;
  return `${domain}${clean}`;
}

function generateSchemaOrgJsonLd(meta, baseDomain) {
  const canonicalUrl = buildCanonicalUrl(baseDomain, meta.canonicalPath);
  const imageUrl = buildAbsoluteAssetUrl(baseDomain, meta.image);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'PresentationDigitalDocument',
        '@id': `${canonicalUrl}#presentation`,
        name: meta.title,
        headline: meta.title,
        description: meta.description,
        url: canonicalUrl,
        image: imageUrl,
        datePublished: '2026-11-11T15:10:00-03:00',
        dateModified: '2026-11-12T00:00:00-03:00',
        inLanguage: ['en', 'pt', 'fr'],
        educationalUse: 'Scholarly Legal History Presentation & Archival Record',
        author: {
          '@type': 'Person',
          name: 'Ana Vitória Vanzin Mendes',
          jobTitle: 'Discussant · Doctoral Researcher',
          url: 'https://www.anavanzin.com',
          sameAs: [
            'https://www.anavanzin.com',
            'https://www.anavanzin.com/projetos',
            'https://www.anavanzin.com/trabalhos'
          ],
          affiliation: {
            '@type': 'EducationalOrganization',
            name: 'Universidade Federal de Santa Catarina (UFSC)',
            department: 'Programa de Pós-Graduação em Direito (PPGD)',
            url: 'https://ppgd.ufsc.br'
          }
        },
        contributor: [
          {
            '@type': 'Person',
            name: 'Serge Dauchy',
            jobTitle: 'Conferencista / Keynote',
            affiliation: 'CNRS / Université de Lille'
          },
          {
            '@type': 'Person',
            name: 'Marja Mangili',
            jobTitle: 'Debatedora',
            affiliation: 'UniCesusc'
          }
        ],
        publisher: {
          '@type': 'EducationalOrganization',
          name: 'Centro de Ciências Jurídicas · PPGD/UFSC',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Florianópolis',
            addressRegion: 'Santa Catarina',
            addressCountry: 'BR'
          }
        },
        isPartOf: {
          '@type': 'Event',
          name: 'A circulação das ideias e saberes franceses na ciência jurídica brasileira: Montesquieu',
          startDate: '2026-11-11T15:10:00-03:00',
          endDate: '2026-11-13T18:00:00-03:00',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          location: {
            '@type': 'Place',
            name: 'Auditório do Centro de Ciências Jurídicas (CCJ/UFSC)',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Campus Universitário Reitor João David Ferreira Lima, Trindade',
              addressLocality: 'Florianópolis',
              addressRegion: 'SC',
              postalCode: '88040-900',
              addressCountry: 'BR'
            }
          },
          performer: [
            {
              '@type': 'Person',
              name: 'Serge Dauchy',
              jobTitle: 'Conferencista / Keynote',
              affiliation: 'CNRS / Université de Lille'
            },
            {
              '@type': 'Person',
              name: 'Ana Vitória Vanzin Mendes',
              jobTitle: 'Debatedora',
              affiliation: 'PPGD/UFSC'
            },
            {
              '@type': 'Person',
              name: 'Marja Mangili',
              jobTitle: 'Debatedora',
              affiliation: 'UniCesusc'
            }
          ]
        }
      }
    ]
  };
}

function buildOpenGraphSnippet(meta, baseDomain) {
  const canonicalUrl = buildCanonicalUrl(baseDomain, meta.canonicalPath);
  const imageUrl = buildAbsoluteAssetUrl(baseDomain, meta.image);
  const jsonLd = JSON.stringify(generateSchemaOrgJsonLd(meta, baseDomain), null, 2);

  return [
    `  <base href="/">`,
    `  <title>${escapeHtml(meta.title)}</title>`,
    `  <meta name="description" content="${escapeHtml(meta.description)}">`,
    `  <link rel="canonical" href="${canonicalUrl}">`,
    `  <meta property="og:site_name" content="Whose Liberty? Montesquieu in Brazil · PPGD/UFSC">`,
    `  <meta property="og:title" content="${escapeHtml(meta.title)}">`,
    `  <meta property="og:description" content="${escapeHtml(meta.description)}">`,
    `  <meta property="og:url" content="${canonicalUrl}">`,
    `  <meta property="og:type" content="${meta.slideNumber ? 'article' : 'website'}">`,
    `  <meta property="og:image" content="${imageUrl}">`,
    `  <meta property="og:image:width" content="${meta.imageWidth}">`,
    `  <meta property="og:image:height" content="${meta.imageHeight}">`,
    `  <meta property="og:image:alt" content="${escapeHtml(meta.imageAlt)}">`,
    `  <meta property="og:locale" content="en_US">`,
    `  <meta property="og:locale:alternate" content="pt_BR">`,
    `  <meta property="og:locale:alternate" content="fr_FR">`,
    `  <meta name="twitter:card" content="summary_large_image">`,
    `  <meta name="twitter:title" content="${escapeHtml(meta.title)}">`,
    `  <meta name="twitter:description" content="${escapeHtml(meta.description)}">`,
    `  <meta name="twitter:image" content="${imageUrl}">`,
    `  <meta name="twitter:image:alt" content="${escapeHtml(meta.imageAlt)}">`,
    `  <meta name="author" content="Ana Vitória Vanzin Mendes (PPGD/UFSC)">`,
    `  <meta name="event:keynote" content="Serge Dauchy (CNRS/Université de Lille)">`,
    `  <meta name="event:venue" content="PPGD/UFSC · CCJ, Florianópolis">`,
    `  <meta name="event:date" content="2026-11-11T15:10:00-03:00">`,
    `  <script type="application/ld+json">`,
    `${jsonLd}`,
    `  </script>`,
  ].join('\n');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Transform index.html content by replacing head tags and injecting initial-slide / initial-view markers.
 */
function injectServerRenderedMetadata(indexHtml, routeKeyOrPath, baseDomain) {
  const meta = getSlideMetadata(routeKeyOrPath);
  const snippet = buildOpenGraphSnippet(meta, baseDomain);

  // Replace existing title, description, and canonical / OG / twitter meta tags
  let transformed = indexHtml;

  // Replace <title>...</title>
  transformed = transformed.replace(/<title>[\s\S]*?<\/title>/i, '');

  // Remove existing description, canonical, and OG / twitter tags from the head
  transformed = transformed.replace(/<meta\s+name=["']description["'][^>]*>/gi, '');
  transformed = transformed.replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '');
  transformed = transformed.replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '');
  transformed = transformed.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '');
  transformed = transformed.replace(/<base\s+href=[^>]*>/gi, '');
  transformed = transformed.replace(/<script\s+type=["']application\/ld\+json["'][\s\S]*?<\/script>/gi, '');

  // Insert fresh snippet right after <meta name="viewport" ...>
  transformed = transformed.replace(
    /(<meta\s+name=["']viewport["'][^>]*>)/i,
    `$1\n${snippet}`
  );

  // Set initial slide attributes on <html> tag if route is a specific slide
  if (meta.slideNumber) {
    transformed = transformed.replace(
      /<html([^>]*)>/i,
      (match, attrs) => {
        let nextAttrs = attrs
          .replace(/\s+data-initial-slide=["'][^"']*["']/gi, '')
          .replace(/\s+data-curtain-bypassed=["'][^"']*["']/gi, '');
        return `<html${nextAttrs} data-initial-slide="${meta.slideNumber}" data-curtain-bypassed="true">`;
      }
    );
  } else if (meta.key === 'sources') {
    transformed = transformed.replace(
      /<html([^>]*)>/i,
      (match, attrs) => {
        let nextAttrs = attrs
          .replace(/\s+data-initial-view=["'][^"']*["']/gi, '')
          .replace(/\s+data-curtain-bypassed=["'][^"']*["']/gi, '');
        return `<html${nextAttrs} data-initial-view="sources" data-curtain-bypassed="true">`;
      }
    );
  } else if (meta.key === 'stories') {
    transformed = transformed.replace(
      /<html([^>]*)>/i,
      (match, attrs) => {
        let nextAttrs = attrs
          .replace(/\s+data-initial-view=["'][^"']*["']/gi, '')
          .replace(/\s+data-curtain-bypassed=["'][^"']*["']/gi, '');
        return `<html${nextAttrs} data-initial-view="stories" data-curtain-bypassed="true">`;
      }
    );
  } else if (meta.key === 'landing') {
    transformed = transformed.replace(
      /<html([^>]*)>/i,
      (match, attrs) => {
        let nextAttrs = attrs
          .replace(/\s+data-initial-view=["'][^"']*["']/gi, '')
          .replace(/\s+data-curtain-bypassed=["'][^"']*["']/gi, '');
        return `<html${nextAttrs} data-initial-view="landing">`;
      }
    );
  }

  return transformed;
}

module.exports = {
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
};
