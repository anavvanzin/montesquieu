/**
 * Source-of-truth data module for Ana Vitória Vanzin Mendes's discussant response:
 * "Discussing Dauchy’s Montesquieu: Context, reception and the representation of powers" (v3)
 * Discussant intervention following Serge Dauchy · PPGD/UFSC · 11 November 2026.
 *
 * Implements the v3 structure:
 * - Corrected 7-slide argument centered on Serge Dauchy's 14-paragraph manuscript (¶1–14)
 * - Voice Code taxonomy (DAUCHY, MONTESQUIEU, OTHER SOURCE above #1F35FF line; MY READING below)
 * - Right-hand Dauchy Paragraph Map (¶6, ¶7, ¶8–10, ¶11–12, ¶13–14)
 * - Synchronized 7-page Lectern Script (~1,089 words + 45s pauses ≈ 9:28 at 125 wpm, with [ADDED, CUTTABLE] XI.6 option)
 * - Citation Check register (✓ / ⚠) and Presenter-Only Private Manuscript Notes (never shown on public slides)
 */

export const PRESENTATION_META = {
  deckVersion: 'v3',
  title: 'Discussing Dauchy’s Montesquieu',
  subtitle: 'Context, reception and the representation of powers',
  presenter: 'Ana Vitória Vanzin Mendes · Discussant',
  presenterAffiliation: 'Doctoral Researcher in Law · PPGD/UFSC · Florianópolis',
  event: 'A circulação das ideias e saberes franceses na ciência jurídica brasileira',
  eventKicker: 'PPGD-UFSC · CCJ/UFSC · 11 a 13 de novembro de 2026',
  eventTheme: 'Montesquieu',
  eventDateTime: '11 de novembro de 2026 · 15h10',
  keynoteSpeaker: 'Serge Dauchy (CNRS/Université de Lille)',
  discussants: ['Marja Mangili (UniCesusc)', 'Ana Vitória Vanzin Mendes (UFSC)'],
  panelContext:
    'TEMÁTICA: Montesquieu · 11 de novembro de 2026 · 15h10 · CCJ/UFSC · Conferencista: Serge Dauchy (CNRS/Université de Lille) · Debatedores: Marja Mangili (UniCesusc) & Ana Vitória Vanzin Mendes (UFSC)',
  handoutPdfUrl: './public/assets/aistudio/Discussing-Dauchy-handout_b097f5ac.pdf',
  eventPosterUrl: './public/assets/aistudio/7fefb9a6-f0ef-44ce-9981-b65916a5eb01__1__a4e5800a.png',
  flagsMixUrl: './public/assets/aistudio/c9c1d695-f5e3-4da2-b7dc-d4a3788e04bf_3353c5b9.png',
  backgroundMusic: {
    title: 'Frédéric Chopin — Nocturne Op. 9, No. 2 in E-flat major',
    shortTitle: 'Nocturne Op. 9, No. 2',
    src: './public/assets/aistudio/Classicals.de_-_Chopin_-_Nocturne_Op._9_no._2_in_E-flat_major_a91ca46b.mp3',
    defaultVolume: 0.12,
    maxVolume: 0.35
  },
  presenterTipsShortcut: 'N',
  lecternScriptShortcut: 'L',
  targetDurationMinutes: 10,
  dauchyBlue: '#1F35FF',
  timingNote:
    'Discussing Dauchy’s Montesquieu · v3 (~1,089 spoken words + 45s marked pauses ≈ 9:28 at 125 wpm; 9:08 at 130 wpm; 9:49 at 120 wpm; 9:34 at 120 wpm if Slide 5’s XI.6 sentence is cut).'
};

export const VOICE_CODE_KEY = [
  {
    id: 'dauchy',
    label: 'DAUCHY',
    variant: 'solid-blue',
    position: 'above',
    description: 'Serge Dauchy’s manuscript, quoted verbatim; ¶ numbers follow its order (¶1–14).'
  },
  {
    id: 'montesquieu',
    label: 'MONTESQUIEU',
    variant: 'solid-black',
    position: 'above',
    description: 'De l’esprit des lois, 1777 text, quoted verbatim.'
  },
  {
    id: 'other-source',
    label: 'OTHER SOURCE',
    variant: 'outlined-ink',
    position: 'above',
    description: 'Constitutions of 1824 and 1891; Watson and Legrand as Dauchy presents them.'
  },
  {
    id: 'my-reading',
    label: 'MY READING',
    variant: 'outlined-blue-mono',
    position: 'below',
    description: 'Ana Vitória’s interpretation, set below the #1F35FF line on every slide. Translations marked [tr. AVVM].'
  }
];

export const DAUCHY_PARAGRAPH_MAP = [
  {
    id: 'p6',
    paraRef: '¶6',
    slidesLabel: 'slides 3–4',
    shortTitle: 'BRAZIL · 1824',
    detail: 'Circulation, the 1823 Assembly, four powers « une évolution voire une correction » of the tripartition.',
    primarySlide: 3,
    answeredBySlides: [3, 4, 7]
  },
  {
    id: 'p7',
    paraRef: '¶7',
    slidesLabel: 'slides 1–2, 4–5',
    shortTitle: 'LIBERTY BEYOND THE CONSTITUTION',
    detail: 'Civil and criminal laws, and an institutional frame « (surtout judiciaire) ».',
    primarySlide: 2,
    answeredBySlides: [1, 2, 4, 5, 7]
  },
  {
    id: 'p8-10',
    paraRef: '¶8–10',
    slidesLabel: 'slide 2',
    shortTitle: 'THE SPIRIT OF THE LAWS',
    detail: 'Natural and historical determinants; the « esprit général ».',
    primarySlide: 2,
    answeredBySlides: [2]
  },
  {
    id: 'p11-12',
    paraRef: '¶11–12',
    slidesLabel: 'slide 6',
    shortTitle: 'WATSON · LEGRAND',
    detail: 'Transplants that “grow in a new body”; transplants as « impossibles ».',
    primarySlide: 6,
    answeredBySlides: [6, 7]
  },
  {
    id: 'p13-14',
    paraRef: '¶13–14',
    slidesLabel: 'slides 1, 6–7',
    shortTitle: 'HYBRIDITY · CODE OF 1916',
    detail: '« transplantations imposées, … réceptions assumées »; Dauchy’s question on Beviláqua’s Code.',
    primarySlide: 6,
    answeredBySlides: [1, 6, 7]
  }
];

