// ============================================================
// ErgoDapur — Modul Pembuka & Bantuan (dalam Bahasa Indonesia)
// ============================================================

import {
  Armchair,
  ChefHat,
  CircleHelp,
  Crosshair,
  Glasses,
  HeartPulse,
  MousePointer2,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react";
import { gunakanToko, toko } from "../game/store";
import { audio } from "../game/audio";

const KELOMPOK_KONTROL: { judul: string; baris: [string, string][] }[] = [
  {
    judul: "GERAKAN & POSTUR",
    baris: [
      ["W A S D", "Bergerak di dalam dapur"],
      ["Mouse", "Melihat ke sekeliling"],
      ["C", "Jongkok — ambil panci di rak bawah"],
      ["Shift", "Berdiri tegak (tahan)"],
    ],
  },
  {
    judul: "INTERAKSI & TATA LETAK",
    baris: [
      ["Klik", "Pilih barang atau buka opsi interaksi"],
      ["[ ]", "Geser / atur tinggi objek yang ditatap"],
      ["G", "Geser rak bumbu secara horizontal"],
      ["Esc · M · H · U", "Pengaturan · bisukan suara · bantuan · sembunyikan UI"],
    ],
  },
];

const PILAR = [
  { ikon: ShieldCheck, nama: "Keselamatan", bobot: "30 poin", ket: "Jarak aman kompor, ventilasi, jalur bebas", warna: "#f87171" },
  { ikon: Zap, nama: "Efisiensi", bobot: "25 poin", ket: "Segitiga kerja kompor–wastafel–kulkas", warna: "#fbbf24" },
  { ikon: HeartPulse, nama: "Kesehatan", bobot: "20 poin", ket: "Sirkulasi udara & zona jangkauan rak", warna: "#34d399" },
  { ikon: Armchair, nama: "Kenyamanan", bobot: "25 poin", ket: "Tinggi meja kerja & pencahayaan tugas", warna: "#7dd3fc" },
];

const LEGENDA = [
  ["#34d399", "Baik — parameter sudah ergonomis"],
  ["#fbbf24", "Cukup — masih bisa ditingkatkan"],
  ["#f87171", "Buruk — berisiko, segera perbaiki"],
];

export default function ModulAwal() {
  const dimulai = gunakanToko((s) => s.status.dimulai);
  const bantuanBuka = gunakanToko((s) => s.status.bantuanBuka);

  const tampil = !dimulai || bantuanBuka;
  if (!tampil) return null;

  const mulai = () => {
    audio.mulai();
    if (!dimulai) {
      audio.sambut();
      toko.setStatus({ dimulai: true });
      toko.toast(
        "Selamat datang di ErgoDapur! Mulai Modul 1 — ukur dimensi tubuh Anda di meteran dinding sebelah kiri.",
        "info"
      );
    } else {
      toko.setStatus({ bantuanBuka: false });
    }
    const kanvas = document.querySelector<HTMLCanvasElement>(".bingkai-scene canvas");
    try {
      const r = kanvas?.requestPointerLock?.();
      if (r && (r as Promise<void>).catch) (r as Promise<void>).catch(() => {});
    } catch {
      /* pointer lock tidak tersedia — mode seret mouse tetap berfungsi */
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden p-4"
      style={{
        background:
          "radial-gradient(1100px 620px at 18% -12%, rgba(201,111,74,0.3), transparent 60%), radial-gradient(920px 540px at 92% 112%, rgba(122,139,111,0.24), transparent 55%), rgba(9,11,13,0.9)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="kaca bilah-halus relative max-h-[92vh] w-full max-w-4xl animate-masuk-atas overflow-y-auto rounded-3xl p-7 md:p-10">
        {bantuanBuka && dimulai && (
          <button
            onClick={() => toko.setStatus({ bantuanBuka: false })}
            className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-krem-100/60 transition hover:bg-white/10 hover:text-krem-50"
          >
            <X size={16} />
          </button>
        )}

        {/* ---------- Kepala ---------- */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-terakota-500 shadow-lg shadow-amber-500/25">
              <ChefHat size={26} className="text-arang-950" />
            </div>
            <span className="absolute -inset-1.5 -z-10 rounded-3xl bg-gradient-to-br from-amber-400/25 to-transparent blur-md" />
          </div>
          <div className="min-w-0">
            <div className="teks-display text-[10px] font-extrabold tracking-[0.34em] text-amber-400">
              SIMULASI EDUKASI 3D INTERAKTIF
            </div>
            <h1 className="teks-display mt-0.5 text-[34px] font-extrabold leading-none tracking-tight text-krem-50">
              Ergo<span className="text-amber-400">Dapur</span>
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10.5px] font-bold text-krem-100/80">
              <Crosshair size={12} className="text-amber-400" /> MODE FPS
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10.5px] font-bold text-krem-100/80">
              <Glasses size={12} className="text-amber-400" /> MODE VR
            </span>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-[13px] leading-relaxed text-krem-100/78">
          Jelajahi dapur dari sudut pandang orang pertama. Tata ulang kompor, meja potong, rak bumbu, kulkas,
          pencahayaan, dan ventilasi — lalu lihat secara langsung bagaimana setiap keputusan memengaruhi{" "}
          <span className="font-bold text-krem-50">kenyamanan, efisiensi, kesehatan, dan keselamatan</span> memasak
          melalui skor ergonomi waktu nyata.
        </p>

        {/* ---------- Empat pilar ---------- */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {PILAR.map((p) => (
            <div key={p.nama} className="kartu-bagian relative overflow-hidden p-3.5">
              <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: p.warna }} />
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: `${p.warna}16`, border: `1px solid ${p.warna}35` }}
              >
                <p.ikon size={15} style={{ color: p.warna }} />
              </span>
              <div className="teks-display mt-2 flex items-baseline justify-between text-[12px] font-extrabold text-krem-50">
                {p.nama}
                <span className="text-[9px] font-bold" style={{ color: p.warna }}>
                  {p.bobot}
                </span>
              </div>
              <p className="mt-1 text-[10px] leading-snug text-krem-100/60">{p.ket}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          {/* ---------- Kontrol ---------- */}
          <div className="kartu-bagian p-4">
            <div className="teks-display mb-3 flex items-center gap-2 text-[11px] font-extrabold tracking-[0.18em] text-krem-100/85">
              <MousePointer2 size={13} className="text-amber-400" /> CARA BERMAIN
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {KELOMPOK_KONTROL.map((kel) => (
                <div key={kel.judul}>
                  <div className="mb-2 text-[9.5px] font-extrabold tracking-[0.14em] text-krem-100/45">{kel.judul}</div>
                  <div className="space-y-2">
                    {kel.baris.map(([kunci, label]) => (
                      <div key={kunci} className="flex items-center gap-2.5">
                        <span className="keycap shrink-0">{kunci}</span>
                        <span className="text-[11px] leading-snug text-krem-100/75">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ---------- Indikator & tantangan ---------- */}
          <div className="flex flex-col gap-4">
            <div className="kartu-bagian p-4">
              <div className="teks-display mb-2.5 flex items-center gap-2 text-[11px] font-extrabold tracking-[0.18em] text-krem-100/85">
                <CircleHelp size={13} className="text-amber-400" /> INDIKATOR WARNA
              </div>
              <div className="space-y-2">
                {LEGENDA.map(([warna, teks]) => (
                  <div
                    key={teks}
                    className="flex items-center gap-2.5 rounded-lg border px-2.5 py-2"
                    style={{ borderColor: `${warna}30`, background: `${warna}0d` }}
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: warna }} />
                    <span className="text-[10.5px] font-medium text-krem-100/80">{teks}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="kartu-bagian flex items-start gap-3 border-amber-400/25 p-4" style={{ background: "rgba(245,158,11,0.07)" }}>
              <Target size={17} className="mt-0.5 shrink-0 text-amber-300" />
              <div>
                <div className="teks-display text-[11.5px] font-extrabold text-amber-200">KURIKULUM 6 MODUL</div>
                <p className="mt-1 text-[10.5px] leading-snug text-amber-100/75">
                  Antropometri → Zona Jangkauan → Segitiga Kerja → Pencahayaan → Sesi Memasak Aman → Audit.
                  Tiap sasaran punya <span className="font-bold text-amber-200">target terukur</span> dan debrief
                  pembelajaran bersumber standar ISO, NKBA, dan SNI.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Mode VR ---------- */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-sky-400/25 bg-sky-400/[0.07] p-4">
          <Glasses size={18} className="mt-0.5 shrink-0 text-sky-300" />
          <p className="text-[11.5px] leading-relaxed text-krem-100/80">
            <span className="font-extrabold text-sky-200">Mode Realitas Virtual:</span> sambungkan headset WebXR
            (mis. Meta Quest) melalui browser yang mendukung, lalu klik ikon kacamata{" "}
            <span className="font-bold">"VR"</span> di kanan bawah layar 3D. Tatap objek interaktif selama satu detik
            untuk berinteraksi — panel skor di dinding kanan tetap terlihat di dalam VR.
          </p>
        </div>

        {/* ---------- Tombol mulai (melekat di bawah modal) ---------- */}
        <div
          className="sticky bottom-0 -mx-7 mt-6 px-7 pb-1 pt-6 md:-mx-10 md:px-10"
          style={{ background: "linear-gradient(0deg, rgba(14,18,21,0.97) 55%, transparent)" }}
        >
          <button
            onClick={mulai}
            className="cta-utama teks-display flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-terakota-500 px-6 py-4 text-[15px] font-extrabold text-arang-950 shadow-lg shadow-amber-600/25 transition hover:brightness-110 active:scale-[0.99]"
          >
            <Play size={18} /> {dimulai ? "Kembali ke Simulasi" : "Mulai Simulasi Sekarang"}
          </button>
          <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[10.5px] text-krem-100/45">
            <Sparkles size={11} className="text-amber-400/70" />
            Disarankan desktop dengan mouse — tombol di atas juga mengunci kursor untuk pengalaman FPS penuh.
          </p>
        </div>
      </div>
    </div>
  );
}
