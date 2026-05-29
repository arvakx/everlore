/**
 * Everlore — Web Audio engine.
 * Procedural ambient soundscapes for writers. No external files.
 * Categorías musicales = pads sintéticos suaves.
 * Capas ambientales = ruidos filtrados (lluvia, viento, fuego, etc).
 */

import { useEffect, useState, useSyncExternalStore } from "react";

// ============ Types ============
export type MusicCategoryId =
  | "fantasia-epica" | "biblioteca-magica" | "lluvia-nocturna" | "piano-emocional"
  | "bosque-encantado" | "medieval" | "scifi-atmosferico" | "cafe-nocturno"
  | "velas-tormenta" | "lofi-escritura" | "mar-niebla" | "santuario-arcano"
  | "espacio-profundo" | "ruinas-antiguas" | "viento-hojas" | "misterio"
  | "celestial" | "cozy" | "cinematografico";

export type LayerId =
  | "lluvia" | "fuego" | "viento" | "trueno" | "papel" | "paginas"
  | "bosque" | "cafe" | "susurros" | "agua" | "teclado";

export interface MusicCategory {
  id: MusicCategoryId;
  name: string;
  mood: string;
  /** Base frequencies (Hz) for pad chord */
  chord: number[];
  /** Oscillator wave */
  wave: OscillatorType;
  /** Low-pass cutoff */
  filter: number;
  /** LFO speed for movement */
  lfoSpeed: number;
  /** Optional bell tone every N seconds (0 = off) */
  bellEvery?: number;
  /** Suggested ambient layers to mix in by default */
  layers?: LayerId[];
  /** Visual immersion to suggest pairing with */
  immersionHint?: string;
  /** Hue 0-360 for visual accent */
  hue: number;
}

export interface LayerDef {
  id: LayerId;
  name: string;
  description: string;
}

// ============ Catalog ============
export const MUSIC_CATEGORIES: MusicCategory[] = [
  { id: "fantasia-epica",     name: "Fantasía épica suave",      mood: "épico, cálido",      chord: [220, 277.18, 329.63, 415.30],  wave: "triangle", filter: 900,  lfoSpeed: 0.06, bellEvery: 12, hue: 145 },
  { id: "biblioteca-magica",  name: "Biblioteca mágica",         mood: "místico, sereno",    chord: [196, 246.94, 293.66],          wave: "sine",     filter: 700,  lfoSpeed: 0.04, bellEvery: 18, layers: ["paginas", "papel"], hue: 165 },
  { id: "lluvia-nocturna",    name: "Lluvia nocturna",           mood: "íntimo, calmo",      chord: [146.83, 174.61, 220],          wave: "sine",     filter: 600,  lfoSpeed: 0.03, layers: ["lluvia", "trueno"], hue: 210 },
  { id: "piano-emocional",    name: "Piano emocional",           mood: "melancólico",        chord: [261.63, 329.63, 392, 493.88],  wave: "triangle", filter: 1200, lfoSpeed: 0.05, bellEvery: 8,  hue: 280 },
  { id: "bosque-encantado",   name: "Bosque encantado",          mood: "natural, mágico",    chord: [174.61, 220, 261.63],          wave: "sine",     filter: 800,  lfoSpeed: 0.07, bellEvery: 14, layers: ["bosque", "viento"], hue: 130 },
  { id: "medieval",           name: "Ambiente medieval",         mood: "antiguo, noble",     chord: [196, 261.63, 311.13],          wave: "triangle", filter: 1000, lfoSpeed: 0.05, layers: ["fuego"], hue: 35 },
  { id: "scifi-atmosferico",  name: "Sci-fi atmosférico",        mood: "futurista, frío",    chord: [110, 164.81, 220, 277.18],     wave: "sawtooth", filter: 700,  lfoSpeed: 0.08, hue: 195 },
  { id: "cafe-nocturno",      name: "Café nocturno",             mood: "cálido, urbano",     chord: [220, 277.18, 329.63],          wave: "triangle", filter: 1100, lfoSpeed: 0.06, layers: ["cafe", "lluvia"], hue: 30 },
  { id: "velas-tormenta",     name: "Velas y tormenta",          mood: "íntimo, dramático",  chord: [130.81, 174.61, 220],          wave: "sine",     filter: 600,  lfoSpeed: 0.04, layers: ["fuego", "lluvia", "trueno"], hue: 25 },
  { id: "lofi-escritura",     name: "Lo-fi de escritura",        mood: "cozy, focus",        chord: [196, 246.94, 311.13, 369.99],  wave: "triangle", filter: 1300, lfoSpeed: 0.1,  hue: 290 },
  { id: "mar-niebla",         name: "Mar y niebla",              mood: "vasto, sereno",      chord: [110, 146.83, 196],             wave: "sine",     filter: 500,  lfoSpeed: 0.03, layers: ["agua", "viento"], hue: 200 },
  { id: "santuario-arcano",   name: "Santuario arcano",          mood: "arcano, ritual",     chord: [110, 138.59, 207.65, 261.63],  wave: "triangle", filter: 800,  lfoSpeed: 0.05, bellEvery: 10, layers: ["susurros"], hue: 270 },
  { id: "espacio-profundo",   name: "Espacio profundo",          mood: "cósmico, infinito",  chord: [82.41, 110, 164.81],           wave: "sine",     filter: 500,  lfoSpeed: 0.02, hue: 250 },
  { id: "ruinas-antiguas",    name: "Ruinas antiguas",           mood: "olvidado, vasto",    chord: [98, 146.83, 220],              wave: "triangle", filter: 700,  lfoSpeed: 0.04, layers: ["viento"], hue: 50 },
  { id: "viento-hojas",       name: "Viento y hojas",            mood: "ligero, etéreo",     chord: [220, 293.66, 369.99],          wave: "sine",     filter: 1000, lfoSpeed: 0.08, layers: ["viento", "bosque"], hue: 110 },
  { id: "misterio",           name: "Ambiente de misterio",      mood: "tenso, contenido",   chord: [130.81, 196, 233.08],          wave: "triangle", filter: 600,  lfoSpeed: 0.04, layers: ["susurros", "viento"], hue: 240 },
  { id: "celestial",          name: "Música celestial",          mood: "luminoso, divino",   chord: [261.63, 329.63, 392, 523.25],  wave: "sine",     filter: 1400, lfoSpeed: 0.06, bellEvery: 9,  hue: 60 },
  { id: "cozy",               name: "Ambiente cozy",             mood: "abrigador",          chord: [196, 233.08, 293.66],          wave: "triangle", filter: 1000, lfoSpeed: 0.07, layers: ["fuego"], hue: 20 },
  { id: "cinematografico",    name: "Instrumental cinemático",   mood: "épico, contenido",   chord: [110, 164.81, 220, 261.63],     wave: "triangle", filter: 900,  lfoSpeed: 0.04, bellEvery: 16, hue: 155 },
];