export const PRINCIPAL_SLIDES = [
  {
    number: 1,
    id: 'slide-1',
    navLabel: '01 · Opening',
    kicker: '01 / 07 · DISCUSSING SERGE DAUCHY · PPGD/UFSC · 11 NOVEMBER 2026',
    title: 'Discussing Dauchy’s Montesquieu',
    subtitle: 'Context, reception and the representation of powers',
    presenter: 'Ana Vitória Vanzin Mendes · Discussant',
    durationSeconds: 67,
    targetDurationLabel: '1:05',
    estimatedAt125Wpm: '1:07',
    pauseSeconds: 5,
    lineHeightPct: 48,
    answeredParagraphs: ['p7', 'p13-14'],
    centralQuestion:
      'How does Serge Dauchy move from critiquing a purely “constitutionalist” reading of Montesquieu (¶7) to legal systems whose boundaries are constantly renegotiated (¶13–14)?',
    montesquieuAnchor:
      '« Enfermer Montesquieu dans une vision purement “constitutionnaliste” serait toutefois réducteur. » (Dauchy, ¶7) · Renegotiated boundaries & the 1916 Civil Code question (Dauchy, ¶14).',
    keyPoint:
      'Above the #1F35FF line sit the verbatim sources (Dauchy, Montesquieu 1777, constitutions & comparative literature); below it sits my reading.',
    lecternScript: {
      page: 1,
      heading: 'Slide 1  Discussing Dauchy’s Montesquieu (Opening)',
      elapsedRange: '0:00–1:07 · Target 1:05',
      stageLabel: 'Dauchy’s two tensions & how the slides speak',
      instruction:
        'Read the full prose (~125 wpm). Bracketed cues are silent. Above the #1F35FF line sit the sources; below it sits your reading.',
      paragraphs: [
        {
          leadIn: 'Thank you, Serge, and thank',
          rest: 'you, Arno. My name is Ana Vitória Vanzin Mendes, and I am a doctoral researcher in law here at UFSC.'
        },
        {
          leadIn: 'Rather than presenting a parallel',
          rest: 'paper, I want to engage Serge’s manuscript directly by building on two movements that organise his text.'
        },
        {
          leadIn: 'First, in paragraph seven, Serge',
          rest: 'writes that to confine Montesquieu within a purely “constitutionalist” vision would be reductive, because political liberty requires more than separating powers in a written constitution.'
        },
        {
          leadIn: 'Second, his paper moves from',
          rest: 'laws rooted in one nation’s particular history to legal systems whose boundaries are constantly renegotiated, closing in paragraph fourteen with two questions on Clóvis Beviláqua’s 1916 Civil Code.'
        },
        {
          leadIn: 'On every slide, sources sit',
          rest: 'above the blue line—coded for Serge, Montesquieu, and other texts—and my reading sits below it.'
        }
      ],
      stageCue: '[Pause 5 s · Point briefly to the Voice Code key. CHANGE TO SLIDE 2.]'
    },
    presenterTip: {
      heading: 'Dauchy’s Two Movements & Voice Code',
      pacing: '0:00–1:07 · Target 1:05 (5s pause)',
      cues: [
        {
          label: 'Dauchy ¶7 · Beyond “Constitutionalism”',
          text: 'Anchor immediately in Serge’s key sentence: « Enfermer Montesquieu dans une vision purement “constitutionnaliste” serait toutefois réducteur. »'
        },
        {
          label: 'Dauchy ¶10 → ¶14 · Rootedness to Hybridity',
          text: 'Frame his arc from laws proper to one people to renegotiated boundaries and his closing questions on Brazil’s 1916 Civil Code.'
        },
        {
          label: 'How the Slides Speak',
          text: 'Point briefly to the #1F35FF line: sources above (DAUCHY, MONTESQUIEU, OTHER SOURCE), your interpretation (MY READING) below.'
        }
      ],
      guardrail:
        'Guardrail: Slide 1 renders Dauchy’s inner guillemets around “constitutionnaliste” as quotation marks inside « … ». Translations are marked [tr. AVVM].'
    },
    constellation: {
      mode: 'triad',
      caption: 'Dauchy ¶7 & ¶14 · Framing the Discussion',
      nodes: [
        { id: 'leg', label: 'Dauchy ¶7', x: 50, y: 18 },
        { id: 'exec', label: 'Montesquieu 1777', x: 80, y: 68 },
        { id: 'jud', label: 'Brazil 1824–1961', x: 20, y: 68 },
        { id: 'dom', label: 'My Reading', x: 50, y: 50, subtle: true }
      ]
    },
    artwork: {
      title: 'Portrait of Charles-Louis de Secondat, Baron de Montesquieu',
      date: '18th-century engraving (oval medallion)',
      src: './assets/report/montesquieu-oval.webp',
      verified: true,
      caption: 'Charles-Louis de Secondat, Baron de Montesquieu (1689–1755) · De l’esprit des lois (1748).'
    }
  },
  {
    number: 2,
    id: 'slide-2',
    navLabel: '02 · Liberty (¶7–10)',
    kicker: '02 / 07 · ANSWERING DAUCHY ¶7 & ¶8–10 · LIBERTY BEYOND THE CONSTITUTION',
    title: 'Political liberty beyond the constitutional formula',
    subtitle: 'Serge Dauchy, ¶7 & ¶8–10 · Montesquieu, De l’esprit des lois (1777), XIX.4',
    durationSeconds: 83,
    targetDurationLabel: '1:30',
    estimatedAt125Wpm: '1:23',
    pauseSeconds: 5,
    lineHeightPct: 62,
    answeredParagraphs: ['p7', 'p8-10'],
    centralQuestion:
      'What supports political liberty once we refuse to confine Montesquieu to a purely “constitutionalist” separation-of-powers formula?',
    montesquieuAnchor:
      'Dauchy ¶7 (civil and criminal laws + an institutional frame « surtout judiciaire ») paired with Montesquieu XIX.4 on the « esprit général ».',
    keyPoint:
      'Constitutional provisions must be seconded by civil and criminal laws and judicial institutions within the broader « esprit général »—while keeping « système de liberté » strictly as Dauchy’s attribution.',
    lecternScript: {
      page: 2,
      heading: 'Slide 2  Political liberty beyond the constitutional formula',
      elapsedRange: '1:07–2:30 · Target 1:30',
      stageLabel: 'Answering Dauchy ¶7 & ¶8–10',
      instruction: '',
      paragraphs: [
        {
          leadIn: 'I start with the sentence',
          rest: 'from paragraph seven that anchors my response: confining Montesquieu to a purely “constitutionalist” vision is reductive.'
        },
        {
          leadIn: 'As Serge shows, North American',
          rest: 'readings privileged a written constitutional device, so Montesquieu came to be associated almost exclusively with separating three powers in stone. Yet Serge stresses that constitutional provisions must be seconded by civil and criminal laws and by an institutional—especially judicial—frame.'
        },
        {
          leadIn: 'Notice that when Serge speaks',
          rest: 'of a “system of liberty,” I treat that phrase as his analytical synthesis rather than a verified phrase from Montesquieu’s French text.'
        },
        {
          leadIn: 'In paragraphs eight to ten,',
          rest: 'Serge links those guarantees to natural and historical determinants. As Montesquieu writes in Book Nineteen, chapter four, climate, religion, laws, maxims of government, past examples, mores, and manners together form a general spirit.'
        },
        {
          leadIn: 'My reading below the line',
          rest: 'is that liberty is not a self-executing constitutional diagram: its real conditions lie in ordinary criminal, civil, and judicial protections working within that general spirit.'
        }
      ],
      stageCue: '[Pause 5 s. CHANGE TO SLIDE 3.]'
    },
    presenterTip: {
      heading: 'Dauchy ¶7–10 & Montesquieu XIX.4',
      pacing: '1:07–2:30 · Target 1:30 (5s pause)',
      cues: [
        {
          label: 'Dauchy ¶7 · Civil, Criminal & Judicial Frame',
          text: 'Constitutional arrangements must be seconded by « lois civiles et criminelles » and an institutional frame « (surtout judiciaire) ».'
        },
        {
          label: 'Montesquieu XIX.4 · Esprit Général',
          text: 'Climate, religion, laws, maxims of government, examples of past things, mores, and manners (« manieres » in 1777 spelling) form a general spirit.'
        },
        {
          label: 'Attribution Discipline',
          text: 'Keep « système de liberté » off the Montesquieu chip—it was not located in De l’esprit des lois and stays strictly Dauchy’s attribution.'
        }
      ],
      guardrail:
        'Guardrail: Do not present « système de liberté » as a verified quotation from Montesquieu; keep 1777 spelling « manieres » in XIX.4.'
    },
    constellation: {
      mode: 'dual-tension',
      caption: 'Dauchy ¶7–10 · Liberty & Esprit Général',
      nodes: [
        { id: 'leg', label: 'Constitutional', x: 22, y: 46 },
        { id: 'exec', label: 'Civil & Criminal', x: 50, y: 22 },
        { id: 'jud', label: 'Judicial Frame', x: 78, y: 54 },
        { id: 'dom', label: 'Esprit Général', x: 50, y: 76 }
      ]
    },
    elements: [
      {
        id: 'court',
        label: 'Constitutional dispositions (¶7)',
        detail: 'Necessary to restrain arbitrary authority, yet reductive if read in isolation.'
      },
      {
        id: 'spirit',
        label: 'Civil and criminal laws + judicial frame (¶7)',
        detail: '« lois civiles et criminelles » and « un cadre institutionnel (surtout judiciaire) ».'
      },
      {
        id: 'liberty',
        label: 'Esprit général · Montesquieu XIX.4 (¶8–10)',
        detail: 'Climate, religion, laws, maxims, past examples, mores, manners (« manieres »).'
      }
    ]
  },
  {
    number: 3,
    id: 'slide-3',
    navLabel: '03 · Brazil 1824 (¶6)',
    kicker: '03 / 07 · ANSWERING DAUCHY ¶6 · CIRCULATION & CONSTITUTION OF 1824',
    title: 'Brazil, 1824: circulation, correction, and four powers',
    subtitle: 'Serge Dauchy, ¶6 · Constituição Política do Império do Brazil (1824), art. 10',
    durationSeconds: 71,
    targetDurationLabel: '1:15',
    estimatedAt125Wpm: '1:11',
    pauseSeconds: 5,
    lineHeightPct: 58,
    answeredParagraphs: ['p6'],
    centralQuestion:
      'How does Dauchy’s account of Brazilian circulation in ¶6 relate to the four-power design of Article 10 of the 1824 Constitution?',
    montesquieuAnchor:
      'Dauchy’s Brazilian chronology (1789, 1798 Cipriano Barata inventory, 1823 Constituent Assembly, 1949 translation) alongside 1824 Art. 10 (Legislativo, Moderador, Executivo, Judicial).',
    keyPoint:
      'Presented explicitly as Dauchy’s account of circulation (¶6): Brazil’s 1824 four powers drew on Benjamin Constant as « une évolution voire une correction »—selective adaptation, not an automatic copy.',
    lecternScript: {
      page: 3,
      heading: 'Slide 3  Brazil, 1824: circulation, correction, and four powers',
      elapsedRange: '2:30–3:41 · Target 1:15',
      stageLabel: 'Answering Dauchy ¶6',
      instruction: '',
      paragraphs: [
        {
          leadIn: 'In paragraph six, Serge turns',
          rest: 'to South America and reconstructs how *De l’esprit des lois* circulated in Brazil despite censorship by the *Real Mesa Censória* and the Inquisition.'
        },
        {
          leadIn: 'In Serge’s account, Montesquieu nourished',
          rest: 'the 1789 discussions in Minas Gerais, appeared in the 1798 inventory of books confiscated from Cipriano Barata in Bahia, and was abundantly cited in the 1823 Constituent Assembly, well before the first complete Portuguese translation in 1949.'
        },
        {
          leadIn: 'Yet Article ten of the',
          rest: '1824 Constitution recognised four political powers—in the exact constitutional order: Legislative, Moderating, Executive, and Judicial—inspired by Benjamin Constant, which Serge calls “an evolution, or even a correction” of Montesquieu’s tripartition.'
        },
        {
          leadIn: 'My reading below the line',
          rest: 'is that circulation, political argument, and institution-building are distinct steps: Brazilian actors combined multiple sources for an imperial monarchy rather than adding a fourth Montesquieuan branch.'
        }
      ],
      stageCue: '[Pause 5 s. CHANGE TO SLIDE 4.]'
    },
    presenterTip: {
      heading: 'Dauchy ¶6 & 1824 Four Powers',
      pacing: '2:30–3:41 · Target 1:15 (5s pause)',
      cues: [
        {
          label: 'Dauchy’s Chronology (Explicitly His Account)',
          text: '1789 (Minas Gerais) · 1798 (Cipriano Barata’s confiscated library in Bahia) · 1823 (Constituent Assembly) · 1949 (complete Portuguese translation).'
        },
        {
          label: '1824 Art. 10 · Exact Constitutional Order',
          text: 'Legislativo · Moderador · Executivo · Judicial — inspired by Benjamin Constant (« une évolution voire une correction » in Dauchy ¶6).'
        },
        {
          label: 'My Reading · Circulation ≠ Automatic Chain',
          text: 'Distinguish textual circulation from institutional design: the Moderating Power belonged to the emperor and was not proposed by Montesquieu.'
        }
      ],
      guardrail:
        'Guardrail: Present the 1789 / 1798 / 1823 / 1949 chronology explicitly as Dauchy’s account (¶6), and keep the exact 1824 Art. 10 order: Legislativo, Moderador, Executivo, Judicial.'
    },
    constellation: {
      mode: 'four-powers',
      caption: 'Dauchy ¶6 · Brazil 1824 Four Powers',
      nodes: [
        { id: 'dom', label: 'Moderador', x: 50, y: 14 },
        { id: 'leg', label: 'Legislativo', x: 20, y: 64 },
        { id: 'exec', label: 'Executivo', x: 50, y: 76 },
        { id: 'jud', label: 'Judicial', x: 80, y: 64 }
      ]
    },
    powersComparison: {
      threePowers: ['Legislative', 'Executive', 'Judicial'],
      fourPowers: ['Legislative', 'Moderating', 'Executive', 'Judicial']
    }
  },
  {
    number: 4,
    id: 'slide-4',
    navLabel: '04 · 1896 Oath',
    kicker: '04 / 07 · ENGAGING DAUCHY ¶6–7 · CEREMONY & CONSTITUTION OF 1891',
    title: 'Compromisso Constitucional: executive authority under obligation',
    subtitle: 'Aurélio de Figueiredo, 1896 (oath of 26 Feb. 1891) · Constituição de 1891, arts. 15 & 44',
    durationSeconds: 94,
    targetDurationLabel: '1:45',
    estimatedAt125Wpm: '1:34',
    pauseSeconds: 10,
    lineHeightPct: 54,
    answeredParagraphs: ['p6', 'p7'],
    hasVisualPause: true,
    visualPauseSeconds: 10,
    visualPauseLabel: '10s Visual Look · Let the Audience Examine the 1896 Canvas',
    centralQuestion:
      'What can Figueiredo’s 1896 painting make visible about constitutional obligation, and where does visual evidence stop?',
    montesquieuAnchor:
      'Aurélio de Figueiredo, Compromisso Constitucional (1896, oil on canvas, 330 × 257 cm, Museu da República) alongside Constitution of 1891, arts. 15 and 44.',
    keyPoint:
      'My reading: stages executive authority under a constitutional obligation before Congress (Prudente de Moraes at the centre)—without proving de facto independence or direct reception of Montesquieu.',
    lecternScript: {
      page: 4,
      heading: 'Slide 4  Compromisso Constitucional (1896; oath of 26 Feb. 1891)',
      elapsedRange: '3:41–5:15 · Target 1:45',
      stageLabel: 'Engaging Dauchy ¶6–7 through republican iconography',
      instruction: '',
      paragraphs: [
        {
          leadIn: 'Holding paragraphs six and seven',
          rest: 'together, I want to ask what legal images can show when constitutional formulas are translated into institutional authority.'
        },
        {
          leadIn: 'On the left is Aurélio',
          rest: 'de Figueiredo’s *Compromisso Constitucional*, oil on canvas, painted in 1896 in the Museu da República. It depicts an event five years earlier: Deodoro da Fonseca taking the presidential oath on twenty-six February 1891, with Prudente de Moraes presiding at the centre.'
        },
        {
          leadIn: 'Above the blue line sits',
          rest: 'the 1891 Constitution: Article fifteen declared the Legislative, Executive, and Judicial powers harmonious and independent, while Article forty-four bound the president by oath to maintain and uphold the Constitution.'
        },
        {
          leadIn: 'My reading below the line',
          rest: 'is that the canvas makes executive authority under an obligation visible: Deodoro does not appear alone, because the constitutional book and the assembled Congress frame his power.'
        },
        {
          leadIn: 'Yet a ceremony cannot prove',
          rest: 'that those institutions were independent in practice, and I do not offer the painting as evidence of a direct reception of Montesquieu.'
        }
      ],
      stageCue: '[Pause 10 s · Give the audience a moment to look at the canvas. CHANGE TO SLIDE 5.]'
    },
    presenterTip: {
      heading: 'Figueiredo (1896) & 1891 Arts. 15, 44',
      pacing: '3:41–5:15 · Target 1:45 (10s look)',
      pauseActionSlide: 4,
      cues: [
        {
          label: 'Catalogue Precision (1896 vs. 26 Feb. 1891)',
          text: 'Oil on canvas, 330 × 257 cm, Museu da República (reproduction: Romulo Fialdini). Deodoro holds the book; Prudente de Moraes presides at the centre.'
        },
        {
          label: 'Other Source · 1891 Const. Arts. 15 & 44',
          text: 'Art. 15: powers « harmônicos e independentes entre si »; Art. 44: presidential oath to uphold the Constitution on taking office.'
        },
        {
          label: 'My Reading & 10s Look',
          text: 'Makes authority under an obligation visible—explicitly your reading, not proof of de facto independence or direct Montesquieu influence.',
          isPauseCue: true
        }
      ],
      guardrail:
        'Guardrail: Keep image interpretation strictly below the #1F35FF line as MY READING; neither image is offered as evidence of a direct reception of Montesquieu.'
    },
    constellation: {
      mode: 'floor-gallery',
      caption: '1896 Canvas · 1891 Arts. 15 & 44',
      nodes: [
        { id: 'exec', label: 'Deodoro · Oath', x: 26, y: 64 },
        { id: 'leg', label: 'Prudente · Centre', x: 52, y: 42 },
        { id: 'jud', label: '1891 Arts. 15 & 44', x: 76, y: 64 },
        { id: 'dom', label: 'My Reading', x: 50, y: 18 }
      ]
    },
    artwork: {
      title: 'Compromisso Constitucional',
      artist: 'Aurélio de Figueiredo',
      paintingDate: '1896',
      eventDate: '26 February 1891',
      src: './assets/report/compromisso.jpg',
      verified: true,
      caption: 'Aurélio de Figueiredo, Compromisso Constitucional, 1896. Represents Deodoro’s oath of 26 February 1891.',
      credit: 'Museu da República · Oil on canvas, 330 × 257 cm · Reproduction: Romulo Fialdini'
    }
  },
  {
    number: 5,
    id: 'slide-5',
    navLabel: '05 · 1961 Justice',
    kicker: '05 / 07 · ENGAGING DAUCHY ¶7 & MONTESQUIEU XI.6 · JUDICIAL FRAME',
    title: 'A Justiça: the « null » power and the judicial frame',
    subtitle: 'Alfredo Ceschiatti, 1961 (stone, STF) · Montesquieu, XI.6 · Serge Dauchy, ¶7',
    durationSeconds: 100,
    targetDurationLabel: '1:35',
    estimatedAt125Wpm: '1:40',
    pauseSeconds: 10,
    lineHeightPct: 56,
    answeredParagraphs: ['p7'],
    hasVisualPause: true,
    visualPauseSeconds: 10,
    visualPauseLabel: '10s Visual Look · Examine Ceschiatti’s Stone Sculpture',
    centralQuestion:
      'How does contrasting Montesquieu XI.6 (« en quelque façon nulle ») and Dauchy ¶7 (« surtout judiciaire ») sharpen our reading of Ceschiatti’s stone Justice before the STF?',
    montesquieuAnchor:
      'Montesquieu XI.6 (« celle de juger est en quelque façon nulle ») + Dauchy ¶7 (« un cadre institutionnel (surtout judiciaire) ») + Ceschiatti, A Justiça, 1961, stone (“pedra de Petrópolis”), 3.30 m.',
    keyPoint:
      'Stone stages judicial autonomy as a public ideal before a permanent Supreme Court, yet citizens’ liberty still depends on the civil, criminal, and judicial guarantees Dauchy highlights in ¶7.',
    lecternScript: {
      page: 5,
      heading: 'Slide 5  A Justiça: the « null » power and the judicial frame',
      elapsedRange: '5:15–6:55 · Target 1:35',
      stageLabel: 'Engaging Dauchy ¶7 & Montesquieu XI.6',
      instruction:
        'Note: The second paragraph on Montesquieu XI.6 (~32 words) is marked [ADDED, CUTTABLE]; cutting it trims ~15 seconds.',
      paragraphs: [
        {
          leadIn: 'My second visual case addresses',
          rest: 'Serge’s emphasis in paragraph seven on an institutional—above all judicial—frame: Alfredo Ceschiatti’s *A Justiça*, carved in stone, *pedra de Petrópolis*, in 1961 before the Supreme Federal Court in Brasília.'
        },
        {
          leadIn: '[ADDED, CUTTABLE] Above the line,',
          rest: 'Montesquieu’s Book Eleven, chapter six marks our distance from 1748: “Of the three powers we have spoken of, that of judging is in some fashion null”—not a permanent constitutional court.',
          cuttable: true
        },
        {
          leadIn: 'In the Praça dos Três',
          rest: 'Poderes, Justice sits before the Court with a sword resting across her lap, sharing a civic space with Congress and the presidential palace.'
        },
        {
          leadIn: 'Taking up Arno’s prompt as',
          rest: 'a contextual hypothesis about this sculpture in this setting—alongside Rafael Simioni’s study in the notes—the resting sword claims judicial autonomy without brandishing force.'
        },
        {
          leadIn: 'My reading below the line',
          rest: 'is that stone can make autonomy visible as an ideal, but it cannot tell us whether judges are shielded from interference or whether civil and criminal laws actually protect citizens, as Serge insists in paragraph seven.'
        }
      ],
      stageCue: '[Pause 10 s · Let the audience look at the sculpture and XI.6. CHANGE TO SLIDE 6.]'
    },
    presenterTip: {
      heading: 'Ceschiatti (1961, Stone), XI.6 & Dauchy ¶7',
      pacing: '5:15–6:55 · Target 1:35 (10s look)',
      pauseActionSlide: 5,
      cues: [
        {
          label: 'Material Correction · Stone (“pedra de Petrópolis”)',
          text: 'Alfredo Ceschiatti, A Justiça, 1961, 3.30 m, stone (“pedra de Petrópolis”), STF, Brasília (photo: Fellipe Sampaio / STF).'
        },
        {
          label: 'Montesquieu XI.6 & Dauchy ¶7 ([CUTTABLE] Cue)',
          text: 'XI.6 calls judging « en quelque façon nulle » (cuttable sentence if tight on time); Dauchy ¶7 stresses « un cadre institutionnel (surtout judiciaire) ».'
        },
        {
          label: 'My Reading · Visual Ideal vs. Legal Guarantees',
          text: 'Treat the resting sword as a contextual hypothesis (Simioni 2021 in notes if asked); stone stages an ideal, whereas liberty requires enforceable guarantees.',
          isPauseCue: true
        }
      ],
      guardrail:
        'Guardrail: State “stone (pedra de Petrópolis)”, NOT “granite”. Keep Simioni (2021) as a spoken/notes reference if asked, and do not claim direct reception of Montesquieu.'
    },
    constellation: {
      mode: 'conjugal-scale',
      caption: '1961 Stone Justice · XI.6 & Dauchy ¶7',
      nodes: [
        { id: 'jud', label: 'STF · Stone 1961', x: 50, y: 20 },
        { id: 'leg', label: 'XI.6 « nulle »', x: 22, y: 66 },
        { id: 'exec', label: 'Dauchy ¶7 Frame', x: 78, y: 66 },
        { id: 'dom', label: 'Sword at Rest', x: 50, y: 78 }
      ]
    },
    artwork: {
      title: 'A Justiça',
      artist: 'Alfredo Ceschiatti',
      date: '1961',
      material: 'Stone (“pedra de Petrópolis”), 3.30 m',
      institution: 'Supremo Tribunal Federal, Praça dos Três Poderes, Brasília',
      src: './assets/report/justica.jpg',
      verified: true,
      caption: 'Alfredo Ceschiatti, A Justiça, 1961, stone, Supreme Federal Court, Brasília.',
      credit: 'Stone (“pedra de Petrópolis”), 3.30 m · Photograph: Fellipe Sampaio / STF'
    }
  },
  {
    number: 6,
    id: 'slide-6',
    navLabel: '06 · Transplants (¶11–14)',
    kicker: '06 / 07 · ANSWERING DAUCHY ¶10, ¶11–12 & ¶13–14 · TRANSPLANTS & 1916 CODE',
    title: 'Transplants, hybridity, and the Code of 1916',
    subtitle: 'Montesquieu, I.3 (in ¶10) · Watson (1974) & Legrand (1997) (¶11–12) · Hybridity & Beviláqua (¶13–14)',
    durationSeconds: 75,
    targetDurationLabel: '1:25',
    estimatedAt125Wpm: '1:15',
    pauseSeconds: 5,
    lineHeightPct: 66,
    answeredParagraphs: ['p11-12', 'p13-14'],
    centralQuestion:
      'How does Dauchy move from Montesquieu I.3 and the Watson–Legrand debate (¶11–12) to historical hybridity and Clóvis Beviláqua’s 1916 Civil Code (¶13–14)?',
    montesquieuAnchor:
      'Montesquieu I.3 (« c’est un très-grand hasard si celles d’une nation peuvent convenir à une autre », quoted in ¶10) → Watson 1974 vs. Legrand 1997 (¶11–12) → Hybridity & 1916 Code (¶13–14).',
    keyPoint:
      'My reading: context is not only the starting point inside a single society—context is also produced and renegotiated through contact between legal orders.',
    lecternScript: {
      page: 6,
      heading: 'Slide 6  Transplants, hybridity, and the Code of 1916',
      elapsedRange: '6:55–8:10 · Target 1:25',
      stageLabel: 'Answering Dauchy ¶10–14',
      instruction: '',
      paragraphs: [
        {
          leadIn: 'In paragraph ten, Serge quotes',
          rest: 'Book One, chapter three of *De l’esprit des lois*: laws must be so proper to the people for whom they are made that it is a very great chance if those of one nation can suit another.'
        },
        {
          leadIn: 'From there, paragraphs eleven and',
          rest: 'twelve stage the comparative debate: Alan Watson’s 1974 argument that a transplanted rule “will grow in its new body,” against Pierre Legrand’s 1997 objection that legal meaning depends on cultural context, rendering transplants “impossible.”'
        },
        {
          leadIn: 'In paragraphs thirteen and fourteen,',
          rest: 'Serge moves past a static binary toward historical hybridity—imposed transplantations, assumed receptions, overlapping sovereignties—and asks how Clóvis Beviláqua’s 1916 Brazilian Civil Code fits this picture.'
        },
        {
          leadIn: 'My reading below the line',
          rest: 'is that context is not merely a prior barrier inside each nation: context is also made through contact, forcing us to ask what moves as legal form and what changes in meaning.'
        }
      ],
      stageCue: '[Pause 5 s. CHANGE TO SLIDE 7.]'
    },
    presenterTip: {
      heading: 'I.3, Watson/Legrand & 1916 Code (¶10–14)',
      pacing: '6:55–8:10 · Target 1:25 (5s pause)',
      cues: [
        {
          label: 'Montesquieu I.3 (Quoted in Dauchy ¶10)',
          text: '« … c’est un très-grand hasard si celles d’une nation peuvent convenir à une autre. » — launches the transplant problem.'
        },
        {
          label: 'Watson (1974) vs. Legrand (1997) (¶11–12)',
          text: 'Watson: rules move and “grow in its new body” (not unchanging!); Legrand: cultural « contextualité » makes transplants « impossibles ».'
        },
        {
          label: 'Hybridity & 1916 Code Q&A Guardrail (¶13–14)',
          text: 'If Serge turns the Beviláqua 1916 question back to you, say honestly you would examine the drafting record before claiming anything about Montesquieu.'
        }
      ],
      guardrail:
        'Guardrail: Do not imply Watson thought rules never evolve, nor answer the 1916 Beviláqua drafting question beyond the evidence—the slides ask by design.'
    },
    constellation: {
      mode: 'civic-triad',
      caption: '¶11–14 · Watson, Legrand & Hybridity',
      nodes: [
        { id: 'leg', label: 'I.3 Rootedness', x: 22, y: 48 },
        { id: 'exec', label: 'Watson · Legrand', x: 78, y: 48 },
        { id: 'jud', label: 'Hybridity ¶13–14', x: 50, y: 20 },
        { id: 'dom', label: '1916 Civil Code', x: 50, y: 80 }
      ]
    }
  },
  {
    number: 7,
    id: 'slide-7',
    navLabel: '07 · Questions',
    kicker: '07 / 07 · TWO QUESTIONS FOR THE DISCUSSION · ENGAGING ¶6–14',
    title: 'Two questions for Serge',
    subtitle: 'Transformation of legal meaning (¶10–14) · Circulation, appropriation and political authority (¶6–7)',
    durationSeconds: 78,
    targetDurationLabel: '1:25',
    estimatedAt125Wpm: '1:18',
    pauseSeconds: 5,
    lineHeightPct: 34,
    answeredParagraphs: ['p6', 'p7', 'p11-12', 'p13-14'],
    centralQuestion:
      '1. How does moving from rooted laws (I.3) to hybrid orders whose boundaries are constantly renegotiated (¶13–14) reshape how we describe the transformation of legal meaning? · 2. What evidence links textual circulation, appropriation of arguments, and the organisation of political authority beyond the constitution (¶6–7)?',
    montesquieuAnchor:
      'Brings together Dauchy’s arc from rooted laws to renegotiated legal boundaries (« leurs frontières sont constamment renégociées », ¶10–14) and his critique of a purely “constitutionalist” reading of Montesquieu (¶6–7).',
    keyPoint:
      'Opens floor discussion directly on Serge’s manuscript: how boundary renegotiation through imposed transfers, assumed receptions, and direct contact between legal orders reframes contextual difference, and what documentary evidence connects texts, arguments, institutions, and images.',
    lecternScript: {
      page: 7,
      heading: 'Slide 7  Two questions for Serge',
      elapsedRange: '8:10–9:28 · Target 1:25',
      stageLabel: 'Opening the discussion (¶6–14)',
      instruction: '',
      paragraphs: [
        {
          leadIn: 'That brings me directly to',
          rest: 'two questions for our discussion, Serge, connecting the two halves of your paper—from circulation in Brazil and liberty beyond the constitution, to transplants and the renegotiation of legal boundaries.'
        },
        {
          leadIn: 'First: you move from Montesquieu’s',
          rest: 'insistence that laws belong to a particular people to hybrid legal orders whose boundaries are constantly renegotiated through imposed transfers, assumed receptions, and direct contact between legal orders. When a legal form acquires a different meaning in another setting, how should we describe that transformation—and when does contextual difference stop being an objection to transplantation and instead identify the boundary-renegotiation process we need to study?'
        },
        {
          leadIn: 'Second: you show how reductive',
          rest: 'a purely “constitutionalist” reading of Montesquieu can be. In the Brazilian examples you raise, what evidence allows us to move between the circulation of his writings, the appropriation of his arguments, and the organisation of political authority beyond the constitution?'
        },
        {
          leadIn: 'Could institutional ceremonies and images',
          rest: 'help identify that appropriation, provided their connection to the texts is documented? Thank you, Serge.'
        }
      ],
      stageCue: '[Pause 5 s · STOP. Look up at Serge. Leave the two questions on screen.]'
    },
    presenterTip: {
      heading: 'Two Questions for Serge Dauchy',
      pacing: '8:10–9:28 · Target 1:25 (5s pause)',
      cues: [
        {
          label: 'Question 1 · Renegotiated Legal Boundaries & Meaning (¶10–14)',
          text: 'Dauchy moves from rooted laws (I.3) and Watson/Legrand to hybridity (« leurs frontières sont constamment renégociées ») and direct contact between legal orders: when does contextual difference identify the very process of transformation to study?'
        },
        {
          label: 'Question 2 · Circulation, Appropriation & Liberty (¶6–7)',
          text: 'What evidence links circulation of writings, appropriation of arguments, and organisation of authority (including civil/criminal/judicial guarantees and documented images)?'
        },
        {
          label: 'If Serge Asks Back About Beviláqua (1916)',
          text: 'Honest answer ready: you would examine the 1916 drafting record directly before making any claim about Montesquieu’s role in it.'
        }
      ],
      guardrail: ''
    },
    constellation: {
      mode: 'open-horizon',
      caption: 'Two Questions for Serge Dauchy',
      nodes: [
        { id: 'leg', label: '¶10–14 Boundaries', x: 20, y: 36 },
        { id: 'exec', label: 'Transformation', x: 44, y: 22 },
        { id: 'jud', label: '¶6–7 Authority', x: 66, y: 26 },
        { id: 'dom', label: 'Evidence', x: 82, y: 46 }
      ]
    },
    questions: [
      {
        number: 1,
        text: 'You move from Montesquieu’s insistence that laws belong to a particular people (I.3) to hybrid legal orders whose boundaries are constantly renegotiated through imposed transfers, assumed receptions, and direct contact between legal orders (¶13–14). When a legal form acquires a different meaning in another setting, how should we describe that transformation—and at what point does contextual difference cease to be an objection to transplantation and instead identify the boundary-renegotiation process we need to study?',
        subtext:
          'Engaging ¶10–14 · From rooted laws (Montesquieu I.3) and Watson/Legrand to « leurs frontières sont constamment renégociées » and the 1916 Civil Code: what evidence distinguishes borrowing from a change of legal meaning?'
      },
      {
        number: 2,
        text: 'In the Brazilian examples you raise, what evidence would allow us to move between the circulation of Montesquieu’s writings, the appropriation of his arguments and the organisation of political authority? Could institutional ceremonies and images help identify that appropriation, provided that their connection to the texts is documented?',
        subtext:
          'Engaging ¶6–7 · Beyond a purely “constitutionalist” reading: where would you begin investigating a “system of liberty” across civil, criminal, and judicial guarantees?'
      }
    ]
  }
];

