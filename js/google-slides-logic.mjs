/**
 * Pure Google Slides, Drive & Sheets Deck Modeling and BatchUpdate Request Builders
 * Decoupled from browser DOM and network calls so all Workspace payload transformations
 * and validation rules are deterministically unit-tested via node:test.
 */

import { PRESENTATION_META, PRINCIPAL_SLIDES, getLecternScriptPages } from './presentation-data.mjs';

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/presentations.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly'
];

/**
 * Strip inline HTML tags and normalize whitespace for Google Slides text shapes.
 * @param {string} raw
 * @returns {string}
 */
export function stripHtmlToPlainText(raw = '') {
  return String(raw || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract and validate a Google Slides presentation ID from either a full Google Docs URL
 * or a standalone ID string.
 * @param {string} rawInput
 * @returns {{ valid: boolean, presentationId: string, error: string }}
 */
export function parseGoogleSlidesId(rawInput = '') {
  const trimmed = String(rawInput || '').trim();
  if (!trimmed) {
    return {
      valid: false,
      presentationId: '',
      error: 'Enter a Google Slides URL or Presentation ID.'
    };
  }

  const urlMatch = trimmed.match(/\/presentation\/d\/([a-zA-Z0-9_-]{15,120})/);
  if (urlMatch && urlMatch[1]) {
    return {
      valid: true,
      presentationId: urlMatch[1],
      error: ''
    };
  }

  if (/^[a-zA-Z0-9_-]{15,120}$/.test(trimmed)) {
    return {
      valid: true,
      presentationId: trimmed,
      error: ''
    };
  }

  return {
    valid: false,
    presentationId: '',
    error: 'Invalid Google Slides URL or ID. Paste a docs.google.com/presentation/d/... link or valid file ID.'
  };
}

/**
 * Build a Google Slides edit or present URL from a verified presentationId.
 * @param {string} presentationId
 * @param {'edit'|'present'|'embed'} mode
 * @returns {string}
 */
export function buildGoogleSlidesUrl(presentationId, mode = 'edit') {
  const safeId = encodeURIComponent(String(presentationId || '').trim());
  if (!safeId) return 'https://docs.google.com/presentation/';
  if (mode === 'present') {
    return `https://docs.google.com/presentation/d/${safeId}/present`;
  }
  if (mode === 'embed') {
    return `https://docs.google.com/presentation/d/${safeId}/embed?start=false&loop=false&delayms=5000`;
  }
  return `https://docs.google.com/presentation/d/${safeId}/edit`;
}

/**
 * Format a Lectern Script page into clean Google Slides Speaker Notes prose.
 * @param {Object} lecternPage
 * @returns {string}
 */
export function formatSpeakerNotesForSlide(lecternPage = {}) {
  const lines = [];
  const headParts = [lecternPage.heading, lecternPage.elapsedRange, lecternPage.stageLabel].filter(
    Boolean
  );
  if (headParts.length) {
    lines.push(headParts.join(' · '));
    lines.push('────────────────────────────────────────');
  }
  if (lecternPage.instruction) {
    lines.push(`Podium note: ${lecternPage.instruction}`);
    lines.push('');
  }
  const paragraphs = Array.isArray(lecternPage.paragraphs) ? lecternPage.paragraphs : [];
  paragraphs.forEach((p) => {
    const combined = [p?.leadIn, p?.rest].filter(Boolean).join(' ').trim();
    if (combined) {
      lines.push(combined);
      lines.push('');
    }
  });
  if (lecternPage.stageCue) {
    lines.push(lecternPage.stageCue);
  }
  return lines.join('\n').trim();
}

/**
 * Build the 7-slide deck specification combining PRINCIPAL_SLIDES, optional inline editsMap,
 * and optional verbatim 7-page Lectern Script speaker notes.
 */
export function buildGoogleSlidesDeckSpec({
  slides = PRINCIPAL_SLIDES,
  lecternPages = getLecternScriptPages(),
  editsMap = {},
  includeSpeakerNotes = true,
  customTitle = ''
} = {}) {
  const safeEdits = editsMap && typeof editsMap === 'object' ? editsMap : {};
  const editOr = (key, fallback) =>
    safeEdits[key] ? stripHtmlToPlainText(safeEdits[key]) : stripHtmlToPlainText(fallback);

  const deckTitle =
    String(customTitle || '').trim() ||
    `${PRESENTATION_META.title} — Ana Vitória Vanzin Mendes (PPGD/UFSC)`;

  const slideSpecs = slides.map((slide) => {
    const n = slide.number;
    const lectern = lecternPages.find((p) => p.slideNumber === n) || {};

    let title = slide.title;
    let subtitle = slide.subtitle || '';
    const bullets = [];
    let footerNote = '';

    if (n === 1) {
      title = editOr('s1-title', slide.title);
      subtitle = editOr('s1-subtitle', slide.subtitle);
      bullets.push(editOr('s1-presenter', slide.presenter || PRESENTATION_META.presenter));
      bullets.push(editOr('s1-event', `${PRESENTATION_META.event} · ${PRESENTATION_META.eventKicker}`));
      bullets.push(`Guiding Question: ${editOr('s1-anchor', slide.centralQuestion)}`);
      footerNote = 'Portrait medallion: Charles-Louis de Secondat, Baron de Montesquieu (1689–1755).';
    } else if (n === 2) {
      title = editOr('s2-title', slide.title);
      subtitle = editOr('s2-lead', slide.subtitle);
      (slide.elements || []).forEach((el, idx) => {
        const lbl = editOr(`s2-el-${idx + 1}`, el.label);
        const det = editOr(`s2-el-${idx + 1}-sub`, el.detail);
        bullets.push(`${idx + 1}. ${lbl} — ${det}`);
      });
      footerNote = editOr('s2-note', slide.keyPoint);
    } else if (n === 3) {
      title = editOr('s3-title', slide.title);
      subtitle = slide.subtitle;
      (slide.functions || []).forEach((fn) => {
        bullets.push(`${fn.label} — ${fn.risk}`);
      });
      bullets.push(`Historical Distance: ${slide.keyPoint}`);
      footerNote = 'De l’esprit des lois (1748), Book XI, chapter 6.';
    } else if (n === 4) {
      title = editOr('s4-title', slide.title);
      subtitle = slide.subtitle;
      bullets.push('Montesquieu Reference: Legislative · Executive · Judicial');
      bullets.push('Brazil 1824 Constitution, Art. 10: Legislative · Moderating · Executive · Judicial');
      bullets.push(slide.keyPoint);
      footerNote = 'Constituição Política do Império do Brazil (25 Mar. 1824), Art. 10 · Serge Dauchy (§ 6).';
    } else if (n === 5) {
      title = editOr('s5-title', slide.title);
      subtitle = slide.subtitle;
      bullets.push(
        'Artwork: Aurélio de Figueiredo, Compromisso Constitucional (painted 1896; represents Deodoro da Fonseca’s oath of 26 Feb. 1891 before Prudente de Moraes and the Constituent Congress).'
      );
      bullets.push(
        'Constitutional Comparison: 1891 Constitution, Art. 15 (harmonious and independent powers) & Art. 44 (presidential oath to uphold the Constitution).'
      );
      bullets.push(`Interpretive Qualification: ${slide.keyPoint}`);
      footerNote = slide.artwork?.credit || 'Museu da República · Oil on canvas, 330 × 257 cm.';
    } else if (n === 6) {
      title = editOr('s6-title', slide.title);
      subtitle = slide.subtitle;
      bullets.push(
        'Civic Setting: Praça dos Três Poderes, Brasília — seated granite figure holding a resting sword before the Supremo Tribunal Federal.'
      );
      bullets.push(
        'Contextual Hypothesis: Reading the resting sword alongside Arno’s prompt and Rafael Simioni’s study on judicial autonomy.'
      );
      bullets.push(`Distinction: ${slide.keyPoint}`);
      footerNote = slide.artwork?.credit || 'Alfredo Ceschiatti, A Justiça, 1961 · STF, Brasília.';
    } else if (n === 7) {
      title = editOr('s7-title', slide.title);
      subtitle = slide.subtitle;
      const qs = Array.isArray(slide.questions) ? slide.questions : [];
      qs.forEach((q, idx) => {
        const qText = editOr(`s7-q${idx + 1}`, q.text);
        const qSub = editOr(`s7-q${idx + 1}-sub`, q.subtext || '');
        bullets.push(`Question ${q.number}: ${qText}${qSub ? ` (${qSub})` : ''}`);
      });
      footerNote = 'Discussant Intervention · Ana Vitória Vanzin Mendes · PPGD/UFSC · 11 Nov. 2026.';
    }

    return {
      number: n,
      objectId: `dauchy_slide_0${n}`,
      kicker: stripHtmlToPlainText(slide.kicker || `0${n} / 07`),
      title,
      subtitle,
      bullets,
      footerNote: stripHtmlToPlainText(footerNote),
      durationSeconds: Number(slide.durationSeconds) || 75,
      elapsedRange: lectern.elapsedRange || '',
      isDarkClosing: n === 7,
      speakerNotes: includeSpeakerNotes ? formatSpeakerNotesForSlide(lectern) : ''
    };
  });

  return {
    deckTitle,
    presenter: PRESENTATION_META.presenter,
    slides: slideSpecs
  };
}

/**
 * Build Google Slides API v1 batchUpdate requests to populate all 7 slides cleanly on a
 * standard 16:9 widescreen presentation (720 x 405 PT), replacing any prior slides.
 * @param {Object} deckSpec
 * @param {Object} existingPresentation JSON from presentations.create or presentations.get
 */
export function buildSlidesBatchUpdateRequests(deckSpec, existingPresentation = {}) {
  const requests = [];
  const existingSlides = Array.isArray(existingPresentation?.slides)
    ? existingPresentation.slides
    : [];
  const existingIds = existingSlides.map((s) => s?.objectId).filter(Boolean);

  // Use unique run suffix so syncing into an existing presentation never collides with old objectIds
  const runSuffix = Math.random().toString(36).slice(2, 7);

  const createdSlideIds = [];

  deckSpec.slides.forEach((slide, idx) => {
    const slideId = `s0${slide.number}_${runSuffix}`;
    createdSlideIds.push({ slideNumber: slide.number, slideId });

    const kickerBoxId = `kicker_0${slide.number}_${runSuffix}`;
    const titleBoxId = `title_0${slide.number}_${runSuffix}`;
    const bodyBoxId = `body_0${slide.number}_${runSuffix}`;
    const footBoxId = `foot_0${slide.number}_${runSuffix}`;

    // 1. Create blank widescreen slide
    requests.push({
      createSlide: {
        objectId: slideId,
        insertionIndex: idx,
        slideLayoutReference: {
          predefinedLayout: 'BLANK'
        }
      }
    });

    // 2. Apply archival parchment (#F4EFE4) on Slides 1–6 and midnight navy (#0B121E) on Slide 7
    const bgRgb = slide.isDarkClosing
      ? { red: 0.043, green: 0.071, blue: 0.118 }
      : { red: 0.957, green: 0.937, blue: 0.894 };

    const inkPrimary = slide.isDarkClosing
      ? { red: 0.961, green: 0.945, blue: 0.91 }
      : { red: 0.075, green: 0.106, blue: 0.165 };

    const inkAccent = slide.isDarkClosing
      ? { red: 0.89, green: 0.702, blue: 0.255 }
      : { red: 0.114, green: 0.235, blue: 0.588 };

    const inkMuted = slide.isDarkClosing
      ? { red: 0.75, green: 0.8, blue: 0.88 }
      : { red: 0.28, green: 0.33, blue: 0.41 };

    requests.push({
      updatePageProperties: {
        objectId: slideId,
        pageProperties: {
          pageBackgroundFill: {
            solidFill: {
              color: { rgbColor: bgRgb }
            }
          }
        },
        fields: 'pageBackgroundFill.solidFill.color'
      }
    });

    const makeTextBox = (id, xPt, yPt, wPt, hPt) => ({
      createShape: {
        objectId: id,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: {
            width: { magnitude: wPt, unit: 'PT' },
            height: { magnitude: hPt, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: xPt,
            translateY: yPt,
            unit: 'PT'
          }
        }
      }
    });

    // Kicker row
    requests.push(makeTextBox(kickerBoxId, 44, 26, 632, 24));
    requests.push({
      insertText: {
        objectId: kickerBoxId,
        insertionIndex: 0,
        text: slide.kicker
      }
    });
    requests.push({
      updateTextStyle: {
        objectId: kickerBoxId,
        style: {
          fontFamily: 'Arial',
          fontSize: { magnitude: 9.5, unit: 'PT' },
          bold: true,
          foregroundColor: { opaqueColor: { rgbColor: inkAccent } }
        },
        textRange: { type: 'ALL' },
        fields: 'fontFamily,fontSize,bold,foregroundColor'
      }
    });

    // Title + Subtitle block
    const fullHeading = slide.subtitle ? `${slide.title}\n${slide.subtitle}` : slide.title;
    requests.push(makeTextBox(titleBoxId, 44, 54, 632, 92));
    requests.push({
      insertText: {
        objectId: titleBoxId,
        insertionIndex: 0,
        text: fullHeading
      }
    });
    requests.push({
      updateTextStyle: {
        objectId: titleBoxId,
        style: {
          fontFamily: 'Georgia',
          fontSize: { magnitude: 24, unit: 'PT' },
          bold: true,
          foregroundColor: { opaqueColor: { rgbColor: inkPrimary } }
        },
        textRange: {
          type: 'FIXED_RANGE',
          startIndex: 0,
          endIndex: slide.title.length
        },
        fields: 'fontFamily,fontSize,bold,foregroundColor'
      }
    });
    if (slide.subtitle) {
      requests.push({
        updateTextStyle: {
          objectId: titleBoxId,
          style: {
            fontFamily: 'Georgia',
            fontSize: { magnitude: 13, unit: 'PT' },
            italic: true,
            foregroundColor: { opaqueColor: { rgbColor: inkMuted } }
          },
          textRange: {
            type: 'FIXED_RANGE',
            startIndex: slide.title.length + 1,
            endIndex: fullHeading.length
          },
          fields: 'fontFamily,fontSize,italic,foregroundColor'
        }
      });
    }

    // Main scholarly points / closing questions body
    const bodyText = slide.bullets.join('\n\n');
    if (bodyText) {
      requests.push(makeTextBox(bodyBoxId, 44, 152, 632, 196));
      requests.push({
        insertText: {
          objectId: bodyBoxId,
          insertionIndex: 0,
          text: bodyText
        }
      });
      requests.push({
        updateTextStyle: {
          objectId: bodyBoxId,
          style: {
            fontFamily: slide.isDarkClosing ? 'Georgia' : 'Arial',
            fontSize: { magnitude: slide.isDarkClosing ? 14.5 : 13, unit: 'PT' },
            foregroundColor: { opaqueColor: { rgbColor: inkPrimary } }
          },
          textRange: { type: 'ALL' },
          fields: 'fontFamily,fontSize,foregroundColor'
        }
      });
    }

    // Archival / constitutional citation footer
    if (slide.footerNote) {
      requests.push(makeTextBox(footBoxId, 44, 358, 632, 28));
      requests.push({
        insertText: {
          objectId: footBoxId,
          insertionIndex: 0,
          text: slide.footerNote
        }
      });
      requests.push({
        updateTextStyle: {
          objectId: footBoxId,
          style: {
            fontFamily: 'Arial',
            fontSize: { magnitude: 9, unit: 'PT' },
            foregroundColor: { opaqueColor: { rgbColor: inkMuted } }
          },
          textRange: { type: 'ALL' },
          fields: 'fontFamily,fontSize,foregroundColor'
        }
      });
    }
  });

  // Delete previous slides AFTER inserting the new 7 slides (Google Slides requires >=1 slide at all times)
  existingIds.forEach((oldId) => {
    requests.push({
      deleteObject: {
        objectId: oldId
      }
    });
  });

  return {
    requests,
    createdSlideIds
  };
}

/**
 * Build speaker-notes batchUpdate requests using the system-generated speakerNotesObjectId
 * read back from presentations.get after creating slides.
 * @param {Object} deckSpec
 * @param {Object} presentationJson
 */
export function buildSpeakerNotesBatchRequests(deckSpec, presentationJson = {}) {
  const requests = [];
  const apiSlides = Array.isArray(presentationJson?.slides) ? presentationJson.slides : [];

  deckSpec.slides.forEach((slideSpec, idx) => {
    if (!slideSpec.speakerNotes) return;
    const apiSlide = apiSlides[idx];
    const notesObjId =
      apiSlide?.slideProperties?.notesPage?.notesProperties?.speakerNotesObjectId || '';
    if (!notesObjId) return;

    requests.push({
      insertText: {
        objectId: notesObjId,
        insertionIndex: 0,
        text: slideSpec.speakerNotes
      }
    });
  });

  return requests;
}

/**
 * Build rows for optional Google Sheets rehearsal & performance audit export.
 */
export function buildSheetsExportValues(deckSpec, perfReport = null) {
  const pacingRows = [
    [
      'Slide #',
      'Slide Title',
      'Elapsed Window',
      'Target Duration (s)',
      'Speaker Notes Words',
      'Primary Citation / Source'
    ],
    ...deckSpec.slides.map((s) => {
      const wordCount = s.speakerNotes ? s.speakerNotes.split(/\s+/).filter(Boolean).length : 0;
      return [
        `0${s.number}`,
        s.title,
        s.elapsedRange || '—',
        s.durationSeconds,
        wordCount,
        s.footerNote
      ];
    })
  ];

  const perfRows = [
    [
      'Route',
      'Trigger',
      'Mode',
      'Transition Latency (ms)',
      'Estimated FPS',
      'Dropped Frames',
      'Worst Frame (ms)',
      'Max Long Task (ms)',
      'Severity'
    ]
  ];

  const transitions = Array.isArray(perfReport?.transitions) ? perfReport.transitions : [];
  if (transitions.length) {
    transitions.forEach((t) => {
      perfRows.push([
        t.routeLabel,
        t.trigger,
        t.mode,
        t.totalMs,
        t.estimatedFps,
        t.droppedFrames,
        t.worstFrameMs,
        t.maxLongTaskMs,
        t.severity.toUpperCase()
      ]);
    });
  } else {
    perfRows.push(['No transitions recorded yet', '—', '—', 0, 60, 0, 0, 0, 'OK']);
  }

  return { pacingRows, perfRows };
}
