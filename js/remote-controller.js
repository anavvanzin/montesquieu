/**
 * Dedicated Smartphone Remote Controller for Standing Presenters.
 * Provides high-contrast tactile thumb controls, full verbatim Lectern Script teleprompter
 * (with bold sentence lead-ins and silent stage cues) + Quick Cues toggle, vibration haptics,
 * and bidirectional Firestore/SSE/BroadcastChannel synchronization.
 */

import { PRINCIPAL_SLIDES, getSlideByNumber } from './presentation-data.mjs';
import { DEFAULT_SESSION_CODE, normalizeSessionCode } from './audience-sync-logic.mjs';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export class RemoteController {
  constructor({
    sessionCode = DEFAULT_SESSION_CODE,
    onSlideChange = () => {},
    onCalloutTrigger = () => {}
  } = {}) {
    const codeCheck = normalizeSessionCode(sessionCode);
    this.sessionCode = codeCheck.valid ? codeCheck.code : DEFAULT_SESSION_CODE;
    this.currentSlide = 1;
    this.activeCallout = '';
    this.notesMode = 'script'; // 'script' (Full Lectern Script) | 'cues' (Quick Cues)
    this.isMuted = false;
    this.timerSeconds = 0;
    this.timerRunning = false;
    this.timerInterval = null;

    this.onSlideChange = onSlideChange;
    this.onCalloutTrigger = onCalloutTrigger;

    this.broadcastChannel = null;
    this.eventSource = null;

    this._initChannel();
    this._initSSE();
  }

  _initChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('ufsc_montesquieu_sync');
        this.broadcastChannel.onmessage = (e) => {
          if (e.data && e.data.type === 'slide-update') {
            this.updateFromExternal(e.data);
          }
        };
      } catch (err) {}
    }
  }

  _initSSE() {
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        this.eventSource = new EventSource(
          `/api/audience-sync/events?session=${encodeURIComponent(this.sessionCode)}`
        );
        this.eventSource.addEventListener('sync-state', (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data && typeof data === 'object') {
              this.updateFromExternal(data);
            }
          } catch (err) {}
        });
      } catch (err) {}
    }
  }

  updateFromExternal(data) {
    if (!data) return;
    const nextSlide = Number(data.currentSlide);
    if (Number.isInteger(nextSlide) && nextSlide >= 1 && nextSlide <= PRINCIPAL_SLIDES.length) {
      this.currentSlide = nextSlide;
    }
    if (typeof data.activeCallout === 'string') {
      this.activeCallout = data.activeCallout;
    }
    this.render();
  }

  async publish(slideNum, callout = '') {
    this._vibrate(25);
    this.currentSlide = Math.max(1, Math.min(PRINCIPAL_SLIDES.length, slideNum));
    this.activeCallout = callout;

    const payload = {
      sessionCode: this.sessionCode,
      currentSlide: this.currentSlide,
      activeCallout: this.activeCallout,
      status: 'live',
      presenterName: 'Ana Vitória Vanzin Mendes · UFSC',
      updatedAtMs: Date.now()
    };

    // 1. BroadcastChannel for instant local browser sync
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'slide-update', ...payload });
      } catch (e) {}
    }

    // 2. Local CustomEvent for same-tab
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('remote-slide-command', { detail: payload }));
    }

    // 3. Server HTTP publish for cross-device SSE sync
    try {
      fetch('/api/audience-sync/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (e) {}

    // 4. Firestore publish if workspace firebase is available
    if (typeof window !== 'undefined' && window.publishPresenterStateToFirebase) {
      try {
        window.publishPresenterStateToFirebase(payload);
      } catch (e) {}
    }

    this.render();
    this.onSlideChange(this.currentSlide, this.activeCallout);
  }

  _vibrate(ms) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch (e) {}
    }
  }

  startTimer() {
    if (this.timerRunning) return;
    this.timerRunning = true;
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this._updateTimerDisplay();
    }, 1000);
    this._updateTimerDisplay();
  }

  pauseTimer() {
    this.timerRunning = false;
    clearInterval(this.timerInterval);
    this._updateTimerDisplay();
  }

  toggleTimer() {
    if (this.timerRunning) this.pauseTimer();
    else this.startTimer();
  }

  _updateTimerDisplay() {
    const el = document.getElementById('remote-timer-readout');
    const btn = document.getElementById('remote-timer-toggle-btn');
    if (!el) return;
    const mins = Math.floor(this.timerSeconds / 60);
    const secs = this.timerSeconds % 60;
    el.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (btn) btn.textContent = this.timerRunning ? 'Pause' : 'Start';
  }

  mount(containerEl) {
    if (!containerEl) return;
    this.container = containerEl;
    this.render();
    this.startTimer();
  }

  render() {
    if (!this.container) return;
    const slide = getSlideByNumber(this.currentSlide) || PRINCIPAL_SLIDES[0];
    const total = PRINCIPAL_SLIDES.length;
    const tip = slide.presenterTip || { heading: slide.title, pacing: '', cues: [], guardrail: '' };
    const script = slide.lecternScript || {
      elapsedRange: tip.pacing || '',
      stageLabel: '',
      paragraphs: [],
      stageCue: ''
    };

    const scriptParagraphsHtml = (script.paragraphs || [])
      .map((p) => {
        const lead = escapeHtml(p.leadIn || '');
        const rest = escapeHtml(p.rest || '');
        return `<p class="remote-script-para"><strong>${lead}</strong>${rest ? ` ${rest}` : ''}</p>`;
      })
      .join('');

    const stageCueHtml = script.stageCue
      ? `<p class="remote-script-cue t-meta">${escapeHtml(script.stageCue)}</p>`
      : '';

    const cuesHtml = (tip.cues || [])
      .map(
        (c) => `
        <li class="remote-cue-item">
          <strong>${escapeHtml(c.label || '')}</strong>
          <span>${escapeHtml(c.text || '')}</span>
        </li>`
      )
      .join('');

    const guardrailHtml = tip.guardrail
      ? `<div class="remote-guardrail-card">
          <span class="remote-guardrail-tag t-meta">SCHOLARLY GUARDRAIL</span>
          <p>${escapeHtml(tip.guardrail)}</p>
        </div>`
      : '';

    const notesBodyHtml =
      this.notesMode === 'script'
        ? `<div class="remote-script-prose">
             ${scriptParagraphsHtml}
             ${stageCueHtml}
           </div>`
        : `<ul class="remote-cues-list">
             ${cuesHtml}
           </ul>
           ${guardrailHtml}`;

    const slideButtonsHtml = PRINCIPAL_SLIDES.map((s) => {
      const activeClass = s.number === this.currentSlide ? 'is-active' : '';
      return `<button type="button" class="remote-slide-pill ${activeClass}" data-remote-jump="${s.number}">
        <span class="remote-slide-pill__num">${s.number}</span>
        <span class="remote-slide-pill__name">${escapeHtml(s.navLabel.replace(/^0\d\s*·\s*/, ''))}</span>
      </button>`;
    }).join('');

    const pacingBadge = script.elapsedRange || tip.pacing || '';
    const stageSub = script.stageLabel ? ` · ${script.stageLabel}` : '';

    this.container.innerHTML = `
      <div class="remote-controller" role="region" aria-label="Smartphone Standing Presenter Remote">
        <header class="remote-header">
          <div class="remote-header__left">
            <span class="remote-live-dot" aria-hidden="true"></span>
            <span class="remote-session-code t-meta">${escapeHtml(this.sessionCode)}</span>
          </div>
          <div class="remote-header__timer">
            <span class="remote-timer-label t-meta">ELAPSED</span>
            <span class="remote-timer-val" id="remote-timer-readout">00:00</span>
            <button type="button" class="remote-timer-btn t-meta" id="remote-timer-toggle-btn">${this.timerRunning ? 'Pause' : 'Start'}</button>
          </div>
          <div class="remote-header__right">
            <span class="remote-slide-indicator">${String(this.currentSlide).padStart(2, '0')} / 07</span>
          </div>
        </header>

        <!-- Fast Slide Picker Bar -->
        <nav class="remote-slide-bar" aria-label="Jump to slide">
          ${slideButtonsHtml}
        </nav>

        <!-- Verbatim Lectern Script & Quick Cues Card -->
        <main class="remote-notes-card">
          <div class="remote-notes-header">
            <div class="remote-notes-header__top">
              <span class="remote-notes-kicker t-meta">PAGE ${this.currentSlide} OF 7${escapeHtml(stageSub.toUpperCase())}</span>
              <div class="remote-mode-switch" role="group" aria-label="Notes display mode">
                <button type="button" class="remote-mode-btn t-meta ${this.notesMode === 'script' ? 'is-active' : ''}" data-remote-notes-mode="script" aria-pressed="${this.notesMode === 'script'}">Full Script</button>
                <button type="button" class="remote-mode-btn t-meta ${this.notesMode === 'cues' ? 'is-active' : ''}" data-remote-notes-mode="cues" aria-pressed="${this.notesMode === 'cues'}">Quick Cues</button>
              </div>
            </div>
            <h2 class="remote-notes-title">${escapeHtml(slide.title)}</h2>
            ${pacingBadge ? `<span class="remote-notes-pacing t-meta">${escapeHtml(pacingBadge)}</span>` : ''}
          </div>

          <div class="remote-notes-body">
            ${notesBodyHtml}
          </div>
        </main>

        <!-- Contextual Stage Interaction Buttons -->
        <section class="remote-actions-bar" aria-label="Stage interactions">
          ${
            this.currentSlide === 4
              ? `<button type="button" class="remote-action-btn remote-action-btn--highlight" data-remote-action="toggle-powers">
                   ⚖️ Toggle Four Powers
                 </button>`
              : ''
          }
          ${
            this.currentSlide === 5
              ? `<button type="button" class="remote-action-btn remote-action-btn--highlight" data-remote-action="pause-5s">
                   ⚡ Trigger 5s Visual Look
                 </button>`
              : ''
          }
          ${
            this.currentSlide === 6
              ? `<button type="button" class="remote-action-btn remote-action-btn--highlight" data-remote-action="toggle-sword">
                   🗡️ Toggle Sword Detail
                 </button>`
              : ''
          }
          <button type="button" class="remote-action-btn" data-remote-action="toggle-tip">
            💡 Show Tip on Projector
          </button>
          <button type="button" class="remote-action-btn" data-remote-action="toggle-music">
            🎵 Chopin Nocturne
          </button>
          <button type="button" class="remote-action-btn" data-remote-action="toggle-curtain">
            ◼️ Curtain / Poster
          </button>
        </section>

        <!-- Giant Thumb Navigation Buttons -->
        <footer class="remote-footer-nav">
          <button type="button" class="remote-nav-btn remote-nav-btn--prev" id="remote-btn-prev" aria-label="Previous slide" ${this.currentSlide <= 1 ? 'disabled' : ''}>
            ❮ PREV
          </button>
          <button type="button" class="remote-nav-btn remote-nav-btn--next" id="remote-btn-next" aria-label="Next slide" ${this.currentSlide >= total ? 'disabled' : ''}>
            NEXT SLIDE ❯
          </button>
        </footer>
      </div>
    `;

    this._bindEvents();
    this._updateTimerDisplay();
  }

  _bindEvents() {
    const prevBtn = this.container.querySelector('#remote-btn-prev');
    const nextBtn = this.container.querySelector('#remote-btn-next');
    const timerBtn = this.container.querySelector('#remote-timer-toggle-btn');

    prevBtn?.addEventListener('click', () => {
      if (this.currentSlide > 1) {
        this.publish(this.currentSlide - 1);
      }
    });

    nextBtn?.addEventListener('click', () => {
      if (this.currentSlide < PRINCIPAL_SLIDES.length) {
        this.publish(this.currentSlide + 1);
      }
    });

    timerBtn?.addEventListener('click', () => {
      this.toggleTimer();
    });

    this.container.querySelectorAll('[data-remote-notes-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-remote-notes-mode');
        if (mode === 'script' || mode === 'cues') {
          this.notesMode = mode;
          this.render();
        }
      });
    });

    this.container.querySelectorAll('[data-remote-jump]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = Number(btn.getAttribute('data-remote-jump'));
        if (Number.isInteger(target)) {
          this.publish(target);
        }
      });
    });

    this.container.querySelectorAll('[data-remote-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-remote-action');
        this.publish(this.currentSlide, action);
        this.onCalloutTrigger(action, this.currentSlide);
      });
    });
  }
}
