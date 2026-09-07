// ============================================================
// ErgoDapur — Menu Pengaturan (Esc)
// Semua perubahan diterapkan langsung tanpa mulai ulang.
// ============================================================

import {
  Gauge,
  Keyboard,
  MonitorCog,
  Moon,
  MousePointer2,
  Play,
  RotateCcw,
  Settings,
  Sun,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { gunakanToko, toko, type Pengaturan } from "../game/store";
import { audio } from "../game/audio";

function Slider({
  label,
  ikon: Ikon,
  nilai,
  min,
  maks,
  langkah,
  format,
  ubah,
}: {
  label: string;
  ikon: any;
  nilai: number;
  min: number;
  maks: number;
  langkah: number;
  format: (v: number) => string;
  ubah: (v: number) => void;
}) {
  const persen = ((nilai - min) / (maks - min)) * 100;
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <Ikon size={13.5} className="text-amber-400" />
        <span className="text-[12px] font-semibold text-krem-100/90">{label}</span>
        <span className="teks-display ml-auto text-[12px] font-bold text-amber-300">{format(nilai)}</span>
      </div>
      <input
        type="range"
        className="geser"
        min={min}
        max={maks}
        step={langkah}
        value={nilai}
        style={{ ["--isi" as any]: `${persen}%` }}
        onChange={(e) => ubah(parseFloat(e.target.value))}
      />
    </div>
  );
}

