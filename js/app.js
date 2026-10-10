/**
 * app.js - Orquestador Principal de la Aplicación del Ahorcado
 * Enlaza el modelo de negocio, el sintetizador de sonido, el flujo de pantallas y la UI.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const game = new HangmanGame();
  const ui = new HangmanUI();
  const sound = new SoundSynthesizer();

  // Inicialización de la capa visual y controles
  ui.init();

  // Carga asíncrona del banco de palabras
  try {
    const response = await fetch('words.json');
    if (!response.ok) {
      throw new Error(`Error HTTP al cargar words.json: ${response.status}`);
    }
    const words = await response.json();
    game.initWords(words);

    // Actualizar marcadores iniciales en pantalla de bienvenida y tablero
    ui.updateScoreboard({
      scoreSession: game.scoreSession,
      scoreLastPlay: game.scoreLastPlay,
      scoreMax: game.scoreMax,
      misses: game.misses,
      maxMisses: HangmanGame.MAX_MISSES,
      wordsRemaining: game.wordsRemaining
    });
  } catch (error) {
    console.error('Error crítico al cargar las palabras del juego:', error);
    alert('No se pudo cargar el diccionario de palabras (words.json). Por favor, refresca la página.');
    return;
  }

  /**
   * Procesa la entrada de una letra candidata
   * @param {string} rawChar 
   */
  function handlePlay(rawChar) {
    if (!game.isPlaying) return;

    // Validación preliminar estricta
    const validation = game.validateInput(rawChar);
    if (!validation.isValid) {
      ui.triggerShakeError();
      return;
    }

    // Ejecución de la jugada en el modelo de negocio
    const result = game.guess(rawChar);

    if (result.status === 'INVALID_INPUT') {
      ui.triggerShakeError();
      return;
    }

    if (result.status === 'HIT') {
      sound.playHit();
      ui.revealLetterPositions(result.revealedPositions, result.letter);
      ui.markVirtualKey(result.letter, true);
      ui.updateScoreboard({
        scoreSession: result.scoreSession,
        scoreLastPlay: result.scoreLastPlay,
        scoreMax: result.scoreMax,
        misses: result.misses,
        maxMisses: HangmanGame.MAX_MISSES,
        wordsRemaining: game.wordsRemaining
      });

      if (result.isWon) {
        sound.playWin();
        ui.setControlsEnabled(false);
        if (game.wordsRemaining === 0) {
          ui.disableStartButtonDueToNoWords();
        }
        // Retardo sutil para apreciar la última letra completada antes de abrir el modal
        setTimeout(() => {
          ui.showVictoryModal(game.currentWord, result.roundScore, result.scoreSession);
        }, 350);
      }
    } else if (result.status === 'MISS') {
      sound.playMiss();
      ui.updateHangmanSvg(result.misses);
      ui.markVirtualKey(result.letter, false);
      ui.updateScoreboard({
        scoreSession: result.scoreSession,
        scoreLastPlay: result.scoreLastPlay,
        scoreMax: result.scoreMax,
        misses: result.misses,
        maxMisses: HangmanGame.MAX_MISSES,
        wordsRemaining: game.wordsRemaining
      });

      if (result.isLost) {
        sound.playLoss();
        ui.revealFullSecretWord(game.currentWord);
        ui.setControlsEnabled(false);
        if (game.wordsRemaining === 0) {
          ui.disableStartButtonDueToNoWords();
        }
        setTimeout(() => {
          ui.showDefeatModal(game.currentWord, result.scoreSession);
        }, 450);
      }
    }

    // Limpiar siempre el input y mantener foco si el juego continúa
    if (game.isPlaying) {
      ui.elLetterInput.value = '';
      ui.elLetterInput.focus();
    }
  }

  /**
   * Inicia o reinicia una ronda de juego
   */
  function startRound() {
    if (game.wordsRemaining === 0) {
      ui.disableStartButtonDueToNoWords();
      return;
    }

    const started = game.startNewRound();
    if (!started) {
      ui.disableStartButtonDueToNoWords();
      return;
    }

    // Configuración completa de la UI para la nueva partida
    ui.resetHangmanSvg();
    ui.resetVirtualKeyboard();
    ui.renderWordSlots(game.currentWord.length);
    ui.setControlsEnabled(true);

    ui.updateScoreboard({
      scoreSession: game.scoreSession,
      scoreLastPlay: game.scoreLastPlay,
      scoreMax: game.scoreMax,
      misses: game.misses,
      maxMisses: HangmanGame.MAX_MISSES,
      wordsRemaining: game.wordsRemaining
    });
  }

  // --- EVENT LISTENERS ---

  // 1. Botón "Comenzar Partida" desde la vista de bienvenida (Onboarding)
  if (ui.btnWelcomeStart) {
    ui.btnWelcomeStart.addEventListener('click', () => {
      sound.initContext();
      ui.showGameView();
      startRound();
    });
  }

  // 2. Botón secundario en cabecera "Reiniciar Ronda"
  if (ui.btnRestart) {
    ui.btnRestart.addEventListener('click', () => {
      sound.initContext();
      startRound();
    });
  }

  // 3. Formulario y botón "Comprobar Letra"
  const formElement = document.getElementById('guess-form');
  if (formElement) {
    formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      sound.initContext();
      const val = ui.elLetterInput.value;
      handlePlay(val);
    });
  }

  // 4. Teclado interactivo en pantalla
  if (ui.elKeyboardContainer) {
    ui.elKeyboardContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.virtual-key');
      if (!btn || btn.disabled) return;
      sound.initContext();
      const letter = btn.dataset.key;
      handlePlay(letter);
    });
  }

  // 5. Teclado físico global (keydown)
  window.addEventListener('keydown', (e) => {
    // Si la partida no está activa o hay un modal abierto, ignorar
    if (!game.isPlaying) return;
    if ((ui.modalVictory && ui.modalVictory.open) || (ui.modalDefeat && ui.modalDefeat.open)) {
      return;
    }

    // Tecla Enter la gestiona el formulario
    if (e.key === 'Enter') return;

    // Teclas modificadoras o teclas de control (Tab, Escape, etc.)
    if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) {
      return;
    }

    sound.initContext();
    e.preventDefault();
    handlePlay(e.key);
  });

  // 6. Botones de acción en modales nativos <dialog>
  if (ui.btnVictoryNext) {
    ui.btnVictoryNext.addEventListener('click', () => {
      ui.closeVictoryModal();
      startRound();
    });
  }

  if (ui.btnDefeatNext) {
    ui.btnDefeatNext.addEventListener('click', () => {
      ui.closeDefeatModal();
      startRound();
    });
  }

  // 7. Conmutador de audio (Mute/Unmute)
  if (ui.elSoundToggle) {
    ui.elSoundToggle.addEventListener('click', () => {
      sound.isMuted = !sound.isMuted;
      ui.elSoundToggle.classList.toggle('muted', sound.isMuted);
      ui.elSoundToggle.setAttribute('aria-label', sound.isMuted ? 'Activar sonido' : 'Silenciar sonido');
      const icon = ui.elSoundToggle.querySelector('.sound-icon');
      if (icon) {
        icon.textContent = sound.isMuted ? '🔇' : '🔊';
      }
    });
  }

  // 8. Conmutador de tema de color (Modo Claro / Modo Oscuro)
  if (ui.btnThemeToggle) {
    ui.btnThemeToggle.addEventListener('click', () => {
      ui.toggleTheme();
    });
  }
});
