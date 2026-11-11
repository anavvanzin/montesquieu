/**
 * Hands-Free Voice Control Controller for Standing Presenter.
 * Uses Web Speech API (SpeechRecognition / webkitSpeechRecognition).
 * Supports English, Portuguese, and French commands without server latency.
 */

export class VoiceController {
  constructor({
    onNavigateSlide,
    onToggleTip,
    onTogglePause,
    onToggleMusic,
    onTogglePowers,
    onToggleSword,
    onOpenScript,
    onToggleCurtain,
    onStatusChange
  } = {}) {
    this.onNavigateSlide = onNavigateSlide || (() => {});
    this.onToggleTip = onToggleTip || (() => {});
    this.onTogglePause = onTogglePause || (() => {});
    this.onToggleMusic = onToggleMusic || (() => {});
    this.onTogglePowers = onTogglePowers || (() => {});
    this.onToggleSword = onToggleSword || (() => {});
    this.onOpenScript = onOpenScript || (() => {});
    this.onToggleCurtain = onToggleCurtain || (() => {});
    this.onStatusChange = onStatusChange || (() => {});

    this.recognition = null;
    this.isActive = false;
    this.manualStop = false;
    this.lastCommandTime = 0;
    this.toastEl = null;

    this._initRecognition();
  }

