/**
 * Source-of-truth data module for Ana Vitória Vanzin Mendes's discussant response:
 * "Montesquieu and the three powers: Political liberty, legal images, and institutional autonomy in Brazil"
 * Discussant intervention following Serge Dauchy · PPGD/UFSC · 11 November 2026.
 * Aligned 1-to-1 with the 7-slide Montesquieu Lectern Script while preserving both closing questions on Slide 7.
 */

export const PRESENTATION_META = {
  title: 'Montesquieu and the three powers',
  subtitle: 'Political liberty, legal images, and institutional autonomy in Brazil',
  presenter: 'Ana Vitória Vanzin Mendes · Discussant',
  presenterAffiliation: 'Doctoral Researcher in Law · Federal University of Santa Catarina (UFSC)',
  event: 'A circulação das ideias e saberes franceses na ciência jurídica brasileira',
  eventKicker: 'PPGD-UFSC · CCJ/UFSC · 11 a 13 de novembro de 2026',
  eventTheme: 'Montesquieu',
  eventDateTime: '11 de novembro de 2026 · 15h10',
  keynoteSpeaker: 'Serge Dauchy (CNRS/Université de Lille)',
  discussants: ['Marja Mangili (UniCesusc)', 'Ana Vitória Vanzin Mendes (UFSC)'],
  panelContext:
    'TEMÁTICA: Montesquieu · 11 de novembro de 2026 · 15h10 · CCJ/UFSC · Conferencista: Serge Dauchy (CNRS/Université de Lille) · Debatedores: Marja Mangili (UniCesusc) & Ana Vitória Vanzin Mendes (UFSC)',
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
  timingNote:
    'Aligned with the 7-page Montesquieu Lectern Script (~9m30s elapsed target). Podium cues live in each slide’s top-right Presenter Tip (N), the full Lectern Script view (L), and the Smartphone Remote (R).'
};