export const LAYERS: LayerDef[] = [
  { id: "lluvia",   name: "Lluvia",            description: "Lluvia constante" },
  { id: "fuego",    name: "Chimenea",          description: "Crepitar de leña" },
  { id: "viento",   name: "Viento",            description: "Brisa entre árboles" },
  { id: "trueno",   name: "Truenos lejanos",   description: "Tormenta distante" },
  { id: "papel",    name: "Papel",             description: "Hojas en movimiento" },
  { id: "paginas",  name: "Páginas",           description: "Páginas pasando" },
  { id: "bosque",   name: "Bosque",            description: "Aves y follaje" },
  { id: "cafe",     name: "Café",              description: "Murmullo cálido" },
  { id: "susurros", name: "Susurros mágicos",  description: "Voces lejanas" },
  { id: "agua",     name: "Agua suave",        description: "Olas y arroyo" },
  { id: "teclado",  name: "Teclado lejano",    description: "Tecleo amortiguado" },
];

// ============ Engine ============
class AudioEngine {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  musicGain: GainNode | null = null;
  layersGain: GainNode | null = null;
  noiseBuffers: { white?: AudioBuffer; pink?: AudioBuffer; brown?: AudioBuffer } = {};
  music: { stop: () => void; setVolume: (v: number) => void } | null = null;
  layers: Map<LayerId, { stop: () => void; setVolume: (v: number) => void }> = new Map();