export const CITATION_VERIFICATION_ITEMS = [
  {
    item: 'Dauchy quotations on slides 1, 2, 3, 6, 7 (¶6, ¶7, ¶8–10, ¶11–14)',
    status: 'verified',
    symbol: '✓',
    note: 'Automated verbatim match against Serge Dauchy’s 14-paragraph manuscript. Slide 1 renders inner « constitutionnaliste » as “ ”.'
  },
  {
    item: 'Montesquieu I.3 « Elles doivent être tellement propres au peuple … »',
    status: 'verified',
    symbol: '✓',
    note: 'Wikisource, 1777 edition, Livre I, chap. 3 (quoted in Dauchy ¶10).'
  },
  {
    item: 'Montesquieu XIX.4 « Plusieurs choses gouvernent les hommes … »',
    status: 'verified',
    symbol: '✓',
    note: 'Wikisource, 1777 edition, Livre XIX, chap. 4 (1777 spelling « manieres » preserved).'
  },
  {
    item: 'Montesquieu XI.6 « Des trois puissances … celle de juger est en quelque façon nulle. »',
    status: 'verified',
    symbol: '✓',
    note: 'Wikisource, 1777 edition, Livre XI, chap. 6 (shown on Slide 5).'
  },
  {
    item: 'Constituição de 1824, art. 10 (Legislativo, Moderador, Executivo, Judicial)',
    status: 'verified',
    symbol: '✓',
    note: 'Câmara dos Deputados, publicação original — exact four-power sequence verified.'
  },
  {
    item: 'Constituição de 1891, art. 15 & art. 44',
    status: 'verified',
    symbol: '✓',
    note: 'Câmara dos Deputados, publicação original (harmonious & independent powers; presidential oath).'
  },
  {
    item: 'Compromisso Constitucional: 1896, oil on canvas, 330 × 257 cm, Museu da República',
    status: 'verified',
    symbol: '✓',
    note: 'Oath of 26 Feb. 1891; Prudente de Moraes presiding at the centre; reproduction credit Romulo Fialdini (⚠ carried forward).'
  },
  {
    item: 'A Justiça: Alfredo Ceschiatti, 1961, 3.30 m, stone (“pedra de Petrópolis”), STF',
    status: 'verified',
    symbol: '✓',
    note: 'STF visitor catalogue confirms stone (“pedra de Petrópolis”); photograph credit Fellipe Sampaio / STF (⚠ carried forward).'
  },
  {
    item: 'Pierre Legrand (1997), Maastricht Journal of European and Comparative Law 4(2): 111–124',
    status: 'verified',
    symbol: '✓',
    note: 'Title, volume, and pages confirmed; Dauchy’s French rendering matches Legrand’s English article.'
  },
  {
    item: 'Alan Watson (1974), Legal Transplants — “will grow in its new body”',
    status: 'caution',
    symbol: '⚠',
    note: 'Presented as quoted in Dauchy ¶11; wording matches secondary quotations (commonly cited as p. 27; exact page not re-checked).'
  },
  {
    item: '« système de liberté » & Dauchy’s Brazilian chronology (1789, 1798, 1823, 1949)',
    status: 'caution',
    symbol: '⚠',
    note: '« système de liberté » not located in De l’esprit des lois—kept strictly as Dauchy’s attribution (¶7); chronology on Slide 3 explicitly framed as his account (¶6).'
  }
];

