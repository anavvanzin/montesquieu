/**
 * Academic Annotations & Critical Footnotes Data Module
 * For Ana Vitória Vanzin Mendes's discussant presentation:
 * "Discussing Dauchy’s Montesquieu: Context, reception and the representation of powers"
 * PPGD/UFSC · 11 November 2026.
 *
 * Provides real-time gloss, primary source citations, Dauchy manuscript paragraph ties (¶1–14),
 * and discussant interventions for highlighted/selected scholarly terms.
 */

export const ACADEMIC_ANNOTATIONS = {
  'esprit-general': {
    key: 'esprit-general',
    term: 'Esprit général',
    shortTerm: 'esprit général',
    category: 'PRIMARY SOURCE · MONTESQUIEU',
    primarySlide: 2,
    relatedSlides: [1, 2, 6, 7],
    dauchyParagraph: '¶8–10',
    sourceCitation: 'Montesquieu, De l’esprit des lois (1748), Book XIX, Chap. 4',
    quoteOriginal:
      '« Plusieurs choses gouvernent les hommes : le climat, la religion, les lois, les maximes du gouvernement, les exemples des choses passées, les mœurs, les manières ; d’où il se forme un esprit général qui en résulte. »',
    quoteLanguage: 'fr',
    quoteTranslation:
      'Several things govern men: climate, religion, laws, the maxims of government, examples of past things, mores, manners; whence a general spirit is formed as their result. [tr. AVVM]',
    scholarlyFootnote:
      'Montesquieu synthesizes physical (climate, terrain) and moral (mores, religion, constitutional maxims) causes into an organic totality. As Serge Dauchy observes in ¶8–10, positive laws cannot be severed from this historical fabric without generating institutional dissonance: laws must correspond to the unique “general spirit” formed by a nation’s history.',
    discussantIntervention:
      'In Brazil, the 1824 and 1891 constitutions wrestled with this exact tension: could European constitutional formulas function legitimately in a society founded on plantation slavery and rural oligarchy? The “esprit général” became both a conservative justification for exceptional powers (the Moderating Power) and a critical mirror for liberal reformers.',
    searchAliases: [
      'esprit general',
      'esprit général',
      "l'esprit général",
      "l'esprit general",
      'general spirit',
      'esprit général d’une nation',
      'esprit general d une nation'
    ]
  },

  'moderating-power': {
    key: 'moderating-power',
    term: 'Moderating Power (Poder Moderador)',
    shortTerm: 'Moderating power',
    category: 'CONSTITUTIONAL THEORY · 1824',
    primarySlide: 3,
    relatedSlides: [1, 3, 4, 7],
    dauchyParagraph: '¶6',
    sourceCitation: 'Constituição Política do Império do Brasil (25 March 1824), Arts. 10 & 98',
    quoteOriginal:
      '« Art. 10. Os Poderes Politicos reconhecidos pela Constituição do Imperio do Brazil são quatro: o Poder Legislativo, o Poder Moderador, o Poder Executivo, e o Poder Judicial. »',
    quoteLanguage: 'pt',
    quoteTranslation:
      'Art. 10. The Political Powers recognized by the Constitution of the Empire of Brazil are four: the Legislative Power, the Moderating Power, the Executive Power, and the Judicial Power. [tr. AVVM]',
    scholarlyFootnote:
      'Serge Dauchy notes in ¶6 that the 1824 Brazilian imperial charter represented « une évolution voire une correction » of Montesquieu’s classical tripartition. Conceived through Benjamin Constant’s doctrine of the neutral power (pouvoir neutre, Cours de politique constitutionnelle, 1818–1820) and adapted by Silvestre Pinheiro Ferreira, the Emperor was vested with supreme authority to balance and harmonize the three active branches.',
    discussantIntervention:
      'Far from remaining a purely neutral balancing wheel, the imperial Moderating Power functioned as the institutional apex of centralization: empowering Dom Pedro I and Dom Pedro II to dissolve recalcitrant Parliaments, appoint life senators, and dismiss cabinets until the 1889 republican proclamation.',
    searchAliases: [
      'moderating power',
      'poder moderador',
      'quarto poder',
      'pouvoir neutre',
      'neutral power',
      'art. 10',
      'artigo 10',
      'four powers'
    ]
  },

  'system-of-liberty': {
    key: 'system-of-liberty',
    term: 'System of Liberty (Système de liberté)',
    shortTerm: 'system of liberty',
    category: 'PRIMARY SOURCE · MONTESQUIEU',
    primarySlide: 2,
    relatedSlides: [1, 2, 4, 5, 7],
    dauchyParagraph: '¶7',
    sourceCitation: 'Montesquieu, De l’esprit des lois (1748), Book XI, Chap. 6 & Book XII, Chap. 2',
    quoteOriginal:
      '« Pour former un gouvernement modéré, il faut combiner les puissances, les régler, les tempérer, les faire agir ; donner, pour ainsi dire, un lest à l’une, pour la mettre en état de résister à une autre. »',
    quoteLanguage: 'fr',
    quoteTranslation:
      'To form a moderate government, one must combine the powers, regulate them, temper them, make them act; to give, so to speak, ballast to one, so it can resist another. [tr. AVVM]',
    scholarlyFootnote:
      'Serge Dauchy stresses in ¶7: « Enfermer Montesquieu dans une vision purement “constitutionnaliste” serait toutefois réducteur. » Political liberty in Montesquieu is two-fold: structural equilibrium between branches (Book XI), and the citizen’s tranquility of mind grounded in criminal procedural guarantees and civil security (Book XII, Chap. 2: « La liberté politique consiste dans la sûreté, ou du moins dans l’opinion que l’on a de sa sûreté »).',
    discussantIntervention:
      'In peripheral legal orders, formal separation of powers frequently coexists with arbitrary penal enforcement and systemic denial of bodily security. Dauchy’s pairing of Book XI and Book XII demonstrates why constitutional geometry is hollow without everyday judicial fairness.',
    searchAliases: [
      'system of liberty',
      'système de liberté',
      'systeme de liberte',
      'political liberty',
      'liberté politique',
      'liberte politique',
      'conditions of liberty',
      'gouvernement modéré',
      'gouvernement modere'
    ]
  },

  'pedra-de-petropolis': {
    key: 'pedra-de-petropolis',
    term: 'Pedra de Petrópolis (Materiality of Justice)',
    shortTerm: 'pedra de Petrópolis',
    category: 'ICONOGRAPHY & PUBLIC ART · STF',
    primarySlide: 5,
    relatedSlides: [1, 5, 7],
    dauchyParagraph: '¶7',
    sourceCitation: 'Alfredo Ceschiatti, A Justiça (1961), Praça dos Três Poderes, Brasília · STF',
    quoteOriginal:
      'Escultura monolítica de 3,30 metros de altura esculpida em pedra branca de Petrópolis (gnaisse/rocha metamórfica regional), representando a Justiça sentada com a espada em repouso sobre o regaço e olhos vendados.',
    quoteLanguage: 'pt',
    quoteTranslation:
      'Monolithic 3.30-meter seated figure carved in white Petrópolis stone (regional metamorphic gneiss), blindfolded with a sheathed sword resting horizontally on her lap. [STF Cultural Heritage]',
    scholarlyFootnote:
      'Strict material guardrail: Ceschiatti’s sculpture is carved in white Petrópolis stone (pedra de Petrópolis), never granite. In classical European iconography, Justice stands aloft wielding the scales in one hand and an upright sword in the other. Ceschiatti seated Justice directly upon the stone plaza floor, scales absent, sword horizontal across her lap—signaling judicial restraint, institutional deliberation, and accessibility.',
    discussantIntervention:
      'Positioned directly in front of Niemeyer’s glass-walled STF palace, the stone figure embodies the physical vulnerability of judicial power in Brazilian constitutional crises—starkly evidenced on 8 January 2023 when the monument was defaced with the graffiti « Perdeu, Mané » during the assault on the Three Powers.',
    searchAliases: [
      'pedra de petrópolis',
      'pedra de petropolis',
      'petrópolis stone',
      'petropolis stone',
      'ceschiatti',
      'alfredo ceschiatti',
      'a justiça',
      'a justica',
      'escultura da justiça'
    ]
  },

  'transplantes-juridicos': {
    key: 'transplantes-juridicos',
    term: 'Transplantes Jurídicos (Legal Transplants & Hybridity)',
    shortTerm: 'transplantes jurídicos',
    category: 'COMPARATIVE LAW & CIRCULATION',
    primarySlide: 6,
    relatedSlides: [1, 6, 7],
    dauchyParagraph: '¶11–14',
    sourceCitation: 'Watson (1974) vs. Legrand (1997) vs. Teubner (1998) · Civil Code of 1916',
    quoteOriginal:
      '« Dans quelle mesure le Code civil de 1916 a-t-il réussi à intégrer des éléments du modèle juridique français tout en préservant les particularités du direito brésilien ? »',
    quoteLanguage: 'fr',
    quoteTranslation:
      'To what extent did the 1916 Civil Code succeed in integrating elements of the French legal model while preserving the specificities of Brazilian law? [Serge Dauchy, ¶13]',
    scholarlyFootnote:
      'Dauchy juxtaposes Alan Watson’s model of easily circulating legal rules against Pierre Legrand’s thesis that legal transplants are impossible because rules cannot be disembedded from their cultural meaning. Gunther Teubner re-conceptualizes imported norms as “legal irritants” that provoke systemic mutations inside the host order.',
    discussantIntervention:
      'Clóvis Beviláqua’s 1916 Brazilian Civil Code is an exemplary case of deliberate hybridity: adopting German pandectist systematization (General Part), French Code Civil contractualism, and conservative Brazilian agrarian-family customs. Context is not a pre-existing seal—context is continuously negotiated through contact.',
    searchAliases: [
      'transplantes jurídicos',
      'transplantes juridicos',
      'legal transplants',
      'legal transplant',
      'alan watson',
      'pierre legrand',
      'teubner',
      'gunther teubner',
      'beviláqua',
      'bevilaqua',
      'clóvis beviláqua',
      'code of 1916',
      'código civil de 1916'
    ]
  },

  'compromisso-constitucional': {
    key: 'compromisso-constitucional',
    term: 'Compromisso Constitucional (1896 Painting)',
    shortTerm: 'Compromisso Constitucional',
    category: 'ICONOGRAPHY & REPUBLICAN FOUNDATIONS',
    primarySlide: 4,
    relatedSlides: [1, 4, 7],
    dauchyParagraph: '¶6',
    sourceCitation: 'Aurélio de Figueiredo (1896), Museu Histórico Nacional / Museu da República',
    quoteOriginal:
      '« Compromisso Constitucional: Prometo manter, defender e cumprir com lealdade a Constituição da República dos Estados Unidos do Brasil. » (Juramento de 26 de fevereiro de 1891).',
    quoteLanguage: 'pt',
    quoteTranslation:
      'Constitutional Oath: I promise to maintain, defend, and loyally execute the Constitution of the Republic of the United States of Brazil. (Oath of 26 February 1891) [tr. AVVM]',
    scholarlyFootnote:
      'Aurélio de Figueiredo’s monumental 1896 canvas (330 × 257 cm) visualizes Marshal Deodoro da Fonseca taking the constitutional oath before Prudente de Moraes. Legitimacy shifts dramatically from the Emperor’s divine dynasty to an open parchment document held under oath before the elected constituent assembly.',
    discussantIntervention:
      'The painting stages an idealized theater of republican constitutional legality. In reality, Deodoro dissolved Congress merely eight months later (November 1891), provoking a naval revolt and resignation. The artwork visualizes the fragile tension between military power and constitutional fidelity in Brazil’s early republic.',
    searchAliases: [
      'compromisso constitucional',
      'aurélio de figueiredo',
      'aurelio de figueiredo',
      'deodoro da fonseca',
      'juramento constitucional',
      'oath of 1891',
      '1891 constitution',
      'prudente de moraes'
    ]
  },

  'frontieres-renegociees': {
    key: 'frontieres-renegociees',
    term: 'Renegotiated Legal Boundaries',
    shortTerm: 'renegotiated legal boundaries',
    category: 'CRITICAL DISCUSSANT THESIS',
    primarySlide: 7,
    relatedSlides: [1, 6, 7],
    dauchyParagraph: '¶14',
    sourceCitation: 'Serge Dauchy Manuscript (2026), ¶14 & Slide 7 Discussant Question 1',
    quoteOriginal:
      '« Leurs frontières sont constamment renégociées au gré des contextes historiques, des besoins sociopolitiques et des dynamiques intellectuelles. »',
    quoteLanguage: 'fr',
    quoteTranslation:
      'Their boundaries are constantly renegotiated according to historical contexts, socio-political needs, and intellectual dynamics. [Serge Dauchy, ¶14]',
    scholarlyFootnote:
      'Serge Dauchy concludes his paper by moving beyond rigid dualisms between universalist transplants and closed historical determinism. Legal traditions do not possess fixed territorial borders; their perimeters are porous zones of translation, adaptation, and ideological contestation.',
    discussantIntervention:
      'Question 1 posed to Serge Dauchy: When legal boundaries are renegotiated in post-colonial legal systems, how do we distinguish between genuine domestic appropriation of French ideas and conservative instrumentalization that preserves social hierarchies under the veneer of European Enlightenment doctrine?',
    searchAliases: [
      'frontières renégociées',
      'frontieres renegociees',
      'renegotiated legal boundaries',
      'renegotiated boundaries',
      'renégociées',
      'boundary renegotiation',
      'renegociação de fronteiras'
    ]
  }
};