  private ensureCtx() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.6;
      this.masterGain.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.7;
      this.musicGain.connect(this.masterGain);
      this.layersGain = this.ctx.createGain();
      this.layersGain.gain.value = 0.7;
      this.layersGain.connect(this.masterGain);
    }
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  private getNoise(type: "white" | "pink" | "brown") {
    if (this.noiseBuffers[type]) return this.noiseBuffers[type]!;
    const ctx = this.ctx!;
    const seconds = 5;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    if (type === "white") {
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    } else if (type === "pink") {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < data.length; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    } else {
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const w = (Math.random() * 2 - 1) * 0.02;
        last = Math.max(-1, Math.min(1, last + w));
        data[i] = last * 3.5;
      }
    }
    this.noiseBuffers[type] = buffer;
    return buffer;
  }

  setMasterVolume(v: number) {
    this.ensureCtx();
    if (this.masterGain) this.masterGain.gain.setTargetAtTime(v, this.ctx!.currentTime, 0.15);
  }
  setMusicVolume(v: number) {
    this.ensureCtx();
    if (this.musicGain) this.musicGain.gain.setTargetAtTime(v, this.ctx!.currentTime, 0.15);
  }
  setLayersVolume(v: number) {
    this.ensureCtx();
    if (this.layersGain) this.layersGain.gain.setTargetAtTime(v, this.ctx!.currentTime, 0.15);
  }

  // ---- Music pad ----
  playMusic(cat: MusicCategory, volume = 0.6) {
    this.ensureCtx();
    if (!this.ctx || !this.musicGain) return;
    this.stopMusic();
    const ctx = this.ctx;
    const out = ctx.createGain();
    out.gain.value = 0;
    out.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2.5);
    out.connect(this.musicGain);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cat.filter;
    filter.Q.value = 0.6;
    filter.connect(out);

    // LFO modulates filter for movement
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = cat.lfoSpeed;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = cat.filter * 0.25;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    const oscs: OscillatorNode[] = [];
    const gains: GainNode[] = [];
    cat.chord.forEach((freq, i) => {
      // Two slightly detuned oscillators per note for warmth
      [0, 1].forEach((d) => {
        const o = ctx.createOscillator();
        o.type = cat.wave;
        o.frequency.value = freq;
        o.detune.value = d === 0 ? -7 : 7;
        const g = ctx.createGain();
        g.gain.value = 0.16 / cat.chord.length;
        // Slow tremolo per voice for liveliness
        const trem = ctx.createOscillator();
        trem.frequency.value = 0.08 + i * 0.02;
        const tremG = ctx.createGain();
        tremG.gain.value = 0.05 / cat.chord.length;
        trem.connect(tremG).connect(g.gain);
        trem.start();
        o.connect(g).connect(filter);
        o.start();
        oscs.push(o); gains.push(g);
      });
    });

    // Optional bell tones
    let bellTimer: ReturnType<typeof setInterval> | null = null;
    if (cat.bellEvery && cat.bellEvery > 0) {
      const playBell = () => {
        if (!this.ctx || !this.musicGain) return;
        const c = this.ctx;
        const freq = cat.chord[Math.floor(Math.random() * cat.chord.length)] * 2;
        const o = c.createOscillator();
        o.type = "sine";
        o.frequency.value = freq;
        const g = c.createGain();
        g.gain.setValueAtTime(0, c.currentTime);
        g.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 4);
        const f = c.createBiquadFilter();
        f.type = "lowpass"; f.frequency.value = 2000;
        o.connect(g).connect(f).connect(this.musicGain);
        o.start(); o.stop(c.currentTime + 4.1);
      };
      bellTimer = setInterval(playBell, cat.bellEvery * 1000);
      setTimeout(playBell, 2000);
    }

    this.music = {
      stop: () => {
        const t = ctx.currentTime;
        out.gain.cancelScheduledValues(t);
        out.gain.setValueAtTime(out.gain.value, t);
        out.gain.linearRampToValueAtTime(0, t + 1.2);
        setTimeout(() => {
          oscs.forEach((o) => { try { o.stop(); } catch (e) { void e; } });
          try { lfo.stop(); } catch (e) { void e; }
          try { out.disconnect(); } catch (e) { void e; }
          if (bellTimer) clearInterval(bellTimer);
        }, 1300);
      },
      setVolume: (v: number) => {
        out.gain.setTargetAtTime(v, ctx.currentTime, 0.3);
      },
    };
  }
  stopMusic() {
    if (this.music) { this.music.stop(); this.music = null; }
  }

  // ---- Ambient layers ----
  toggleLayer(id: LayerId, on: boolean, volume = 0.5) {
    if (!on) { this.stopLayer(id); return; }
    this.startLayer(id, volume);
  }
  setLayerVolume(id: LayerId, v: number) {
    this.layers.get(id)?.setVolume(v);
  }
  stopLayer(id: LayerId) {
    const l = this.layers.get(id);
    if (l) { l.stop(); this.layers.delete(id); }
  }
  stopAllLayers() {
    this.layers.forEach((l) => l.stop());
    this.layers.clear();
  }

  private startLayer(id: LayerId, volume: number) {
    this.ensureCtx();
    if (!this.ctx || !this.layersGain) return;
    this.stopLayer(id);
    const ctx = this.ctx;
    const out = ctx.createGain();
    out.gain.value = 0;
    out.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.5);
    out.connect(this.layersGain);

    const nodes: (AudioNode | OscillatorNode | AudioBufferSourceNode)[] = [];
    const timers: ReturnType<typeof setInterval>[] = [];

    const makeNoiseSrc = (type: "white" | "pink" | "brown") => {
      const src = ctx.createBufferSource();
      src.buffer = this.getNoise(type);
      src.loop = true;
      nodes.push(src);
      return src;
    };
    const bp = (freq: number, Q: number) => {
      const f = ctx.createBiquadFilter();
      f.type = "bandpass"; f.frequency.value = freq; f.Q.value = Q;
      return f;
    };
    const lp = (freq: number) => {
      const f = ctx.createBiquadFilter();
      f.type = "lowpass"; f.frequency.value = freq;
      return f;
    };
    const hp = (freq: number) => {
      const f = ctx.createBiquadFilter();
      f.type = "highpass"; f.frequency.value = freq;
      return f;
    };

    if (id === "lluvia") {
      const src = makeNoiseSrc("white");
      src.connect(hp(800)).connect(lp(6000)).connect(out);
      src.start();
    } else if (id === "fuego") {
      const src = makeNoiseSrc("brown");
      src.connect(lp(500)).connect(out);
      src.start();
      // Crackles
      const crackle = () => {
        const c = ctx.createBufferSource();
        c.buffer = this.getNoise("white");
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
        c.connect(hp(2000)).connect(g).connect(out);
        c.start(); c.stop(ctx.currentTime + 0.1);
      };
      timers.push(setInterval(() => { if (Math.random() < 0.7) crackle(); }, 300));
    } else if (id === "viento") {
      const src = makeNoiseSrc("brown");
      const filter = bp(800, 1.5);
      src.connect(filter).connect(out);
      src.start();
      // LFO for whoosh
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.15;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 400;
      lfo.connect(lfoG).connect(filter.frequency);
      lfo.start();
      nodes.push(lfo);
    } else if (id === "trueno") {
      const rumble = () => {
        const src = ctx.createBufferSource();
        src.buffer = this.getNoise("brown");
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.4);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3 + Math.random() * 2);
        src.connect(lp(120)).connect(g).connect(out);
        src.start(); src.stop(ctx.currentTime + 6);
      };
      timers.push(setInterval(() => { if (Math.random() < 0.3) rumble(); }, 8000));
    } else if (id === "papel") {
      const rustle = () => {
        const src = ctx.createBufferSource();
        src.buffer = this.getNoise("pink");
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
        src.connect(bp(3000, 2)).connect(g).connect(out);
        src.start(); src.stop(ctx.currentTime + 0.5);
      };
      timers.push(setInterval(() => { if (Math.random() < 0.4) rustle(); }, 2500));
    } else if (id === "paginas") {
      const flip = () => {
        const src = ctx.createBufferSource();
        src.buffer = this.getNoise("pink");
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
        src.connect(bp(2000, 1.5)).connect(g).connect(out);
        src.start(); src.stop(ctx.currentTime + 0.7);
      };
      timers.push(setInterval(() => { if (Math.random() < 0.3) flip(); }, 6000));
    } else if (id === "bosque") {
      const src = makeNoiseSrc("pink");
      src.connect(bp(3000, 1)).connect(out);
      src.start();
      // Random bird chirps
      const bird = () => {
        const o = ctx.createOscillator();
        o.type = "sine";
        const baseF = 2000 + Math.random() * 1500;
        o.frequency.setValueAtTime(baseF, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(baseF * 1.4, ctx.currentTime + 0.1);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
        o.connect(g).connect(out);
        o.start(); o.stop(ctx.currentTime + 0.25);
      };
      timers.push(setInterval(() => { if (Math.random() < 0.4) bird(); }, 4000));
    } else if (id === "cafe") {
      const src = makeNoiseSrc("brown");
      src.connect(lp(1200)).connect(out);
      src.start();
      // Subtle murmur modulation
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.3;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 0.1;
      const trem = ctx.createGain();
      trem.gain.value = 1;
      lfo.connect(lfoG).connect(trem.gain);
      src.disconnect();
      src.connect(lp(1200)).connect(trem).connect(out);
      lfo.start();
      nodes.push(lfo, trem);
    } else if (id === "susurros") {
      const src = makeNoiseSrc("pink");
      const filter = bp(1500, 4);
      src.connect(filter).connect(out);
      src.start();
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.4;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 600;
      lfo.connect(lfoG).connect(filter.frequency);
      lfo.start();
      nodes.push(lfo);
    } else if (id === "agua") {
      const src = makeNoiseSrc("pink");
      const filter = lp(900);
      src.connect(filter).connect(out);
      src.start();
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.2;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 400;
      lfo.connect(lfoG).connect(filter.frequency);
      lfo.start();
      nodes.push(lfo);
    } else if (id === "teclado") {
      const tap = () => {
        const src = ctx.createBufferSource();
        src.buffer = this.getNoise("white");
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.002);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
        src.connect(bp(1200 + Math.random() * 800, 3)).connect(g).connect(out);
        src.start(); src.stop(ctx.currentTime + 0.08);
      };
      timers.push(setInterval(() => { if (Math.random() < 0.6) tap(); }, 220));
    }

    this.layers.set(id, {
      stop: () => {
        const t = ctx.currentTime;
        out.gain.cancelScheduledValues(t);
        out.gain.setValueAtTime(out.gain.value, t);
        out.gain.linearRampToValueAtTime(0, t + 0.8);
        setTimeout(() => {
          nodes.forEach((n) => {
            try { (n as OscillatorNode | AudioBufferSourceNode).stop?.(); } catch (e) { void e; }
            try { n.disconnect(); } catch (e) { void e; }
          });
          timers.forEach((t) => clearInterval(t));
          try { out.disconnect(); } catch (e) { void e; }
        }, 900);
      },
      setVolume: (v: number) => {
        out.gain.setTargetAtTime(v, ctx.currentTime, 0.25);
      },
    });
  }

  stopAll() {
    this.stopMusic();
    this.stopAllLayers();
  }
}