/**
 * Presenter-only private verification notes on Dauchy’s manuscript (5 Nov 2026).
 * Strictly for backstage preparation in the Lectern Script / Prep modal — NEVER rendered on Slides 1–7 or public handouts.
 */
export const PRIVATE_MANUSCRIPT_NOTES = [
  {
    number: 1,
    locus: 'Place of death (¶1)',
    detail:
      'Dauchy writes that Montesquieu was born at La Brède « et y décèdera ». Montesquieu actually died in Paris, at his rue Saint-Dominique home (10 February 1755), and was buried at Saint-Sulpice. (Does not affect your argument.)'
  },
  {
    number: 2,
    locus: 'Considérations sur les richesses de l’Espagne (¶9)',
    detail:
      'Dauchy states Montesquieu « avait d’ailleurs déjà publié » this study twenty years earlier. It remained unpublished during Montesquieu’s lifetime and first appeared in 1910, edited by Paul Bonnefon, though material from it was reused in De l’esprit des lois.'
  },
  {
    number: 3,
    locus: 'Alan Watson at Edinburgh (¶11)',
    detail:
      'Confirmed accurate: Alan Watson held the Chair of Civil Law at the University of Edinburgh from 1968.'
  },
  {
    number: 4,
    locus: 'German translation dated 1782 (¶3)',
    detail:
      'Possibly late, as an earlier German translation may exist (*Des Herrn von Montesquiou Werk Von den Gesetzen*), though without a verified earlier publication date — leave untouched.'
  },
  {
    number: 5,
    locus: 'Unreferenced Teubner & Weber quotations (¶12, ¶14)',
    detail:
      'Neither carries a footnote in the manuscript. Teubner’s phrase (“direct contact between legal orders within one global legal discourse”) comes from Gunther Teubner (1998), “Legal Irritants”, Modern Law Review 61(1): 11–32. The Max Weber passage in ¶12 remains unidentified.'
  },
  {
    number: 6,
    locus: 'If Serge turns the 1916 Beviláqua question back to you (Q&A Prep)',
    detail:
      'By design, Slide 6 and Slide 7 ask rather than overclaiming. Honest Q&A response: “I would want to inspect the 1916 congressional and Beviláqua drafting record directly before claiming how Montesquieu figured in it.”'
  }
];

