/**
 * audio.js - Sintetizador de audio nativo mediante Web Audio API
 * Genera tonos y efectos acústicos discretos sin dependencias externas.
 */

class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  /**
   * Inicializa el contexto de audio perezosamente tras la primera interacción del usuario
   * para cumplir con las políticas de autoplay de navegadores modernos.
   */
  initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Sonido de acierto: Tono armónico ascendente dulce (Do5 -> Mi5)
   */
  playHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Sonido de fallo: Tono descendente y sutilmente amortiguado (190Hz -> 120Hz)
   */
  playMiss() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.22);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Sonido de victoria: Arpegio triunfal breve y festivo (Do5 - Mi5 - Sol5 - Do6)
   */
  playWin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const startTime = now + idx * 0.1;
      const duration = 0.35;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  /**
   * Sonido de derrota: Cadencia menor descendente reflexiva (Re4 - Do4 - Sib3 - La3)
   */
  playLoss() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [293.66, 261.63, 233.08, 220.00];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const startTime = now + idx * 0.16;
      const duration = 0.32;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);

      // Filtro paso bajo para suavizar el timbre del sinte
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, startTime);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }
}

// Exportar como objeto global o módulo ES
window.SoundSynthesizer = SoundSynthesizer;
