import {
  PRESENTATION_META,
  PRINCIPAL_SLIDES,
  getLecternScriptPages,
  getConstellationCoordinates,
  clampMusicVolume,
  formatMusicStatusLabel,
  shouldBypassOpeningPoster,
  getPresenterTipForSlide,
  resolvePresenterTipState,
  computeSlideTransitionSpec
} from './presentation-data.mjs';
import {
  DEFAULT_SESSION_CODE,
  buildRemoteShareUrl,
  parseRemoteParamsFromSearch
} from './audience-sync-logic.mjs';
import { generateQrSvg } from './qr-svg.mjs';
import { VoiceController } from './voice-control.js';
import { RemoteController } from './remote-controller.js';

(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const TOTAL_SLIDES = PRINCIPAL_SLIDES.length; // 7
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');

  let currentSlideNum = 1;
  let activeSlideCallouts = {
    2: '',
    3: 'judicial',
    4: 'four-powers',
    5: '',
    6: 'stf',
    7: 'q1'
  };
  let visualPauseTimer = null;
  let visualPauseSlide = 0;

  // =========================================================================
  // 1. Theme & Projector Legibility Modes
  // =========================================================================
  const themeBtn = $('#theme-toggle');
  const mobileThemeBtn = $('#mobile-theme-toggle');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('dauchy-theme', theme);
    } catch (e) {}

    const isDark = theme === 'dark';
    if (themeBtn) {
      const icon = $('.theme-toggle__icon', themeBtn);
      const text = $('.theme-toggle__text', themeBtn);
      if (icon) icon.textContent = isDark ? '☾' : '☼';
      if (text) text.textContent = isDark ? 'Dark' : 'Light';
    }
    const mobileLabel = $('#mobile-theme-label');
    if (mobileLabel) {
      mobileLabel.textContent = isDark ? 'Dark' : 'Light';
    }
  }

  applyTheme(document.documentElement.getAttribute('data-theme') || 'light');

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  themeBtn?.addEventListener('click', toggleTheme);
  mobileThemeBtn?.addEventListener('click', toggleTheme);

  const projectorBtn = $('#projector-toggle');
  const mobileProjectorBtn = $('#mobile-projector-toggle');

  function applyProjectorMode(mode) {
    const isHigh = mode === 'high';
    if (isHigh) {
      document.documentElement.setAttribute('data-projector', 'high');
    } else {
      document.documentElement.removeAttribute('data-projector');
    }
    try {
      localStorage.setItem('dauchy-projector', isHigh ? 'high' : 'normal');
    } catch (e) {}

    if (projectorBtn) {
      projectorBtn.setAttribute('aria-pressed', String(isHigh));
      const label = $('#projector-label');
      if (label) label.textContent = isHigh ? 'Projector ON' : 'Projector (P)';
    }
    const mobileProjLabel = $('#mobile-projector-label');
    if (mobileProjLabel) {
      mobileProjLabel.textContent = isHigh ? 'High Contrast' : 'Standard';
    }
  }

  applyProjectorMode(
    document.documentElement.getAttribute('data-projector') === 'high' ? 'high' : 'normal'
  );

  function toggleProjectorMode() {
    const current =
      document.documentElement.getAttribute('data-projector') === 'high' ? 'high' : 'normal';
    applyProjectorMode(current === 'high' ? 'normal' : 'high');
  }

  projectorBtn?.addEventListener('click', toggleProjectorMode);
  mobileProjectorBtn?.addEventListener('click', toggleProjectorMode);

  // =========================================================================
  // 2. Low-Volume Background Music Controller (Chopin Nocturne Op. 9, No. 2)
  // =========================================================================
  const bgAudio = $('#bg-music-audio');
  const curtainMusicBtn = $('#curtain-music-btn');
  const curtainMusicLabel = $('#curtain-music-label');
  const floatingMusicBtn = $('#floating-music-btn');
  const floatingMusicLabel = $('#floating-music-label');
  const prepMusicToggle = $('#prep-music-toggle');
  const prepMusicLabel = $('#prep-music-label');
  const prepMusicSlider = $('#prep-music-volume');
  const prepMusicVolReadout = $('#prep-music-vol-readout');
  const mobileMusicBtn = $('#mobile-music-toggle');
  const mobileMusicLabel = $('#mobile-music-label');

  const MUSIC_VOL_KEY = 'dauchy-music-volume';
  const MUSIC_MUTE_KEY = 'dauchy-music-muted';

  let musicVolume = PRESENTATION_META.backgroundMusic.defaultVolume; // 0.12 (12%)
  let userMutedMusic = false;
  let musicFadeInterval = null;

  try {
    const savedVol = localStorage.getItem(MUSIC_VOL_KEY);
    if (savedVol !== null) {
      musicVolume = clampMusicVolume(savedVol);
    }
    userMutedMusic = localStorage.getItem(MUSIC_MUTE_KEY) === 'true';
  } catch (e) {}

  function clearMusicFade() {
    if (musicFadeInterval) {
      clearInterval(musicFadeInterval);
      musicFadeInterval = null;
    }
  }

  function isMusicPlaying() {
    return Boolean(bgAudio && !bgAudio.paused && !bgAudio.ended && !bgAudio.muted);
  }

  function syncMusicUI() {
    const playing = isMusicPlaying();
    const muted = userMutedMusic || musicVolume === 0;
    const status = formatMusicStatusLabel({
      playing,
      muted,
      volume: musicVolume
    });
    const activePressed = String(playing && !muted);

    if (curtainMusicBtn) {
      curtainMusicBtn.setAttribute('aria-pressed', activePressed);
      curtainMusicBtn.setAttribute('aria-label', status.ariaLabel);
    }
    if (curtainMusicLabel) curtainMusicLabel.textContent = status.shortLabel;

    if (floatingMusicBtn) {
      floatingMusicBtn.setAttribute('aria-pressed', activePressed);
      floatingMusicBtn.setAttribute('aria-label', status.ariaLabel);
    }
    if (floatingMusicLabel) floatingMusicLabel.textContent = status.shortLabel;

    if (prepMusicToggle) {
      prepMusicToggle.setAttribute('aria-pressed', activePressed);
      prepMusicToggle.setAttribute('aria-label', status.ariaLabel);
    }
    if (prepMusicLabel) prepMusicLabel.textContent = status.shortLabel;

    const sliderPct = muted ? 0 : Math.round(musicVolume * 100);
    if (prepMusicSlider && document.activeElement !== prepMusicSlider) {
      prepMusicSlider.value = String(sliderPct);
    }
    if (prepMusicVolReadout) {
      prepMusicVolReadout.textContent = `${sliderPct}%`;
    }
    if (mobileMusicLabel) {
      mobileMusicLabel.textContent = muted
        ? 'Muted'
        : playing
        ? `Playing (${sliderPct}%)`
        : `Ready (${sliderPct}%)`;
    }
  }

  function startMusicGentle({ fade = true } = {}) {
    if (!bgAudio || userMutedMusic || musicVolume <= 0) {
      syncMusicUI();
      return Promise.resolve(false);
    }
    clearMusicFade();
    bgAudio.muted = false;
    const target = clampMusicVolume(musicVolume);

    if (!fade || prefersReducedMotion?.matches) {
      bgAudio.volume = target;
    } else if (bgAudio.paused) {
      bgAudio.volume = Math.min(0.02, target);
    }

    const playPromise = bgAudio.play();
    if (playPromise && typeof playPromise.then === 'function') {
      return playPromise
        .then(() => {
          if (fade && !prefersReducedMotion?.matches && bgAudio.volume < target) {
            const step = Math.max(0.008, (target - bgAudio.volume) / 12);
            musicFadeInterval = setInterval(() => {
              if (!bgAudio || bgAudio.paused || userMutedMusic) {
                clearMusicFade();
                return;
              }
              const next = Math.min(target, bgAudio.volume + step);
              bgAudio.volume = Number(next.toFixed(3));
              if (next >= target) {
                clearMusicFade();
              }
            }, 65);
          } else {
            bgAudio.volume = target;
          }
          syncMusicUI();
          return true;
        })
        .catch(() => {
          syncMusicUI();
          return false;
        });
    }
    bgAudio.volume = target;
    syncMusicUI();
    return Promise.resolve(true);
  }

  function pauseAndMuteMusic() {
    clearMusicFade();
    userMutedMusic = true;
    try {
      localStorage.setItem(MUSIC_MUTE_KEY, 'true');
    } catch (e) {}
    if (bgAudio) {
      bgAudio.pause();
    }
    syncMusicUI();
  }

  function toggleBackgroundMusic() {
    if (isMusicPlaying() && !userMutedMusic) {
      pauseAndMuteMusic();
      return;
    }
    userMutedMusic = false;
    if (musicVolume <= 0) {
      musicVolume = PRESENTATION_META.backgroundMusic.defaultVolume;
    }
    try {
      localStorage.setItem(MUSIC_MUTE_KEY, 'false');
      localStorage.setItem(MUSIC_VOL_KEY, String(musicVolume));
    } catch (e) {}
    startMusicGentle({ fade: true });
  }

  function setMusicVolumeFromPercent(pctValue) {
    const normalized = clampMusicVolume(Number(pctValue) / 100);
    clearMusicFade();
    musicVolume = normalized;
    if (normalized === 0) {
      userMutedMusic = true;
      if (bgAudio) bgAudio.pause();
    } else {
      userMutedMusic = false;
      if (bgAudio) {
        bgAudio.muted = false;
        bgAudio.volume = normalized;
        if (bgAudio.paused) {
          bgAudio.play()?.catch(() => {});
        }
      }
    }
    try {
      localStorage.setItem(MUSIC_VOL_KEY, String(musicVolume));
      localStorage.setItem(MUSIC_MUTE_KEY, String(userMutedMusic));
    } catch (e) {}
    syncMusicUI();
  }

  if (bgAudio) {
    bgAudio.volume = clampMusicVolume(musicVolume);
    bgAudio.addEventListener('play', syncMusicUI);
    bgAudio.addEventListener('pause', syncMusicUI);
    bgAudio.addEventListener('volumechange', syncMusicUI);
  }

  [curtainMusicBtn, floatingMusicBtn, prepMusicToggle].forEach((btn) => {
    btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleBackgroundMusic();
    });
  });

  mobileMusicBtn?.addEventListener('click', () => {
    toggleBackgroundMusic();
  });

  prepMusicSlider?.addEventListener('input', (e) => {
    setMusicVolumeFromPercent(e.target.value);
  });

  syncMusicUI();

  // Attempt soft background playback on load if not muted; otherwise start on first user gesture
  if (!userMutedMusic) {
    startMusicGentle({ fade: true }).then((started) => {
      if (!started) {
        const resumeOnFirstGesture = (ev) => {
          // If the user clicked a music mute/toggle button directly, its own click handler manages state
          const targetEl = ev.target instanceof Element ? ev.target : null;
          if (
            targetEl?.closest('#curtain-music-btn, #floating-music-btn, #prep-music-toggle, #mobile-music-toggle')
          ) {
            return;
          }
          if (!userMutedMusic && !isMusicPlaying()) {
            startMusicGentle({ fade: true });
          }
        };
        document.addEventListener('pointerdown', resumeOnFirstGesture, { once: true, passive: true });
      }
    });
  }

  // =========================================================================
  // 2B. Opening Event Poster & Franco-Brazilian Flag Mix Stage (#podium-curtain)
  // =========================================================================
  const podiumCurtain = $('#podium-curtain');
  const curtainStartBtn = $('#curtain-start-btn');
  const curtainBrowseBtn = $('#curtain-browse-btn');
  const curtainScriptBtn = $('#curtain-script-btn');
  const drawCurtainBtn = $('#draw-curtain-btn');
  const mobileCurtainBtn = $('#mobile-curtain-toggle');
  let curtainOpen = true;
  let curtainTransitionTimer = null;

  function isCurtainVisible() {
    return Boolean(podiumCurtain && !podiumCurtain.hidden && curtainOpen);
  }

  function dismissPodiumCurtain({ enterPresent = false, targetSlide = 1 } = {}) {
    if (!podiumCurtain) return;
    curtainOpen = false;
    document.documentElement.setAttribute('data-curtain-bypassed', 'true');

    if (!userMutedMusic && !isMusicPlaying()) {
      startMusicGentle({ fade: true });
    }

    if (enterPresent) {
      goToSlide(targetSlide, false);
      setPresentingState(true);
      document.documentElement.requestFullscreen?.().catch(() => {});
    }

    if (prefersReducedMotion?.matches) {
      podiumCurtain.classList.remove('is-parting');
      podiumCurtain.hidden = true;
      return;
    }

    podiumCurtain.classList.add('is-parting');
    animateSlideFrameEntrance(targetSlide, 1);
    if (curtainTransitionTimer) clearTimeout(curtainTransitionTimer);
    curtainTransitionTimer = setTimeout(() => {
      podiumCurtain.hidden = true;
      podiumCurtain.classList.remove('is-parting');
    }, 580);
  }

  function drawPodiumCurtain() {
    if (!podiumCurtain) return;
    closePrepPopover();
    if (document.body.classList.contains('is-presenting')) {
      exitFullscreenPresentation();
    }
    if (curtainTransitionTimer) clearTimeout(curtainTransitionTimer);
    curtainOpen = true;
    document.documentElement.removeAttribute('data-curtain-bypassed');
    podiumCurtain.hidden = false;
    void podiumCurtain.offsetWidth;
    podiumCurtain.classList.remove('is-parting');
    curtainStartBtn?.focus({ preventScroll: true });
  }

  if (
    document.documentElement.getAttribute('data-curtain-bypassed') === 'true' ||
    shouldBypassOpeningPoster(window.location.search, window.location.hash)
  ) {
    curtainOpen = false;
    document.documentElement.setAttribute('data-curtain-bypassed', 'true');
    if (podiumCurtain) podiumCurtain.hidden = true;
  }

  curtainStartBtn?.addEventListener('click', () => {
    dismissPodiumCurtain({ enterPresent: true, targetSlide: 1 });
  });

  curtainBrowseBtn?.addEventListener('click', () => {
    dismissPodiumCurtain({ enterPresent: false });
  });

  curtainScriptBtn?.addEventListener('click', () => {
    dismissPodiumCurtain({ enterPresent: false });
    openLecternScriptDialog(1);
  });

  drawCurtainBtn?.addEventListener('click', drawPodiumCurtain);
  mobileCurtainBtn?.addEventListener('click', () => {
    closeMobileMenu();
    drawPodiumCurtain();
  });

  // =========================================================================
  // 3. Backstage "Prep ▾" Popover & Mobile Slide Menu
  // =========================================================================
  const prepMenuWrap = $('#prep-menu-wrap');
  const prepToggleBtn = $('#prep-menu-toggle');
  const prepPopover = $('#prep-popover');

  function setPrepPopoverOpen(open) {
    if (!prepToggleBtn || !prepPopover) return;
    prepPopover.hidden = !open;
    prepToggleBtn.setAttribute('aria-expanded', String(open));
  }

  function closePrepPopover() {
    setPrepPopoverOpen(false);
  }

  prepToggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const shouldOpen = prepPopover ? prepPopover.hidden : false;
    setPrepPopoverOpen(shouldOpen);
  });

  document.addEventListener('click', (e) => {
    if (prepPopover && !prepPopover.hidden && prepMenuWrap && !prepMenuWrap.contains(e.target)) {
      closePrepPopover();
    }
  });

  // Close popover when launching dialogs/drawers inside it
  [
    '#sync-audience-btn',
    '#meridian-3d-button',
    '#studio-button',
    '#revisions-button',
    '#print-button',
    '#prep-print-script-direct-btn'
  ].forEach((sel) => {
    $(sel)?.addEventListener('click', () => closePrepPopover());
  });

  const contentsBtn = $('#contents-toggle');
  const contentsMenu = $('#mobile-contents');

  function closeMobileMenu() {
    if (!contentsBtn || !contentsMenu) return;
    contentsMenu.hidden = true;
    contentsBtn.setAttribute('aria-expanded', 'false');
  }

  if (contentsBtn && contentsMenu) {
    contentsBtn.addEventListener('click', () => {
      const open = contentsMenu.hidden;
      contentsMenu.hidden = !open;
      contentsBtn.setAttribute('aria-expanded', String(open));
    });
    $$('a', contentsMenu).forEach((a) => a.addEventListener('click', closeMobileMenu));
  }

  // =========================================================================
  // 4. Full-Artwork Lightbox Dialog
  // =========================================================================
  const dialog = $('#image-dialog');
  const dialogImg = $('#dialog-image');
  const dialogCaption = $('#dialog-caption');
  const dialogClose = $('#dialog-close');

  $$('[data-image]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!dialog || !dialogImg || !dialogCaption) return;
      dialogImg.src = btn.dataset.image;
      dialogImg.alt = btn.dataset.alt || '';
      dialogCaption.textContent = btn.dataset.caption || '';
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    });
  });

  const closeDialog = () => {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  };

  dialogClose?.addEventListener('click', closeDialog);
  dialog?.addEventListener('click', (e) => {
    if (e.target === dialog) closeDialog();
  });

  // =========================================================================
  // 5. Orbital Power Constellation Controller
  // =========================================================================
  const constellationDial = $('#constellation-dial');
  const constellationToggle = $('#constellation-toggle');
  const constSlideTag = $('#constellation-slide-tag');
  const constLabelText = $('#constellation-label-text');
  const constNodeLeg = $('#const-node-leg');
  const constNodeExec = $('#const-node-exec');
  const constNodeJud = $('#const-node-jud');
  const constNodeDom = $('#const-node-dom');
  const constLineLE = $('#const-line-le');
  const constLineEJ = $('#const-line-ej');
  const constLineJL = $('#const-line-jl');
  const constLineDom = $('#const-line-dom');

  function setSvgPoint(circleEl, point) {
    if (!circleEl || !Array.isArray(point) || point.length < 2) return;
    circleEl.setAttribute('cx', String(point[0]));
    circleEl.setAttribute('cy', String(point[1]));
  }

  function setSvgLine(lineEl, p1, p2) {
    if (!lineEl || !Array.isArray(p1) || p1.length < 2 || !Array.isArray(p2) || p2.length < 2) {
      return;
    }
    lineEl.setAttribute('x1', String(p1[0]));
    lineEl.setAttribute('y1', String(p1[1]));
    lineEl.setAttribute('x2', String(p2[0]));
    lineEl.setAttribute('y2', String(p2[1]));
  }

  function updateConstellationForSlide(num) {
    if (!constellationDial) return;
    const { mode, caption, leg, exec, jud, dom } = getConstellationCoordinates(num);

    constellationDial.setAttribute('data-constellation-mode', mode);
    if (constSlideTag) {
      constSlideTag.textContent = `${String(num).padStart(2, '0')} · POWER ORBIT`;
    }
    if (constLabelText) {
      constLabelText.textContent = caption;
    }

    setSvgPoint(constNodeLeg, leg);
    setSvgPoint(constNodeExec, exec);
    setSvgPoint(constNodeJud, jud);
    setSvgPoint(constNodeDom, dom);

    setSvgLine(constLineLE, leg, exec);
    setSvgLine(constLineEJ, exec, jud);
    setSvgLine(constLineJL, jud, leg);
    setSvgLine(constLineDom, jud, dom);
  }

  constellationToggle?.addEventListener('click', () => {
    const expanded = constellationToggle.getAttribute('aria-expanded') === 'true';
    constellationToggle.setAttribute('aria-expanded', String(!expanded));
    constellationDial?.classList.toggle('is-expanded', !expanded);
  });

  // =========================================================================
  // 6. Interactive Power-Distribution & Equilibrium Callouts (Slides 02–07)
  // =========================================================================
  function emitPresenterStateChanged() {
    window.dispatchEvent(
      new CustomEvent('dauchy:presenter-state-changed', {
        detail: {
          currentSlide: currentSlideNum,
          activeCallout: getCurrentCallout()
        }
      })
    );
  }

  // Slide 02: Who Was Montesquieu (Court / Spirit of the Laws / Security Under Laws)
  const s2Bridge = $('#s2-equilibrium-bridge');
  const s2PoleBtns = $$('[data-eq-pole]');
  const s2SelectRows = $$('[data-eq-select]');
  const s2PolePanels = $$('[data-pole-panel]');

  function setSlide2Pole(pole, { fromRemoteSync = false } = {}) {
    const nextPole =
      pole === 'court' || pole === 'spirit' || pole === 'liberty' ? pole : 'balanced';
    activeSlideCallouts[2] = nextPole === 'balanced' ? '' : nextPole;
    if (s2Bridge) {
      s2Bridge.setAttribute('data-active-pole', nextPole);
    }
    s2PoleBtns.forEach((btn) => {
      const active = btn.dataset.eqPole === nextPole;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    s2PolePanels.forEach((panel) => {
      panel.classList.toggle('is-highlighted', panel.dataset.polePanel === nextPole);
    });
    if (!fromRemoteSync) emitPresenterStateChanged();
  }

  s2PoleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const pole = btn.dataset.eqPole;
      const current = s2Bridge?.getAttribute('data-active-pole') || 'balanced';
      setSlide2Pole(current === pole ? 'balanced' : pole);
    });
  });

  s2SelectRows.forEach((row) => {
    const pole = row.dataset.eqSelect;
    const toggle = () => {
      const current = s2Bridge?.getAttribute('data-active-pole') || 'balanced';
      setSlide2Pole(current === pole ? 'balanced' : pole);
    };
    row.addEventListener('click', toggle);
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });

  // Slide 03: Book XI, Chapter 6 — Legislative, Executive & Judicial Functions
  const s3ScaleBar = $('#s3-functions-scale');
  const s3FnCards = $$('[data-s3-fn]');
  const s3StepMap = {
    legislative: 'imposed',
    executive: 'deliberate',
    judicial: 'overlapping'
  };

  function setSlide3Function(fnId, { fromRemoteSync = false } = {}) {
    if (fnId !== 'legislative' && fnId !== 'executive' && fnId !== 'judicial') return;
    activeSlideCallouts[3] = fnId;
    if (s3ScaleBar) {
      s3ScaleBar.setAttribute('data-step', s3StepMap[fnId] || 'deliberate');
    }
    s3FnCards.forEach((card) => {
      card.classList.toggle('is-active', card.dataset.s3Fn === fnId);
    });
    if (!fromRemoteSync) emitPresenterStateChanged();
  }

  s3FnCards.forEach((card) => {
    const fnId = card.dataset.s3Fn;
    card.addEventListener('click', () => setSlide3Function(fnId));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setSlide3Function(fnId);
      }
    });
  });

  // Slide 04: Montesquieu in Brazil, 1824 — Tripartite Three Powers vs. 1824 Art. 10 Four Powers
  const s4OrbitBox = $('#s4-powers-orbit');
  const s4ModeBtns = $$('[data-powers-mode]');

  function setSlide4PowersMode(mode, { fromRemoteSync = false } = {}) {
    const nextMode = mode === 'three-powers' ? 'three-powers' : 'four-powers';
    activeSlideCallouts[4] = nextMode;
    if (s4OrbitBox) {
      s4OrbitBox.setAttribute('data-mode', nextMode);
    }
    s4ModeBtns.forEach((btn) => {
      const active = btn.dataset.powersMode === nextMode;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    if (!fromRemoteSync) emitPresenterStateChanged();
  }

  s4ModeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      setSlide4PowersMode(btn.dataset.powersMode);
    });
  });

  // Slide 05: Representing Distinct and Related Institutions (Figueiredo, 1896 / Oath of 1891)
  const s5ArtworkBox = $('#s5-artwork-box');
  const s5SpotItems = $$('[data-spot-select]');

  function setSlide5OathSpotlight(spotId, { fromRemoteSync = false } = {}) {
    const valid =
      spotId === 'deodoro' || spotId === 'prudente' || spotId === 'gallery' ? spotId : '';
    activeSlideCallouts[5] = valid;
    if (s5ArtworkBox) {
      s5ArtworkBox.setAttribute('data-active-spot', valid);
    }
    s5SpotItems.forEach((item) => {
      item.classList.toggle('is-active', item.dataset.spotSelect === valid);
    });
    if (!fromRemoteSync) emitPresenterStateChanged();
  }

  s5SpotItems.forEach((item) => {
    const id = item.dataset.spotSelect;
    const toggle = () => {
      setSlide5OathSpotlight(activeSlideCallouts[5] === id ? '' : id);
    };
    item.addEventListener('click', toggle);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });

  // Slide 06: Ceschiatti’s Justice (1961, STF) — Sword Focus & Praça dos Três Poderes Triad
  const swordBtn = $('#toggle-sword-focus');
  const s6PhotoBox = $('#s6-photo-box');
  const pracaNodeBtns = $$('[data-praca-node]');
  const pracaCaptionEl = $('#s6-triad-caption');
  const PRACA_NOTES = {
    stf: 'Positioned before the Supreme Federal Court, identifying the figure of Justice with a particular judicial institution.',
    congress: 'Shares the Praça dos Três Poderes with the National Congress—distinct legislative and judicial buildings in a common civic space.',
    planalto: 'Shares the Praça dos Três Poderes with the presidential palace—visualising distinct powers within a shared republican setting.'
  };

  function setSlide6JusticaState(callout, { fromRemoteSync = false } = {}) {
    const val = String(callout || '');
    if (val === 'sword-detail' || val === 'whole') {
      const swordFocused = val === 'sword-detail';
      activeSlideCallouts[6] = swordFocused ? 'sword-detail' : 'whole';
      if (s6PhotoBox) {
        s6PhotoBox.classList.toggle('is-sword-focused', swordFocused);
      }
      if (swordBtn) {
        swordBtn.classList.toggle('is-active', swordFocused);
        swordBtn.setAttribute('aria-pressed', String(swordFocused));
        swordBtn.textContent = swordFocused ? 'Show whole sculpture' : 'Detail: Sword on lap';
      }
    } else if (val === 'stf' || val === 'congress' || val === 'planalto') {
      activeSlideCallouts[6] = val;
      pracaNodeBtns.forEach((btn) => {
        const active = btn.dataset.pracaNode === val;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
      if (pracaCaptionEl && !document.body.classList.contains('is-editing')) {
        pracaCaptionEl.textContent = PRACA_NOTES[val];
      }
    }
    if (!fromRemoteSync) emitPresenterStateChanged();
  }

  swordBtn?.addEventListener('click', () => {
    const next = !s6PhotoBox?.classList.contains('is-sword-focused');
    setSlide6JusticaState(next ? 'sword-detail' : 'whole');
  });

  pracaNodeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      setSlide6JusticaState(btn.dataset.pracaNode);
    });
  });

  // Slide 07: Questions for Serge Spotlights (Q1 / Q2)
  const s7Questions = $$('[data-q-spot]');

  function setSlide7QuestionSpot(qId, { fromRemoteSync = false } = {}) {
    if (qId !== 'q1' && qId !== 'q2') return;
    activeSlideCallouts[7] = qId;
    s7Questions.forEach((q) => {
      q.classList.toggle('is-active', q.dataset.qSpot === qId);
    });
    if (!fromRemoteSync) emitPresenterStateChanged();
  }

  s7Questions.forEach((q) => {
    const qId = q.dataset.qSpot;
    q.addEventListener('click', () => setSlide7QuestionSpot(qId));
    q.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setSlide7QuestionSpot(qId);
      }
    });
  });

  // =========================================================================
  // 7. 5-Second Visual Pause Aura (Slide 05 — Figueiredo’s Compromisso Constitucional)
  // =========================================================================
  const pauseButtons = $$('[data-visual-pause]');

  function stopVisualPause({ fromRemoteSync = false } = {}) {
    if (visualPauseTimer) {
      clearTimeout(visualPauseTimer);
      visualPauseTimer = null;
    }
    const prevSlide = visualPauseSlide;
    visualPauseSlide = 0;

    const sec = $('#slide-5');
    const badge = $('#s5-pause-badge');
    sec?.removeAttribute('data-visual-pause-active');
    if (badge) {
      badge.hidden = true;
      badge.classList.remove('is-counting');
    }
    pauseButtons.forEach((b) => b.classList.remove('is-active'));

    if (prevSlide && !fromRemoteSync) {
      emitPresenterStateChanged();
    }
  }

  function startVisualPause(slideNum, { fromRemoteSync = false } = {}) {
    const targetNum = Number(slideNum);
    if (targetNum !== 5) return;

    if (visualPauseSlide === targetNum) {
      stopVisualPause({ fromRemoteSync });
      return;
    }

    stopVisualPause({ fromRemoteSync: true });
    visualPauseSlide = targetNum;

    const sec = $(`#slide-${targetNum}`);
    const badge = $(`#s${targetNum}-pause-badge`);
    sec?.setAttribute('data-visual-pause-active', 'true');
    if (badge) {
      badge.hidden = false;
      badge.classList.remove('is-counting');
      void badge.offsetWidth;
      badge.classList.add('is-counting');
    }
    pauseButtons.forEach((b) => {
      b.classList.toggle('is-active', Number(b.dataset.visualPause) === targetNum);
    });

    if (!fromRemoteSync) {
      emitPresenterStateChanged();
    }

    visualPauseTimer = setTimeout(() => {
      stopVisualPause({ fromRemoteSync });
    }, 5000);
  }

  pauseButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      startVisualPause(Number(btn.dataset.visualPause));
    });
  });

  // =========================================================================
  // 7B. Slide-Specific Unobtrusive Presenter Tips (Top-Right of Slides 01–07)
  // =========================================================================
  const presenterTipWraps = $$('[data-presenter-tip-slide]');
  const prepTipToggleBtn = $('#prep-tip-toggle');
  let presenterTipState = { activeSlide: null, mode: 'closed' };
  const tipHoverTimers = new Map();

  function clearTipHoverTimer(slideNum) {
    const t = tipHoverTimers.get(slideNum);
    if (t) {
      clearTimeout(t);
      tipHoverTimers.delete(slideNum);
    }
  }

  function renderPresenterTipPanelContent(slideNum, panelEl) {
    if (!panelEl) return;
    const tip = getPresenterTipForSlide(slideNum);
    panelEl.textContent = '';

    const head = document.createElement('div');
    head.className = 'presenter-tip__head';

    const titleWrap = document.createElement('div');
    const kicker = document.createElement('p');
    kicker.className = 'presenter-tip__kicker t-meta';
    kicker.textContent = tip.kicker;

    const heading = document.createElement('h3');
    heading.className = 'presenter-tip__heading t-display-serif';
    heading.textContent = tip.heading;

    titleWrap.appendChild(kicker);
    titleWrap.appendChild(heading);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'presenter-tip__close t-ui';
    closeBtn.setAttribute(
      'aria-label',
      `Close Presenter Tip for Slide ${String(slideNum).padStart(2, '0')}`
    );
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      applyPresenterTipAction({ type: 'close' }, { restoreFocusSlide: slideNum });
    });

    head.appendChild(titleWrap);
    head.appendChild(closeBtn);
    panelEl.appendChild(head);

    const list = document.createElement('ul');
    list.className = 'presenter-tip__list';

    tip.cues.forEach((cue) => {
      const li = document.createElement('li');
      li.className = 'presenter-tip__item';

      const lbl = document.createElement('span');
      lbl.className = 'presenter-tip__cue-label t-meta';
      lbl.textContent = cue.label;

      const txt = document.createElement('p');
      txt.className = 'presenter-tip__cue-text';
      txt.textContent = cue.text;

      li.appendChild(lbl);
      li.appendChild(txt);

      if (cue.isPauseCue && tip.pauseActionSlide) {
        const pauseTrigger = document.createElement('button');
        pauseTrigger.type = 'button';
        pauseTrigger.className = 'presenter-tip__pause-btn t-ui';
        pauseTrigger.textContent = '◎ Start 5s Visual Pause';
        pauseTrigger.addEventListener('click', (ev) => {
          ev.stopPropagation();
          applyPresenterTipAction({ type: 'close' });
          startVisualPause(tip.pauseActionSlide);
        });
        li.appendChild(pauseTrigger);
      }

      list.appendChild(li);
    });

    panelEl.appendChild(list);

    if (tip.guardrail) {
      const guard = document.createElement('p');
      guard.className = 'presenter-tip__guardrail';
      guard.textContent = tip.guardrail;
      panelEl.appendChild(guard);
    }

    const scriptLinkRow = document.createElement('div');
    scriptLinkRow.className = 'presenter-tip__footer-row';
    const scriptLinkBtn = document.createElement('button');
    scriptLinkBtn.type = 'button';
    scriptLinkBtn.className = 'presenter-tip__pause-btn t-ui';
    scriptLinkBtn.textContent = `📄 Read Page ${slideNum} in Lectern Script (L)`;
    scriptLinkBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      applyPresenterTipAction({ type: 'close' });
      openLecternScriptDialog(slideNum);
    });
    scriptLinkRow.appendChild(scriptLinkBtn);
    panelEl.appendChild(scriptLinkRow);
  }

  function syncPresenterTipDOM({ restoreFocusSlide = null } = {}) {
    presenterTipWraps.forEach((wrap) => {
      const num = Number(wrap.dataset.presenterTipSlide);
      const isOpen = presenterTipState.activeSlide === num && presenterTipState.mode !== 'closed';
      const mode = isOpen ? presenterTipState.mode : 'closed';
      wrap.setAttribute('data-tip-mode', mode);

      const btn = $('.presenter-tip__btn', wrap);
      const panel = $('.presenter-tip__panel', wrap);
      if (btn) {
        btn.setAttribute('aria-expanded', String(isOpen));
      }
      if (panel) {
        panel.hidden = !isOpen;
      }
      if (restoreFocusSlide === num && btn) {
        btn.focus({ preventScroll: true });
      }
    });
  }

  function applyPresenterTipAction(action, options = {}) {
    presenterTipState = resolvePresenterTipState(presenterTipState, action);
    syncPresenterTipDOM(options);
  }

  presenterTipWraps.forEach((wrap) => {
    const num = Number(wrap.dataset.presenterTipSlide);
    const btn = $('.presenter-tip__btn', wrap);
    const panel = $('.presenter-tip__panel', wrap);
    renderPresenterTipPanelContent(num, panel);

    wrap.addEventListener('pointerenter', (ev) => {
      if (ev.pointerType && ev.pointerType !== 'mouse' && ev.pointerType !== 'pen') return;
      clearTipHoverTimer(num);
      applyPresenterTipAction({ type: 'hover-enter', slide: num });
    });

    wrap.addEventListener('pointerleave', (ev) => {
      if (ev.pointerType && ev.pointerType !== 'mouse' && ev.pointerType !== 'pen') return;
      clearTipHoverTimer(num);
      const timer = setTimeout(() => {
        tipHoverTimers.delete(num);
        applyPresenterTipAction({ type: 'hover-leave', slide: num });
      }, 150);
      tipHoverTimers.set(num, timer);
    });

    btn?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      clearTipHoverTimer(num);
      applyPresenterTipAction({ type: 'click-toggle', slide: num });
    });
  });

  prepTipToggleBtn?.addEventListener('click', (ev) => {
    ev.stopPropagation();
    closePrepPopover();
    applyPresenterTipAction(
      { type: 'pin-open', slide: currentSlideNum },
      { restoreFocusSlide: currentSlideNum }
    );
  });

  document.addEventListener('click', (ev) => {
    if (presenterTipState.mode === 'closed') return;
    const targetEl = ev.target instanceof Element ? ev.target : null;
    if (!targetEl?.closest('[data-presenter-tip-slide], #prep-tip-toggle')) {
      applyPresenterTipAction({ type: 'close' });
    }
  });

  // =========================================================================
  // 7C. 7-Page Revised Lectern Script Reader & Dedicated A4 Print Mode
  // =========================================================================
  const lecternDialog = $('#lectern-script-dialog');
  const lecternCloseBtn = $('#lectern-script-close');
  const lecternPagesContainer = $('#lectern-script-pages');
  const printLecternContainer = $('#print-lectern-script');
  const printScriptOnlyBtn = $('#print-script-only-btn');
  const prepPrintScriptDirectBtn = $('#prep-print-script-direct-btn');
  const headerScriptBtn = $('#header-script-btn');
  const prepScriptBtn = $('#prep-script-btn');
  const mobileScriptBtn = $('#mobile-script-toggle');
  const footerScriptOpenBtn = $('#footer-script-open-btn');
  const footerScriptPrintBtn = $('#footer-script-print-btn');
  const scriptFontBtns = $$('[data-script-font]');

  function buildLecternPageElement(pageData, { forPrint = false } = {}) {
    const pageEl = document.createElement('article');
    pageEl.className = forPrint ? 'print-lectern-page' : 'lectern-page-card';
    pageEl.dataset.scriptPage = String(pageData.page);

    const runningHead = document.createElement('header');
    runningHead.className = 'lectern-page__running-head t-meta';
    runningHead.textContent = 'MONTESQUIEU • LECTERN SCRIPT • ANA VITÓRIA VANZIN MENDES';
    pageEl.appendChild(runningHead);

    const titleRow = document.createElement('div');
    titleRow.className = 'lectern-page__title-row';

    const h3 = document.createElement('h3');
    h3.className = 'lectern-page__heading t-display-serif';
    h3.textContent = pageData.heading;
    titleRow.appendChild(h3);

    if (!forPrint) {
      const jumpBtn = document.createElement('button');
      jumpBtn.type = 'button';
      jumpBtn.className = 'text-link-sm';
      jumpBtn.textContent = `Go to Slide 0${pageData.slideNumber} →`;
      jumpBtn.addEventListener('click', () => {
        closeLecternScriptDialog();
        goToSlide(pageData.slideNumber);
      });
      titleRow.appendChild(jumpBtn);
    }

    pageEl.appendChild(titleRow);

    const metaLine = document.createElement('p');
    metaLine.className = 'lectern-page__meta t-meta';
    metaLine.textContent = pageData.stageLabel
      ? `${pageData.elapsedRange}  |  ${pageData.stageLabel}`
      : pageData.elapsedRange;
    pageEl.appendChild(metaLine);

    if (pageData.instruction) {
      const instr = document.createElement('p');
      instr.className = 'lectern-page__instruction';
      instr.textContent = pageData.instruction;
      pageEl.appendChild(instr);
    }

    const rule = document.createElement('hr');
    rule.className = 'lectern-page__rule';
    pageEl.appendChild(rule);

    const body = document.createElement('div');
    body.className = 'lectern-page__prose';
    pageData.paragraphs.forEach((p) => {
      const para = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = p.leadIn;
      para.appendChild(strong);
      if (p.rest) {
        para.appendChild(document.createTextNode(` ${p.rest}`));
      }
      body.appendChild(para);
    });
    pageEl.appendChild(body);

    if (pageData.stageCue) {
      const cue = document.createElement('p');
      cue.className = 'lectern-page__cue';
      cue.textContent = pageData.stageCue;
      pageEl.appendChild(cue);
    }

    const foot = document.createElement('footer');
    foot.className = 'lectern-page__footer t-meta';
    foot.textContent = `PAGE ${pageData.page}`;
    pageEl.appendChild(foot);

    return pageEl;
  }

  function populateLecternScriptViews() {
    const pages = getLecternScriptPages();
    if (lecternPagesContainer) {
      lecternPagesContainer.textContent = '';
      pages.forEach((p) => {
        lecternPagesContainer.appendChild(buildLecternPageElement(p, { forPrint: false }));
      });
    }
    if (printLecternContainer) {
      printLecternContainer.textContent = '';
      pages.forEach((p) => {
        printLecternContainer.appendChild(buildLecternPageElement(p, { forPrint: true }));
      });
    }
  }

  populateLecternScriptViews();

  function highlightActiveLecternPage(slideNum) {
    if (!lecternPagesContainer) return;
    $$('.lectern-page-card', lecternPagesContainer).forEach((card) => {
      card.classList.toggle('is-current-slide', Number(card.dataset.scriptPage) === slideNum);
    });
  }

  function openLecternScriptDialog(targetPage = currentSlideNum) {
    if (!lecternDialog) return;
    closePrepPopover();
    closeMobileMenu();
    highlightActiveLecternPage(targetPage);
    if (!lecternDialog.open) {
      if (typeof lecternDialog.showModal === 'function') {
        lecternDialog.showModal();
      } else {
        lecternDialog.setAttribute('open', '');
      }
    }
    const targetCard = $(`[data-script-page="${targetPage}"]`, lecternPagesContainer);
    targetCard?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }

  function closeLecternScriptDialog() {
    if (!lecternDialog) return;
    if (typeof lecternDialog.close === 'function') lecternDialog.close();
    else lecternDialog.removeAttribute('open');
  }

  function printLecternScript() {
    if (!printLecternContainer) return;
    if (lecternDialog?.open) {
      closeLecternScriptDialog();
    }
    document.body.classList.add('is-printing-script');
    printLecternContainer.hidden = false;
    printLecternContainer.removeAttribute('aria-hidden');

    const cleanup = () => {
      document.body.classList.remove('is-printing-script');
      printLecternContainer.hidden = true;
      printLecternContainer.setAttribute('aria-hidden', 'true');
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);
    window.print();
    setTimeout(cleanup, 1200);
  }

  headerScriptBtn?.addEventListener('click', () => openLecternScriptDialog(currentSlideNum));
  prepScriptBtn?.addEventListener('click', () => openLecternScriptDialog(currentSlideNum));
  mobileScriptBtn?.addEventListener('click', () => openLecternScriptDialog(currentSlideNum));
  footerScriptOpenBtn?.addEventListener('click', () => openLecternScriptDialog(1));
  lecternCloseBtn?.addEventListener('click', closeLecternScriptDialog);
  lecternDialog?.addEventListener('click', (e) => {
    if (e.target === lecternDialog) closeLecternScriptDialog();
  });

  printScriptOnlyBtn?.addEventListener('click', printLecternScript);
  prepPrintScriptDirectBtn?.addEventListener('click', printLecternScript);
  footerScriptPrintBtn?.addEventListener('click', printLecternScript);

  scriptFontBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const size = btn.dataset.scriptFont === 'large' ? 'large' : 'standard';
      lecternDialog?.setAttribute('data-script-size', size);
      scriptFontBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
    });
  });

  if (
    /(?:^\?|&)script=1(?:&|$)/.test(window.location.search) ||
    window.location.hash === '#lectern-script'
  ) {
    requestAnimationFrame(() => openLecternScriptDialog(1));
  }

  function getCurrentCallout() {
    if (visualPauseSlide === currentSlideNum && currentSlideNum === 5) {
      return 'pause-5s';
    }
    return activeSlideCallouts[currentSlideNum] || '';
  }

  function applySlideCallout(slideNum, calloutId, { fromRemoteSync = true } = {}) {
    const num = Number(slideNum);
    const id = String(calloutId || '');

    if (id === 'pause-5s' && num === 5) {
      startVisualPause(num, { fromRemoteSync });
      return;
    }
    if (visualPauseSlide === num && id !== 'pause-5s') {
      stopVisualPause({ fromRemoteSync: true });
    }

    if (num === 2) {
      setSlide2Pole(id, { fromRemoteSync });
    } else if (num === 3) {
      setSlide3Function(id, { fromRemoteSync });
    } else if (num === 4 && (id === 'three-powers' || id === 'four-powers')) {
      setSlide4PowersMode(id, { fromRemoteSync });
    } else if (num === 5) {
      setSlide5OathSpotlight(id, { fromRemoteSync });
    } else if (num === 6) {
      setSlide6JusticaState(id, { fromRemoteSync });
    } else if (num === 7) {
      setSlide7QuestionSpot(id, { fromRemoteSync });
    }
  }

  // =========================================================================
  // 8. Gentle Archival Pointer Parallax on Slide 01
  // =========================================================================
  const slide1El = $('#slide-1');
  if (slide1El && !prefersReducedMotion?.matches) {
    let rafPending = false;
    let targetPx = 0;
    let targetPy = 0;

    slide1El.addEventListener(
      'pointermove',
      (e) => {
        if (prefersReducedMotion?.matches) return;
        const rect = slide1El.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
        const ny = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
        targetPx = Math.round(nx * 12 * 10) / 10;
        targetPy = Math.round(ny * 10 * 10) / 10;
        if (!rafPending) {
          rafPending = true;
          requestAnimationFrame(() => {
            rafPending = false;
            slide1El.style.setProperty('--px', `${targetPx}px`);
            slide1El.style.setProperty('--py', `${targetPy}px`);
          });
        }
      },
      { passive: true }
    );

    slide1El.addEventListener('pointerleave', () => {
      slide1El.style.setProperty('--px', '0px');
      slide1El.style.setProperty('--py', '0px');
    });
  }

  // =========================================================================
  // 9. Slide Stepper, Navigation & Scroll Synchronization
  // =========================================================================
  const headerEl = $('.header');
  function syncHeaderOffset() {
    const isPresenting = document.body.classList.contains('is-presenting');
    const h = !isPresenting && headerEl ? Math.ceil(headerEl.getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty('--header-offset', `${h}px`);
    return h;
  }
  syncHeaderOffset();
  window.addEventListener('resize', syncHeaderOffset, { passive: true });

  const slideSections = $$('[data-slide]');
  const navLinks = $$('[data-slide-link]');
  const slideIndicator = $('#slide-indicator');
  const prevBtn = $('#prev-slide');
  const nextBtn = $('#next-slide');
  const progressBar = $('#reading-progress-bar');

  const bgs = {
    storm: $('.bg--storm'),
    palace: $('.bg--palace'),
    lake: $('.bg--lake'),
    nightsea: $('.bg--nightsea')
  };

  let suppressScrollEmitUntil = 0;

  // GSAP + ScrollTrigger engine for subtle cross-fade & directional slide-in transitions
  const gsapApi = typeof window !== 'undefined' ? window.gsap || null : null;
  const scrollTriggerApi = typeof window !== 'undefined' ? window.ScrollTrigger || null : null;
  if (gsapApi && scrollTriggerApi) {
    try {
      gsapApi.registerPlugin(scrollTriggerApi);
    } catch (e) {}
  }

  let activeSlideTimeline = null;
  let isProgrammaticGsapScroll = false;
  let scrollRevealReady = false;

  function getSlideStageBlocks(frameEl) {
    if (!frameEl) return [];
    return [...frameEl.children].filter(
      (child) => !child.classList.contains('presenter-tip') && !child.hidden
    );
  }

  function clearAllSlideGsapProps() {
    if (!gsapApi) return;
    slideSections.forEach((sec) => {
      const frame = $('.slide-frame', sec);
      if (!frame) return;
      frame.classList.remove('is-gsap-transitioning');
      const blocks = getSlideStageBlocks(frame);
      gsapApi.killTweensOf(frame);
      if (blocks.length > 0) gsapApi.killTweensOf(blocks);
      gsapApi.set(frame, { clearProps: 'opacity,transform' });
      if (blocks.length > 0) {
        gsapApi.set(blocks, { clearProps: 'opacity,transform' });
      }
    });
  }

  function animateSlideFrameEntrance(slideNum, direction = 1) {
    if (
      !gsapApi ||
      prefersReducedMotion?.matches ||
      document.body.classList.contains('is-editing') ||
      document.body.classList.contains('is-phone-remote')
    ) {
      return;
    }
    const sec = $(`#slide-${slideNum}`);
    const frame = sec ? $('.slide-frame', sec) : null;
    if (!frame) return;

    const blocks = getSlideStageBlocks(frame);
    frame.classList.add('is-gsap-transitioning');
    gsapApi.killTweensOf(frame);
    if (blocks.length > 0) gsapApi.killTweensOf(blocks);

    gsapApi.fromTo(
      frame,
      { opacity: 0.34, y: direction * 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.56,
        ease: 'power2.out',
        overwrite: 'auto',
        clearProps: 'opacity,transform',
        onComplete: () => frame.classList.remove('is-gsap-transitioning')
      }
    );

    if (blocks.length > 0) {
      gsapApi.fromTo(
        blocks,
        { opacity: 0.52, y: direction * 9 },
        {
          opacity: 1,
          y: 0,
          duration: 0.46,
          stagger: 0.045,
          ease: 'power2.out',
          overwrite: 'auto',
          clearProps: 'opacity,transform'
        }
      );
    }
  }

  function updateActiveSlideUI(num, { fromRemoteSync = false } = {}) {
    const changed = currentSlideNum !== num;
    if (changed && visualPauseSlide) {
      stopVisualPause({ fromRemoteSync: true });
    }
    if (changed && presenterTipState.mode !== 'closed') {
      applyPresenterTipAction({ type: 'slide-change' });
    }
    currentSlideNum = num;
    highlightActiveLecternPage(num);

    const padded = String(num).padStart(2, '0');
    const totalPadded = String(TOTAL_SLIDES).padStart(2, '0');
    if (slideIndicator) slideIndicator.textContent = `${padded} / ${totalPadded}`;
    navLinks.forEach((link) => {
      link.classList.toggle('is-current', Number(link.dataset.slideLink) === num);
    });
    slideSections.forEach((sec) => {
      sec.classList.toggle('is-active-slide', Number(sec.dataset.slide) === num);
    });

    updateConstellationForSlide(num);

    const activeSection = $(`[data-slide="${num}"]`);
    const scene = activeSection?.dataset.scene || 'storm';
    Object.entries(bgs).forEach(([key, el]) => {
      if (!el) return;
      const targetOpacity = key === scene ? 1 : 0;
      if (gsapApi && !prefersReducedMotion?.matches) {
        gsapApi.to(el, {
          opacity: targetOpacity,
          duration: 0.72,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      } else {
        el.style.opacity = String(targetOpacity);
      }
    });

    if (changed && !fromRemoteSync) {
      emitPresenterStateChanged();
    }
  }

  function goToSlide(num, options = true) {
    const smooth = typeof options === 'boolean' ? options : options?.smooth !== false;
    const fromRemoteSync = typeof options === 'object' && Boolean(options?.fromRemoteSync);
    const clamped = Math.max(1, Math.min(TOTAL_SLIDES, num));
    const prevSlide = currentSlideNum;

    if (fromRemoteSync && isCurtainVisible()) {
      dismissPodiumCurtain({ enterPresent: false });
    }

    const target = $(`#slide-${clamped}`);
    if (!target) return;

    const spec = computeSlideTransitionSpec(prevSlide, clamped, {
      reducedMotion: Boolean(prefersReducedMotion?.matches),
      smooth
    });

    if (activeSlideTimeline) {
      activeSlideTimeline.kill();
      activeSlideTimeline = null;
    }
    isProgrammaticGsapScroll = false;
    clearAllSlideGsapProps();

    const h = syncHeaderOffset();
    const top = Math.max(0, Math.round(target.getBoundingClientRect().top + window.scrollY - h));

    if (
      gsapApi &&
      spec.animate &&
      !document.body.classList.contains('is-editing') &&
      !document.body.classList.contains('is-phone-remote')
    ) {
      const prevSection = $(`#slide-${prevSlide}`);
      const prevFrame = prevSection ? $('.slide-frame', prevSection) : null;
      const nextFrame = $('.slide-frame', target);
      const nextBlocks = getSlideStageBlocks(nextFrame);

      suppressScrollEmitUntil = Date.now() + Math.round((spec.scrollDuration + 0.3) * 1000);
      isProgrammaticGsapScroll = true;

      if (prevFrame) prevFrame.classList.add('is-gsap-transitioning');
      if (nextFrame) nextFrame.classList.add('is-gsap-transitioning');

      updateActiveSlideUI(clamped, { fromRemoteSync });

      const scrollProxy = { y: window.scrollY };
      activeSlideTimeline = gsapApi.timeline({
        onComplete: () => {
          isProgrammaticGsapScroll = false;
          activeSlideTimeline = null;
          clearAllSlideGsapProps();
          scrollTriggerApi?.refresh?.();
        },
        onInterrupt: () => {
          isProgrammaticGsapScroll = false;
          clearAllSlideGsapProps();
        }
      });

      activeSlideTimeline.to(
        scrollProxy,
        {
          y: top,
          duration: spec.scrollDuration,
          ease: 'power3.inOut',
          onUpdate: () => {
            window.scrollTo(0, scrollProxy.y);
          }
        },
        0
      );

      if (prevFrame && prevFrame !== nextFrame) {
        activeSlideTimeline.to(
          prevFrame,
          {
            opacity: spec.exitOpacity,
            y: spec.exitY,
            duration: spec.exitDuration,
            ease: 'power2.out',
            overwrite: 'auto'
          },
          0
        );
      }

      if (nextFrame) {
        gsapApi.set(nextFrame, { opacity: spec.enterOpacity, y: spec.enterY });
        activeSlideTimeline.to(
          nextFrame,
          {
            opacity: 1,
            y: 0,
            duration: spec.enterDuration,
            ease: 'power3.out',
            overwrite: 'auto'
          },
          spec.enterDelay
        );

        if (nextBlocks.length > 0) {
          gsapApi.set(nextBlocks, { opacity: spec.childOpacity, y: spec.childOffsetY });
          activeSlideTimeline.to(
            nextBlocks,
            {
              opacity: 1,
              y: 0,
              duration: spec.childDuration,
              stagger: spec.childStagger,
              ease: 'power2.out',
              overwrite: 'auto'
            },
            spec.enterDelay + 0.05
          );
        }
      }

      if (!fromRemoteSync) {
        emitPresenterStateChanged();
      }
      return;
    }

    suppressScrollEmitUntil = Date.now() + (smooth ? 900 : 250);
    window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
    updateActiveSlideUI(clamped, { fromRemoteSync });
    if (!fromRemoteSync) {
      emitPresenterStateChanged();
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const num = Number(link.dataset.slideLink);
      if (num >= 1 && num <= TOTAL_SLIDES) {
        e.preventDefault();
        goToSlide(num);
      }
    });
  });

  prevBtn?.addEventListener('click', () => goToSlide(currentSlideNum - 1));
  nextBtn?.addEventListener('click', () => goToSlide(currentSlideNum + 1));

  // Keyboard navigation & stage shortcuts
  document.addEventListener('keydown', (e) => {
    if (document.body.classList.contains('is-editing')) return;
    if (
      dialog?.open ||
      lecternDialog?.open ||
      $('#phone-remote-dialog')?.open ||
      $('#revisions-dialog')?.open ||
      $('#confirm-dialog')?.open ||
      $('#sync-audience-dialog')?.open
    ) {
      return;
    }
    const studioDrawer = $('#studio-drawer');
    if (studioDrawer && !studioDrawer.hidden) return;
    const meridianOverlay = $('#meridian-3d-overlay');
    if (meridianOverlay && !meridianOverlay.hidden) return;

    const tag = document.activeElement?.tagName;
    if (
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      document.activeElement?.isContentEditable
    ) {
      return;
    }

    // Handle Opening Event Poster keyboard shortcuts first when poster is drawn
    if (isCurtainVisible()) {
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const ck = e.key.toLowerCase();
        if (ck === 'b') {
          e.preventDefault();
          toggleBackgroundMusic();
          return;
        }
        if (ck === 'l') {
          e.preventDefault();
          dismissPodiumCurtain({ enterPresent: false });
          openLecternScriptDialog(1);
          return;
        }
      }
      if (e.key === 'Enter' || e.key === ' ') {
        const activeEl = document.activeElement;
        const isInteractiveOther =
          activeEl &&
          activeEl !== document.body &&
          activeEl !== podiumCurtain &&
          activeEl !== curtainStartBtn &&
          (activeEl.tagName === 'BUTTON' || activeEl.tagName === 'A');
        if (!isInteractiveOther) {
          e.preventDefault();
          dismissPodiumCurtain({ enterPresent: true, targetSlide: 1 });
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        dismissPodiumCurtain({ enterPresent: false });
      }
      return;
    }

    if (e.key === 'Escape') {
      if (presenterTipState.mode !== 'closed') {
        e.preventDefault();
        const prevTipSlide = presenterTipState.activeSlide;
        applyPresenterTipAction({ type: 'close' }, { restoreFocusSlide: prevTipSlide });
        return;
      }
      if (prepPopover && !prepPopover.hidden) {
        closePrepPopover();
        return;
      }
      if (contentsMenu && !contentsMenu.hidden) {
        closeMobileMenu();
        return;
      }
      if (visualPauseSlide) {
        stopVisualPause();
        return;
      }
      if (document.body.classList.contains('is-presenting')) {
        exitFullscreenPresentation();
        return;
      }
    }

    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      goToSlide(currentSlideNum + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      goToSlide(currentSlideNum - 1);
    } else if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      const key = e.key.toLowerCase();
      if (key === 'p') {
        e.preventDefault();
        toggleProjectorMode();
      } else if (key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (key === 'c' || key === '.') {
        e.preventDefault();
        if (isCurtainVisible()) {
          dismissPodiumCurtain({ enterPresent: false });
        } else {
          drawPodiumCurtain();
        }
      } else if (key === 'b') {
        e.preventDefault();
        toggleBackgroundMusic();
      } else if (key === 'n') {
        e.preventDefault();
        applyPresenterTipAction({ type: 'click-toggle', slide: currentSlideNum });
      } else if (key === 'l') {
        e.preventDefault();
        openLecternScriptDialog(currentSlideNum);
      } else if (key === 'r') {
        e.preventDefault();
        openPhoneRemoteDialog();
      } else if (key === 'v') {
        e.preventDefault();
        toggleVoiceNavigation();
      } else if (key === 't') {
        e.preventDefault();
        toggleAutoPace();
      }
    }
  });

  function onScroll() {
    const doc = document.documentElement;
    const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
    if (progressBar) {
      progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, window.scrollY / maxScroll))})`;
    }

    if (Date.now() < suppressScrollEmitUntil) {
      return;
    }

    const viewportCenter = window.innerHeight * 0.45;
    let bestNum = currentSlideNum;
    let bestDist = Infinity;

    slideSections.forEach((sec) => {
      const r = sec.getBoundingClientRect();
      const center = r.top + r.height / 2;
      const dist = Math.abs(center - viewportCenter);
      if (dist < bestDist) {
        bestDist = dist;
        bestNum = Number(sec.dataset.slide);
      }
    });

    if (bestNum !== currentSlideNum) {
      updateActiveSlideUI(bestNum, { fromRemoteSync: false });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateConstellationForSlide(1);
  onScroll();

  $$('main > section').forEach((sec) => sec.classList.add('is-in-view'));

  // Interrupt programmatic GSAP scroll cleanly if user manually scrolls with mousewheel or touch
  const cancelProgrammaticScrollOnUserGesture = () => {
    if (isProgrammaticGsapScroll && activeSlideTimeline) {
      activeSlideTimeline.kill();
      activeSlideTimeline = null;
      isProgrammaticGsapScroll = false;
      suppressScrollEmitUntil = 0;
      clearAllSlideGsapProps();
    }
  };
  window.addEventListener('wheel', cancelProgrammaticScrollOnUserGesture, { passive: true });
  window.addEventListener('touchmove', cancelProgrammaticScrollOnUserGesture, { passive: true });
  window.addEventListener('beforeprint', () => {
    if (activeSlideTimeline) {
      activeSlideTimeline.kill();
      activeSlideTimeline = null;
    }
    isProgrammaticGsapScroll = false;
    clearAllSlideGsapProps();
  });

  // Natural scroll cross-fade & slide-in across the 7 sections via GSAP ScrollTrigger
  if (gsapApi && scrollTriggerApi && !prefersReducedMotion?.matches) {
    slideSections.forEach((sec) => {
      const slideNum = Number(sec.dataset.slide);
      scrollTriggerApi.create({
        trigger: sec,
        start: 'top 78%',
        end: 'bottom 22%',
        onEnter: () => {
          if (!scrollRevealReady || isProgrammaticGsapScroll || isCurtainVisible()) return;
          animateSlideFrameEntrance(slideNum, 1);
        },
        onEnterBack: () => {
          if (!scrollRevealReady || isProgrammaticGsapScroll || isCurtainVisible()) return;
          animateSlideFrameEntrance(slideNum, -1);
        }
      });
    });
    requestAnimationFrame(() => {
      scrollRevealReady = true;
    });
  }

  // =========================================================================
  // 10. Clean Audience Mode / Fullscreen Presentation
  // =========================================================================
  const presentBtn = $('#present-button');
  const presentLabel = $('#present-label');
  const exitPresentBtn = $('#exit-present-btn');

  function setPresentingState(active) {
    document.body.classList.toggle('is-presenting', active);
    if (presentLabel) {
      presentLabel.textContent = active ? 'Exit' : 'Present';
    }
    if (exitPresentBtn) {
      exitPresentBtn.hidden = !active;
    }
    if (active) {
      closePrepPopover();
    }
    syncHeaderOffset();
  }

  function exitFullscreenPresentation() {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    setPresentingState(false);
  }

  function toggleFullscreen() {
    const isCurrentlyPresenting =
      Boolean(document.fullscreenElement) || document.body.classList.contains('is-presenting');
    if (!isCurrentlyPresenting) {
      setPresentingState(true);
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      exitFullscreenPresentation();
    }
  }

  presentBtn?.addEventListener('click', toggleFullscreen);
  exitPresentBtn?.addEventListener('click', exitFullscreenPresentation);
  document.addEventListener('fullscreenchange', () => {
    setPresentingState(Boolean(document.fullscreenElement));
  });

  // =========================================================================
  // 11. Print Handout / PDF Button
  // =========================================================================
  const printBtn = $('#print-button');
  const footerPrintBtn = $('#footer-print-btn');
  const handlePrint = () => {
    document.body.classList.remove('is-printing-script');
    if (printLecternContainer) {
      printLecternContainer.hidden = true;
      printLecternContainer.setAttribute('aria-hidden', 'true');
    }
    window.print();
  };
  printBtn?.addEventListener('click', handlePrint);
  footerPrintBtn?.addEventListener('click', handlePrint);

  // =========================================================================
  // 12. Inline Text Editing & LocalStorage Revision Support
  // =========================================================================
  const editBtn = $('#edit-toggle');
  const editLabel = $('#edit-toggle-label');
  const resetBtn = $('#reset-edits');
  const editableEls = $$('[data-editable]');

  const STORAGE_KEY = 'montesquieu-lectern-aligned-v3';
  const LEGACY_KEYS = [
    'whose-liberty-dauchy-response-v2',
    'whose-liberty-unified-edits-v1',
    'three-powers-edits-v1',
    'whose-liberty-edits-v2',
    'whose-liberty-edits-v1',
    'whose-liberty-revisions-v1'
  ];

  const defaultTexts = {};
  editableEls.forEach((el) => {
    defaultTexts[el.dataset.editable] = el.innerHTML;
  });

  function collectAllLocalEditsBundle() {
    const bundle = {
      exportedAt: new Date().toISOString(),
      presentationTitle: 'Whose liberty? Montesquieu in Brazil',
      currentEdits: {},
      preservedLegacyStorage: {}
    };
    editableEls.forEach((el) => {
      const key = el.dataset.editable;
      if (el.innerHTML !== defaultTexts[key]) {
        bundle.currentEdits[key] = el.innerHTML;
      }
    });
    try {
      LEGACY_KEYS.forEach((k) => {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            bundle.preservedLegacyStorage[k] = JSON.parse(raw);
          } catch {
            bundle.preservedLegacyStorage[k] = raw;
          }
        }
      });
    } catch (e) {}
    return bundle;
  }

  function downloadEditsJsonBundle(filenamePrefix = 'whose-liberty-slides-backup') {
    const payload = collectAllLocalEditsBundle();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function loadSavedEdits() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      let hasCustom = false;
      editableEls.forEach((el) => {
        const key = el.dataset.editable;
        if (saved[key] && saved[key] !== defaultTexts[key]) {
          el.innerHTML = saved[key];
          hasCustom = true;
        }
      });
      if (resetBtn) resetBtn.hidden = !hasCustom;
    } catch (e) {}
  }

  function saveEdits() {
    try {
      const current = {};
      let hasCustom = false;
      editableEls.forEach((el) => {
        const key = el.dataset.editable;
        if (el.innerHTML !== defaultTexts[key]) {
          current[key] = el.innerHTML;
          hasCustom = true;
        }
      });
      if (hasCustom) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      if (resetBtn) resetBtn.hidden = !hasCustom;
      window.dispatchEvent(
        new CustomEvent('dauchy:edits-changed', {
          detail: { edits: current, hasCustom }
        })
      );
    } catch (e) {}
  }

  const deckBridge = {
    getCurrentSlide() {
      return currentSlideNum;
    },
    getCurrentCallout() {
      return getCurrentCallout();
    },
    goToSlide(num, opts = {}) {
      goToSlide(num, opts);
    },
    applySlideCallout(slideNum, calloutId, opts = {}) {
      applySlideCallout(slideNum, calloutId, opts);
    },
    syncHeaderOffset() {
      return syncHeaderOffset();
    },
    getCurrentEdits() {
      const current = {};
      editableEls.forEach((el) => {
        const key = el.dataset.editable;
        if (el.innerHTML !== defaultTexts[key]) {
          current[key] = el.innerHTML;
        }
      });
      return current;
    },
    getEditsMap() {
      return this.getCurrentEdits();
    },
    applyEditsMap(editsMap = {}) {
      editableEls.forEach((el) => {
        const key = el.dataset.editable;
        if (Object.prototype.hasOwnProperty.call(editsMap, key)) {
          el.innerHTML = editsMap[key];
        } else {
          el.innerHTML = defaultTexts[key];
        }
      });
      saveEdits();
    },
    exportAllBundle: downloadEditsJsonBundle
  };

  window.dauchyDeckBridge = deckBridge;
  window.WhoseLibertyDeck = deckBridge;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  loadSavedEdits();

  let isEditing = false;
  editBtn?.addEventListener('click', () => {
    isEditing = !isEditing;
    document.body.classList.toggle('is-editing', isEditing);
    editBtn.setAttribute('aria-pressed', String(isEditing));
    if (editLabel) editLabel.textContent = isEditing ? 'Done Editing' : 'Edit Text';

    editableEls.forEach((el) => {
      if (isEditing) {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('spellcheck', 'true');
      } else {
        el.removeAttribute('contenteditable');
      }
    });

    if (!isEditing) saveEdits();
    closePrepPopover();
  });

  editableEls.forEach((el) => {
    el.addEventListener('blur', saveEdits);
  });

  resetBtn?.addEventListener('click', () => {
    editableEls.forEach((el) => {
      el.innerHTML = defaultTexts[el.dataset.editable];
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    resetBtn.hidden = true;
    saveEdits();
  });

  // =========================================================================
  // 13. Backstage Rehearsal Timer (10 / 12 / 15 min)
  // =========================================================================
  const timerBox = $('#pacing-timer');
  const timerPresetBtn = $('#timer-preset-btn');
  const timerToggleBtn = $('#timer-toggle-btn');
  const timerResetBtn = $('#timer-reset-btn');

  if (timerBox && timerPresetBtn && timerToggleBtn && timerResetBtn) {
    const PRESETS_MINUTES = [10, 12, 15];
    let presetIndex = 0;
    let totalSeconds = PRESETS_MINUTES[presetIndex] * 60;
    let remainingSeconds = totalSeconds;
    let timerInterval = null;
    let isRunning = false;

    function formatTime(sec) {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function updateTimerUI() {
      timerPresetBtn.textContent = formatTime(remainingSeconds);
      timerToggleBtn.textContent = isRunning ? 'Pause' : 'Start';
      timerToggleBtn.setAttribute('aria-pressed', String(isRunning));
      timerPresetBtn.disabled = isRunning;
      timerResetBtn.hidden = isRunning || remainingSeconds === totalSeconds;

      if (remainingSeconds === 0) {
        timerBox.setAttribute('data-timer-state', 'expired');
      } else if (remainingSeconds <= 120) {
        timerBox.setAttribute('data-timer-state', 'warning');
      } else if (isRunning) {
        timerBox.setAttribute('data-timer-state', 'running');
      } else {
        timerBox.removeAttribute('data-timer-state');
      }
    }

    function stopTimer() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      isRunning = false;
      updateTimerUI();
    }

    function startTimer() {
      if (remainingSeconds <= 0) {
        remainingSeconds = totalSeconds;
      }
      isRunning = true;
      updateTimerUI();
      timerInterval = setInterval(() => {
        if (remainingSeconds > 0) {
          remainingSeconds -= 1;
          updateTimerUI();
        } else {
          stopTimer();
        }
      }, 1000);
    }

    function toggleTimer() {
      if (isRunning) stopTimer();
      else startTimer();
    }

    timerToggleBtn.addEventListener('click', toggleTimer);

    timerPresetBtn.addEventListener('click', () => {
      if (isRunning) return;
      presetIndex = (presetIndex + 1) % PRESETS_MINUTES.length;
      totalSeconds = PRESETS_MINUTES[presetIndex] * 60;
      remainingSeconds = totalSeconds;
      updateTimerUI();
    });

    timerResetBtn.addEventListener('click', () => {
      stopTimer();
      remainingSeconds = totalSeconds;
      updateTimerUI();
    });

    updateTimerUI();
  }

  // =========================================================================
  // 14. Standing Presenter Suite: Phone Remote, Voice Control & Auto-Pace
  // =========================================================================

  // A. Stage Action Dispatcher for Remote & Voice triggers
  function handleRemoteAction(action) {
    if (!action) return;
    if (action === 'pause-5s') {
      if (currentSlideNum !== 5) goToSlide(5);
      startVisualPause(5);
    } else if (action === 'toggle-powers') {
      if (currentSlideNum !== 4) goToSlide(4);
      const isFour = activeSlideCallouts[4] === 'four-powers';
      applySlideCallout(4, isFour ? 'three-powers' : 'four-powers');
    } else if (action === 'toggle-sword') {
      if (currentSlideNum !== 6) goToSlide(6);
      const isSword = activeSlideCallouts[6] === 'sword-detail';
      applySlideCallout(6, isSword ? 'whole' : 'sword-detail');
    } else if (action === 'toggle-tip') {
      applyPresenterTipAction({ type: 'click-toggle', slide: currentSlideNum });
    } else if (action === 'toggle-music') {
      toggleBackgroundMusic();
    } else if (action === 'toggle-curtain') {
      if (isCurtainVisible()) {
        dismissPodiumCurtain({ enterPresent: false });
      } else {
        drawPodiumCurtain();
      }
    }
  }

  // B. Smartphone Remote Pairing Dialog & Inline QR Code
  const phoneRemoteDialog = $('#phone-remote-dialog');
  const phoneRemoteCloseBtn = $('#phone-remote-dialog-close');
  const phoneRemoteDismissBtn = $('#phone-remote-dismiss-btn');
  const phoneRemoteCopyBtn = $('#phone-remote-copy-btn');
  const phoneRemoteLaunchBtn = $('#phone-remote-launch-btn');
  const phoneRemoteUrlInput = $('#phone-remote-url-input');
  const phoneRemoteQrWrap = $('#phone-remote-qr-wrap');

  const headerPhoneRemoteBtn = $('#header-phone-remote-btn');
  const prepPhoneRemoteBtn = $('#prep-remote-btn');

  function openPhoneRemoteDialog() {
    const sessionCode = window.getActiveSyncSessionCode?.() || DEFAULT_SESSION_CODE;
    const remoteUrl = buildRemoteShareUrl(window.location.href, sessionCode);

    if (phoneRemoteUrlInput) phoneRemoteUrlInput.value = remoteUrl;
    if (phoneRemoteQrWrap) {
      phoneRemoteQrWrap.innerHTML = generateQrSvg(remoteUrl, { sizePx: 210 });
    }

    phoneRemoteDialog?.showModal();
    closePrepPopover();
  }

  headerPhoneRemoteBtn?.addEventListener('click', openPhoneRemoteDialog);
  prepPhoneRemoteBtn?.addEventListener('click', openPhoneRemoteDialog);
  phoneRemoteCloseBtn?.addEventListener('click', () => phoneRemoteDialog?.close());
  phoneRemoteDismissBtn?.addEventListener('click', () => phoneRemoteDialog?.close());

  phoneRemoteCopyBtn?.addEventListener('click', async () => {
    if (!phoneRemoteUrlInput) return;
    try {
      await navigator.clipboard.writeText(phoneRemoteUrlInput.value);
      phoneRemoteCopyBtn.textContent = 'Copied! ✓';
      setTimeout(() => {
        if (phoneRemoteCopyBtn) phoneRemoteCopyBtn.textContent = 'Copy Link';
      }, 2000);
    } catch (e) {
      phoneRemoteUrlInput.select();
    }
  });

  phoneRemoteLaunchBtn?.addEventListener('click', () => {
    if (!phoneRemoteUrlInput) return;
    phoneRemoteDialog?.close();
    window.location.href = phoneRemoteUrlInput.value;
  });

  // C. Hands-Free Voice Controller (Web Speech API)
  const headerVoiceBtn = $('#header-voice-btn');
  const prepVoiceBtn = $('#prep-voice-btn');
  const prepVoiceLabel = $('#prep-voice-label');

  const voiceController = new VoiceController({
    onNavigateSlide: (val, mode) => {
      if (mode === 'delta') {
        goToSlide(currentSlideNum + val);
      } else {
        goToSlide(val);
      }
    },
    onToggleTip: () => applyPresenterTipAction({ type: 'click-toggle', slide: currentSlideNum }),
    onTogglePause: () => {
      if (currentSlideNum !== 5) goToSlide(5);
      startVisualPause(5);
    },
    onToggleMusic: () => toggleBackgroundMusic(),
    onTogglePowers: () => {
      if (currentSlideNum !== 4) goToSlide(4);
      const isFour = activeSlideCallouts[4] === 'four-powers';
      applySlideCallout(4, isFour ? 'three-powers' : 'four-powers');
    },
    onToggleSword: () => {
      if (currentSlideNum !== 6) goToSlide(6);
      const isSword = activeSlideCallouts[6] === 'sword-detail';
      applySlideCallout(6, isSword ? 'whole' : 'sword-detail');
    },
    onOpenScript: () => openLecternScriptDialog(currentSlideNum),
    onToggleCurtain: () => {
      if (isCurtainVisible()) {
        dismissPodiumCurtain({ enterPresent: false });
      } else {
        drawPodiumCurtain();
      }
    },
    onStatusChange: ({ active }) => {
      if (headerVoiceBtn) {
        headerVoiceBtn.setAttribute('aria-pressed', String(active));
        headerVoiceBtn.classList.toggle('is-listening', Boolean(active));
        const lbl = $('#header-voice-label', headerVoiceBtn);
        if (lbl) lbl.textContent = active ? '🎙️ Listening' : '🎙️ Voice';
      }
      if (prepVoiceBtn) {
        prepVoiceBtn.setAttribute('aria-pressed', String(active));
        if (prepVoiceLabel) {
          prepVoiceLabel.textContent = active ? '🎙️ Voice: ON (V)' : '🎙️ Voice: OFF (V)';
        }
      }
    }
  });

  function toggleVoiceNavigation() {
    voiceController.toggle();
  }

  headerVoiceBtn?.addEventListener('click', toggleVoiceNavigation);
  prepVoiceBtn?.addEventListener('click', toggleVoiceNavigation);

  // D. Lectern-Script Synchronized Auto-Paced Rehearsal & Delivery Mode (50s, 75s, 90s, 70s, 90s, 125s, 70s = 9m30s)
  const SLIDE_DURATIONS_SEC = Object.fromEntries(
    PRINCIPAL_SLIDES.map((s) => [s.number, Number(s.durationSeconds) || 85])
  );
  let autoPaceActive = false;
  let autoPaceElapsedOnSlide = 0;
  let autoPaceInterval = null;
  const autoPaceBar = $('#auto-pace-bar');
  const prepAutoPaceBtn = $('#prep-auto-pace-btn');
  const prepAutoPaceLabel = $('#prep-auto-pace-label');

  function updateAutoPaceProgress() {
    if (!autoPaceActive || !autoPaceBar) return;
    const dur = SLIDE_DURATIONS_SEC[currentSlideNum] || 85;
    const pct = Math.min(100, (autoPaceElapsedOnSlide / dur) * 100);
    autoPaceBar.style.width = `${pct}%`;

    if (autoPaceElapsedOnSlide >= dur) {
      if (currentSlideNum < TOTAL_SLIDES) {
        goToSlide(currentSlideNum + 1);
        autoPaceElapsedOnSlide = 0;
      } else {
        stopAutoPace();
      }
    }
  }

  function startAutoPace() {
    autoPaceActive = true;
    autoPaceElapsedOnSlide = 0;
    if (autoPaceBar) {
      autoPaceBar.hidden = false;
      autoPaceBar.classList.remove('is-paused');
      autoPaceBar.style.width = '0%';
    }
    if (prepAutoPaceBtn) prepAutoPaceBtn.setAttribute('aria-pressed', 'true');
    if (prepAutoPaceLabel) prepAutoPaceLabel.textContent = '⏱️ Auto-Pace: ON (T)';

    clearInterval(autoPaceInterval);
    autoPaceInterval = setInterval(() => {
      autoPaceElapsedOnSlide += 0.5;
      updateAutoPaceProgress();
    }, 500);
  }

  function stopAutoPace() {
    autoPaceActive = false;
    clearInterval(autoPaceInterval);
    if (autoPaceBar) {
      autoPaceBar.style.width = '0%';
      autoPaceBar.hidden = true;
    }
    if (prepAutoPaceBtn) prepAutoPaceBtn.setAttribute('aria-pressed', 'false');
    if (prepAutoPaceLabel) prepAutoPaceLabel.textContent = '⏱️ Auto-Pace: OFF (T)';
  }

  function toggleAutoPace() {
    if (autoPaceActive) stopAutoPace();
    else startAutoPace();
  }

  prepAutoPaceBtn?.addEventListener('click', toggleAutoPace);

  // E. Listen to incoming commands from Smartphone Remote or Firebase/SSE
  window.addEventListener('remote-slide-command', (e) => {
    if (e.detail) {
      if (Number.isInteger(e.detail.currentSlide)) {
        goToSlide(e.detail.currentSlide, { smooth: true, fromRemoteSync: true });
      }
      if (e.detail.activeCallout) {
        handleRemoteAction(e.detail.activeCallout);
      }
    }
  });

  // F. Mount Dedicated Smartphone Remote when opened with ?role=remote
  const remoteParams = parseRemoteParamsFromSearch(window.location.search);
  if (remoteParams.isRemote) {
    document.body.classList.add('is-phone-remote');
    const remoteRoot = $('#mobile-remote-root');
    if (remoteRoot) {
      const remote = new RemoteController({
        sessionCode: remoteParams.sessionCode,
        onSlideChange: (num) => {
          goToSlide(num, { smooth: false });
        },
        onCalloutTrigger: (action) => {
          handleRemoteAction(action);
        }
      });
      remote.mount(remoteRoot);
    }
  }

  window.openPhoneRemoteDialog = openPhoneRemoteDialog;
  window.openLecternScriptDialog = openLecternScriptDialog;
  window.printLecternScript = printLecternScript;
  window.toggleVoiceNavigation = toggleVoiceNavigation;
  window.toggleAutoPace = toggleAutoPace;
})();
