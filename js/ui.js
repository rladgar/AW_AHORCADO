/**
 * ui.js - Capa de Presentación e Interacción con el DOM
 * Administra el renderizado reactivo, las transiciones de pantalla (Onboarding/Juego),
 * las animaciones CSS/SVG, el teclado virtual y los modales nativos <dialog>.
 */

class HangmanUI {
  constructor() {
    // Vistas principales
    this.viewWelcome = document.getElementById('view-welcome');
    this.viewGame = document.getElementById('view-game');

    // Botones de inicio y navegación
    this.btnWelcomeStart = document.getElementById('btn-welcome-start');
    this.btnRestart = document.getElementById('btn-restart');
    this.btnThemeToggle = document.getElementById('btn-theme-toggle');
    this.themeIconSvg = document.getElementById('theme-icon');
    this.elSoundToggle = document.getElementById('btn-sound-toggle');

    // Estado del tema activo
    this.currentTheme = 'light';

    // Marcador de bienvenida
    this.elWelcomeScoreMax = document.getElementById('welcome-score-max');

    // Referencias a marcadores del juego
    this.elScoreSession = document.getElementById('stat-score-session');
    this.elScoreLast = document.getElementById('stat-score-last');
    this.elScoreMax = document.getElementById('stat-score-max');
    this.elMissesCurrent = document.getElementById('stat-misses-current');
    this.elMissesMax = document.getElementById('stat-misses-max');
    this.elWordsRemaining = document.getElementById('stat-words-remaining');

    // Contenedores del tablero
    this.elWordSlots = document.getElementById('word-slots-container');
    this.elHangmanSvg = document.getElementById('hangman-svg');
    this.hangmanParts = [
      document.getElementById('part-1'),
      document.getElementById('part-2'),
      document.getElementById('part-3'),
      document.getElementById('part-4'),
      document.getElementById('part-5'),
      document.getElementById('part-6'),
      document.getElementById('part-7')
    ];

    // Formulario y teclado
    this.elLetterInput = document.getElementById('letter-input');
    this.elCheckBtn = document.getElementById('btn-check');
    this.elKeyboardContainer = document.getElementById('virtual-keyboard');

    // Modales nativos <dialog>
    this.modalVictory = document.getElementById('modal-victory');
    this.modalDefeat = document.getElementById('modal-defeat');
    this.victoryWord = document.getElementById('victory-word');
    this.victoryRoundScore = document.getElementById('victory-round-score');
    this.victoryTotalScore = document.getElementById('victory-total-score');
    this.defeatWord = document.getElementById('defeat-word');
    this.defeatTotalScore = document.getElementById('defeat-total-score');
    this.btnVictoryNext = document.getElementById('btn-victory-next');
    this.btnDefeatNext = document.getElementById('btn-defeat-next');

    // Distribución ergonómica del teclado español
    this.keyboardRows = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];