export const audioEngine = new AudioEngine();

// ============ Persistent state ============
export interface LayerState { enabled: boolean; volume: number; }
export interface AudioState {
  masterVolume: number;
  musicVolume: number;
  layersVolume: number;
  category: MusicCategoryId | null;
  playing: boolean;
  layers: Partial<Record<LayerId, LayerState>>;
  presets: AudioPreset[];
}
export interface AudioPreset {
  id: string;
  name: string;
  category: MusicCategoryId | null;
  layers: Partial<Record<LayerId, LayerState>>;
  immersion?: string;
}

const KEY = "everlore:audio";
const DEFAULT_STATE: AudioState = {
  masterVolume: 0.55,
  musicVolume: 0.7,
  layersVolume: 0.7,
  category: null,
  playing: false,
  layers: {},
  presets: [
    { id: "p1", name: "Biblioteca de lluvia", category: "biblioteca-magica", layers: { lluvia: { enabled: true, volume: 0.5 }, paginas: { enabled: true, volume: 0.4 } } },
    { id: "p2", name: "Café y tormenta",       category: "cafe-nocturno",     layers: { cafe: { enabled: true, volume: 0.5 }, lluvia: { enabled: true, volume: 0.4 }, trueno: { enabled: true, volume: 0.6 } } },
    { id: "p3", name: "Bosque arcano",         category: "bosque-encantado",  layers: { bosque: { enabled: true, volume: 0.5 }, viento: { enabled: true, volume: 0.3 }, susurros: { enabled: true, volume: 0.25 } } },
    { id: "p4", name: "Fantasía oscura",       category: "santuario-arcano",  layers: { susurros: { enabled: true, volume: 0.4 }, viento: { enabled: true, volume: 0.3 } } },
    { id: "p5", name: "Meditación nocturna",   category: "piano-emocional",   layers: { lluvia: { enabled: true, volume: 0.3 } } },
  ],
};