export const PRINCIPAL_SLIDES = [
  {
    number: 1,
    id: 'slide-1',
    navLabel: '01 · Cover',
    kicker: '01 / 07 · STAGE 1: THE AUTHOR AND HIS PROBLEM · 0:00–0:50',
    title: 'Montesquieu and the three powers',
    subtitle: 'Political liberty, legal images, and institutional autonomy in Brazil',
    presenter: 'Ana Vitória Vanzin Mendes · Discussant',
    durationSeconds: 50,
    centralQuestion:
      'How do Brazilian legal images represent the three powers, and what can they tell us about institutional autonomy and independence?',
    montesquieuAnchor:
      'Connecting Montesquieu’s account of political liberty in De l’esprit des lois (1748) with Brazilian constitutional history and institutional iconography.',
    keyPoint:
      'Moves from Montesquieu’s problem of restraining arbitrary power, to Brazil’s 1824 framework and two institutional artworks (1896, 1961), to closing questions for Serge Dauchy.',
    lecternScript: {
      page: 1,
      heading: 'Slide 1  Montesquieu and the three powers',
      elapsedRange: '0:00–0:50',
      stageLabel: 'Stage 1: the author and his problem',
      instruction: 'Read the full prose. Bracketed cues are silent. Total target about 9–10 minutes.',
      paragraphs: [
        {
          leadIn: 'Thank you, Serge, and thank',
          rest: 'you, Arno. My name is Ana Vitória Vanzin Mendes. I am a doctoral researcher in law at the Federal University of Santa Catarina.'
        },
        {
          leadIn: 'For this discussion, I would like',
          rest: 'to connect Montesquieu’s account of political liberty with a question about images: how do Brazilian legal images represent the three powers, and what can they tell us about autonomy and independence?'
        },
        {
          leadIn: 'I will begin with Montesquieu',
          rest: 'himself, then turn to Brazil and the images of its institutions. Finally, I will put two questions to Serge about legal context and the conditions that make political liberty possible.'
        }
      ],
      stageCue: '[Pause. CHANGE TO SLIDE 2.]'
    },
    presenterTip: {
      heading: 'Opening & Research Question',
      pacing: '0:00–0:50 · Stage 1',
      cues: [
        {
          label: 'Opening & Affiliation',
          text: 'Thank Serge and Arno; introduce yourself as a doctoral researcher in law at UFSC.'
        },
        {
          label: 'Guiding Question on Images',
          text: 'Connect Montesquieu’s account of political liberty with how Brazilian legal images represent the three powers, autonomy, and independence.'
        },
        {
          label: 'Three-Stage Roadmap',
          text: '1) Montesquieu and his problem → 2) Brazil (1824) and institutional images (1896, 1961) → 3) Closing questions for Serge.'
        }
      ],
      guardrail: ''
    },
    constellation: {
      mode: 'triad',
      caption: 'Montesquieu & Three Powers',
      nodes: [
        { id: 'leg', label: 'Legislative', x: 50, y: 18 },
        { id: 'exec', label: 'Executive', x: 80, y: 68 },
        { id: 'jud', label: 'Judicial', x: 20, y: 68 },
        { id: 'dom', label: 'Political Liberty', x: 50, y: 50, subtle: true }
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
    navLabel: '02 · Montesquieu',
    kicker: '02 / 07 · STAGE 1: THE AUTHOR AND HIS PROBLEM · 0:50–2:05',
    title: 'Who was Montesquieu',
    subtitle: 'Charles-Louis de Secondat (1689–1755) · The Spirit of the Laws (1748)',
    durationSeconds: 75,
    centralQuestion: 'What problem of public power and security under laws animates The Spirit of the Laws?',
    montesquieuAnchor:
      'Magistrate in the Parlement of Bordeaux (a judicial court, not a modern legislative parliament); author of De l’esprit des lois (1748).',
    keyPoint:
      'Montesquieu offers more than a diagram of government: political liberty requires security under laws and limits against the arbitrary exercise of public power.',
    lecternScript: {
      page: 2,
      heading: 'Slide 2  Who was Montesquieu',
      elapsedRange: '0:50–2:05',
      stageLabel: '',
      instruction: '',
      paragraphs: [
        {
          leadIn: 'Montesquieu was Charles-Louis de Secondat,',
          rest: 'a French magistrate and political thinker who lived from 1689 to 1755. He served in the Parlement of Bordeaux, which was a court, not a parliament in the modern legislative sense.'
        },
        {
          leadIn: 'His major work, The Spirit',
          rest: 'of the Laws, appeared in 1748. It asks how laws relate to different forms of government and to the circumstances of a society: its customs, religion, commerce, geography and history.'
        },
        {
          leadIn: 'That matters because Montesquieu gives',
          rest: 'us more than a diagram of government. He asks how power operates, what restrains it, and under what conditions people can live without fearing its arbitrary exercise.'
        },
        {
          leadIn: 'Political liberty, in this account,',
          rest: 'does not mean that everyone can simply do whatever they want. It requires security under laws and limits on the people who exercise public power. The distribution of powers is one essential part of that problem.'
        }
      ],
      stageCue: '[CHANGE TO SLIDE 3.]'
    },
    presenterTip: {
      heading: 'Magistrate, Context & Political Liberty',
      pacing: '0:50–2:05 · ~1m15s',
      cues: [
        {
          label: 'Parlement of Bordeaux (1689–1755)',
          text: 'Clarify that the Parlement of Bordeaux was a judicial court, not a modern legislative parliament.'
        },
        {
          label: 'The Spirit of the Laws (1748)',
          text: 'Laws are examined in relation to forms of government and societal circumstances: customs, religion, commerce, geography, and history.'
        },
        {
          label: 'Meaning of Political Liberty',
          text: 'Liberty is not doing whatever one wants—it requires security under laws and limits preventing arbitrary public power.'
        }
      ],
      guardrail:
        'Guardrail: Emphasise that the Parlement of Bordeaux was an Ancien Régime court of justice, and that Montesquieu gives more than an abstract diagram of government.'
    },
    constellation: {
      mode: 'dual-tension',
      caption: 'Bordeaux · Spirit of the Laws (1748)',
      nodes: [
        { id: 'leg', label: '1689–1755 Court', x: 22, y: 46 },
        { id: 'exec', label: '1748 Circumstances', x: 50, y: 22 },
        { id: 'jud', label: 'Security Under Law', x: 78, y: 54 },
        { id: 'dom', label: 'Limits on Power', x: 50, y: 76 }
      ]
    },
    elements: [
      {
        id: 'court',
        label: 'Magistrate in the Parlement of Bordeaux (1689–1755)',
        detail: 'Served in an Ancien Régime court of justice, not a modern legislative parliament.'
      },
      {
        id: 'spirit',
        label: 'The Spirit of the Laws (1748) & societal circumstances',
        detail: 'Relates laws to forms of government, customs, religion, commerce, geography, and history.'
      },
      {
        id: 'liberty',
        label: 'Political liberty as security under laws',
        detail: 'Living without fear of arbitrary power through restraints and distribution of public authority.'
      }
    ]
  },
  {
    number: 3,
    id: 'slide-3',
    navLabel: '03 · Three Powers',
    kicker: '03 / 07 · BOOK XI, CHAPTER 6 · 2:05–3:35',
    title: 'Three powers, limits on power',
    subtitle: 'De l’esprit des lois (1748), Book XI, chapter 6',
    durationSeconds: 90,
    centralQuestion: 'Why does concentrating legislative, executive, and judicial functions threaten political liberty?',
    montesquieuAnchor:
      'Book XI, chapter 6: legislative, executive, and judicial functions; preventing unchecked concentration while keeping historical distance from modern constitutional courts.',
    keyPoint:
      'Separation is not three isolated silos with no relation to one another—and Montesquieu’s account of judging is not a description of today’s permanent constitutional courts.',
    lecternScript: {
      page: 3,
      heading: 'Slide 3  Three powers, limits on power',
      elapsedRange: '2:05–3:35',
      stageLabel: '',
      instruction: '',
      paragraphs: [
        {
          leadIn: 'In Book Eleven, chapter six,',
          rest: 'Montesquieu distinguishes three kinds of power. In familiar terms, these are legislative, executive and judicial: making laws, conducting government, and judging crimes and disputes.'
        },
        {
          leadIn: 'His concern is what happens',
          rest: 'when these functions are concentrated. If the same authority makes the laws and executes them, it can make oppressive laws and then enforce them. If judging is joined to legislation, the judge can become the lawmaker. If it is joined to executive power, judging can acquire the force of an oppressor.'
        },
        {
          leadIn: 'Separating these functions therefore helps',
          rest: 'protect liberty. But separation should not be understood as three institutions with no relationship to one another. The question is how their arrangements prevent an unchecked accumulation of power.'
        },
        {
          leadIn: 'There is also a historical',
          rest: 'distance to keep in mind. Montesquieu’s account of judging is not a description of today’s permanent constitutional courts. When we look at a modern image of judicial independence, we are examining a later institutional world. We should not assume that it simply reproduces his model.'
        }
      ],
      stageCue: '[Pause. CHANGE TO SLIDE 4.]'
    },
    presenterTip: {
      heading: 'Book XI, Ch. 6 & Historical Distance',
      pacing: '2:05–3:35 · ~1m30s',
      cues: [
        {
          label: 'Danger of Concentration',
          text: 'Lawmaker + executor = oppressive laws tyrannically enforced; judge + lawmaker = arbitrary control; judge + executive = force of an oppressor.'
        },
        {
          label: 'Relational Arrangement',
          text: 'Separation does not mean three isolated institutions with zero relationship—it asks how arrangements prevent unchecked accumulation.'
        },
        {
          label: 'Historical Distance on Judging',
          text: 'Montesquieu’s account of judging does not describe modern permanent constitutional courts; keep that distance in view when turning to images.'
        }
      ],
      guardrail:
        'Guardrail: Do not project today’s permanent constitutional courts back onto Montesquieu’s 1748 account of judging.'
    },
    constellation: {
      mode: 'civic-triad',
      caption: 'Book XI, Ch. 6 · Limits on Power',
      nodes: [
        { id: 'leg', label: 'Legislative', x: 22, y: 48 },
        { id: 'exec', label: 'Executive', x: 78, y: 48 },
        { id: 'jud', label: 'Judicial', x: 50, y: 20 },
        { id: 'dom', label: 'Historical Distance', x: 50, y: 80 }
      ]
    },
    functions: [
      {
        id: 'legislative',
        label: 'Legislative · Making laws',
        risk: 'Joined with execution: can enact oppressive laws and enforce them.'
      },
      {
        id: 'executive',
        label: 'Executive · Conducting government',
        risk: 'Joined with judging: judging can acquire the force of an oppressor.'
      },
      {
        id: 'judicial',
        label: 'Judicial · Judging crimes and disputes',
        risk: 'Joined with legislation: the judge can become the lawmaker.'
      }
    ]
  },
  {
    number: 4,
    id: 'slide-4',
    navLabel: '04 · Brazil 1824',
    kicker: '04 / 07 · STAGE 2: INSTITUTIONS AND THEIR IMAGES · 3:35–4:45',
    title: 'Montesquieu in Brazil, 1824',
    subtitle: 'Constitution of 1824, article 10 · Serge Dauchy, conference text (§ 6)',
    durationSeconds: 70,
    centralQuestion: 'How did Brazilian constitutional actors adapt European models in the independent monarchy of 1824?',
    montesquieuAnchor:
      'Circulation before independence and 1823 debates (Dauchy § 6); Constitution of 1824, Article 10 recognising four powers (Legislative, Moderating, Executive, Judicial) drawing on Benjamin Constant.',
    keyPoint:
      'Reception involved choices and adaptation: the Moderating Power belonged to the emperor under Benjamin Constant’s model rather than inventing a fourth Montesquieuan branch.',
    lecternScript: {
      page: 4,
      heading: 'Slide 4  Montesquieu in Brazil 1824',
      elapsedRange: '3:35–4:45',
      stageLabel: 'Stage 2: institutions and their images',
      instruction: '',
      paragraphs: [
        {
          leadIn: 'Brazil makes that historical distance',
          rest: 'particularly clear. As Serge explains in his text, Montesquieu’s work circulated in Brazil before independence and was discussed during the constitutional debates of 1823.'
        },
        {
          leadIn: 'Yet the Constitution of 1824',
          rest: 'recognised four powers: Legislative, Moderating, Executive and Judicial. Article ten names them explicitly. The Moderating Power belonged to the emperor, and this arrangement drew on Benjamin Constant’s model.'
        },
        {
          leadIn: 'So reception involved choices and',
          rest: 'adaptation. The fourth power was not another branch invented by Montesquieu. Brazilian constitutional actors were working with several sources and with the political circumstances of an independent monarchy.'
        },
        {
          leadIn: 'That is the background I',
          rest: 'want to keep in view when turning to images. A familiar idea about power can acquire a different institutional form. An image, too, needs to be understood in the particular setting in which it was made and used.'
        }
      ],
      stageCue: '[CHANGE TO SLIDE 5.]'
    },
    presenterTip: {
      heading: '1824 Four Powers & Adaptation',
      pacing: '3:35–4:45 · Stage 2',
      cues: [
        {
          label: 'Circulation & 1823 Debates',
          text: 'As Serge explains (§ 6), Montesquieu circulated in Brazil before independence and featured in the 1823 Constituent Assembly.'
        },
        {
          label: '1824 Article 10 · Four Powers',
          text: 'Recognised Legislative, Moderating, Executive, and Judicial powers—the Emperor’s Moderating Power drew on Benjamin Constant’s model.'
        },
        {
          label: 'Bridge to Institutional Images',
          text: 'Reception involved choices and adaptation in an independent monarchy; images likewise require reading within their specific historical setting.'
        }
      ],
      guardrail:
        'Guardrail: The fourth power was not another branch invented by Montesquieu; Brazilian actors combined multiple sources within an imperial monarchy.'
    },
    constellation: {
      mode: 'four-powers',
      caption: 'Brazil, 1824 · Four Powers',
      nodes: [
        { id: 'dom', label: 'Moderating', x: 50, y: 14 },
        { id: 'leg', label: 'Legislative', x: 20, y: 64 },
        { id: 'exec', label: 'Executive', x: 50, y: 76 },
        { id: 'jud', label: 'Judicial', x: 80, y: 64 }
      ]
    },
    powersComparison: {
      threePowers: ['Legislative', 'Executive', 'Judicial'],
      fourPowers: ['Legislative', 'Moderating', 'Executive', 'Judicial']
    }
  },
  {
    number: 5,
    id: 'slide-5',
    navLabel: '05 · 1896 Oath',
    kicker: '05 / 07 · REPRESENTING DISTINCT AND RELATED INSTITUTIONS · 4:45–6:15',
    title: 'Representing distinct and related institutions',
    subtitle: 'Aurélio de Figueiredo · Compromisso Constitucional, 1896 (Oath of 26 February 1891)',
    durationSeconds: 90,
    centralQuestion: 'How does Figueiredo’s 1896 canvas stage executive authority under constitutional obligation?',
    montesquieuAnchor:
      'Aurélio de Figueiredo, Compromisso Constitucional (painted 1896; oath of 26 February 1891) read alongside Constitution of 1891, Articles 15 and 44.',
    keyPoint:
      'Makes executive authority under an obligation visible—Deodoro holds the constitutional book before the Constituent Congress presided over by Prudente de Moraes.',
    hasVisualPause: true,
    visualPauseLabel: '5s Visual Pause · Give the Audience a Moment to Look',
    lecternScript: {
      page: 5,
      heading: 'Slide 5  Representing distinct and related institutions',
      elapsedRange: '4:45–6:15',
      stageLabel: '',
      instruction: '',
      paragraphs: [
        {
          leadIn: 'How, then, can an image',
          rest: 'represent the relationship between powers?'
        },
        {
          leadIn: 'Consider Aurélio de Figueiredo’s Compromisso',
          rest: 'Constitucional, painted in 1896. It represents Deodoro da Fonseca taking his constitutional oath in 1891. The date of the painting and the date of the event are different.'
        },
        {
          leadIn: 'Here, executive authority appears in',
          rest: 'a scene involving a constitutional commitment and the Constituent Congress. Deodoro holds the book, while Prudente de Moraes presides over the Congress. We see different offices brought into a shared ceremony.'
        },
        {
          leadIn: 'The constitutional text gives us',
          rest: 'a point of comparison. Article fifteen of the Constitution of 1891 described the Legislative, Executive and Judicial powers as harmonious and independent of one another. Article forty-four required the president to promise to uphold the Constitution.'
        },
        {
          leadIn: 'My reading of the painting',
          rest: 'is that it makes authority under an obligation visible. The executive does not appear alone: the book and the assembly help define the relationship being represented.'
        },
        {
          leadIn: 'But this is an interpretation',
          rest: 'of the image. The ceremony cannot establish that those institutions were independent in practice, and the painting does not by itself prove direct influence from Montesquieu.'
        }
      ],
      stageCue: '[Give the audience a moment to look. CHANGE TO SLIDE 6.]'
    },
    presenterTip: {
      heading: 'Figueiredo (1896) & 1891 Oath',
      pacing: '4:45–6:15 · + 5s Look',
      pauseActionSlide: 5,
      cues: [
        {
          label: '1896 Painting vs. 1891 Event',
          text: 'Distinguish execution date (1896) from Deodoro da Fonseca’s oath (26 Feb. 1891) before the Constituent Congress presided over by Prudente de Moraes.'
        },
        {
          label: '1891 Constitution · Arts. 15 & 44',
          text: 'Art. 15: Legislative, Executive, and Judicial harmonious and independent; Art. 44: presidential oath to uphold the Constitution.'
        },
        {
          label: 'Give the Audience a Moment to Look',
          text: 'My reading: executive authority appears under an obligation (book + assembly). Pause briefly before moving to Slide 6.',
          isPauseCue: true
        }
      ],
      guardrail:
        'Guardrail: Present this explicitly as your interpretation of the image; the ceremony does not prove institutional independence in practice or direct influence from Montesquieu.'
    },
    constellation: {
      mode: 'floor-gallery',
      caption: '1896 Canvas · 1891 Constitutional Oath',
      nodes: [
        { id: 'exec', label: 'Deodoro · Oath', x: 26, y: 64 },
        { id: 'leg', label: 'Prudente · Congress', x: 52, y: 42 },
        { id: 'jud', label: '1891 Art. 15 & 44', x: 76, y: 64 },
        { id: 'dom', label: '1896 Canvas', x: 50, y: 18 }
      ]
    },
    artwork: {
      title: 'Compromisso Constitucional',
      artist: 'Aurélio de Figueiredo',
      paintingDate: '1896',
      eventDate: '26 February 1891',
      src: './assets/report/compromisso.jpg',
      verified: true,
      caption: 'Aurélio de Figueiredo, Compromisso Constitucional, 1896. Represents the oath of 26 February 1891.',
      credit: 'Museu da República · Oil on canvas, 330 × 257 cm · Reproduction: Romulo Fialdini'
    }
  },
  {
    number: 6,
    id: 'slide-6',
    navLabel: '06 · 1961 Justice',
    kicker: '06 / 07 · CESCHIATTI’S JUSTICE: THE SWORD AND AUTONOMY · 6:15–8:20',
    title: 'Ceschiatti’s Justice: the sword and autonomy',
    subtitle: 'Alfredo Ceschiatti · A Justiça, 1961 · Supremo Tribunal Federal, Brasília',
    durationSeconds: 125,
    centralQuestion: 'What can a judicial sculpture make visible as an ideal, and what depends on laws and practices beyond the image?',
    montesquieuAnchor:
      'Alfredo Ceschiatti, A Justiça (1961, STF, Praça dos Três Poderes); Arno’s hypothesis and Rafael Simioni’s reading of judicial autonomy versus de facto institutional guarantees.',
    keyPoint:
      'An image can make institutional independence visible as an ideal, but whether that ideal holds depends on the laws and practices through which public power is exercised.',
    lecternScript: {
      page: 6,
      heading: 'Slide 6  Ceschiatti’s Justice: the sword and autonomy',
      elapsedRange: '6:15–8:20',
      stageLabel: '',
      instruction: '',
      paragraphs: [
        {
          leadIn: 'The judicial example is Alfredo',
          rest: 'Ceschiatti’s A Justiça, from 1961, in front of the Supreme Federal Court in Brasília.'
        },
        {
          leadIn: 'The seated figure holds a',
          rest: 'sword across her lap. Her position before the court identifies her with a particular institution. The setting matters: this is the Praça dos Três Poderes, where the Supreme Court, Congress and the presidential palace occupy distinct buildings within a common civic space.'
        },
        {
          leadIn: 'Arno suggested that we consider',
          rest: 'the sword as a sign of judicial autonomy and independence. I would treat that as a hypothesis about this sculpture in this place, rather than as the universal meaning of a sword.'
        },
        {
          leadIn: 'The sword can evoke the',
          rest: 'force associated with justice. Here, however, it is at rest, held by Justice herself. Rafael Simioni, in his study of Ceschiatti’s sculpture, develops an interpretation in terms of autonomy. That gives us a way to discuss the image’s claim to judicial authority.'
        },
        {
          leadIn: 'We still need to distinguish',
          rest: 'that claim from the institution’s actual position. A sword cannot tell us whether judges are protected from interference, whether their decisions can be enforced, or how the court relates to the other powers.'
        },
        {
          leadIn: 'The distinction is important for',
          rest: 'Montesquieu’s question about liberty. An image can make institutional independence visible as an ideal. Whether that ideal is sustained depends on the laws and practices through which public power is exercised.'
        }
      ],
      stageCue: '[Pause. CHANGE TO SLIDE 7.]'
    },
    presenterTip: {
      heading: 'Ceschiatti (1961), Sword & Autonomy',
      pacing: '6:15–8:20 · ~2m05s',
      cues: [
        {
          label: 'Praça dos Três Poderes Setting',
          text: 'Seated before the STF in Brasília within a shared civic plaza alongside Congress and the presidential palace.'
        },
        {
          label: 'Sword at Rest · Arno & Simioni',
          text: 'Treat Arno’s suggestion as a contextual hypothesis: the sword is at rest across Justice’s lap; cite Rafael Simioni’s study on judicial autonomy.'
        },
        {
          label: 'Visual Ideal vs. Legal Practice',
          text: 'A sculpture can stage independence as an ideal, but cannot show whether judges are protected from interference or their decisions enforced.'
        }
      ],
      guardrail:
        'Guardrail: Treat the sword’s link to autonomy as a hypothesis about this sculpture in this civic setting (citing Rafael Simioni), not a universal symbol or proof of actual judicial independence.'
    },
    constellation: {
      mode: 'conjugal-scale',
      caption: '1961 A Justiça · Praça dos Três Poderes',
      nodes: [
        { id: 'jud', label: 'STF · A Justiça', x: 50, y: 20 },
        { id: 'leg', label: 'Congress', x: 22, y: 66 },
        { id: 'exec', label: 'Planalto Palace', x: 78, y: 66 },
        { id: 'dom', label: 'Sword at Rest', x: 50, y: 78 }
      ]
    },
    artwork: {
      title: 'A Justiça',
      artist: 'Alfredo Ceschiatti',
      date: '1961',
      institution: 'Supremo Tribunal Federal, Praça dos Três Poderes, Brasília',
      src: './assets/report/justica.jpg',
      verified: true,
      caption: 'Alfredo Ceschiatti, A Justiça, 1961. Supremo Tribunal Federal, Brasília.',
      credit: 'Granite, 3.30 m · Photograph: Fellipe Sampaio / STF'
    }
  },
  {
    number: 7,
    id: 'slide-7',
    navLabel: '07 · Questions',
    kicker: '07 / 07 · STAGE 3: THE DISCUSSION · 8:20–9:30',
    title: 'Questions for Serge',
    subtitle: 'Context, separation of powers, and the conditions of political liberty',
    durationSeconds: 70,
    centralQuestion:
      '1. What changes in our understanding of context when we move from laws rooted in a particular society to legal systems whose boundaries are constantly renegotiated? · 2. What was lost when Montesquieu came to be read mainly through the separation of powers?',
    montesquieuAnchor:
      'Connecting Serge Dauchy’s caution against reducing Montesquieu to a constitutional formula (highlighting civil/criminal laws and judicial institutions) with both closing questions.',
    keyPoint:
      'Opens discussion on how circulation and renegotiated boundaries reshape legal context, and what is lost from political liberty when Montesquieu is read primarily through separation of powers.',
    lecternScript: {
      page: 7,
      heading: 'Slide 7  Questions for Serge',
      elapsedRange: '8:20–9:30',
      stageLabel: 'Stage 3: the discussion',
      instruction: '',
      paragraphs: [
        {
          leadIn: 'This brings me to a',
          rest: 'point in Serge’s text that I would like to open for discussion. He cautions against reducing Montesquieu to a constitutional formula for separating powers. He draws attention to the civil and criminal laws, and especially the judicial institutions, that must support political liberty.'
        },
        {
          leadIn: 'The images help us see',
          rest: 'why that distinction matters. A constitutional oath represents an obligation. Justice before a court represents an authority. Both invite us to ask how the relationship they display is sustained beyond the image itself—and how legal contexts shift as ideas and institutions move.'
        },
        {
          leadIn: 'So, Serge, I would like',
          rest: 'to put two connected questions to you. First: you begin with Montesquieu’s insistence that laws belong to a particular society, and end with legal systems whose boundaries are constantly being renegotiated. What changes in our understanding of context when we move from the first picture to the second?'
        },
        {
          leadIn: 'And second: you show how',
          rest: 'Montesquieu came to be read mainly through the separation of powers. What do you think was lost from his account of political liberty in that reading?'
        },
        {
          leadIn: 'Thank you.',
          rest: ''
        }
      ],
      stageCue: '[STOP. Look up. Leave the questions on screen.]'
    },
    presenterTip: {
      heading: 'Closing Synthesis & Two Questions',
      pacing: '8:20–9:30 · Stage 3',
      cues: [
        {
          label: 'Bridge from Serge’s Text & Images',
          text: 'Dauchy cautions against reducing Montesquieu to a constitutional formula—highlighting civil/criminal laws and judicial institutions that sustain liberty beyond images.'
        },
        {
          label: 'Question 1 · Rethinking Context',
          text: '“You begin with Montesquieu’s insistence that laws belong to a particular society, and end with legal systems whose boundaries are constantly being renegotiated. What changes in our understanding of context when we move from the first picture to the second?”'
        },
        {
          label: 'Question 2 · Beyond Separation of Powers',
          text: '“You show how Montesquieu came to be read mainly through the separation of powers. What do you think was lost in that reading?” — Conclude: “Thank you.”'
        }
      ],
      guardrail: ''
    },
    constellation: {
      mode: 'open-horizon',
      caption: 'Questions for Serge Dauchy',
      nodes: [
        { id: 'leg', label: 'Particular Society', x: 20, y: 36 },
        { id: 'exec', label: 'Renegotiation', x: 44, y: 22 },
        { id: 'jud', label: 'Three Powers', x: 66, y: 26 },
        { id: 'dom', label: 'Political Liberty', x: 82, y: 46 }
      ]
    },
    questions: [
      {
        number: 1,
        text: 'You begin with Montesquieu’s insistence that laws belong to a particular society, and end with legal systems whose boundaries are constantly being renegotiated. What changes in our understanding of context when we move from the first picture to the second?',
        subtext: 'What evidence distinguishes borrowing from a change of legal meaning?'
      },
      {
        number: 2,
        text: 'You show how Montesquieu came to be read mainly through the separation of powers. What do you think was lost in that reading?',
        subtext: 'Where would you begin investigating a “system of liberty” beyond the constitution?'
      }
    ]
  }
];

export const VERIFIED_SOURCES = [
  {
    code: 'S1',
    id: 'src-dauchy',
    title: 'DAUCHY, Serge.',
    work: '« Montesquieu, De l’esprit des lois (1748) » — Conference paper, PPGD/UFSC (11 Nov. 2026).',
    url: '#slide-4',
    urlLabel: 'Panel Paper · Circulation, Liberty & Renegotiated Boundaries',
    verificationNote:
      'Primary conference text engaged across the intervention: pre-independence circulation in Brazil and the 1824 Constitution (§ 6), civil and criminal laws and judicial institutions supporting political liberty (§ 7), and renegotiated legal boundaries (§§ 11–14).'
  },
  {
    code: 'S2',
    id: 'src-montesquieu',
    title: 'MONTESQUIEU, Charles-Louis de Secondat, Baron de.',
    work: 'De l’esprit des lois (1748; 1777 ed.), esp. Book XI, chapter 6.',
    url: 'https://fr.wikisource.org/wiki/Esprit_des_lois_(1777)/L11/C6',
    urlLabel: 'Wikisource · De l’esprit des lois, Book XI, ch. 6',
    verificationNote:
      'Foundational 1748 treatise by the Bordeaux magistrate (1689–1755) examining how laws relate to forms of government and societal circumstances, and how distributing legislative, executive, and judicial functions restrains arbitrary power.'
  },
  {
    code: 'S3',
    id: 'src-const-1824',
    title: 'BRASIL.',
    work: 'Constituição Política do Império do Brazil (25 Mar. 1824), Article 10; Constituição da República dos Estados Unidos do Brasil (24 Feb. 1891), Articles 15 and 44.',
    url: 'https://www2.camara.leg.br/legin/fed/consti/1824-1899/constituicao-35041-25-marco-1824-532540-publicacaooriginal-14770-pl.html',
    urlLabel: 'Câmara dos Deputados · Constituições de 1824 e 1891',
    verificationNote:
      'Primary constitutional texts for Slide 04 (1824 Art. 10 enumerating Legislative, Moderating, Executive, and Judicial powers under Benjamin Constant’s model) and Slide 05 (1891 Art. 15 on harmonious and independent powers; Art. 44 on the presidential constitutional oath).'
  },
  {
    code: 'S4',
    id: 'src-figueiredo',
    title: 'MUSEU DA REPÚBLICA (IBRAM).',
    work: 'Aurélio de Figueiredo, Compromisso Constitucional, 1896 (Oil on canvas, 330 × 257 cm; represents Deodoro da Fonseca’s oath of 26 Feb. 1891 before the Constituent Congress presided over by Prudente de Moraes).',
    url: 'https://museudarepublica.acervos.museus.gov.br/acervo-museologico/pintura-historica-4/',
    urlLabel: 'Museu da República · Acervo Museológico',
    verificationNote:
      'Catalogue reference for Slide 05 distinguishing the painting’s execution date (1896) from the constitutional oath of 26 February 1891. Reproduction credit: Romulo Fialdini.'
  },
  {
    code: 'S5',
    id: 'src-ceschiatti',
    title: 'BRASIL. Supremo Tribunal Federal (STF).',
    work: '130 anos: conheça os destaques do acervo cultural do STF — Alfredo Ceschiatti, A Justiça, 1961 (Praça dos Três Poderes, Brasília).',
    url: 'https://noticias.stf.jus.br/postsnoticias/130-anos-conheca-os-destaques-do-acervo-cultural-stf/',
    urlLabel: 'STF Notícias · Acervo Cultural do STF',
    verificationNote:
      'Institutional reference for Slide 06: Alfredo Ceschiatti, A Justiça, 1961, granite (3.30 m), Supremo Tribunal Federal, Brasília. Photograph credit: Fellipe Sampaio / STF.'
  },
  {
    code: 'S6',
    id: 'src-simioni',
    title: 'SIMIONI, Rafael Lazzarotto.',
    work: 'Study on Alfredo Ceschiatti’s sculpture A Justiça (STF, Brasília) and the iconography of judicial autonomy.',
    url: '#slide-6',
    urlLabel: 'Slide 06 · Iconography of Judicial Autonomy',
    verificationNote:
      'Cited on Slide 06 alongside Arno’s conference prompt to frame the resting sword across Justice’s lap as a contextual hypothesis regarding judicial autonomy—while distinguishing visual ideals from actual institutional guarantees.'
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
 * Return all 7 structured Lectern Script pages (aligned 1-to-1 with PRINCIPAL_SLIDES)
 * for the in-app Lectern Script reader, Smartphone Remote teleprompter, and 7-page A4 print mode.
 * @returns {Array<Object>}
 */
export function getLecternScriptPages() {
  return PRINCIPAL_SLIDES.map((slide) => {
    const script = slide.lecternScript || {};
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
      paragraphs: Array.isArray(script.paragraphs)
        ? script.paragraphs.map((p) => ({
            leadIn: String(p?.leadIn || ''),
            rest: String(p?.rest || '')
          }))
        : [],
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
 * @param {number|string} rawVolume
 * @param {number} defaultVolume
 * @param {number} maxVolume
 * @returns {number}
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
 * @param {{ playing?: boolean, muted?: boolean, volume?: number }} state
 * @returns {{ shortLabel: string, ariaLabel: string, percent: number }}
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
 * Determine whether the opening event poster stage should be skipped automatically
 * (e.g., ?autostart=1, ?sync= session links, ?script=1, or direct #slide-N / #sources deep links).
 * @param {string} search
 * @param {string} hash
 * @returns {boolean}
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
 * @param {number|string} slideNumber
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
    cues,
    guardrail: String(tip.guardrail || '')
  };
}

/**
 * Pure state machine for the slide-specific Presenter Tip disclosure (hover vs. pinned click).
 * Prevents hover-then-click from accidentally closing the popover instead of pinning it open.
 * @param {{ activeSlide: number|null, mode: 'closed'|'hover'|'pinned' }} currentState
 * @param {{ type: string, slide?: number|string }} action
 * @returns {{ activeSlide: number|null, mode: 'closed'|'hover'|'pinned' }}
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
 * Respects reduced-motion and non-smooth instant jumps.
 *
 * @param {number} fromSlide
 * @param {number} toSlide
 * @param {{ reducedMotion?: boolean, smooth?: boolean }} [options]
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
    scrollDuration: distance > 1 ? 0.68 : 0.6,
    exitDuration: 0.24,
    exitOpacity: 0.3,
    exitY: direction * -14,
    enterDelay: 0.12,
    enterDuration: 0.58,
    enterOpacity: 0.22,
    enterY: direction * 22,
    childOpacity: 0.45,
    childOffsetY: direction * 10,
    childDuration: 0.48,
    childStagger: 0.05,
    bgDuration: 0.72
  };
}