  isSupported() {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  _initRecognition() {
    if (!this.isSupported()) return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRec();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 3;

    this.recognition.onstart = () => {
      this.isActive = true;
      this.onStatusChange({ active: true, message: 'Voice Listening 🎙️' });
      this._showToast('Voice Control: Listening 🎙️');
    };

    this.recognition.onend = () => {
      this.isActive = false;
      this.onStatusChange({ active: false, message: 'Voice Off' });
      // If not intentionally stopped by user, restart after brief pause
      if (!this.manualStop) {
        setTimeout(() => {
          if (!this.manualStop && this.recognition) {
            try {
              this.recognition.start();
            } catch (e) {}
          }
        }, 500);
      }
    };

    this.recognition.onerror = (e) => {
      if (e.error === 'no-speech') return;
      if (e.error === 'not-allowed') {
        this.manualStop = true;
        this.isActive = false;
        this.onStatusChange({ active: false, error: 'Microphone permission denied.' });
        this._showToast('Mic permission denied', true);
      }
    };

    this.recognition.onresult = (event) => {
      const now = Date.now();
      if (now - this.lastCommandTime < 600) return; // Debounce rapid speech

      const results = event.results;
      for (let i = event.resultIndex; i < results.length; i++) {
        if (results[i].isFinal) {
          for (let j = 0; j < results[i].length; j++) {
            const transcript = results[i][j].transcript.trim().toLowerCase();
            const handled = this._processCommand(transcript);
            if (handled) {
              this.lastCommandTime = now;
              break;
            }
          }
        }
      }
    };
  }

  start() {
    if (!this.isSupported()) {
      this._showToast('Voice navigation requires Chrome, Edge, or Safari with Web Speech support.', true);
      return false;
    }
    this.manualStop = false;
    try {
      this.recognition.start();
      return true;
    } catch (e) {
      return false;
    }
  }

  stop() {
    this.manualStop = true;
    this.isActive = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.onStatusChange({ active: false, message: 'Voice Off' });
    this._showToast('Voice Control: Paused');
  }

  toggle() {
    if (this.isActive) {
      this.stop();
      return false;
    } else {
      return this.start();
    }
  }

  _processCommand(phrase) {
    // Normalise accents for Portuguese & French
    const clean = phrase
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    // 1. Next Slide
    if (
      clean.includes('next') ||
      clean.includes('proximo') ||
      clean.includes('avancar') ||
      clean.includes('seguir') ||
      clean.includes('suivant') ||
      clean.includes('frente')
    ) {
      this.onNavigateSlide(1, 'delta');
      this._showToast('🎙️ "Next" → Next Slide');
      return true;
    }

    // 2. Previous Slide
    if (
      clean.includes('previous') ||
      clean.includes('back') ||
      clean.includes('anterior') ||
      clean.includes('voltar') ||
      clean.includes('precedent') ||
      clean.includes('retour')
    ) {
      this.onNavigateSlide(-1, 'delta');
      this._showToast('🎙️ "Back" → Previous Slide');
      return true;
    }

    // 3. Direct Slide Number (1 to 7)
    const numMap = {
      'one': 1, 'um': 1, 'uma': 1, 'un': 1, '1': 1,
      'two': 2, 'dois': 2, 'duas': 2, 'deux': 2, '2': 2,
      'three': 3, 'tres': 3, 'trois': 3, '3': 3,
      'four': 4, 'quatro': 4, 'quatre': 4, '4': 4,
      'five': 5, 'cinco': 5, 'cinq': 5, '5': 5,
      'six': 6, 'seis': 6, 'six': 6, '6': 6,
      'seven': 7, 'sete': 7, 'sept': 7, '7': 7
    };

    for (const [word, num] of Object.entries(numMap)) {
      if (clean.includes(`slide ${word}`) || clean.includes(`pagina ${word}`) || clean.includes(`diapositiva ${word}`)) {
        this.onNavigateSlide(num, 'absolute');
        this._showToast(`🎙️ "Slide ${num}" → Jump to Slide ${num}`);
        return true;
      }
    }

    if (clean.includes('first slide') || clean.includes('primeiro slide') || clean.includes('cover')) {
      this.onNavigateSlide(1, 'absolute');
      this._showToast('🎙️ "Cover" → Slide 1');
      return true;
    }

    if (clean.includes('last slide') || clean.includes('ultimo slide') || clean.includes('questions') || clean.includes('questoes')) {
      this.onNavigateSlide(7, 'absolute');
      this._showToast('🎙️ "Questions" → Slide 7');
      return true;
    }

    // 4. 5-Second Visual Pause (Slide 5 · Figueiredo)
    if (clean.includes('pause') || clean.includes('pausa') || clean.includes('look') || clean.includes('olhar')) {
      this.onTogglePause();
      this._showToast('🎙️ "Pause" → 5s Visual Look (Slide 5)');
      return true;
    }

    // 5. Lectern Script / Lecture Notes Modal
    if (clean.includes('script') || clean.includes('lecture notes') || clean.includes('roteiro')) {
      this.onOpenScript();
      this._showToast('🎙️ "Script" → Lectern Script Notes');
      return true;
    }

    // 6. Presenter Tip / Podium Cues
    if (clean.includes('tip') || clean.includes('dica') || clean.includes('notes') || clean.includes('notas')) {
      this.onToggleTip();
      this._showToast('🎙️ "Notes" → Toggle Presenter Tip');
      return true;
    }

    // 7. Background Music
    if (clean.includes('music') || clean.includes('musica') || clean.includes('chopin') || clean.includes('piano')) {
      this.onToggleMusic();
      this._showToast('🎙️ "Music" → Toggle Chopin Nocturne');
      return true;
    }

    // 8. Four Powers (Slide 4 · Brazil 1824)
    if (clean.includes('powers') || clean.includes('poderes') || clean.includes('four powers') || clean.includes('quatro poderes') || clean.includes('tripartite')) {
      this.onTogglePowers();
      this._showToast('🎙️ "Powers" → Toggle 1824 Art. 10 Four Powers');
      return true;
    }

    // 9. Sword Detail (Slide 6 · Ceschiatti A Justiça)
    if (clean.includes('sword') || clean.includes('espada') || clean.includes('sculpture') || clean.includes('escultura')) {
      this.onToggleSword();
      this._showToast('🎙️ "Sword" → Toggle Ceschiatti Sword Detail');
      return true;
    }

    // 10. Stage Curtain
    if (clean.includes('curtain') || clean.includes('cortina') || clean.includes('poster')) {
      this.onToggleCurtain();
      this._showToast('🎙️ "Curtain" → Toggle Event Poster');
      return true;
    }

    return false;
  }

  _showToast(text, isError = false) {
    if (typeof document === 'undefined') return;

    if (!this.toastEl) {
      this.toastEl = document.createElement('div');
      this.toastEl.className = 'voice-cmd-toast';
      this.toastEl.setAttribute('role', 'status');
      this.toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(this.toastEl);
    }

    this.toastEl.textContent = text;
    this.toastEl.classList.toggle('voice-cmd-toast--error', Boolean(isError));
    this.toastEl.classList.add('is-visible');

    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      if (this.toastEl) {
        this.toastEl.classList.remove('is-visible');
      }
    }, 2400);
  }
}