const listeners = new Set<() => void>();
function readState(): AudioState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<AudioState>;
    return { ...DEFAULT_STATE, ...parsed, presets: parsed.presets ?? DEFAULT_STATE.presets, layers: parsed.layers ?? {} };
  } catch { return DEFAULT_STATE; }
}
function writeState(s: AudioState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
  listeners.forEach((l) => l());
}

export function getAudioState(): AudioState { return readState(); }
export function useAudioState(): AudioState {
  const snap = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => localStorage.getItem(KEY) ?? "",
    () => "",
  );
  return snap ? (() => { try { return { ...DEFAULT_STATE, ...JSON.parse(snap) } as AudioState; } catch { return DEFAULT_STATE; } })() : DEFAULT_STATE;
}

// ============ Actions ============
function update(patch: Partial<AudioState> | ((s: AudioState) => AudioState)) {
  const cur = readState();
  const next = typeof patch === "function" ? patch(cur) : { ...cur, ...patch };
  writeState(next);
  return next;
}

export function setMasterVolume(v: number) {
  audioEngine.setMasterVolume(v);
  update({ masterVolume: v });
}
export function setMusicVolume(v: number) {
  audioEngine.setMusicVolume(v);
  update({ musicVolume: v });
}
export function setLayersVolume(v: number) {
  audioEngine.setLayersVolume(v);
  update({ layersVolume: v });
}