export const ANNOTATION_KEYS = Object.keys(ACADEMIC_ANNOTATIONS);

/**
 * Normalizes text for resilient matching (strips diacritics, punctuation, lowercases).
 * @param {string} text
 * @returns {string}
 */
export function normalizeAnnotationText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[«»“”"''’‘`.,;:\-–—()[\]{}?!*\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Finds the best matching academic annotation for a user-highlighted or selected string.
 * @param {string} rawSelectedText
 * @returns {object|null} Matching annotation entry or null
 */
export function findAnnotationForSelection(rawSelectedText) {
  if (!rawSelectedText || typeof rawSelectedText !== 'string') return null;
  const clean = normalizeAnnotationText(rawSelectedText);
  if (clean.length < 3) return null;

  // 1. Direct key match
  if (ACADEMIC_ANNOTATIONS[clean]) {
    return ACADEMIC_ANNOTATIONS[clean];
  }

  // 2. Exact match against aliases
  for (const entry of Object.values(ACADEMIC_ANNOTATIONS)) {
    for (const alias of entry.searchAliases) {
      const cleanAlias = normalizeAnnotationText(alias);
      if (clean === cleanAlias) {
        return entry;
      }
    }
  }

  // 3. Substring match: selection contains alias OR alias contains selection
  let bestMatch = null;
  let maxScore = 0;

  for (const entry of Object.values(ACADEMIC_ANNOTATIONS)) {
    for (const alias of entry.searchAliases) {
      const cleanAlias = normalizeAnnotationText(alias);
      if (clean.includes(cleanAlias)) {
        const score = cleanAlias.length * 2;
        if (score > maxScore) {
          maxScore = score;
          bestMatch = entry;
        }
      } else if (cleanAlias.includes(clean) && clean.length >= 5) {
        const score = clean.length;
        if (score > maxScore) {
          maxScore = score;
          bestMatch = entry;
        }
      }
    }
  }

  return bestMatch;
}

/**
 * Returns all annotations relevant to a specific slide number (1–7).
 * @param {number} slideNum
 * @returns {object[]}
 */
export function getAnnotationsForSlide(slideNum) {
  const num = Number(slideNum);
  return Object.values(ACADEMIC_ANNOTATIONS).filter(
    (item) => item.primarySlide === num || (item.relatedSlides && item.relatedSlides.includes(num))
  );
}

/**
 * Formats bibliographic academic citation in ABNT or Chicago style.
 * @param {object} entry
 * @param {'abnt'|'chicago'} style
 * @returns {string}
 */
export function formatAnnotationCitation(entry, style = 'abnt') {
  if (!entry) return '';
  if (style === 'chicago') {
    return `${entry.sourceCitation}. Quoted and discussed in: Ana Vitória Vanzin Mendes, "Discussing Dauchy’s Montesquieu: Context, reception and the representation of powers," Discussant paper following Serge Dauchy, PPGD/UFSC, Florianópolis, November 11, 2026.`;
  }
  return `MENDES, Ana Vitória Vanzin. Discussing Dauchy’s Montesquieu: Context, reception and the representation of powers. Debatedora em conferência de Serge Dauchy. Florianópolis: CCJ/PPGD-UFSC, 11 nov. 2026. Ref: ${entry.sourceCitation}.`;
}