    this.keyElements = new Map();
  }

  /**
   * Inicializa la interfaz, el tema de color y genera el teclado en pantalla
   */
  init() {
    this.initTheme();
    this.renderKeyboard();
    this.setControlsEnabled(false);
    this.resetHangmanSvg();
  }

  /**
   * Inicializa el tema de color comprobando localStorage o la preferencia del sistema operativo
   */
  initTheme() {
    let savedTheme = null;
    try {
      savedTheme = localStorage.getItem('theme');
    } catch (e) {
      console.warn('Acceso a localStorage restringido:', e);
    }

    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(prefersDark ? 'dark' : 'light');
    }

    // Escuchar cambios de preferencia del sistema si el usuario no ha forzado manualmente el tema
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        try {
          if (!localStorage.getItem('theme')) {
            this.applyTheme(e.matches ? 'dark' : 'light');
          }
        } catch (_) {}
      });
    }
  }

  /**
   * Aplica el atributo de tema en el elemento raíz y actualiza el icono SVG
   * @param {'light'|'dark'} theme 
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;

    if (this.themeIconSvg) {
      if (theme === 'dark') {
        // Icono de Luna para representar el modo oscuro
        this.themeIconSvg.innerHTML = `
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        `;
      } else {
        // Icono de Sol para representar el modo claro
        this.themeIconSvg.innerHTML = `
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `;
      }
    }

    if (this.btnThemeToggle) {
      this.btnThemeToggle.setAttribute(
        'title',
        theme === 'dark' ? 'Modo Oscuro activo (cambiar a claro)' : 'Modo Claro activo (cambiar a oscuro)'
      );
    }
  }

  /**
   * Alterna dinámicamente entre modo claro y modo oscuro y lo persiste en localStorage
   */
  toggleTheme() {
    const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
    try {
      localStorage.setItem('theme', nextTheme);
    } catch (e) {
      console.warn('Error al guardar el tema en localStorage:', e);
    }
  }

  /**
   * Muestra la pantalla de juego con transición y revela el botón de reinicio
   */
  showGameView() {
    if (this.viewWelcome) {
      this.viewWelcome.classList.remove('active');
      this.viewWelcome.classList.add('hidden');
    }
    if (this.viewGame) {
      this.viewGame.classList.remove('hidden');
      // Forzar ciclo de render para activar la transición CSS
      void this.viewGame.offsetWidth;
      this.viewGame.classList.add('active');
    }
    if (this.btnRestart) {
      this.btnRestart.classList.remove('hidden');
    }
  }

  /**
   * Muestra la pantalla de bienvenida y oculta el botón de reinicio
   */
  showWelcomeView() {
    if (this.viewGame) {
      this.viewGame.classList.remove('active');
      this.viewGame.classList.add('hidden');
    }
    if (this.viewWelcome) {
      this.viewWelcome.classList.remove('hidden');
      void this.viewWelcome.offsetWidth;
      this.viewWelcome.classList.add('active');
    }
    if (this.btnRestart) {
      this.btnRestart.classList.add('hidden');
    }
  }

  /**
   * Construye las filas y botones del teclado virtual
   */
  renderKeyboard() {
    if (!this.elKeyboardContainer) return;
    this.elKeyboardContainer.innerHTML = '';
    this.keyElements.clear();

    this.keyboardRows.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'keyboard-row';

      row.forEach(char => {
        const keyBtn = document.createElement('button');
        keyBtn.type = 'button';
        keyBtn.className = 'virtual-key';
        keyBtn.textContent = char;
        keyBtn.dataset.key = char;
        keyBtn.setAttribute('aria-label', `Letra ${char}`);
        keyBtn.disabled = true;

        this.keyElements.set(char, keyBtn);
        rowDiv.appendChild(keyBtn);
      });

      this.elKeyboardContainer.appendChild(rowDiv);
    });
  }

  /**
   * Habilita o deshabilita los controles de juego (formulario y teclado)
   * @param {boolean} enabled 
   */
  setControlsEnabled(enabled) {
    if (this.elLetterInput) {
      this.elLetterInput.disabled = !enabled;
      if (enabled) {
        this.elLetterInput.focus();
      } else {
        this.elLetterInput.value = '';
      }
    }

    if (this.elCheckBtn) {
      this.elCheckBtn.disabled = !enabled;
    }

    // Habilitar o deshabilitar teclas no jugadas
    this.keyElements.forEach(btn => {
      if (!enabled) {
        btn.disabled = true;
      } else {
        const alreadyPlayed = btn.classList.contains('key-hit') || btn.classList.contains('key-miss');
        btn.disabled = alreadyPlayed;
      }
    });
  }

  /**
   * Renderiza las casillas de texto individuales horizontales para la palabra asignada
   * @param {number} wordLength 
   */
  renderWordSlots(wordLength) {
    if (!this.elWordSlots) return;
    this.elWordSlots.innerHTML = '';
    for (let i = 0; i < wordLength; i++) {
      const slot = document.createElement('input');
      slot.type = 'text';
      slot.className = 'word-slot';
      slot.readOnly = true;
      slot.tabIndex = -1;
      slot.maxLength = 1;
      slot.value = '';
      slot.setAttribute('aria-label', `Letra ${i + 1} de ${wordLength}`);
      this.elWordSlots.appendChild(slot);
    }
  }

  /**
   * Revela una letra en los índices especificados con microanimación
   * @param {number[]} positions 
   * @param {string} letter 
   */
  revealLetterPositions(positions, letter) {
    if (!this.elWordSlots) return;
    const slots = this.elWordSlots.querySelectorAll('.word-slot');
    positions.forEach(pos => {
      if (slots[pos]) {
        slots[pos].value = letter;
        slots[pos].classList.add('revealed', 'pop-in');
        setTimeout(() => slots[pos].classList.remove('pop-in'), 300);
      }
    });
  }

  /**
   * Revela la palabra completa al terminar la ronda (utilizado en derrota)
   * @param {string} fullWord 
   */
  revealFullSecretWord(fullWord) {
    if (!this.elWordSlots) return;
    const slots = this.elWordSlots.querySelectorAll('.word-slot');
    [...fullWord].forEach((char, index) => {
      if (slots[index]) {
        if (!slots[index].value) {
          slots[index].value = char;
          slots[index].classList.add('missed-reveal');
        }
      }
    });
  }

  /**
   * Actualiza el dibujo del ahorcado según el número de fallos actuales
   * Asigna la clase .drawn progresivamente a los 7 elementos
   * @param {number} misses 
   */
  updateHangmanSvg(misses) {
    this.hangmanParts.forEach((part, index) => {
      if (part) {
        if (index < misses) {
          part.classList.add('drawn');
        } else {
          part.classList.remove('drawn');
        }
      }
    });
  }

  /**
   * Resetea el dibujo del ahorcado a su estado totalmente vacío
   */
  resetHangmanSvg() {
    this.hangmanParts.forEach(part => {
      if (part) {
        part.classList.remove('drawn');
      }
    });
  }

  /**
   * Actualiza el estado visual de una tecla en el teclado virtual
   * @param {string} letter 
   * @param {boolean} isHit 
   */
  markVirtualKey(letter, isHit) {
    const btn = this.keyElements.get(letter.toUpperCase());
    if (btn) {
      btn.disabled = true;
      btn.classList.add(isHit ? 'key-hit' : 'key-miss');
    }
  }

  /**
   * Resetea las clases de todo el teclado virtual
   */
  resetVirtualKeyboard() {
    this.keyElements.forEach(btn => {
      btn.className = 'virtual-key';
      btn.disabled = true;
    });
  }

  /**
   * Dispara la microinteracción de sacudida (shake CSS de 0.3s) con borde temporal rojo
   */
  triggerShakeError() {
    if (!this.elLetterInput) return;
    this.elLetterInput.value = '';
    this.elLetterInput.classList.remove('shake-error');
    
    void this.elLetterInput.offsetWidth;
    this.elLetterInput.classList.add('shake-error');

    setTimeout(() => {
      if (this.elLetterInput) {
        this.elLetterInput.classList.remove('shake-error');
        this.elLetterInput.focus();
      }
    }, 300);
  }

  /**
   * Actualiza los marcadores en pantalla con valores reactivos
   * @param {object} stats 
   */
  updateScoreboard(stats) {
    if (this.elScoreSession) this.elScoreSession.textContent = stats.scoreSession ?? 0;
    if (this.elScoreLast) this.elScoreLast.textContent = stats.scoreLastPlay ?? 0;
    if (this.elScoreMax) this.elScoreMax.textContent = stats.scoreMax ?? 0;
    if (this.elMissesCurrent) this.elMissesCurrent.textContent = stats.misses ?? 0;
    if (this.elMissesMax) this.elMissesMax.textContent = stats.maxMisses ?? 7;
    if (this.elWordsRemaining) this.elWordsRemaining.textContent = stats.wordsRemaining ?? 0;
    if (this.elWelcomeScoreMax) this.elWelcomeScoreMax.textContent = stats.scoreMax ?? 0;
  }

  /**
   * Muestra la ventana emergente nativa <dialog> de Victoria
   * @param {string} word 
   * @param {number} roundScore 
   * @param {number} totalScore 
   */
  showVictoryModal(word, roundScore, totalScore) {
    if (this.victoryWord) this.victoryWord.textContent = word;
    if (this.victoryRoundScore) this.victoryRoundScore.textContent = roundScore;
    if (this.victoryTotalScore) this.victoryTotalScore.textContent = totalScore;
    if (this.modalVictory && typeof this.modalVictory.showModal === 'function') {
      this.modalVictory.showModal();
    }
  }

  /**
   * Cierra el modal de victoria
   */
  closeVictoryModal() {
    if (this.modalVictory && this.modalVictory.open) {
      this.modalVictory.close();
    }
  }

  /**
   * Muestra la ventana emergente nativa <dialog> de Derrota
   * @param {string} word 
   * @param {number} totalScore 
   */
  showDefeatModal(word, totalScore) {
    if (this.defeatWord) this.defeatWord.textContent = word;
    if (this.defeatTotalScore) this.defeatTotalScore.textContent = totalScore;
    if (this.modalDefeat && typeof this.modalDefeat.showModal === 'function') {
      this.modalDefeat.showModal();
    }
  }

  /**
   * Cierra el modal de derrota
   */
  closeDefeatModal() {
    if (this.modalDefeat && this.modalDefeat.open) {
      this.modalDefeat.close();
    }
  }

  /**
   * Inhabilita el botón de reinicio al agotarse las palabras
   */
  disableStartButtonDueToNoWords() {
    if (this.btnRestart) {
      this.btnRestart.disabled = true;
      this.btnRestart.textContent = 'Palabras agotadas';
    }
    if (this.btnWelcomeStart) {
      this.btnWelcomeStart.disabled = true;
      this.btnWelcomeStart.textContent = 'Palabras agotadas';
    }
  }
}

window.HangmanUI = HangmanUI;