export function playCategory(id: MusicCategoryId) {
  const cat = MUSIC_CATEGORIES.find((c) => c.id === id);
  if (!cat) return;
  const s = readState();
  audioEngine.setMasterVolume(s.masterVolume);
  audioEngine.setMusicVolume(s.musicVolume);
  audioEngine.setLayersVolume(s.layersVolume);
  audioEngine.playMusic(cat, 0.6);
  update({ category: id, playing: true });
}
export function stopMusic() {
  audioEngine.stopMusic();
  update({ playing: false });
}
export function togglePlay() {
  const s = readState();
  if (s.playing) { stopMusic(); return; }
  if (s.category) { playCategory(s.category); return; }
  playCategory("biblioteca-magica");
}

export function setLayer(id: LayerId, enabled: boolean, volume?: number) {
  const cur = readState();
  const v = volume ?? cur.layers[id]?.volume ?? 0.5;
  audioEngine.setMasterVolume(cur.masterVolume);
  audioEngine.setLayersVolume(cur.layersVolume);
  audioEngine.toggleLayer(id, enabled, v);
  update((s) => ({ ...s, layers: { ...s.layers, [id]: { enabled, volume: v } } }));
}
export function setLayerVolume(id: LayerId, v: number) {
  audioEngine.setLayerVolume(id, v);
  update((s) => ({ ...s, layers: { ...s.layers, [id]: { enabled: s.layers[id]?.enabled ?? false, volume: v } } }));
}

export function applyPreset(p: AudioPreset) {
  // Stop current layers
  const cur = readState();
  Object.keys(cur.layers).forEach((k) => audioEngine.stopLayer(k as LayerId));
  // Apply new
  Object.entries(p.layers).forEach(([id, st]) => {
    if (st?.enabled) audioEngine.toggleLayer(id as LayerId, true, st.volume);
  });
  if (p.category) {
    const cat = MUSIC_CATEGORIES.find((c) => c.id === p.category);
    if (cat) audioEngine.playMusic(cat, 0.6);
  }
  update({ category: p.category, playing: !!p.category, layers: p.layers });
}

export function savePreset(name: string) {
  const cur = readState();
  const p: AudioPreset = {
    id: Math.random().toString(36).slice(2, 10),
    name: name.trim() || "Sin nombre",
    category: cur.category,
    layers: cur.layers,
  };
  update((s) => ({ ...s, presets: [p, ...s.presets] }));
}
export function deletePreset(id: string) {
  update((s) => ({ ...s, presets: s.presets.filter((p) => p.id !== id) }));
}

export function stopAll() {
  audioEngine.stopAll();
  update({ playing: false, layers: {} });
}

// Map "Modo Inmersión" → suggested category
export const IMMERSION_TO_CATEGORY: Record<string, MusicCategoryId> = {
  biblioteca: "biblioteca-magica",
  lluvia:     "lluvia-nocturna",
  bosque:     "bosque-encantado",
  arcano:     "santuario-arcano",
  cyberpunk:  "scifi-atmosferico",
  espacio:    "espacio-profundo",
};

// Hook: rehydrate engine on mount if a session was playing
export function useAudioHydrate() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (hydrated) return;
    setHydrated(true);
    // We can't resume audio without a user gesture; just keep state.
    // Engine starts on next user action.
  }, [hydrated]);
}
