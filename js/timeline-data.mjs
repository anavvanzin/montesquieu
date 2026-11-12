/**
 * Parallel Legal Circulation Timeline Data & Pure Lookup Logic (v3)
 * Maps Serge Dauchy’s 14-paragraph manuscript (¶6–14) and Montesquieu’s De l’esprit des lois (1777 text)
 * across Slides 02–06 of Ana Vitória Vanzin Mendes’s discussant intervention.
 */

export const LEGAL_CIRCULATION_TIMELINE = [
  {
    id: 'milestone-liberty-esprit',
    periodLabel: '1748 / 1777 · ¶7–10',
    theme: 'circulation',
    slideId: 'slide-2',
    sourceAnchor: '#src-montesquieu',
    sourceCode: 'S1 · S2',
    french: {
      year: '1748 / 1777 · XIX.4',
      institution: 'Montesquieu XIX.4 & Dauchy ¶7–10',
      title: 'Liberty Beyond a “Constitutionalist” Formula',
      summary:
        '« Enfermer Montesquieu dans une vision purement “constitutionnaliste” serait toutefois réducteur » (Dauchy ¶7); laws interact with climate, religion, maxims, mores, and « manieres » to form an « esprit général » (XIX.4).'
    },
    brazilian: {
      year: 'Discussant Reading',
      institution: 'Civil, Criminal & Judicial Guarantees',
      title: 'Conditions of Political Liberty Below the Line',
      summary:
        'Constitutional provisions must be seconded by civil and criminal laws and an institutional frame « (surtout judiciaire) »; « système de liberté » stays strictly Dauchy’s attribution.'
    },
    citation: {
      heading: 'LIBERTY BEYOND THE CONSTITUTION & ESPRIT GÉNÉRAL — DAUCHY ¶7–10 & MONTESQUIEU XIX.4',
      primaryQuote:
        '« Plusieurs choses gouvernent les hommes, le climat, la religion, les lois, les maximes du gouvernement, les exemples des choses passées, les mœurs, les manieres ; d’où il se forme un esprit général qui en résulte. » (XIX.4)',
      bibliographicRef:
        'DAUCHY, Serge, manuscript, ¶7–10 · MONTESQUIEU, Esprit des lois (1777), Livre XIX, chap. 4 (Wikisource).',
      methodologicalNote:
        'Preserve 1777 spelling « manieres »; keep « système de liberté » as Dauchy’s analytical synthesis rather than a verified Montesquieu quote.',
      externalUrl: 'https://fr.wikisource.org/wiki/Esprit_des_lois_(1777)/L19/C4',
      externalLabel: 'Wikisource · Esprit des lois (1777), XIX.4'
    },
    researchPrompt:
      'Examine Serge Dauchy’s critique of a purely constitutionalist reading of Montesquieu alongside Book XIX, chapter 4 of De l’esprit des lois (1777) on the esprit général.'
  },
  {
    id: 'milestone-1748-1824',
    periodLabel: '1789–1824 · ¶6',
    theme: 'constitutional',
    slideId: 'slide-3',
    sourceAnchor: '#src-const-1824',
    sourceCode: 'S1 · S3',
    french: {
      year: '1789 · 1798 · 1823 (¶6)',
      institution: 'Dauchy’s Brazilian Circulation Account',
      title: 'Clandestine Reading & Benjamin Constant',
      summary:
        'Dauchy traces circulation via 1789 (Minas Gerais), 1798 (Cipriano Barata’s confiscated library in Bahia), and the 1823 Constituent Assembly debates prior to the 1949 translation.'
    },
    brazilian: {
      year: '1824 · Art. 10',
      institution: 'Constituição Política do Império do Brazil',
      title: 'Legislativo · Moderador · Executivo · Judicial',
      summary:
        'Article 10 enumerates four political powers in exact constitutional order—described by Dauchy (¶6) as « une évolution voire une correction » of Montesquieu’s tripartition.'
    },
    citation: {
      heading: 'BRAZIL, 1824: CIRCULATION & FOUR POWERS — DAUCHY ¶6 & CONSTITUIÇÃO DE 1824, ART. 10',
      primaryQuote:
        'Os Poderes Politicos reconhecidos pela Constituição do Imperio do Brazil são quatro: o Poder Legislativo, o Poder Moderador, o Poder Executivo, e o Poder Judicial.',
      bibliographicRef:
        'BRASIL, Constituição Política do Império do Brazil, 25 mar. 1824, art. 10 · DAUCHY, Serge, manuscript, ¶6.',
      methodologicalNote:
        'Show Dauchy’s 1789 / 1798 / 1823 / 1949 chronology explicitly as his account, and distinguish selective monarchical adaptation from an automatic causal chain.',
      externalUrl:
        'https://www2.camara.leg.br/legin/fed/consti/1824-1899/constituicao-35041-25-marco-1824-532540-publicacaooriginal-14770-pl.html',
      externalLabel: 'Câmara dos Deputados · Constituição de 1824'
    },
    researchPrompt:
      'Compare Article 10 of the 1824 Imperial Constitution of Brazil (Legislative, Moderating, Executive, Judicial) with Benjamin Constant’s pouvoir neutre and Montesquieu’s tripartition.'
  },
  {
    id: 'milestone-figueiredo-1896',
    periodLabel: '1891 / 1896 · ¶6–7',
    theme: 'iconography',
    slideId: 'slide-4',
    sourceAnchor: '#src-figueiredo',
    sourceCode: 'S3 · S4',
    french: {
      year: 'Constitutional Obligation',
      institution: 'Dauchy ¶6–7 & Republican Form',
      title: 'Staging Harmonious & Bound Offices',
      summary:
        'Tests how ceremonial painting represents the bond between executive power, constitutional text, and legislative assembly.'
    },
    brazilian: {
      year: '1891 Oath / 1896 Canvas',
      institution: 'Museu da República · Const. 1891 Arts. 15 & 44',
      title: 'Aurélio de Figueiredo, Compromisso Constitucional (1896)',
      summary:
        'Oil on canvas, 330 × 257 cm: Deodoro da Fonseca’s oath of 26 Feb. 1891 with Prudente de Moraes presiding at the centre (reproduction: Romulo Fialdini).'
    },
    citation: {
      heading: 'COMPROMISSO CONSTITUCIONAL (1896) & CONSTITUTION OF 1891, ARTS. 15 AND 44',
      primaryQuote:
        'Aurélio de Figueiredo, Compromisso Constitucional, 1896 (oath of 26 Feb. 1891) · Constitution of 1891, art. 15 (harmonious and independent powers) & art. 44 (presidential oath).',
      bibliographicRef:
        'MUSEU DA REPÚBLICA, Compromisso Constitucional, 1896 (330 × 257 cm; Reproduction: Romulo Fialdini) · BRASIL, Constituição de 1891, arts. 15, 44.',
      methodologicalNote:
        'Set below the #1F35FF line as MY READING: makes executive authority under obligation visible, without proving de facto independence or direct reception of Montesquieu.',
      externalUrl: 'https://museudarepublica.acervos.museus.gov.br/acervo-museologico/pintura-historica-4/',
      externalLabel: 'Museu da República · Compromisso Constitucional'
    },
    researchPrompt:
      'Verify the Museu da República catalogue entry for Aurélio de Figueiredo’s Compromisso Constitucional (1896, oath of 26 February 1891) alongside Articles 15 and 44 of the 1891 Brazilian Constitution.'
  },
  {
    id: 'milestone-ceschiatti-1961',
    periodLabel: '1748 XI.6 / 1961 · ¶7',
    theme: 'iconography',
    slideId: 'slide-5',
    sourceAnchor: '#src-ceschiatti',
    sourceCode: 'S2 · S5',
    french: {
      year: '1748 · XI.6 & ¶7',
      institution: 'Montesquieu XI.6 & Dauchy ¶7',
      title: '« En quelque façon nulle » vs. Judicial Frame',
      summary:
        'Contrasts Montesquieu’s 1748 statement on judging with Dauchy’s emphasis in ¶7 on civil/criminal laws and « un cadre institutionnel (surtout judiciaire) ».'
    },
    brazilian: {
      year: '1961 · Stone (3.30 m)',
      institution: 'Supremo Tribunal Federal · Praça dos Três Poderes',
      title: 'Alfredo Ceschiatti, A Justiça (Stone / Pedra de Petrópolis)',
      summary:
        'Seated stone sculpture holding a resting sword across her lap before the STF in Brasília (photo: Fellipe Sampaio / STF; cf. Simioni 2021).'
    },
    citation: {
      heading: 'A JUSTIÇA (1961, STONE), MONTESQUIEU XI.6 & DAUCHY’S JUDICIAL FRAME (¶7)',
      primaryQuote:
        '« Des trois puissances dont nous avons parlé, celle de juger est en quelque façon nulle. » (Montesquieu, XI.6) · Alfredo Ceschiatti, A Justiça, 1961, stone (“pedra de Petrópolis”), 3.30 m, STF.',
      bibliographicRef:
        'MONTESQUIEU, Esprit des lois (1777), XI.6 · STF, A Justiça, 1961 (Stone / pedra de Petrópolis, 3.30 m; Photo: Fellipe Sampaio / STF).',
      methodologicalNote:
        'Material verified as stone (“pedra de Petrópolis”), correcting v2’s “granite”. Neither artwork is offered as evidence of a direct reception of Montesquieu.',
      externalUrl:
        'https://noticias.stf.jus.br/postsnoticias/130-anos-conheca-os-destaques-do-acervo-cultural-stf/',
      externalLabel: 'STF · Acervo Cultural (A Justiça)'
    },
    researchPrompt:
      'Examine Alfredo Ceschiatti’s 1961 stone (“pedra de Petrópolis”) sculpture A Justiça before the Supremo Tribunal Federal in Brasília alongside Montesquieu XI.6 and Rafael Simioni’s reading of judicial autonomy.'
  },
  {
    id: 'milestone-transplants-1916',
    periodLabel: '1916 / 1974 / 1997 · ¶11–14',
    theme: 'circulation',
    slideId: 'slide-6',
    sourceAnchor: '#src-transplants',
    sourceCode: 'S1 · S6',
    french: {
      year: '1748 I.3 · 1974 · 1997',
      institution: 'Montesquieu I.3 · Watson · Legrand (¶10–12)',
      title: 'Rootedness, Transplants & Contextualité',
      summary:
        'Moves from Montesquieu I.3 (« un très-grand hasard ») to Watson’s rules that “grow in its new body” (1974) and Legrand’s « impossibles » transplants (1997, MJ 4(2): 111–124).'
    },
    brazilian: {
      year: '1916 · ¶13–14',
      institution: 'Código Civil de 1916 · Clóvis Beviláqua',
      title: 'Historical Hybridity & Renegotiated Boundaries',
      summary:
        'Dauchy highlights « transplantations imposées, … réceptions assumées » and asks how Beviláqua’s 1916 Civil Code illustrates renegotiated legal boundaries.'
    },
    citation: {
      heading: 'TRANSPLANTS, HYBRIDITY & THE CODE OF 1916 — DAUCHY ¶10–14, WATSON (1974) & LEGRAND (1997)',
      primaryQuote:
        '« Elles doivent être tellement propres au peuple pour lequel elles sont faites, que c’est un très-grand hasard si celles d’une nation peuvent convenir à une autre. » (Montesquieu, I.3, quoted in Dauchy ¶10)',
      bibliographicRef:
        'DAUCHY, Serge, manuscript, ¶10–14 · WATSON, Legal Transplants (1974) · LEGRAND, MJ 4(2): 111–124 (1997).',
      methodologicalNote:
        'My reading: context is also made through contact. On Beviláqua’s 1916 Code, the slides ask rather than overclaiming prior to inspecting the drafting record.',
      externalUrl: 'https://fr.wikisource.org/wiki/Esprit_des_lois_(1777)/L1/C3',
      externalLabel: 'Wikisource · Esprit des lois (1777), I.3'
    },
    researchPrompt:
      'Analyze Alan Watson (1974) and Pierre Legrand (1997, Maastricht Journal 4(2): 111–124) on legal transplants in relation to Montesquieu I.3 and Clóvis Beviláqua’s 1916 Brazilian Civil Code.'
  }
];

