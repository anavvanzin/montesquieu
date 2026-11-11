/**
 * Parallel Legal Circulation Timeline Data & Pure Lookup Logic
 * Connects Montesquieu (1689–1755; De l’esprit des lois, 1748) and Serge Dauchy’s conference paper
 * with all active slides (02–06) in Ana Vitória Vanzin Mendes’s 7-slide discussant intervention.
 */

export const LEGAL_CIRCULATION_TIMELINE = [
  {
    id: 'milestone-bordeaux-spirit',
    periodLabel: '1689–1755 · 1748',
    theme: 'circulation',
    slideId: 'slide-2',
    sourceAnchor: '#src-montesquieu',
    sourceCode: 'S1 · S2',
    french: {
      year: '1689–1755 / 1748',
      institution: 'Parlement of Bordeaux & De l’esprit des lois',
      title: 'Who Was Montesquieu: Laws, Circumstances & Liberty',
      summary:
        'Magistrate in the Parlement of Bordeaux (an Ancien Régime court, not a modern legislature); his 1748 treatise relates laws to forms of government, customs, religion, commerce, geography, and history.'
    },
    brazilian: {
      year: 'Discussant Lens',
      institution: 'Security Under Laws & Limits on Public Power',
      title: 'More Than an Abstract Diagram of Government',
      summary:
        'Frames political liberty as living without fear of arbitrary power—opening the question of how legal contexts shift as ideas and institutions circulate (Dauchy §§ 7, 11–14).'
    },
    citation: {
      heading: 'MONTESQUIEU (1689–1755), PARLEMENT OF BORDEAUX & THE SPIRIT OF THE LAWS (1748)',
      primaryQuote:
        'Political liberty requires security under laws and limits on those who exercise public power—relating laws to customs, religion, commerce, geography, and history.',
      bibliographicRef:
        'MONTESQUIEU, De l’esprit des lois (1748; 1777 ed.) · DAUCHY, Serge, « Montesquieu, De l’esprit des lois (1748) », PPGD/UFSC, 2026.',
      methodologicalNote:
        'Clarify that the Parlement of Bordeaux was a judicial court rather than a modern legislative parliament, and that Montesquieu offers more than a formal diagram of government.',
      externalUrl: 'https://fr.wikisource.org/wiki/Esprit_des_lois_(1777)/L11/C6',
      externalLabel: 'Wikisource · De l’esprit des lois (1777)'
    },
    researchPrompt:
      'Examine Montesquieu’s judicial role in the Parlement of Bordeaux and how De l’esprit des lois (1748) connects political liberty with societal circumstances and security under laws.'
  },
  {
    id: 'milestone-book-xi-limits',
    periodLabel: '1748 · Book XI, Ch. 6',
    theme: 'constitutional',
    slideId: 'slide-3',
    sourceAnchor: '#src-montesquieu',
    sourceCode: 'S2',
    french: {
      year: '1748 · Book XI, Ch. 6',
      institution: 'De l’esprit des lois, Book XI, chapter 6',
      title: 'Legislative, Executive & Judicial Functions',
      summary:
        'Distinguishes making laws, conducting government, and judging crimes and disputes to prevent oppressive concentration of public authority.'
    },
    brazilian: {
      year: 'Historical Distance',
      institution: 'Relational Restraint vs. Modern Constitutional Courts',
      title: 'Limits on Power Without Anachronism',
      summary:
        'Separating functions does not mean isolated institutions with no relation—and 1748 judging must be distinguished from today’s permanent constitutional courts.'
    },
    citation: {
      heading: 'THREE POWERS & LIMITS ON POWER — DE L’ESPRIT DES LOIS, BOOK XI, CHAPTER 6',
      primaryQuote:
        'Legislative (making laws) · Executive (conducting government) · Judicial (judging crimes and disputes) — preventing unchecked accumulation of power.',
      bibliographicRef:
        'MONTESQUIEU, Charles-Louis de Secondat, De l’esprit des lois (1748; 1777 ed.), Book XI, chapter 6.',
      methodologicalNote:
        'Keep historical distance in view: Montesquieu’s 1748 account of judging is not a description of modern permanent constitutional courts.',
      externalUrl: 'https://fr.wikisource.org/wiki/Esprit_des_lois_(1777)/L11/C6',
      externalLabel: 'Wikisource · Book XI, chapter 6'
    },
    researchPrompt:
      'Analyze Montesquieu’s warning against concentrated legislative, executive, and judicial functions in Book XI, chapter 6 of De l’esprit des lois and its historical distance from modern constitutional courts.'
  },
  {
    id: 'milestone-1748-1824',
    periodLabel: '1823–1824 · Art. 10',
    theme: 'constitutional',
    slideId: 'slide-4',
    sourceAnchor: '#src-const-1824',
    sourceCode: 'S1 · S3',
    french: {
      year: '1748 / 1815',
      institution: 'Montesquieu & Benjamin Constant (Dauchy § 6)',
      title: 'Pre-Independence Circulation & Pouvoir Neutre',
      summary:
        'Montesquieu circulated in Brazil before independence and in the 1823 Constituent Assembly debates alongside Benjamin Constant’s constitutional theory.'
    },
    brazilian: {
      year: '1824',
      institution: 'Constitution of 1824 · Article 10',
      title: 'Four Powers: Legislative · Moderating · Executive · Judicial',
      summary:
        'Article 10 explicitly recognised four powers, vesting the Moderating Power in the emperor through choices and adaptation in an independent monarchy.'
    },
    citation: {
      heading: 'MONTESQUIEU IN BRAZIL, 1824 — CONSTITUTION OF 1824, ARTICLE 10 & DAUCHY (§ 6)',
      primaryQuote:
        'Os Poderes Politicos reconhecidos pela Constituição do Imperio do Brazil são quatro: o Poder Legislativo, o Poder Moderador, o Poder Executivo, e o Poder Judicial.',
      bibliographicRef:
        'BRASIL, Constituição Política do Império do Brazil, 25 mar. 1824, art. 10 · DAUCHY, Serge, conference paper, paragraph 6.',
      methodologicalNote:
        'The Moderating Power belonged to the emperor under Benjamin Constant’s model; it was not another branch invented by Montesquieu.',
      externalUrl:
        'https://www2.camara.leg.br/legin/fed/consti/1824-1899/constituicao-35041-25-marco-1824-532540-publicacaooriginal-14770-pl.html',
      externalLabel: 'Câmara dos Deputados · Constituição de 1824'
    },
    researchPrompt:
      'Compare the circulation of Montesquieu in the 1823–1824 Brazilian constitutional debates with Article 10 of the 1824 Constitution and Benjamin Constant’s Moderating Power.'
  },
  {
    id: 'milestone-figueiredo-1896',
    periodLabel: '1891 / 1896 · Arts. 15 & 44',
    theme: 'iconography',
    slideId: 'slide-5',
    sourceAnchor: '#src-figueiredo',
    sourceCode: 'S3 · S4',
    french: {
      year: 'Republican Constitutionalism',
      institution: 'Distinct & Related Offices in Ceremony',
      title: 'Representing Executive Authority Under Obligation',
      summary:
        'Tests how historical painting stages the relationship between executive commitment and legislative assembly.'
    },
    brazilian: {
      year: '1891 Event / 1896 Canvas',
      institution: 'Museu da República & Constitution of 1891',
      title: 'Aurélio de Figueiredo, Compromisso Constitucional (1896)',
      summary:
        'Represents Deodoro da Fonseca’s oath of 26 Feb. 1891 before Prudente de Moraes and the Constituent Congress (cf. 1891 Const., Arts. 15 & 44).'
    },
    citation: {
      heading: 'REPRESENTING DISTINCT AND RELATED INSTITUTIONS — FIGUEIREDO (1896) & 1891 CONSTITUTION',
      primaryQuote:
        'Aurélio de Figueiredo, Compromisso Constitucional, 1896 (oath of 26 Feb. 1891) · Constitution of 1891, Art. 15 (harmonious and independent powers) & Art. 44 (presidential oath).',
      bibliographicRef:
        'MUSEU DA REPÚBLICA, Compromisso Constitucional, 1896 (Oil on canvas, 330 × 257 cm; Reproduction: Romulo Fialdini) · BRASIL, Constituição de 1891, arts. 15, 44.',
      methodologicalNote:
        'Reading the canvas as “authority under an obligation” is the discussant’s interpretation; the ceremony cannot prove independence in practice or direct influence from Montesquieu.',
      externalUrl: 'https://museudarepublica.acervos.museus.gov.br/acervo-museologico/pintura-historica-4/',
      externalLabel: 'Museu da República · Compromisso Constitucional'
    },
    researchPrompt:
      'Verify the Museu da República provenance of Aurélio de Figueiredo’s Compromisso Constitucional (1896, representing the oath of 26 February 1891) alongside Articles 15 and 44 of the 1891 Brazilian Constitution.'
  },
  {
    id: 'milestone-ceschiatti-1961',
    periodLabel: '1961 · STF Brasília',
    theme: 'iconography',
    slideId: 'slide-6',
    sourceAnchor: '#src-ceschiatti',
    sourceCode: 'S5 · S6',
    french: {
      year: 'Judicial Iconography & Liberty',
      institution: 'Visual Ideal vs. Legal & Institutional Guarantees',
      title: 'The Sword at Rest & Judicial Autonomy',
      summary:
        'Connects Dauchy’s emphasis on civil/criminal laws and judicial institutions (§ 7) with the limits of what an allegory can guarantee.'
    },
    brazilian: {
      year: '1961',
      institution: 'Supremo Tribunal Federal · Praça dos Três Poderes',
      title: 'Alfredo Ceschiatti, A Justiça (1961) & Simioni’s Reading',
      summary:
        'Seated granite figure holding a resting sword across her lap before the STF in Brasília; read with Arno’s prompt and Rafael Simioni’s study on autonomy.'
    },
    citation: {
      heading: 'CESCHIATTI’S JUSTICE (1961): THE SWORD, AUTONOMY & INSTITUTIONAL PRACTICE',
      primaryQuote:
        'Alfredo Ceschiatti, A Justiça, 1961 (STF, Praça dos Três Poderes) — An image can make institutional independence visible as an ideal; sustaining it depends on laws and practices.',
      bibliographicRef:
        'STF, A Justiça, 1961 (Granite, 3.30 m; Photograph: Fellipe Sampaio / STF) · SIMIONI, Rafael Lazzarotto (study on Ceschiatti’s sculpture and judicial autonomy).',
      methodologicalNote:
        'Treat the sword as a contextual hypothesis about this sculpture in the Praça dos Três Poderes rather than a universal symbol or proof that judges are protected from interference in practice.',
      externalUrl:
        'https://noticias.stf.jus.br/postsnoticias/130-anos-conheca-os-destaques-do-acervo-cultural-stf/',
      externalLabel: 'STF · Acervo Cultural (A Justiça)'
    },
    researchPrompt:
      'Examine Alfredo Ceschiatti’s 1961 granite sculpture A Justiça before the Supremo Tribunal Federal in Brasília and Rafael Simioni’s interpretation of the resting sword and judicial autonomy.'
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
