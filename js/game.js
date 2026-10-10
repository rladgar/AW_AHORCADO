/**
 * game.js - Capa de Modelo y Lógica de Negocio Pura
 * Totalmente desacoplada de la interfaz de usuario (DOM).
 */

class HangmanGame {
  static MAX_MISSES = 7;
  static INPUT_REGEX = /^[a-zA-ZñÑ]$/;
  static STORAGE_RECORD_KEY = 'ahorcado_max_score_record';

  constructor() {
    this.wordsPool = [];
    this.currentWord = '';
    this.guessedLetters = new Set();
    this.misses = 0;
    
    // Marcadores y métricas reactivas
    this.scoreSession = 0;
    this.scoreLastPlay = 0;
    this.roundScore = 0;
    this.scoreMax = this.loadMaxScore();
    
    // Estado de partida
    this.isPlaying = false;
    this.isWon = false;
    this.isLost = false;
  }

  /**
   * Carga la lista inicial de palabras en el pool activo
   * @param {string[]} words 
   */
  initWords(words) {
    if (!Array.isArray(words) || words.length === 0) {
      throw new Error('El banco de palabras suministrado es inválido o está vacío.');
    }
    // Clonamos para mutar con splice durante la partida
    this.wordsPool = [...words];
  }

  /**
   * Obtiene el récord guardado en localStorage
   * @returns {number}
   */
  loadMaxScore() {
    try {
      const stored = localStorage.getItem(HangmanGame.STORAGE_RECORD_KEY);
      return stored ? parseInt(stored, 10) || 0 : 0;
    } catch (e) {
      console.warn('Acceso a localStorage no disponible:', e);
      return 0;
    }
  }

  /**
   * Persiste el nuevo récord en localStorage si supera el actual
   */
  updateMaxScore() {
    if (this.scoreSession > this.scoreMax) {
      this.scoreMax = this.scoreSession;
      try {
        localStorage.setItem(HangmanGame.STORAGE_RECORD_KEY, this.scoreMax.toString());
      } catch (e) {
        console.warn('Error al guardar en localStorage:', e);
      }
    }
  }

  /**
   * Cantidad de palabras restantes en el array activo
   * @returns {number}
   */
  get wordsRemaining() {
    return this.wordsPool.length;
  }

  /**
   * Inicia una nueva ronda extrayendo una palabra aleatoria con .splice()
   * @returns {boolean} True si la ronda se inició con éxito, False si no quedan palabras
   */
  startNewRound() {
    if (this.wordsRemaining === 0) {
      this.isPlaying = false;
      return false;
    }

    // Extracción aleatoria permanente mediante .splice()
    const randomIndex = Math.floor(Math.random() * this.wordsPool.length);
    this.currentWord = this.wordsPool.splice(randomIndex, 1)[0].toUpperCase();

    // Reseteo estricto del estado de la ronda
    this.misses = 0;
    this.guessedLetters.clear();
    this.roundScore = 0;
    this.scoreLastPlay = 0;
    this.isWon = false;
    this.isLost = false;
    this.isPlaying = true;

    return true;
  }

  /**
   * Valida la letra candidata según especificaciones exactas:
   * - Solo 1 carácter permitido.
   * - Debe coincidir con /^[a-zA-ZñÑ]$/.
   * - Rechazo explícito de tildes (á, é, í, ó, ú), diéresis, números o caracteres especiales.
   * - No debe haber sido jugada previamente en la ronda activa.
   * 
   * @param {string} rawInput 
   * @returns {{ isValid: boolean, reason?: string, normalizedLetter?: string }}
   */
  validateInput(rawInput) {
    if (typeof rawInput !== 'string') {
      return { isValid: false, reason: 'INVALID_TYPE' };
    }

    const trimmed = rawInput.trim();

    // Verificación estricta de longitud 1
    if (trimmed.length !== 1) {
      return { isValid: false, reason: 'INVALID_LENGTH' };
    }

    // Comprobación de expresión regular obligatoria
    if (!HangmanGame.INPUT_REGEX.test(trimmed)) {
      return { isValid: false, reason: 'DISALLOWED_CHARACTER' };
    }

    const normalizedLetter = trimmed.toUpperCase();

    // Verificación de letra repetida / ya descubierta o fallada
    if (this.guessedLetters.has(normalizedLetter)) {
      return { isValid: false, reason: 'ALREADY_GUESSED', normalizedLetter };
    }

    return { isValid: true, normalizedLetter };
  }

  /**
   * Procesa un turno de juego con una letra dada
   * @param {string} rawInput 
   * @returns {object} Resultado completo de la jugada
   */
  guess(rawInput) {
    if (!this.isPlaying || this.isWon || this.isLost) {
      return { status: 'INACTIVE_GAME' };
    }

    const validation = this.validateInput(rawInput);
    if (!validation.isValid) {
      return {
        status: 'INVALID_INPUT',
        reason: validation.reason,
        normalizedLetter: validation.normalizedLetter
      };
    }

    const letter = validation.normalizedLetter;
    this.guessedLetters.add(letter);

    // Conteo de apariciones de la letra en la palabra secreta
    let occurrences = 0;
    for (let i = 0; i < this.currentWord.length; i++) {
      if (this.currentWord[i] === letter) {
        occurrences++;
      }
    }

    if (occurrences > 0) {
      // ACIEERTO:
      // Puntos Jugada = (Num. letras acertadas en el turno) * (7 - N.º fallos cometidos hasta el momento)
      const points = occurrences * (HangmanGame.MAX_MISSES - this.misses);
      this.scoreLastPlay = points;
      this.roundScore += points;
      this.scoreSession += points;
      this.updateMaxScore();

      // Comprobar si se ha completado la palabra entera
      const isWordComplete = [...this.currentWord].every(char => this.guessedLetters.has(char));
      if (isWordComplete) {
        this.isWon = true;
        this.isPlaying = false;
      }

      return {
        status: 'HIT',
        letter,
        occurrences,
        pointsAwarded: points,
        scoreSession: this.scoreSession,
        scoreLastPlay: this.scoreLastPlay,
        scoreMax: this.scoreMax,
        roundScore: this.roundScore,
        misses: this.misses,
        isWon: this.isWon,
        isLost: false,
        revealedPositions: this.getRevealedPositions(letter)
      };
    } else {
      // FALLO:
      this.misses++;
      this.scoreLastPlay = 0; // Solo los aciertos suman puntos en última jugada

      if (this.misses >= HangmanGame.MAX_MISSES) {
        this.isLost = true;
        this.isPlaying = false;
      }

      return {
        status: 'MISS',
        letter,
        occurrences: 0,
        pointsAwarded: 0,
        scoreSession: this.scoreSession,
        scoreLastPlay: this.scoreLastPlay,
        scoreMax: this.scoreMax,
        roundScore: this.roundScore,
        misses: this.misses,
        isWon: false,
        isLost: this.isLost
      };
    }
  }

  /**
   * Obtiene los índices donde aparece la letra acertada en la palabra actual
   * @param {string} letter 
   * @returns {number[]}
   */
  getRevealedPositions(letter) {
    const positions = [];
    for (let i = 0; i < this.currentWord.length; i++) {
      if (this.currentWord[i] === letter) {
        positions.push(i);
      }
    }
    return positions;
  }

  /**
   * Retorna el estado actual de los caracteres de la palabra (letras o nulos)
   * @returns {Array<string|null>}
   */
  getWordDisplayState() {
    if (!this.currentWord) return [];
    return [...this.currentWord].map(char => (this.guessedLetters.has(char) ? char : null));
  }
}

window.HangmanGame = HangmanGame;
