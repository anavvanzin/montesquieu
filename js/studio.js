import {
  filterTimelineByTheme,
  getTimelineMilestoneById,
  formatMilestoneCitationNote,
} from './timeline-data.mjs';

(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const drawer = $('#studio-drawer');
  const backdrop = $('#studio-backdrop');
  const openBtn = $('#studio-button');
  const mobileOpenBtn = $('#mobile-studio-toggle');
  const closeBtn = $('#studio-drawer-close');
  const tabButtons = $$('[data-studio-tab]');
  const panels = {
    timeline: $('#panel-timeline'),
    research: $('#panel-research'),
    image: $('#panel-image'),
    video: $('#panel-video'),
    chat: $('#panel-chat'),
  };

  if (!drawer) return;

  const SLIDE_TARGETS = {
    'slide-1': {
      stageSelector: '#s1-medallion-stage',
      imgSelector: '#montesquieu-image',
      restoreSelector: '[data-restore-plate="slide-1"]',
      defaultAspect: '3:4',
      presetKey: 'montesquieu-oval',
      scrollSlideId: 'slide-1',
    },
    'slide-4': {
      stageSelector: '#s4-artwork-stage',
      imgSelector: '#compromisso-image',
      fullBtnSelector: '#s4-oath-full-btn',
      restoreSelector: '[data-restore-plate="slide-4"]',
      defaultAspect: '4:3',
      presetKey: 'compromisso',
      scrollSlideId: 'slide-4',
    },
    'slide-5': {
      stageSelector: '#s5-photo-stage',
      imgSelector: '#justica-image',
      fullBtnSelector: '#s5-justica-full-btn',
      restoreSelector: '[data-restore-plate="slide-5"]',
      defaultAspect: '4:3',
      presetKey: 'justica',
      scrollSlideId: 'slide-5',
    },
  };

  let uploadedImageForEdit = null;
  let uploadedImageForVideo = null;
  let lastGeneratedImageUrl = null;
  let lastGeneratedVideoUrl = null;
  let lastResearchNoteText = '';

  function switchStudioTab(tabName) {
    tabButtons.forEach((btn) => {
      const active = btn.dataset.studioTab === tabName;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    Object.entries(panels).forEach(([key, panel]) => {
      if (panel) panel.hidden = key !== tabName;
    });
  }

  function openStudio(options = {}) {
    if (options.tab && panels[options.tab]) {
      switchStudioTab(options.tab);
    }
    if (options.preset) {
      if (options.tab === 'image') {
        const imgSelect = $('#image-source-select');
        if (imgSelect) {
          imgSelect.value = options.preset;
          imgSelect.dispatchEvent(new Event('change'));
        }
      } else if (options.tab === 'video') {
        const vidSelect = $('#video-source-select');
        if (vidSelect) {
          vidSelect.value = options.preset;
          vidSelect.dispatchEvent(new Event('change'));
        }
      }
    }
    if (options.targetSlide && SLIDE_TARGETS[options.targetSlide]) {
      const imgTarget = $('#image-target-slide');
      const vidTarget = $('#video-target-slide');
      const aspectSelect = $('#image-aspect-select');
      if (imgTarget) imgTarget.value = options.targetSlide;
      if (vidTarget) vidTarget.value = options.targetSlide;
      if (aspectSelect && SLIDE_TARGETS[options.targetSlide].defaultAspect) {
        aspectSelect.value = SLIDE_TARGETS[options.targetSlide].defaultAspect;
      }
    }

    drawer.hidden = false;
    if (backdrop) backdrop.hidden = false;
    requestAnimationFrame(() => {
      drawer.classList.add('is-open');
      backdrop?.classList.add('is-open');
    });
    openBtn?.setAttribute('aria-expanded', 'true');
  }

  function closeStudio() {
    drawer.classList.remove('is-open');
    backdrop?.classList.remove('is-open');
    openBtn?.setAttribute('aria-expanded', 'false');
    setTimeout(() => {
      if (!drawer.classList.contains('is-open')) {
        drawer.hidden = true;
        if (backdrop) backdrop.hidden = true;
      }
    }, 220);
  }

  openBtn?.addEventListener('click', () => {
    if (drawer.hidden || !drawer.classList.contains('is-open')) {
      openStudio();
    } else {
      closeStudio();
    }
  });

  mobileOpenBtn?.addEventListener('click', () => {
    const mobileMenu = $('#mobile-contents');
    const mobileToggle = $('#contents-toggle');
    if (mobileMenu && mobileToggle) {
      mobileMenu.hidden = true;
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
    openStudio();
  });

  closeBtn?.addEventListener('click', closeStudio);
  backdrop?.addEventListener('click', closeStudio);

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => switchStudioTab(btn.dataset.studioTab));
  });

  $$('[data-open-studio]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openStudio({
        tab: btn.dataset.openStudio,
        preset: btn.dataset.studioPreset,
        targetSlide: btn.dataset.studioTarget,
      });
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer.hidden) {
      closeStudio();
      return;
    }
    const activeEl = document.activeElement;
    const tag = activeEl?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || activeEl?.isContentEditable) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key.toLowerCase() === 's' && !e.repeat && !document.body.classList.contains('is-editing')) {
      e.preventDefault();
      if (drawer.hidden) openStudio();
      else closeStudio();
    }
  });

  // Helper: Apply custom image or video to a slide stage & restore original
  function applyVisualToSlide(slideId, mediaType, dataUrl) {
    const target = SLIDE_TARGETS[slideId];
    if (!target || !dataUrl) return;
    const stage = $(target.stageSelector);
    const img = $(target.imgSelector);
    const restoreBtn = $(target.restoreSelector);
    const fullBtn = target.fullBtnSelector ? $(target.fullBtnSelector) : null;
    if (!stage || !img) return;

    const existingVideo = $('.slide-inline-video', stage);
    if (existingVideo) existingVideo.remove();

    if (mediaType === 'image') {
      img.hidden = false;
      img.src = dataUrl;
      if (fullBtn) {
        fullBtn.dataset.image = dataUrl;
      }
    } else if (mediaType === 'video') {
      img.hidden = true;
      const vid = document.createElement('video');
      vid.className = 'slide-inline-video';
      vid.src = dataUrl;
      vid.controls = true;
      vid.autoplay = true;
      vid.loop = true;
      vid.muted = true;
      vid.playsInline = true;
      stage.prepend(vid);
    }

    if (restoreBtn) {
      restoreBtn.hidden = false;
    }

    const slideEl = document.getElementById(target.scrollSlideId || slideId);
    slideEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function restoreOriginalSlide(slideId) {
    const target = SLIDE_TARGETS[slideId];
    if (!target) return;
    const stage = $(target.stageSelector);
    const img = $(target.imgSelector);
    const restoreBtn = $(target.restoreSelector);
    const fullBtn = target.fullBtnSelector ? $(target.fullBtnSelector) : null;
    if (!stage || !img) return;

    const existingVideo = $('.slide-inline-video', stage);
    if (existingVideo) existingVideo.remove();

    const originalSrc = img.dataset.originalSrc || img.getAttribute('src');
    img.src = originalSrc;
    img.hidden = false;
    if (fullBtn) {
      fullBtn.dataset.image = originalSrc;
    }
    if (restoreBtn) {
      restoreBtn.hidden = true;
    }
  }

  $$('[data-restore-plate]').forEach((btn) => {
    btn.addEventListener('click', () => {
      restoreOriginalSlide(btn.dataset.restorePlate);
    });
  });

  // Helper: Read uploaded file as Data URL
  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ dataUrl: String(reader.result), mimeType: file.type || 'image/jpeg', name: file.name });
      reader.onerror = () => reject(new Error('Could not read selected image file.'));
      reader.readAsDataURL(file);
    });
  }

  // Helper: Format scholarly text paragraphs safely into HTML elements
  function renderScholarlyText(container, rawText) {
    container.innerHTML = '';
    const blocks = String(rawText || '')
      .trim()
      .split(/\n{2,}/);
    blocks.forEach((block) => {
      const trimmed = block.trim();
      if (!trimmed) return;
      const p = document.createElement('p');
      // Convert **bold** and *italic* safely
      const parts = trimmed.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
      parts.forEach((segment) => {
        if (segment.startsWith('**') && segment.endsWith('**') && segment.length > 4) {
          const strong = document.createElement('strong');
          strong.textContent = segment.slice(2, -2);
          p.appendChild(strong);
        } else if (segment.startsWith('*') && segment.endsWith('*') && segment.length > 2) {
          const em = document.createElement('em');
          em.textContent = segment.slice(1, -1);
          p.appendChild(em);
        } else {
          p.appendChild(document.createTextNode(segment));
        }
      });
      container.appendChild(p);
    });
  }

  // =========================================================================
  // TAB 1: GOOGLE SEARCH GROUNDING RESEARCH
  // =========================================================================
  const researchInput = $('#research-query-input');
  const researchIncludeSlide = $('#research-include-slide');
  const researchSubmitBtn = $('#research-submit-btn');
  const researchClearBtn = $('#research-clear-btn');
  const researchStatus = $('#research-status');
  const researchResult = $('#research-result');
  const researchOutputText = $('#research-output-text');
  const researchSourcesBox = $('#research-sources-box');
  const researchSourcesList = $('#research-sources-list');
  const researchCopyBtn = $('#research-copy-btn');

  function getCurrentSlideSummary() {
    const activeLink = $('.header__nav a.is-current');
    const slideNum = activeLink ? activeLink.dataset.slideLink : '1';
    const sec = $(`[data-slide="${slideNum}"]`);
    if (!sec) return '';
    const text = (sec.innerText || sec.textContent || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 900);
    return `Slide 0${slideNum}: ${text}`;
  }

  async function runGroundedResearch() {
    const query = (researchInput?.value || '').trim();
    if (!query) {
      if (researchStatus) {
        researchStatus.hidden = false;
        researchStatus.textContent = 'Enter a research question or select a quick inquiry chip above.';
      }
      return;
    }

    if (researchSubmitBtn) researchSubmitBtn.disabled = true;
    if (researchStatus) {
      researchStatus.hidden = false;
      researchStatus.textContent = 'Searching grounded historiographical & legal sources (gemini-3.8-flash)...';
    }

    try {
      const slideContext = researchIncludeSlide?.checked ? getCurrentSlideSummary() : '';
      const res = await fetch('/api/studio/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, slideContext }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Research request failed.');
      }

      if (researchStatus) researchStatus.hidden = true;
      if (researchResult) researchResult.hidden = false;
      if (researchClearBtn) researchClearBtn.hidden = false;

      if (researchOutputText) {
        renderScholarlyText(researchOutputText, data.text || 'No response returned.');
      }

      const sources = Array.isArray(data.sources) ? data.sources : [];
      if (researchSourcesList && researchSourcesBox) {
        researchSourcesList.innerHTML = '';
        if (sources.length > 0) {
          researchSourcesBox.hidden = false;
          sources.forEach((src) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = src.uri;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = src.title || src.uri;
            li.appendChild(a);
            researchSourcesList.appendChild(li);
          });
        } else {
          researchSourcesBox.hidden = true;
        }
      }

      const citationLines = sources.map((s, i) => `[${i + 1}] ${s.title}: ${s.uri}`).join('\n');
      lastResearchNoteText = `${data.text || ''}${citationLines ? '\n\nSources:\n' + citationLines : ''}`;
    } catch (err) {
      if (researchStatus) {
        researchStatus.hidden = false;
        researchStatus.textContent = `Error: ${err.message}`;
      }
    } finally {
      if (researchSubmitBtn) researchSubmitBtn.disabled = false;
    }
  }

  $$('[data-research-prompt]').forEach((chip) => {
    chip.addEventListener('click', () => {
      if (researchInput) {
        researchInput.value = chip.dataset.researchPrompt || '';
        runGroundedResearch();
      }
    });
  });

  researchSubmitBtn?.addEventListener('click', runGroundedResearch);
  researchClearBtn?.addEventListener('click', () => {
    if (researchInput) researchInput.value = '';
    if (researchResult) researchResult.hidden = true;
    if (researchStatus) researchStatus.hidden = true;
    researchClearBtn.hidden = true;
  });

  researchCopyBtn?.addEventListener('click', async () => {
    if (!lastResearchNoteText) return;
    try {
      await navigator.clipboard.writeText(lastResearchNoteText);
      const orig = researchCopyBtn.textContent;
      researchCopyBtn.textContent = 'Copied ✓';
      setTimeout(() => {
        researchCopyBtn.textContent = orig;
      }, 1800);
    } catch (e) {}
  });

  // =========================================================================
  // TAB 2: CREATE & EDIT IMAGES (GEMINI-NANO-BANANA-2.1)
  // =========================================================================
  const imageSourceSelect = $('#image-source-select');
  const imageUploadField = $('#image-upload-field');
  const imageUploadInput = $('#image-upload-input');
  const imageUploadPreview = $('#image-upload-preview');
  const imageUploadThumb = $('#image-upload-thumb');
  const imageUploadName = $('#image-upload-name');
  const imagePromptInput = $('#image-prompt-input');
  const imageAspectSelect = $('#image-aspect-select');
  const imageSizeSelect = $('#image-size-select');
  const imageUseSearch = $('#image-use-search');
  const imageGenerateBtn = $('#image-generate-btn');
  const imageStatus = $('#image-status');
  const imageResult = $('#image-result');
  const imageOutputPreview = $('#image-output-preview');
  const imageDownloadLink = $('#image-download-link');
  const imageTargetSlide = $('#image-target-slide');
  const imageApplyBtn = $('#image-apply-btn');
  const imageRestoreBtn = $('#image-restore-btn');

  imageSourceSelect?.addEventListener('change', () => {
    const val = imageSourceSelect.value;
    if (imageUploadField) {
      imageUploadField.hidden = val !== 'upload';
    }
    if (val === 'montesquieu-oval') {
      if (imageTargetSlide) imageTargetSlide.value = 'slide-1';
      if (imageAspectSelect) imageAspectSelect.value = '3:4';
    } else if (val === 'compromisso') {
      if (imageTargetSlide) imageTargetSlide.value = 'slide-5';
      if (imageAspectSelect) imageAspectSelect.value = '4:3';
    } else if (val === 'justica') {
      if (imageTargetSlide) imageTargetSlide.value = 'slide-6';
      if (imageAspectSelect) imageAspectSelect.value = '4:3';
    }
  });

  imageUploadInput?.addEventListener('change', async () => {
    const file = imageUploadInput.files?.[0];
    if (!file) return;
    try {
      uploadedImageForEdit = await readFileAsDataUrl(file);
      if (imageUploadThumb) imageUploadThumb.src = uploadedImageForEdit.dataUrl;
      if (imageUploadName) imageUploadName.textContent = uploadedImageForEdit.name;
      if (imageUploadPreview) imageUploadPreview.hidden = false;
    } catch (err) {
      if (imageStatus) {
        imageStatus.hidden = false;
        imageStatus.textContent = err.message;
      }
    }
  });

  $$('[data-image-prompt]').forEach((chip) => {
    chip.addEventListener('click', () => {
      if (imagePromptInput) {
        imagePromptInput.value = chip.dataset.imagePrompt || '';
        imagePromptInput.focus();
      }
    });
  });

  imageGenerateBtn?.addEventListener('click', async () => {
    const prompt = (imagePromptInput?.value || '').trim();
    if (!prompt) {
      if (imageStatus) {
        imageStatus.hidden = false;
        imageStatus.textContent = 'Please enter a prompt or click one of the prompt presets above.';
      }
      return;
    }

    const sourceVal = imageSourceSelect?.value || 'none';
    if (sourceVal === 'upload' && !uploadedImageForEdit) {
      if (imageStatus) {
        imageStatus.hidden = false;
        imageStatus.textContent = 'Please select an image file from your computer to edit.';
      }
      return;
    }

    imageGenerateBtn.disabled = true;
    if (imageStatus) {
      imageStatus.hidden = false;
      imageStatus.textContent =
        sourceVal === 'none'
          ? 'Generating historical plate with gemini-nano-banana-2.1...'
          : 'Editing selected plate with gemini-nano-banana-2.1...';
    }

    try {
      const payload = {
        prompt,
        aspectRatio: imageAspectSelect?.value || '4:3',
        imageSize: imageSizeSelect?.value || '1K',
        useSearch: Boolean(imageUseSearch?.checked),
      };

      if (sourceVal === 'upload' && uploadedImageForEdit) {
        payload.imageBase64 = uploadedImageForEdit.dataUrl;
        payload.mimeType = uploadedImageForEdit.mimeType;
      } else if (sourceVal !== 'none') {
        payload.presetAsset = sourceVal;
      }

      const res = await fetch('/api/studio/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Image generation failed.');
      }

      lastGeneratedImageUrl = data.imageDataUrl;
      if (imageStatus) imageStatus.hidden = true;
      if (imageResult) imageResult.hidden = false;
      if (imageOutputPreview) imageOutputPreview.src = lastGeneratedImageUrl;
      if (imageDownloadLink) imageDownloadLink.href = lastGeneratedImageUrl;
    } catch (err) {
      if (imageStatus) {
        imageStatus.hidden = false;
        imageStatus.textContent = `Error: ${err.message}`;
      }
    } finally {
      imageGenerateBtn.disabled = false;
    }
  });

  imageApplyBtn?.addEventListener('click', () => {
    if (!lastGeneratedImageUrl) return;
    const slideId = imageTargetSlide?.value || 'slide-5';
    applyVisualToSlide(slideId, 'image', lastGeneratedImageUrl);
  });

  imageRestoreBtn?.addEventListener('click', () => {
    const slideId = imageTargetSlide?.value || 'slide-5';
    restoreOriginalSlide(slideId);
  });

  // =========================================================================
  // TAB 3: ANIMATE IMAGES INTO VIDEO (GEMINI-OMNI-1.2-FLASH)
  // =========================================================================
  const videoSourceSelect = $('#video-source-select');
  const videoUploadField = $('#video-upload-field');
  const videoUploadInput = $('#video-upload-input');
  const videoUploadPreview = $('#video-upload-preview');
  const videoUploadThumb = $('#video-upload-thumb');
  const videoUploadName = $('#video-upload-name');
  const videoPromptInput = $('#video-prompt-input');
  const videoAspectSelect = $('#video-aspect-select');
  const videoGenerateBtn = $('#video-generate-btn');
  const videoStatus = $('#video-status');
  const videoResult = $('#video-result');
  const videoOutputPlayer = $('#video-output-player');
  const videoDownloadLink = $('#video-download-link');
  const videoTargetSlide = $('#video-target-slide');
  const videoApplyBtn = $('#video-apply-btn');
  const videoRestoreBtn = $('#video-restore-btn');

  videoSourceSelect?.addEventListener('change', () => {
    const val = videoSourceSelect.value;
    if (videoUploadField) {
      videoUploadField.hidden = val !== 'upload';
    }
    if (val === 'montesquieu-oval') {
      if (videoTargetSlide) videoTargetSlide.value = 'slide-1';
      if (videoAspectSelect) videoAspectSelect.value = '9:16';
    } else if (val === 'compromisso') {
      if (videoTargetSlide) videoTargetSlide.value = 'slide-5';
      if (videoAspectSelect) videoAspectSelect.value = '16:9';
    } else if (val === 'justica') {
      if (videoTargetSlide) videoTargetSlide.value = 'slide-6';
      if (videoAspectSelect) videoAspectSelect.value = '16:9';
    }
  });

  videoUploadInput?.addEventListener('change', async () => {
    const file = videoUploadInput.files?.[0];
    if (!file) return;
    try {
      uploadedImageForVideo = await readFileAsDataUrl(file);
      if (videoUploadThumb) videoUploadThumb.src = uploadedImageForVideo.dataUrl;
      if (videoUploadName) videoUploadName.textContent = uploadedImageForVideo.name;
      if (videoUploadPreview) videoUploadPreview.hidden = false;
    } catch (err) {
      if (videoStatus) {
        videoStatus.hidden = false;
        videoStatus.textContent = err.message;
      }
    }
  });

  $$('[data-video-prompt]').forEach((chip) => {
    chip.addEventListener('click', () => {
      if (videoPromptInput) {
        videoPromptInput.value = chip.dataset.videoPrompt || '';
        videoPromptInput.focus();
      }
    });
  });

  videoGenerateBtn?.addEventListener('click', async () => {
    const sourceVal = videoSourceSelect?.value || 'compromisso';
    if (sourceVal === 'upload' && !uploadedImageForVideo) {
      if (videoStatus) {
        videoStatus.hidden = false;
        videoStatus.textContent = 'Please upload a photo from your computer to animate.';
      }
      return;
    }

    const prompt = (videoPromptInput?.value || '').trim();
    const aspectRatio = videoAspectSelect?.value === '9:16' ? '9:16' : '16:9';

    videoGenerateBtn.disabled = true;
    if (videoStatus) {
      videoStatus.hidden = false;
      videoStatus.textContent =
        'Animating image into video with gemini-omni-1.2-flash (this typically takes 25–60 seconds)...';
    }

    try {
      const payload = {
        prompt,
        aspectRatio,
      };
      if (sourceVal === 'upload' && uploadedImageForVideo) {
        payload.imageBase64 = uploadedImageForVideo.dataUrl;
        payload.mimeType = uploadedImageForVideo.mimeType;
      } else {
        payload.presetAsset = sourceVal;
      }

      const res = await fetch('/api/studio/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Video animation failed.');
      }

      lastGeneratedVideoUrl = data.videoDataUrl;
      if (videoStatus) videoStatus.hidden = true;
      if (videoResult) videoResult.hidden = false;
      if (videoOutputPlayer) {
        videoOutputPlayer.src = lastGeneratedVideoUrl;
        videoOutputPlayer.load();
        videoOutputPlayer.play().catch(() => {});
      }
      if (videoDownloadLink) {
        videoDownloadLink.href = lastGeneratedVideoUrl;
      }
    } catch (err) {
      if (videoStatus) {
        videoStatus.hidden = false;
        videoStatus.textContent = `Error: ${err.message}`;
      }
    } finally {
      videoGenerateBtn.disabled = false;
    }
  });

  videoApplyBtn?.addEventListener('click', () => {
    if (!lastGeneratedVideoUrl) return;
    const slideId = videoTargetSlide?.value || 'slide-5';
    applyVisualToSlide(slideId, 'video', lastGeneratedVideoUrl);
  });

  videoRestoreBtn?.addEventListener('click', () => {
    const slideId = videoTargetSlide?.value || 'slide-5';
    restoreOriginalSlide(slideId);
  });

  // =========================================================================
  // TAB 1: LEGAL CIRCULATION TIMELINE (FRANCE ⇄ BRAZIL, 1748–1962)
  // =========================================================================
  const timelineListEl = $('#circulation-timeline-list');
  const filterButtons = $$('[data-timeline-filter]');
  const citationCodeEl = $('#citation-card-code');
  const citationHeadingEl = $('#citation-card-heading');
  const citationFrTagEl = $('#citation-fr-tag');
  const citationFrTitleEl = $('#citation-fr-title');
  const citationFrSummaryEl = $('#citation-fr-summary');
  const citationBrTagEl = $('#citation-br-tag');
  const citationBrTitleEl = $('#citation-br-title');
  const citationBrSummaryEl = $('#citation-br-summary');
  const citationQuoteEl = $('#citation-card-quote');
  const citationBibEl = $('#citation-card-bib');
  const citationMethodEl = $('#citation-card-method');
  const citationLinksEl = $('#citation-card-links');
  const copyCitationBtn = $('#timeline-copy-citation-btn');
  const jumpSourceBtn = $('#timeline-jump-source-btn');
  const jumpSlideBtn = $('#timeline-jump-slide-btn');
  const timelineResearchBtn = $('#timeline-research-btn');

  let currentTimelineFilter = 'all';
  let activeMilestoneId = 'milestone-1748-1824';

  function updateCitationCard(milestone) {
    if (!milestone) return;
    activeMilestoneId = milestone.id;

    if (citationCodeEl) {
      citationCodeEl.textContent = `${milestone.periodLabel} · REGISTER ${milestone.sourceCode}`;
    }
    if (citationHeadingEl) {
      citationHeadingEl.textContent = milestone.citation.heading;
    }
    if (citationFrTagEl) {
      citationFrTagEl.textContent = `FRANCE · ${milestone.french.year} · ${milestone.french.institution}`;
    }
    if (citationFrTitleEl) {
      citationFrTitleEl.textContent = milestone.french.title;
    }
    if (citationFrSummaryEl) {
      citationFrSummaryEl.textContent = milestone.french.summary;
    }
    if (citationBrTagEl) {
      citationBrTagEl.textContent = `BRASIL · ${milestone.brazilian.year} · ${milestone.brazilian.institution}`;
    }
    if (citationBrTitleEl) {
      citationBrTitleEl.textContent = milestone.brazilian.title;
    }
    if (citationBrSummaryEl) {
      citationBrSummaryEl.textContent = milestone.brazilian.summary;
    }
    if (citationQuoteEl) {
      citationQuoteEl.textContent = milestone.citation.primaryQuote;
    }
    if (citationBibEl) {
      citationBibEl.textContent = milestone.citation.bibliographicRef;
    }
    if (citationMethodEl) {
      citationMethodEl.textContent = milestone.citation.methodologicalNote;
    }

    if (citationLinksEl) {
      citationLinksEl.innerHTML = '';
      if (milestone.citation.externalUrl) {
        const a1 = document.createElement('a');
        a1.href = milestone.citation.externalUrl;
        a1.target = '_blank';
        a1.rel = 'noopener noreferrer';
        a1.className = 'circulation-ext-link';
        a1.textContent = `${milestone.citation.externalLabel} ↗`;
        citationLinksEl.appendChild(a1);
      }
      if (milestone.citation.secondaryUrl) {
        const a2 = document.createElement('a');
        a2.href = milestone.citation.secondaryUrl;
        a2.target = '_blank';
        a2.rel = 'noopener noreferrer';
        a2.className = 'circulation-ext-link';
        a2.textContent = `${milestone.citation.secondaryLabel} ↗`;
        citationLinksEl.appendChild(a2);
      }
    }

    if (jumpSourceBtn) {
      jumpSourceBtn.textContent = `View in Sources (${milestone.sourceCode}) ↓`;
    }
    if (jumpSlideBtn) {
      if (milestone.slideId === 'archive') {
        jumpSlideBtn.textContent = 'Go to Archive ↓';
      } else {
        const slideNum = milestone.slideId.replace('slide-', '0');
        jumpSlideBtn.textContent = `Go to Slide ${slideNum}`;
      }
    }

    if (timelineListEl) {
      $$('.circulation-row', timelineListEl).forEach((row) => {
        const selected = row.dataset.milestoneId === milestone.id;
        row.classList.toggle('is-active', selected);
        row.setAttribute('aria-selected', String(selected));
      });
    }
  }

  function renderTimelineList() {
    if (!timelineListEl) return;
    const items = filterTimelineByTheme(currentTimelineFilter);
    timelineListEl.innerHTML = '';

    const hasActiveInFiltered = items.some((m) => m.id === activeMilestoneId);
    const selectedId = hasActiveInFiltered ? activeMilestoneId : (items[0]?.id || 'milestone-1748-1824');

    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'circulation-row' + (item.id === selectedId ? ' is-active' : '');
      btn.dataset.milestoneId = item.id;
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', String(item.id === selectedId));
      btn.setAttribute(
        'aria-label',
        `${item.french.year} France (${item.french.title}) and ${item.brazilian.year} Brazil (${item.brazilian.title})`
      );

      const frCol = document.createElement('div');
      frCol.className = 'circulation-row__col circulation-row__col--fr';
      const frYear = document.createElement('span');
      frYear.className = 'circulation-row__year t-meta';
      frYear.textContent = item.french.year;
      const frTitle = document.createElement('strong');
      frTitle.className = 'circulation-row__title';
      frTitle.textContent = item.french.title;
      frCol.append(frYear, frTitle);

      const bridgeCol = document.createElement('div');
      bridgeCol.className = 'circulation-row__bridge t-meta';
      bridgeCol.setAttribute('aria-hidden', 'true');
      bridgeCol.innerHTML = `<span class="circulation-row__arrow">⇄</span><span class="circulation-row__code">${item.sourceCode}</span>`;

      const brCol = document.createElement('div');
      brCol.className = 'circulation-row__col circulation-row__col--br';
      const brYear = document.createElement('span');
      brYear.className = 'circulation-row__year t-meta';
      brYear.textContent = item.brazilian.year;
      const brTitle = document.createElement('strong');
      brTitle.className = 'circulation-row__title';
      brTitle.textContent = item.brazilian.title;
      brCol.append(brYear, brTitle);

      btn.append(frCol, bridgeCol, brCol);
      btn.addEventListener('click', () => {
        updateCitationCard(item);
      });
      timelineListEl.appendChild(btn);
    });

    updateCitationCard(getTimelineMilestoneById(selectedId));
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentTimelineFilter = btn.dataset.timelineFilter || 'all';
      filterButtons.forEach((b) => {
        const isCurrent = b === btn;
        b.classList.toggle('is-active', isCurrent);
        b.setAttribute('aria-pressed', String(isCurrent));
      });
      renderTimelineList();
    });
  });

  copyCitationBtn?.addEventListener('click', async () => {
    const milestone = getTimelineMilestoneById(activeMilestoneId);
    const note = formatMilestoneCitationNote(milestone);
    if (!note) return;
    try {
      await navigator.clipboard.writeText(note);
      const orig = copyCitationBtn.textContent;
      copyCitationBtn.textContent = 'Copied ✓';
      setTimeout(() => {
        copyCitationBtn.textContent = orig;
      }, 1800);
    } catch (e) {}
  });

  jumpSourceBtn?.addEventListener('click', () => {
    const milestone = getTimelineMilestoneById(activeMilestoneId);
    closeStudio();
    setTimeout(() => {
      const targetEl = $(milestone.sourceAnchor);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetEl.classList.add('is-highlighted-source');
        setTimeout(() => targetEl.classList.remove('is-highlighted-source'), 2600);
      }
    }, 240);
  });

  jumpSlideBtn?.addEventListener('click', () => {
    const milestone = getTimelineMilestoneById(activeMilestoneId);
    closeStudio();
    setTimeout(() => {
      if (milestone.slideId === 'archive') {
        const archiveDetails = $('#archive-vault-details');
        if (archiveDetails) archiveDetails.open = true;
      }
      const slideEl = document.getElementById(milestone.slideId);
      slideEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 240);
  });

  timelineResearchBtn?.addEventListener('click', () => {
    const milestone = getTimelineMilestoneById(activeMilestoneId);
    switchStudioTab('research');
    if (researchInput && milestone.researchPrompt) {
      researchInput.value = milestone.researchPrompt;
      researchInput.focus();
    }
  });

  // ============================================================================
  // TAB 5: GEMINI DISCUSSANT CHATBOT INTERFACE
  // ============================================================================
  const chatThread = $('#chat-thread');
  const chatInput = $('#chat-input');
  const chatSendBtn = $('#chat-send-btn');
  const chatModelSelect = $('#chat-model-select');
  const chatStatus = $('#chat-status');
  const chatClearBtn = $('#chat-clear-btn');
  const chatIncludeSlide = $('#chat-include-slide');
  let chatHistory = [];

  function appendChatMessage(role, text, modelBadge) {
    if (!chatThread) return;
    const msgEl = document.createElement('div');
    msgEl.className = `chat-message chat-message--${role === 'user' ? 'user' : 'assistant'}`;

    const authorEl = document.createElement('div');
    authorEl.className = 'chat-message__author t-meta';
    if (role === 'user') {
      authorEl.textContent = 'YOU · DISCUSSANT';
    } else {
      authorEl.textContent = modelBadge ? `GEMINI (${modelBadge})` : 'GEMINI · DISCUSSANT ASSISTANT';
    }

    const bodyEl = document.createElement('div');
    bodyEl.className = 'chat-message__body';
    bodyEl.textContent = text;

    msgEl.appendChild(authorEl);
    msgEl.appendChild(bodyEl);
    chatThread.appendChild(msgEl);
    chatThread.scrollTop = chatThread.scrollHeight;
  }

  async function sendChatMessage() {
    if (!chatInput) return;
    const msg = chatInput.value.trim();
    if (!msg) return;

    const selectedModel = chatModelSelect?.value || 'gemini-3.8-flash';
    chatInput.value = '';
    appendChatMessage('user', msg);
    chatHistory.push({ role: 'user', text: msg });

    if (chatStatus) {
      chatStatus.hidden = false;
      chatStatus.textContent = `Consulting ${selectedModel}...`;
    }
    if (chatSendBtn) chatSendBtn.disabled = true;

    let slideContext = '';
    if (chatIncludeSlide?.checked && typeof window.getCurrentSlideContext === 'function') {
      slideContext = window.getCurrentSlideContext();
    }

    try {
      const resp = await fetch('/api/studio/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: chatHistory.slice(-10), // keep recent 10 turns
          model: selectedModel,
          slideContext,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to receive a response from Gemini.');
      }

      appendChatMessage('model', data.reply, data.modelUsed);
      chatHistory.push({ role: 'model', text: data.reply });
      if (chatStatus) chatStatus.hidden = true;
    } catch (err) {
      if (chatStatus) {
        chatStatus.hidden = false;
        chatStatus.textContent = `Error: ${err.message}`;
      }
    } finally {
      if (chatSendBtn) chatSendBtn.disabled = false;
    }
  }

  chatSendBtn?.addEventListener('click', sendChatMessage);
  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });

  chatClearBtn?.addEventListener('click', () => {
    chatHistory = [];
    if (chatThread) {
      chatThread.innerHTML = `
        <div class="chat-message chat-message--assistant">
          <div class="chat-message__author t-meta">DISCUSSANT SCHOLARLY ASSISTANT</div>
          <div class="chat-message__body">
            Thread reset. Ready to explore questions on Montesquieu, Serge Dauchy’s paper, and Brazilian constitutional history.
          </div>
        </div>
      `;
    }
    if (chatStatus) chatStatus.hidden = true;
  });

  $$('[data-chat-prompt]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (chatInput) {
        chatInput.value = btn.dataset.chatPrompt;
        chatInput.focus();
      }
    });
  });

  renderTimelineList();
})();
