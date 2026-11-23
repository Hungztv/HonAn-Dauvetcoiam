import { SurfaceType, Vec3 } from '../types/game';

class HorrorAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambientNodes: AudioNode[] = [];
  private ambientIntervals: number[] = [];
  private noiseBuffer: AudioBuffer | null = null;
  private volume = 0.75;
  private musicVolume = 0.75;
  private sfxVolume = 0.85;
  private paused = false;
  private initialized = false;
  private activeTheme: string | null = null;

  public init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.musicGain.gain.value = this.musicVolume;
      this.sfxGain.gain.value = this.sfxVolume;
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      this.noiseBuffer = this.createNoiseBuffer(3);
      this.initialized = true;
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMasterVolume(v: number) {
    this.applyVolumes(v, this.musicVolume, this.sfxVolume);
  }

  public applyVolumes(master: number, music: number, sfx: number) {
    this.volume = Math.max(0, Math.min(1, master));
    this.musicVolume = Math.max(0, Math.min(1, music));
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const pauseScale = this.paused ? 0.18 : 1;
    if (this.masterGain) this.masterGain.gain.setTargetAtTime(this.volume * pauseScale, now, 0.05);
    if (this.musicGain) this.musicGain.gain.setTargetAtTime(this.musicVolume, now, 0.05);
    if (this.sfxGain) this.sfxGain.gain.setTargetAtTime(this.sfxVolume, now, 0.05);
  }

  public setPaused(paused: boolean) {
    this.paused = paused;
    this.applyVolumes(this.volume, this.musicVolume, this.sfxVolume);
  }

  public updateListener(pos: Vec3, forward: Vec3, up: Vec3) {
    if (!this.ctx || !this.initialized) return;
    const listener = this.ctx.listener;
    const now = this.ctx.currentTime;
    try {
      if (listener.positionX) {
        listener.positionX.setValueAtTime(pos[0], now);
        listener.positionY.setValueAtTime(pos[1], now);
        listener.positionZ.setValueAtTime(pos[2], now);
        listener.forwardX.setValueAtTime(forward[0], now);
        listener.forwardY.setValueAtTime(forward[1], now);
        listener.forwardZ.setValueAtTime(forward[2], now);
        listener.upX.setValueAtTime(up[0], now);
        listener.upY.setValueAtTime(up[1], now);
        listener.upZ.setValueAtTime(up[2], now);
      }
    } catch {
      // Fallback safely if browser audio listener API differs
    }
  }

  private createNoiseBuffer(seconds: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const rate = this.ctx.sampleRate;
    const length = rate * seconds;
    const buffer = this.ctx.createBuffer(1, length, rate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      // Brown-ish pink noise for smooth wind/rumble
      data[i] = (lastOut + 0.04 * white) / 1.04;
      lastOut = data[i];
      data[i] *= 2.8;
    }
    return buffer;
  }

  private createPanner(position?: Vec3, bus: 'music' | 'sfx' = 'sfx'): AudioNode {
    const targetBus = bus === 'music' ? this.musicGain : this.sfxGain;
    if (!this.ctx || !targetBus) {
      throw new Error('AudioContext not ready');
    }
    if (!position) return targetBus;
    const panner = this.ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 2.0;
    panner.maxDistance = 32;
    panner.rolloffFactor = 1.15;
    panner.positionX.value = position[0];
    panner.positionY.value = position[1];
    panner.positionZ.value = position[2];
    panner.connect(targetBus);
    return panner;
  }

  public startAmbient(theme: 'house' | 'shrine' | 'village' | 'temple' | 'river') {
    this.init();
    if (this.activeTheme === theme && this.ambientNodes.length > 0) return;
    this.stopAmbient();
    this.activeTheme = theme;
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;

    const now = this.ctx.currentTime;

    // 1. Eerie dark drone (two detuned low oscillators)
    const baseFreqs: Record<typeof theme, [number, number]> = {
      house: [55, 58.3],
      shrine: [61.7, 65.4],
      village: [49, 51.9],
      temple: [58.3, 61.7],
      river: [46.2, 49.0],
    };
    const [f1, f2] = baseFreqs[theme];

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.001, now);
    droneGain.gain.linearRampToValueAtTime(0.085, now + 2.5);

    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 180;

    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = f1;

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = f2;

    osc1.connect(droneFilter);
    osc2.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.musicGain ?? this.masterGain);

    osc1.start();
    osc2.start();
    this.ambientNodes.push(osc1, osc2, droneFilter, droneGain);

    // 2. Wind / Night rain air noise with slow LFO filter sweep
    const windSource = this.ctx.createBufferSource();
    windSource.buffer = this.noiseBuffer;
    windSource.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = theme === 'river' || theme === 'village' ? 580 : 420;
    windFilter.Q.value = theme === 'river' || theme === 'village' ? 0.85 : 1.6;

    const windLfo = this.ctx.createOscillator();
    windLfo.frequency.value = 0.14;
    const windLfoGain = this.ctx.createGain();
    windLfoGain.gain.value = 170;
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);

    const windGain = this.ctx.createGain();
    windGain.gain.value = theme === 'river' || theme === 'village' ? 0.17 : 0.11;

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.musicGain ?? this.masterGain);

    windSource.start();
    windLfo.start();
    this.ambientNodes.push(windSource, windFilter, windLfo, windLfoGain, windGain);

    // 3. Occasional crickets / night insects
    const cricketTimer = window.setInterval(() => {
      if (Math.random() < 0.55) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 6 + Math.random() * 10;
        this.playCricket([Math.cos(angle) * dist, 0.8, Math.sin(angle) * dist]);
      }
    }, 3400);
    this.ambientIntervals.push(cricketTimer);

    // 4. Periodic distant atmospheric textures (creaks, well drips, temple mõ)
    const detailTimer = window.setInterval(() => {
      const r = Math.random();
      const angle = Math.random() * Math.PI * 2;
      const dist = 5 + Math.random() * 12;
      const pos: Vec3 = [Math.cos(angle) * dist, 1.5, Math.sin(angle) * dist];
      if (theme === 'house' && r < 0.36) {
        // Spatialized dripping inside Level 1's backyard stone well!
        this.playWaterDrip([0, 0.5, 7.6]);
      } else if (r < 0.3) {
        this.playWaterDrip(pos);
      } else if (r < 0.62) {
        this.playWoodCreak(pos);
      } else if (r < 0.78 && (theme === 'shrine' || theme === 'temple')) {
        this.playWoodenFish(pos);
      }
    }, 5800);
    this.ambientIntervals.push(detailTimer);
  }

  public stopAmbient() {
    this.activeTheme = null;
    this.ambientIntervals.forEach((id) => window.clearInterval(id));
    this.ambientIntervals = [];
    this.ambientNodes.forEach((n) => {
      try {
        if ('stop' in n && typeof (n as OscillatorNode).stop === 'function') {
          (n as OscillatorNode).stop();
        }
        n.disconnect();
      } catch {
        // Ignore already stopped
      }
    });
    this.ambientNodes = [];
  }

  private playCricket(pos: Vec3) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const dest = this.createPanner(pos);
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 3900 + Math.random() * 600;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.085;
      gain.gain.linearRampToValueAtTime(0.018, t + 0.015);
      gain.gain.linearRampToValueAtTime(0, t + 0.065);
    }
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  public playFootstep(surface: SurfaceType, sprinting: boolean, pos?: Vec3) {
    this.init();
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;
    const dest = this.createPanner(pos);
    const vol = (sprinting ? 0.24 : 0.14) * (pos ? 1.4 : 1);

    // Filtered noise transient
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (surface === 'wood') {
      filter.type = 'bandpass';
      filter.frequency.value = 220 + Math.random() * 90;
      filter.Q.value = 2.2;
      // Add subtle hollow wooden thump
      const thump = this.ctx.createOscillator();
      thump.type = 'sine';
      thump.frequency.setValueAtTime(115 + Math.random() * 25, now);
      thump.frequency.exponentialRampToValueAtTime(48, now + 0.08);
      const tGain = this.ctx.createGain();
      tGain.gain.setValueAtTime(vol * 0.7, now);
      tGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      thump.connect(tGain);
      tGain.connect(dest);
      thump.start(now);
      thump.stop(now + 0.1);
    } else if (surface === 'stone') {
      filter.type = 'highpass';
      filter.frequency.value = 750 + Math.random() * 250;
    } else if (surface === 'water') {
      filter.type = 'bandpass';
      filter.frequency.value = 950 + Math.random() * 400;
      filter.Q.value = 0.9;
    } else {
      // dirt
      filter.type = 'lowpass';
      filter.frequency.value = 480 + Math.random() * 140;
    }

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (surface === 'water' ? 0.18 : 0.11));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start(now, Math.random() * 1.5, 0.2);
  }

  /** Tiếng mõ chùa (hollow wooden fish percussion) */
  public playWoodenFish(pos?: Vec3) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const dest = this.createPanner(pos);

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(640, now);
    osc.frequency.exponentialRampToValueAtTime(410, now + 0.09);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 540;
    filter.Q.value = 4.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  /** Tiếng chuông chùa ngân vang */
  public playTempleBell(pos?: Vec3) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const dest = this.createPanner(pos);
    const partials = [196, 392.8, 587.3, 830.6, 1174.6];
    partials.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = this.ctx.createGain();
      const peak = 0.16 / (idx + 1);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(peak, now + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0005, now + (4.2 - idx * 0.55));
      osc.connect(g);
      g.connect(dest);
      osc.start(now);
      osc.stop(now + 4.4);
    });
  }

  /** Tiếng nước nhỏ giọt */
  public playWaterDrip(pos?: Vec3) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const dest = this.createPanner(pos);
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    const base = 780 + Math.random() * 450;
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * 1.9, now + 0.065);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  /** Tiếng gỗ kẽo kẹt */
  public playWoodCreak(pos?: Vec3) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const dest = this.createPanner(pos);
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(92, now + 0.45);
    osc.frequency.linearRampToValueAtTime(125, now + 0.7);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 340;
    filter.Q.value = 6;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.78);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.8);
  }

  /** Tiếng gõ cửa / tiếng gõ từ đáy giếng (3 nhịp) */
  public playEerieKnock(pos?: Vec3) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const dest = this.createPanner(pos);
    [0, 0.34, 0.72].forEach((offset) => {
      if (!this.ctx) return;
      const t = now + offset;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(145, t);
      osc.frequency.exponentialRampToValueAtTime(52, t + 0.14);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.38, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.19);
      osc.connect(g);
      g.connect(dest);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  }

  /** Tiếng hát ru ngũ cung mơ hồ (haunting Vietnamese pentatonic ghost lullaby) */
  public playGhostLullaby(pos?: Vec3) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const dest = this.createPanner(pos);
    // Haunting minor pentatonic motif: A4 -> C5 -> D5 -> A4 -> G4
    const notes = [440, 523.25, 587.33, 440, 392];
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const t = now + i * 0.65;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      // Subtle eerie vibrato
      const vib = this.ctx.createOscillator();
      vib.frequency.value = 5.2;
      const vibGain = this.ctx.createGain();
      vibGain.gain.value = 4.5;
      vib.connect(vibGain);
      vibGain.connect(osc.frequency);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.065, t + 0.15);
      g.gain.exponentialRampToValueAtTime(0.0008, t + 0.62);

      osc.connect(g);
      g.connect(dest);
      osc.start(t);
      vib.start(t);
      osc.stop(t + 0.64);
      vib.stop(t + 0.64);
    });
  }

  public playDoorCreak() {
    this.playWoodCreak();
  }

  public playLockedDoor() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    [0, 0.11].forEach((off) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(110, now + off);
      osc.frequency.exponentialRampToValueAtTime(55, now + off + 0.08);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.14, now + off);
      g.gain.exponentialRampToValueAtTime(0.001, now + off + 0.09);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(now + off);
      osc.stop(now + off + 0.1);
    });
  }

  public playClick() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.035);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.12, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  public playEvidencePickup() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    [330, 440, 493.88].forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + i * 0.07;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.48);
    });
  }

  public playHotspotFound() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    [293.66, 440, 587.33].forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + i * 0.09;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.13, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.68);
    });
  }

  public playTierAdvance() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    // Deep gong + minor mystery chord
    [110, 164.81, 220, 261.63].forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 650;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.08, now + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0005, now + 2.4);
      osc.connect(f);
      f.connect(g);
      g.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 2.5);
    });
  }

  public playError() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(135, now);
    osc.frequency.linearRampToValueAtTime(92, now + 0.25);
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 340;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.18, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(f);
    f.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  /** High-impact 3D positional horror jumpscare sting emitted from exact NPC world position */
  public playJumpscare(
    variant: 'pale_bride' | 'statue_face' | 'faceless_ferryman' | 'blood_hands' = 'pale_bride',
    pos?: Vec3
  ) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const dest = this.createPanner(pos, 'sfx');

    // 1. Massive sub-bass impact
    const sub = this.ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(88, now);
    sub.frequency.exponentialRampToValueAtTime(26, now + 0.55);
    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.82, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    sub.connect(subGain);
    subGain.connect(this.sfxGain ?? this.masterGain);
    sub.start(now);
    sub.stop(now + 0.7);

    // 2. Spatialized spectral shriek / wood slam from NPC's 3D location
    const freqs =
      variant === 'pale_bride'
        ? [587, 622, 1175, 1245]
        : variant === 'statue_face'
        ? [210, 224, 440, 830]
        : variant === 'faceless_ferryman'
        ? [185, 261, 523, 740]
        : [311, 330, 932, 987];

    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(f * 1.08, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.78, now + 0.72);

      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(f * 1.4, now);
      bp.Q.value = 3.2;

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.18, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0008, now + 0.82);

      osc.connect(bp);
      bp.connect(g);
      g.connect(dest);
      osc.start(now);
      osc.stop(now + 0.85);
    });

    // 3. Harsh burst of spatial static / breath rush
    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 950;
      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(0.5, now);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
      noise.connect(hp);
      hp.connect(ng);
      ng.connect(dest);
      noise.start(now, 0, 0.55);
    }

    // 4. Rapid pounding heartbeat aftermath
    this.playHeartbeat(5, 0.65);
  }

  /** 3D Positional heavy raspy breathing emitted from NPC coordinates */
  public playSpatialBreathing(pos: Vec3) {
    this.init();
    if (!this.ctx || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;
    const dest = this.createPanner(pos, 'sfx');
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(620, now);
    bp.frequency.linearRampToValueAtTime(380, now + 0.9);
    bp.Q.value = 2.8;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.22, now + 0.28);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.05);
    noise.connect(bp);
    bp.connect(g);
    g.connect(dest);
    noise.start(now, Math.random() * 1.2, 1.1);
  }

  /** 3D Positional eerie cloth/wind disappearance whoosh */
  public playSpatialDisappear(pos: Vec3) {
    this.init();
    if (!this.ctx || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;
    const dest = this.createPanner(pos, 'sfx');
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1400, now);
    bp.frequency.exponentialRampToValueAtTime(190, now + 0.65);
    bp.Q.value = 1.8;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.28, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.68);
    noise.connect(bp);
    bp.connect(g);
    g.connect(dest);
    noise.start(now, 0.2, 0.72);
  }

  /** 3D Positional fingernail/wood wall scratching (Trần Thị Liên — Level 1) */
  public playWallScratching(pos: Vec3) {
    this.init();
    if (!this.ctx || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;
    const dest = this.createPanner(pos, 'sfx');
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.16;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1800 + i * 240, t);
      bp.frequency.exponentialRampToValueAtTime(750, t + 0.14);
      bp.Q.value = 5.5;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      noise.connect(bp);
      bp.connect(g);
      g.connect(dest);
      noise.start(t, Math.random() * 1.1, 0.16);
    }
  }

  /** 3D Positional dark well water bubbling (Hồn Đứa Trẻ — Level 3) */
  public playWaterBubble(pos: Vec3) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const dest = this.createPanner(pos, 'sfx');
    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.12 + Math.random() * 0.04;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      const baseFreq = 260 + Math.random() * 180;
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.1, t + 0.09);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.14, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(g);
      g.connect(dest);
      osc.start(t);
      osc.stop(t + 0.11);
    }
  }

  /** 3D Positional heavy lacquered wooden statue impact (4 Tượng Quan Gỗ — Level 4) */
  public playHeavyWoodImpact(pos: Vec3) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const dest = this.createPanner(pos, 'sfx');
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(118, now);
    osc.frequency.exponentialRampToValueAtTime(36, now + 0.24);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.42, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + 0.3);
    this.playWoodCreak(pos);
  }

  /** 3D Positional layered faceless passenger murmur (4 Hành Khách — Level 5) */
  public playCollectiveWhisper(pos: Vec3) {
    this.init();
    if (!this.ctx || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;
    const dest = this.createPanner(pos, 'sfx');
    [480, 740, 1080].forEach((freq, idx) => {
      if (!this.ctx || !this.noiseBuffer) return;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(freq, now + idx * 0.08);
      bp.Q.value = 6.0;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.001, now + idx * 0.08);
      g.gain.linearRampToValueAtTime(0.11, now + idx * 0.08 + 0.28);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 1.0);
      noise.connect(bp);
      bp.connect(g);
      g.connect(dest);
      noise.start(now + idx * 0.08, idx * 0.4, 1.05);
    });
  }

  /** 3D Positional wooden oar paddling water (Ông Lão Lái Đò — Level 5) */
  public playPaddleWater(pos: Vec3) {
    this.init();
    if (!this.ctx || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;
    const dest = this.createPanner(pos, 'sfx');
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'bandpass';
    lp.frequency.setValueAtTime(420, now);
    lp.frequency.linearRampToValueAtTime(860, now + 0.25);
    lp.frequency.exponentialRampToValueAtTime(280, now + 0.72);
    lp.Q.value = 1.4;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.16, now + 0.22);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    noise.connect(lp);
    lp.connect(g);
    g.connect(dest);
    noise.start(now, Math.random() * 1.1, 0.78);
  }

  public playHeartbeat(beats = 4, delaySec = 0) {
    if (!this.ctx || !this.masterGain) return;
    const base = this.ctx.currentTime + delaySec;
    for (let i = 0; i < beats; i++) {
      const t = base + i * 0.54;
      [0, 0.16].forEach((off, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 0 ? 64 : 52, t + off);
        osc.frequency.exponentialRampToValueAtTime(28, t + off + 0.12);
        const g = this.ctx.createGain();
        const peak = (idx === 0 ? 0.36 : 0.24) * (1 - i * 0.14);
        g.gain.setValueAtTime(Math.max(0.05, peak), t + off);
        g.gain.exponentialRampToValueAtTime(0.001, t + off + 0.14);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(t + off);
        osc.stop(t + off + 0.16);
      });
    }
  }
}

export const horrorAudio = new HorrorAudioEngine();