export const VERIFIED_SOURCES = [
  {
    code: 'S1',
    id: 'src-dauchy',
    title: 'DAUCHY, Serge.',
    work: 'Montesquieu, De l’esprit des lois (1748). 2026. Unpublished conference manuscript, 14 paragraphs (PPGD/UFSC, 11 Nov. 2026).',
    url: '#slide-1',
    urlLabel: 'Engaged verbatim across Slides 01–07 (¶6–14)',
    verificationNote:
      'Primary conference paper mapped by paragraph on every slide: ¶6 (Brazil, 1789–1949 & 1824 four powers), ¶7 (political liberty, civil/criminal laws, judicial frame), ¶8–10 (natural/historical determinants & esprit général), ¶11–12 (Watson & Legrand), and ¶13–14 (hybridity & 1916 Civil Code).'
  },
  {
    code: 'S2',
    id: 'src-montesquieu',
    title: 'MONTESQUIEU, Charles-Louis de Secondat, Baron de.',
    work: 'Esprit des lois (1777). Livre I, chap. 3; Livre XI, chap. 6; Livre XIX, chap. 4. Wikisource (accessed 5 Nov. 2026).',
    url: 'https://fr.wikisource.org/wiki/Esprit_des_lois_(1777)/L19/C4',
    urlLabel: 'Wikisource · Esprit des lois (1777): I.3, XI.6, XIX.4',
    verificationNote:
      'Verbatim 1777 French text checked online: XIX.4 on Slide 02 (preserving « manieres »), XI.6 on Slide 05 (« celle de juger est en quelque façon nulle »), and I.3 on Slide 06 (quoted in Dauchy ¶10). Translations marked [tr. AVVM].'
  },
  {
    code: 'S3',
    id: 'src-const-1824',
    title: 'BRASIL.',
    work: 'Constituição Política do Império do Brazil (25 Mar. 1824), art. 10; Constituição da República dos Estados Unidos do Brasil (24 Feb. 1891), arts. 15 and 44.',
    url: 'https://www2.camara.leg.br/legin/fed/consti/1824-1899/constituicao-35041-25-marco-1824-532540-publicacaooriginal-14770-pl.html',
    urlLabel: 'Câmara dos Deputados · Publicações Originais (1824 & 1891)',
    verificationNote:
      'Checked against original Câmara publications: 1824 Art. 10 four powers in exact sequence (Legislativo, Moderador, Executivo, Judicial) on Slide 03; 1891 Arts. 15 and 44 on Slide 04.'
  },
  {
    code: 'S4',
    id: 'src-figueiredo',
    title: 'FIGUEIREDO, Aurélio de.',
    work: 'Compromisso Constitucional, 1896. Oil on canvas, 330 × 257 cm. Museu da República, Rio de Janeiro (Deodoro’s oath, 26 Feb. 1891; reproduction: Romulo Fialdini).',
    url: 'https://museudarepublica.acervos.museus.gov.br/acervo-museologico/pintura-historica-4/',
    urlLabel: 'Museu da República · Compromisso Constitucional (1896)',
    verificationNote:
      'Slide 04 visual case: Prudente de Moraes presides at the centre while Deodoro da Fonseca holds the constitutional book. Offered as an institutional case, not as proof of a direct reception of Montesquieu.'
  },
  {
    code: 'S5',
    id: 'src-ceschiatti',
    title: 'CESCHIATTI, Alfredo.',
    work: 'A Justiça, 1961. Stone (“pedra de Petrópolis”), 3.30 m. Supremo Tribunal Federal, Praça dos Três Poderes, Brasília (photograph: Fellipe Sampaio / STF; cf. Simioni 2021).',
    url: 'https://noticias.stf.jus.br/postsnoticias/130-anos-conheca-os-destaques-do-acervo-cultural-stf/',
    urlLabel: 'STF · Acervo Cultural (Stone / Pedra de Petrópolis)',
    verificationNote:
      'Slide 05 visual case: material verified as stone (“pedra de Petrópolis”) per STF visitor documentation. Engaged alongside Montesquieu XI.6, Dauchy ¶7, and Rafael Simioni (2021, Suprema) in speaker notes.'
  },
  {
    code: 'S6',
    id: 'src-transplants',
    title: 'WATSON, Alan (1974); LEGRAND, Pierre (1997); TEUBNER, Gunther (1998).',
    work: 'Watson, Legal Transplants (1974); Legrand, “The Impossibility of ‘Legal Transplants’”, MJ 4(2): 111–124 (1997); Teubner, “Legal Irritants”, MLR 61(1): 11–32 (1998, in notes).',
    url: '#slide-6',
    urlLabel: 'Slide 06 · Comparative Law & Transplants (Dauchy ¶11–14)',
    verificationNote:
      'Engaged on Slide 06 as presented in Dauchy ¶11–14 alongside Clóvis Beviláqua’s 1916 Brazilian Civil Code.'
  }
];

