// ============================================================
// ErgoDapur — Manajer Audio Prosedural (Web Audio API)
// Semua efek suara dibuat programatis. Tingkat volume sengaja
// dijaga tetap lembut agar tidak bising.
// ============================================================

import type { ParameterDapur, Pengaturan } from "./store";

class ManajerAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private desis: GainNode | null = null; // kompor menyala
  private angin: GainNode | null = null; // jendela terbuka
  private dengung: GainNode | null = null; // mesin kulkas
  private air: GainNode | null = null; // keran wastafel
  private kipas: GainNode | null = null; // hood penyedot asap
  private komporAktif = false;
  private siap = false;

  /** Harus dipanggil dari gestur pengguna (klik tombol mulai). */
  mulai() {
    if (this.siap) {
      this.ctx?.resume();
      return;
    }
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.6;
      this.master.connect(this.ctx.destination);
      this.buatSumber();
      this.siap = true;
    } catch {
      /* audio tidak tersedia */
    }
  }

  private buferDerau(): AudioBuffer {
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  private loopDerau(laju: number, jenis: BiquadFilterType, frek: number, q: number): GainNode {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource();
    s.buffer = this.buferDerau();
    s.loop = true;
    s.playbackRate.value = laju;
    const f = ctx.createBiquadFilter();
    f.type = jenis;
    f.frequency.value = frek;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = 0;
    s.connect(f).connect(g).connect(this.master!);
    s.start();
    return g;
  }

  private buatSumber() {
    const ctx = this.ctx!;
    // Desis kompor — pita menengah, lembut
    this.desis = this.loopDerau(1, "bandpass", 3200, 0.5);
    // Krepitasi halus — HANYA saat kompor benar-benar aktif (perbaikan bug)
    setInterval(() => {
      if (this.komporAktif && this.desis && this.ctx) {
        this.desis.gain.setTargetAtTime(0.1 + Math.random() * 0.07, this.ctx.currentTime, 0.08);
      }
    }, 260);
    // Angin jendela
    this.angin = this.loopDerau(0.5, "bandpass", 460, 0.4);
    // Air keran
    this.air = this.loopDerau(1.3, "bandpass", 1900, 0.8);
    // Kipas hood
    this.kipas = this.loopDerau(0.4, "lowpass", 360, 0.5);

    // Dengung kulkas: osilator rendah halus
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = 52;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 130;
    this.dengung = ctx.createGain();
    this.dengung.gain.value = 0.016;
    o.connect(f).connect(this.dengung).connect(this.master!);
    o.start();
  }

  private nada(freq: number, mulai: number, dur: number, jenis: OscillatorType, vol: number) {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime + mulai;
    const os = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    os.type = jenis;
    os.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    os.connect(g).connect(this.master);
    os.start(t);
    os.stop(t + dur + 0.05);
  }

  klik() {
    this.nada(880, 0, 0.07, "triangle", 0.1);
  }
  beralih() {
    this.nada(520, 0, 0.06, "square", 0.05);
    this.nada(720, 0.05, 0.07, "square", 0.045);
  }
  geser() {
    this.nada(300, 0, 0.05, "triangle", 0.07);
  }
  gagal() {
    this.nada(150, 0, 0.2, "square", 0.06);
  }
  sukses() {
    this.nada(659, 0, 0.13, "sine", 0.1);
    this.nada(784, 0.1, 0.15, "sine", 0.1);
    this.nada(1047, 0.2, 0.26, "sine", 0.11);
  }
  sambut() {
    this.nada(523, 0, 0.12, "sine", 0.08);
    this.nada(659, 0.09, 0.14, "sine", 0.08);
  }
  cincang() {
    // Dua tebasan cepat: ketukan talenan
    this.nada(210, 0, 0.05, "square", 0.08);
    this.nada(160, 0.005, 0.07, "triangle", 0.09);
    this.nada(210, 0.16, 0.05, "square", 0.08);
    this.nada(150, 0.165, 0.08, "triangle", 0.1);
  }

  /** Sinkronkan suara lingkungan dengan keadaan dapur. */
  sinkron(p: ParameterDapur, pg: Pengaturan) {
    if (!this.ctx || !this.master) return;
    const v = pg.bisu ? 0 : pg.volume;
    const t = this.ctx.currentTime;
    this.komporAktif = p.komporNyala;
    this.master.gain.setTargetAtTime(v * 0.7, t, 0.1);
    this.desis?.gain.setTargetAtTime(p.komporNyala ? 0.16 : 0, t, 0.25);
    this.angin?.gain.setTargetAtTime(p.ventilasiBuka ? 0.13 : 0, t, 0.4);
    this.air?.gain.setTargetAtTime(p.keranNyala ? 0.11 : 0, t, 0.15);
    this.kipas?.gain.setTargetAtTime(p.hoodNyala ? 0.09 : 0, t, 0.3);
    this.dengung?.gain.setTargetAtTime(p.kulkasTerbuka ? 0.038 : 0.016, t, 0.3);
  }
}

export const audio = new ManajerAudio();