export default function MenuPengaturan() {
  const buka = gunakanToko((s) => s.status.menuBuka);
  const pg: Pengaturan = gunakanToko((s) => s.pengaturan);

  if (!buka) return null;

  const lanjutkan = () => {
    toko.setStatus({ menuBuka: false });
    if (!toko.keadaan.status.modeInteraksi) {
      const kanvas = document.querySelector<HTMLCanvasElement>(".bingkai-scene canvas");
      try {
        const r = kanvas?.requestPointerLock?.();
        if (r && (r as Promise<void>).catch) (r as Promise<void>).catch(() => {});
      } catch {
        /* pointer lock tidak tersedia — mode seret mouse tetap berfungsi */
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-layu-masuk">
      <div className="kaca w-full max-w-lg animate-masuk-atas rounded-3xl p-6">
        {/* Kepala */}
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15">
            <Settings size={18} className="text-amber-300" />
          </div>
          <div className="min-w-0">
            <h2 className="teks-display text-lg font-extrabold text-krem-50">Pengaturan</h2>
            <p className="text-[11.5px] text-krem-100/60">
              Semua perubahan diterapkan langsung tanpa memulai ulang simulasi.
            </p>
          </div>
          <button
            onClick={lanjutkan}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-krem-100/60 transition hover:bg-white/10 hover:text-krem-50"
            title="Tutup Pengaturan (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        <div className="bilah-halus max-h-[58vh] space-y-6 overflow-y-auto pr-1.5">
          {/* Kontrol */}
          <section className="kartu-bagian p-4">
            <div className="mb-3 flex items-center gap-2">
              <Keyboard size={13} className="text-amber-400/80" />
              <span className="teks-display text-[11px] font-bold tracking-[0.16em] text-krem-100/70">KONTROL</span>
            </div>
            <div className="space-y-4">
              <Slider
                label="Sensitivitas Mouse"
                ikon={MousePointer2}
                nilai={pg.sensitivitas}
                min={0.2}
                maks={2.5}
                langkah={0.05}
                format={(v) => v.toFixed(2)}
                ubah={(v) => toko.setPengaturan({ sensitivitas: v })}
              />
              <Slider
                label="Kecepatan Gerak"
                ikon={Gauge}
                nilai={pg.kecepatan}
                min={1.5}
                maks={6}
                langkah={0.1}
                format={(v) => `${v.toFixed(1)} m/s`}
                ubah={(v) => toko.setPengaturan({ kecepatan: v })}
              />
            </div>
          </section>

          {/* Audio */}
          <section className="kartu-bagian p-4">
            <div className="mb-3 flex items-center gap-2">
              <Volume2 size={13} className="text-amber-400/80" />
              <span className="teks-display text-[11px] font-bold tracking-[0.16em] text-krem-100/70">AUDIO</span>
            </div>
            <div className="space-y-4">
              <Slider
                label="Volume Suara"
                ikon={Volume2}
                nilai={Math.round(pg.volume * 100)}
                min={0}
                maks={100}
                langkah={1}
                format={(v) => `${v}%`}
                ubah={(v) => toko.setPengaturan({ volume: v / 100 })}
              />
              <button
                onClick={() => toko.setPengaturan({ bisu: !pg.bisu })}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 transition hover:bg-white/8"
              >
                <span className="flex items-center gap-2 text-[12px] font-semibold text-krem-100/85">
                  <VolumeX size={13.5} className="text-amber-400" /> Bisukan semua suara
                </span>
                <span
                  className={`relative h-5 w-9 rounded-full transition ${pg.bisu ? "bg-amber-500" : "bg-white/15"}`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-krem-50 shadow transition-all ${
                      pg.bisu ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </span>
              </button>
            </div>
          </section>

          {/* Tampilan */}
          <section className="kartu-bagian p-4">
            <div className="mb-3 flex items-center gap-2">
              <MonitorCog size={13} className="text-amber-400/80" />
              <span className="teks-display text-[11px] font-bold tracking-[0.16em] text-krem-100/70">TAMPILAN</span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 text-[12px] font-semibold text-krem-100/90">Mode Suasana Dapur</div>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ["terang", "Siang (Terang)", Sun],
                      ["gelap", "Malam (Gelap)", Moon],
                    ] as const
                  ).map(([mode, label, Ikon]) => {
                    const aktif = mode === "gelap" ? pg.modeGelap : !pg.modeGelap;
                    return (
                      <button
                        key={mode}
                        onClick={() => {
                          toko.setPengaturan({ modeGelap: mode === "gelap" });
                          audio.beralih();
                        }}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[12px] font-semibold transition ${
                          aktif
                            ? "border-amber-400/60 bg-amber-400/15 text-amber-200"
                            : "border-white/10 bg-white/5 text-krem-100/65 hover:bg-white/8"
                        }`}
                      >
                        <Ikon size={14} /> {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="mb-1.5 text-[12px] font-semibold text-krem-100/90">Kualitas Grafis</div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ["hemat", "Hemat", "Tanpa bayangan, resolusi 70%"],
                      ["sedang", "Sedang", "Bayangan 1024, resolusi 100%"],
                      ["tinggi", "Tinggi", "Bayangan 2048, resolusi penuh"],
                    ] as const
                  ).map(([q, label, ket]) => (
                    <button
                      key={q}
                      onClick={() => {
                        toko.setPengaturan({ kualitas: q });
                        audio.klik();
                      }}
                      className={`rounded-xl border px-2.5 py-2.5 text-left transition ${
                        pg.kualitas === q
                          ? "border-amber-400/60 bg-amber-400/15"
                          : "border-white/10 bg-white/5 hover:bg-white/8"
                      }`}
                      title={ket}
                    >
                      <div
                        className={`teks-display text-[12px] font-bold ${
                          pg.kualitas === q ? "text-amber-200" : "text-krem-100/75"
                        }`}
                      >
                        {label}
                      </div>
                      <div className="mt-0.5 text-[9.5px] leading-tight text-krem-100/50">{ket}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Tata letak */}
          <section>
            <button
              onClick={() => toko.aturUlangDapur()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-[12px] font-semibold text-krem-100/85 transition hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-200"
            >
              <RotateCcw size={13.5} /> Atur Ulang Tata Letak Dapur ke Kondisi Awal
            </button>
          </section>
        </div>

        {/* Kaki */}
        <button
          onClick={lanjutkan}
          className="teks-display mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-[13.5px] font-extrabold text-arang-950 transition hover:bg-amber-400 active:scale-[0.99]"
        >
          <Play size={15} /> Lanjutkan Simulasi (Esc)
        </button>
      </div>
    </div>
  );
}