/**
 * Filter timeline entries by thematic category ('all', 'constitutional', 'iconography', 'circulation').
 * @param {string} themeFilter
 * @returns {Array}
 */
export function filterTimelineByTheme(themeFilter = 'all') {
  const normalized = String(themeFilter || 'all').trim().toLowerCase();
  if (!normalized || normalized === 'all') {
    return [...LEGAL_CIRCULATION_TIMELINE];
  }
  return LEGAL_CIRCULATION_TIMELINE.filter((item) => item.theme === normalized);
}

/**
 * Retrieve a specific timeline milestone by its id, falling back to the first entry.
 * @param {string} id
 * @returns {Object}
 */
export function getTimelineMilestoneById(id) {
  if (!id) return LEGAL_CIRCULATION_TIMELINE[0];
  const found = LEGAL_CIRCULATION_TIMELINE.find((item) => item.id === id);
  return found || LEGAL_CIRCULATION_TIMELINE[0];
}

/**
 * Format a plain-text scholarly citation note for clipboard export or research grounding.
 * @param {Object} milestone
 * @returns {string}
 */
export function formatMilestoneCitationNote(milestone) {
  if (!milestone || !milestone.citation) return '';
  return [
    `${milestone.periodLabel} — ${milestone.citation.heading}`,
    `France / Theory (${milestone.french.year}): ${milestone.french.title} — ${milestone.french.summary}`,
    `Brazil / Response (${milestone.brazilian.year}): ${milestone.brazilian.title} — ${milestone.brazilian.summary}`,
    `Key Formulation: ${milestone.citation.primaryQuote}`,
    `Source Citation (${milestone.sourceCode}): ${milestone.citation.bibliographicRef}`,
    `Methodological Note: ${milestone.citation.methodologicalNote}`
  ].join('\n\n');
}