/**
 * Retrieve slide data by 1-based slide number (1..7).
 * @param {number|string} slideNumber
 * @returns {Object}
 */
export function getSlideByNumber(slideNumber) {
  const num = Number(slideNumber);
  return PRINCIPAL_SLIDES.find((s) => s.number === num) || PRINCIPAL_SLIDES[0];
}

/**
 * Count spoken words in a string (ignoring bracketed editorial tags like [ADDED, CUTTABLE]).
 * @param {string} text
 * @returns {number}
 */
export function countSpokenWords(text) {
  const cleaned = String(text || '')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/[—–·]/g, ' ')
    .trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

/**
 * Compute live word count, pause seconds, and estimated total speaking duration
 * across all 7 Lectern Script pages (supports toggling the cuttable Slide 5 XI.6 sentence).
 * @param {{ excludeCuttable?: boolean, wpm?: number }} [options]
 */
export function computeLecternScriptMetrics({ excludeCuttable = false, wpm = 125 } = {}) {
  const safeWpm = Number.isFinite(Number(wpm)) && Number(wpm) > 0 ? Number(wpm) : 125;
  let totalWords = 0;
  let cuttableWords = 0;
  let totalPauseSeconds = 0;

  const perSlide = PRINCIPAL_SLIDES.map((slide) => {
    const paragraphs = slide.lecternScript?.paragraphs || [];
    let slideWords = 0;
    for (const p of paragraphs) {
      const words = countSpokenWords(`${p.leadIn || ''} ${p.rest || ''}`);
      if (p.cuttable) {
        cuttableWords += words;
        if (excludeCuttable) continue;
      }
      slideWords += words;
    }
    const pauseSec = Number(slide.pauseSeconds) || 5;
    totalWords += slideWords;
    totalPauseSeconds += pauseSec;
    const estSec = Math.round((slideWords / safeWpm) * 60 + pauseSec);
    return {
      slideNumber: slide.number,
      words: slideWords,
      pauseSeconds: pauseSec,
      estimatedSeconds: estSec
    };
  });

  const totalSeconds = Math.round((totalWords / safeWpm) * 60 + totalPauseSeconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  return {
    wpm: safeWpm,
    excludeCuttable: Boolean(excludeCuttable),
    totalWords,
    cuttableWords,
    totalPauseSeconds,
    totalSeconds,
    formattedDuration: `${mins}:${String(secs).padStart(2, '0')}`,
    perSlide
  };
}

/**
 * Return all 7 structured Lectern Script pages (aligned 1-to-1 with PRINCIPAL_SLIDES)
 * for the in-app Lectern Script reader, Smartphone Remote teleprompter, and 7-page A4 print mode.
 * @param {{ excludeCuttable?: boolean }} [options]
 * @returns {Array<Object>}
 */
export function getLecternScriptPages({ excludeCuttable = false } = {}) {
  return PRINCIPAL_SLIDES.map((slide) => {
    const script = slide.lecternScript || {};
    const rawParas = Array.isArray(script.paragraphs) ? script.paragraphs : [];
    const filteredParas = excludeCuttable ? rawParas.filter((p) => !p?.cuttable) : rawParas;
    return {
      slideNumber: slide.number,
      page: script.page || slide.number,
      slideId: slide.id,
      navLabel: slide.navLabel,
      title: slide.title,
      heading: script.heading || `Slide ${slide.number}  ${slide.title}`,
      elapsedRange: script.elapsedRange || '',
      stageLabel: script.stageLabel || '',
      instruction: script.instruction || '',
      durationSeconds: Number(slide.durationSeconds) || 80,
      pauseSeconds: Number(slide.pauseSeconds) || 5,
      answeredParagraphs: Array.isArray(slide.answeredParagraphs) ? [...slide.answeredParagraphs] : [],
      paragraphs: filteredParas.map((p) => ({
        leadIn: String(p?.leadIn || ''),
        rest: String(p?.rest || ''),
        cuttable: Boolean(p?.cuttable)
      })),
      stageCue: String(script.stageCue || '')
    };
  });
}

/**
 * Resolve normalized [x, y] SVG coordinates and caption for the slide's orbital constellation.
 * @param {number|string} slideNumber
 */
export function getConstellationCoordinates(slideNumber) {
  const slide = getSlideByNumber(slideNumber);
  const constellation = slide?.constellation || {};
  const nodes = Array.isArray(constellation.nodes) ? constellation.nodes : [];

  const pointFor = (id, fallback) => {
    if (Array.isArray(constellation[id]) && constellation[id].length >= 2) {
      return [Number(constellation[id][0]), Number(constellation[id][1])];
    }
    const found = nodes.find((n) => n && n.id === id);
    if (found && Number.isFinite(Number(found.x)) && Number.isFinite(Number(found.y))) {
      return [Number(found.x), Number(found.y)];
    }
    return fallback;
  };

  return {
    mode: constellation.mode || 'triad',
    caption: constellation.caption || constellation.label || slide?.title || '',
    leg: pointFor('leg', [22, 48]),
    exec: pointFor('exec', [78, 48]),
    jud: pointFor('jud', [50, 20]),
    dom: pointFor('dom', [50, 80])
  };
}

/**
 * Clamp background piano volume strictly to a gentle ambient ceiling [0, maxVolume].
 */
export function clampMusicVolume(
  rawVolume,
  defaultVolume = PRESENTATION_META.backgroundMusic.defaultVolume,
  maxVolume = PRESENTATION_META.backgroundMusic.maxVolume
) {
  const cap = Number.isFinite(Number(maxVolume)) && Number(maxVolume) > 0 ? Number(maxVolume) : 0.35;
  const fallback =
    Number.isFinite(Number(defaultVolume)) && Number(defaultVolume) >= 0
      ? Math.min(Number(defaultVolume), cap)
      : 0.12;
  if (rawVolume === null || rawVolume === undefined || rawVolume === '') {
    return Number(fallback.toFixed(3));
  }
  const parsed = Number(rawVolume);
  if (!Number.isFinite(parsed)) {
    return Number(fallback.toFixed(3));
  }
  const clamped = Math.min(cap, Math.max(0, parsed));
  return Number(clamped.toFixed(3));
}

/**
 * Format accessible, human-readable status text for the low-volume background piano control.
 */
export function formatMusicStatusLabel({ playing = false, muted = false, volume = 0.12 } = {}) {
  const safeVol = clampMusicVolume(volume);
  const percent = Math.round(safeVol * 100);
  if (muted || percent === 0) {
    return {
      shortLabel: 'Piano · Muted',
      ariaLabel: 'Unmute Chopin Nocturne background music (shortcut B)',
      percent: 0
    };
  }
  if (playing) {
    return {
      shortLabel: `Nocturne · ${percent}%`,
      ariaLabel: `Mute Chopin Nocturne background music, playing softly at ${percent}% volume (shortcut B)`,
      percent
    };
  }
  return {
    shortLabel: `Play Nocturne · ${percent}%`,
    ariaLabel: `Play Chopin Nocturne background music softly at ${percent}% volume (shortcut B)`,
    percent
  };
}

/**
 * Determine whether the opening event poster stage should be skipped automatically.
 */
export function shouldBypassOpeningPoster(search = '', hash = '') {
  const qs = String(search || '');
  const hs = String(hash || '');
  if (
    /(?:^\?|&)autostart=1(?:&|$)/.test(qs) ||
    /(?:^\?|&)script=1(?:&|$)/.test(qs) ||
    qs.includes('sync=')
  ) {
    return true;
  }
  if (/^#slide-[1-7]$/.test(hs) || hs === '#sources' || hs === '#lectern-script') {
    return true;
  }
  return false;
}

/**
 * Retrieve normalized, slide-specific Presenter Tip metadata and cues for slide 1..7.
 */
export function getPresenterTipForSlide(slideNumber) {
  const slide = getSlideByNumber(slideNumber);
  const tip = slide?.presenterTip || {};
  const padded = String(slide.number).padStart(2, '0');
  const cues = Array.isArray(tip.cues)
    ? tip.cues.map((c) => ({
        label: String(c?.label || ''),
        text: String(c?.text || ''),
        isPauseCue: Boolean(c?.isPauseCue)
      }))
    : [];

  return {
    slideNumber: slide.number,
    kicker: `SLIDE ${padded} / 07 · ${tip.pacing || 'PODIUM CUE'}`.toUpperCase(),
    heading: String(tip.heading || slide.title),
    pacing: String(tip.pacing || ''),
    pauseActionSlide: tip.pauseActionSlide ? Number(tip.pauseActionSlide) : null,
    pauseSeconds: Number(slide.visualPauseSeconds || slide.pauseSeconds || 5),
    cues,
    guardrail: String(tip.guardrail || '')
  };
}

/**
 * Pure state machine for the slide-specific Presenter Tip disclosure (hover vs. pinned click).
 */
export function resolvePresenterTipState(
  currentState = { activeSlide: null, mode: 'closed' },
  action = { type: 'close' }
) {
  const prevSlide = currentState?.activeSlide ? Number(currentState.activeSlide) : null;
  const prevMode =
    currentState?.mode === 'hover' || currentState?.mode === 'pinned'
      ? currentState.mode
      : 'closed';
  const targetSlide =
    action?.slide !== undefined && action?.slide !== null ? Number(action.slide) : null;
  const validSlide =
    Number.isInteger(targetSlide) && targetSlide >= 1 && targetSlide <= PRINCIPAL_SLIDES.length
      ? targetSlide
      : null;

  switch (action?.type) {
    case 'hover-enter': {
      if (!validSlide) return { activeSlide: prevSlide, mode: prevMode };
      if (prevMode === 'pinned' && prevSlide === validSlide) {
        return { activeSlide: validSlide, mode: 'pinned' };
      }
      if (prevMode === 'pinned' && prevSlide !== null) {
        return { activeSlide: prevSlide, mode: 'pinned' };
      }
      return { activeSlide: validSlide, mode: 'hover' };
    }
    case 'hover-leave': {
      if (prevMode === 'hover' && (!validSlide || prevSlide === validSlide)) {
        return { activeSlide: null, mode: 'closed' };
      }
      return { activeSlide: prevSlide, mode: prevMode };
    }
    case 'click-toggle': {
      if (!validSlide) return { activeSlide: null, mode: 'closed' };
      if (prevMode === 'pinned' && prevSlide === validSlide) {
        return { activeSlide: null, mode: 'closed' };
      }
      return { activeSlide: validSlide, mode: 'pinned' };
    }
    case 'pin-open': {
      if (!validSlide) return { activeSlide: prevSlide, mode: prevMode };
      return { activeSlide: validSlide, mode: 'pinned' };
    }
    case 'slide-change':
    case 'close':
    default:
      return { activeSlide: null, mode: 'closed' };
  }
}

/**
 * Computes deterministic, subtle GSAP cross-fade + directional slide-in parameters
 * when moving between the 7 presentation sections.
 */
export function computeSlideTransitionSpec(
  fromSlide,
  toSlide,
  { reducedMotion = false, smooth = true } = {}
) {
  const total = PRINCIPAL_SLIDES.length;
  const from = Math.max(1, Math.min(total, Number(fromSlide) || 1));
  const to = Math.max(1, Math.min(total, Number(toSlide) || 1));

  if (reducedMotion || !smooth || from === to) {
    return {
      animate: false,
      fromSlide: from,
      toSlide: to,
      direction: 0,
      distance: 0,
      scrollDuration: 0,
      exitDuration: 0,
      exitOpacity: 1,
      exitY: 0,
      enterDelay: 0,
      enterDuration: 0,
      enterOpacity: 1,
      enterY: 0,
      childOpacity: 1,
      childOffsetY: 0,
      childDuration: 0,
      childStagger: 0,
      bgDuration: 0
    };
  }

  const direction = to > from ? 1 : -1;
  const distance = Math.abs(to - from);

  return {
    animate: true,
    fromSlide: from,
    toSlide: to,
    direction,
    distance,
    scrollDuration: distance > 1 ? 0.46 : 0.38,
    exitDuration: 0.2,
    exitOpacity: 0.38,
    exitY: direction * -12,
    enterDelay: 0.05,
    enterDuration: 0.36,
    enterOpacity: 0.42,
    enterY: direction * 14,
    childOpacity: 0.65,
    childOffsetY: direction * 8,
    childDuration: 0.32,
    childStagger: 0.03,
    bgDuration: 0.48
  };
}
