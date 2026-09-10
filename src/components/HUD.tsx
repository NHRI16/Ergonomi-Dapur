// ============================================================
// ErgoDapur — HUD (tampilan informasi permainan)
// ============================================================

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Armchair,
  Boxes,
  CheckCircle2,
  ChefHat,
  CircleHelp,
  CookingPot,
  Droplets,
  Fan,
  Flame,
  Glasses,
  HeartPulse,
  Lightbulb,
  Move,
  PersonStanding,
  Ruler,
  Refrigerator,
  Settings,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  Volume2,
  VolumeX,
  Wind,
  X,
  Zap,
} from "lucide-react";
import {
  gunakanToko,
  toko,
  teksPrompt,
  warnaSkor,
  labelSkor,
  warnaTingkat,
  MAKS_PILAR,
  type Tingkat,
} from "../game/store";
import { audio } from "../game/audio";
import PanelModul from "./PanelModul";

const IKON_PILAR = { keselamatan: ShieldCheck, efisiensi: Zap, kesehatan: HeartPulse, kenyamanan: Armchair } as const;
const NAMA_PILAR = { keselamatan: "Keselamatan", efisiensi: "Efisiensi", kesehatan: "Kesehatan", kenyamanan: "Kenyamanan" } as const;

const IKON_TARGET: Record<string, any> = {
  kompor: Flame,
  "meja-potong": ChefHat,
  "stasiun-ukur": Ruler,
  talenan: UtensilsCrossed,
  "rak-bumbu": CookingPot,
  kulkas: Refrigerator,
  "saklar-lampu": Lightbulb,
  "lampu-meja": Lightbulb,
  ventilasi: Wind,
  wastafel: Droplets,
  hood: Fan,
  "rak-bawah": CookingPot,
  "papan-skor": Activity,
};

const CHIP_TINGKAT: Record<string, string> = {
  buruk: "SEGERA",
  cukup: "TINGKATKAN",
};

function IkonTingkat({ tingkat, ukuran = 13 }: { tingkat: Tingkat; ukuran?: number }) {
  if (tingkat === "baik") return <CheckCircle2 size={ukuran} color={warnaTingkat.baik} />;
  if (tingkat === "info") return <Zap size={ukuran} color={warnaTingkat.info} />;
  return <AlertTriangle size={ukuran} color={warnaTingkat[tingkat]} />;
}

export default function HUD() {
  const k = gunakanToko((s) => s);
  const [spanduk, setSpanduk] = useState<string | null>(null);
  const bandSebelum = useRef<string | null>(null);

  useEffect(() => {
    if (!k.status.dimulai) return;
    const band = labelSkor(k.skor);
    if (bandSebelum.current === null) {
      bandSebelum.current = band;
      return;
    }
    if (band !== bandSebelum.current) {
      bandSebelum.current = band;
      setSpanduk(band);
      if (band === "Ergonomis") audio.sukses();
      const timer = setTimeout(() => setSpanduk(null), 2800);
      return () => clearTimeout(timer);
    }
  }, [k.skor, k.status.dimulai]);

  if (!k.status.dimulai) return null;

  const { status, params, pengaturan } = k;
  const prompt = teksPrompt(status.target, params, status.sikap);
  const IkonTarget = status.target ? IKON_TARGET[status.target] || Activity : null;
  const warna = warnaSkor(k.skor);
  const keliling = 2 * Math.PI * 31;
  const uiTerbuka = status.menuBuka || status.bantuanBuka || status.modeInteraksi;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 font-sans">
      {/* Gradasi keterbacaan */}
      <div className="scrim-atas absolute inset-x-0 top-0 h-32" />
      <div className="scrim-bawah absolute inset-x-0 bottom-0 h-32" />
      {/* Vinyet saat jongkok */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: "radial-gradient(ellipse at center, transparent 52%, rgba(8,10,12,0.55) 100%)",
          opacity: status.sikap === "jongkok" ? 1 : 0,
        }}
      />

      {/* ---------- Kartu skor (kiri atas) ---------- */}
      <div className="kaca absolute left-4 top-4 w-[268px] animate-masuk-atas rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-terakota-500">
            <ChefHat size={13} className="text-arang-950" />
          </div>
          <span className="teks-display text-[11px] font-extrabold tracking-[0.2em] text-krem-50">ERGODAPUR</span>
          <span className="ml-auto rounded-md border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-amber-300">
            SIMULASI
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative h-[84px] w-[84px] shrink-0">
            <svg width="84" height="84" className="-rotate-90" style={{ filter: `drop-shadow(0 0 8px ${warna}55)` }}>
              <circle cx="42" cy="42" r="31" fill="none" stroke="rgba(243,236,221,0.1)" strokeWidth="7" />
              <circle
                cx="42"
                cy="42"
                r="31"
                fill="none"
                stroke={warna}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={keliling}
                strokeDashoffset={keliling * (1 - k.skor / 100)}
                style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1), stroke 0.4s" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="teks-display text-[22px] font-extrabold leading-none" style={{ color: warna }}>
                {k.skor}
              </span>
              <span className="mt-0.5 text-[9px] font-semibold tracking-wide text-krem-100/55">DARI 100</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <span
              className="teks-display inline-block rounded-lg border px-2 py-1 text-[11.5px] font-extrabold leading-none"
              style={{ color: warna, borderColor: `${warna}55`, background: `${warna}14` }}
            >
              {labelSkor(k.skor)}
            </span>
            <p className="mt-1.5 text-[10.5px] leading-snug text-krem-100/60">
              Skor ergonomi tata letak dapur Anda saat ini.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="titik-hidup" style={{ background: warna, color: warna }} />
              <span className="text-[10px] font-semibold text-krem-100/70">
                {k.masalah.length ? `${k.masalah.length} temuan aktif` : "Tanpa temuan"}
              </span>
            </div>
          </div>
        </div>

        {/* Empat pilar */}
        <div className="mt-3.5 space-y-2 border-t border-white/[0.06] pt-3">
          {(Object.keys(NAMA_PILAR) as (keyof typeof NAMA_PILAR)[]).map((kunci) => {
            const Ikon = IKON_PILAR[kunci];
            const nilai = k.pilar[kunci];
            const maks = MAKS_PILAR[kunci];
            const persen = (nilai / maks) * 100;
            const w = warnaSkor(persen);
            return (
              <div key={kunci} className="flex items-center gap-2">
                <span
                  className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md"
                  style={{ background: `${w}16`, border: `1px solid ${w}30` }}
                >
                  <Ikon size={12} style={{ color: w }} />
                </span>
                <span className="w-[72px] truncate text-[10.5px] font-medium text-krem-100/75">{NAMA_PILAR[kunci]}</span>
                <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${persen}%`, background: `linear-gradient(90deg, ${w}90, ${w})` }}
                  />
                </div>
                <span className="teks-display w-9 text-right text-[10px] font-bold tabular-nums text-krem-100/80">
                  {nilai}/{maks}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------- Tombol pojok kanan atas ---------- */}
      <div className="pointer-events-auto absolute right-4 top-4 flex animate-masuk-atas items-center gap-2">
        <div className="kaca flex items-center rounded-xl p-1">
          <button
            onClick={() => toko.setStatus({ bantuanBuka: true })}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-krem-100/75 transition hover:bg-white/10 hover:text-amber-300"
            title="Bantuan & cara bermain (H)"
          >
            <CircleHelp size={15.5} />
          </button>
          <div className="h-4 w-px bg-white/10" />
          <button
            onClick={() => toko.setPengaturan({ bisu: !pengaturan.bisu })}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-krem-100/75 transition hover:bg-white/10 hover:text-amber-300"
            title="Bisukan / aktifkan suara (M)"
          >
            {pengaturan.bisu ? <VolumeX size={15.5} /> : <Volume2 size={15.5} />}
          </button>
          <div className="h-4 w-px bg-white/10" />
          <button
            onClick={() => {
              toko.setStatus({ modeTata: !status.modeTata, dipegang: null });
              audio.beralih();
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-white/10 ${status.modeTata ? "text-emerald-300" : "text-krem-100/75 hover:text-amber-300"}`}
            title="Mode Tata Letak — pindahkan barang (B)"
          >
            <Move size={15.5} />
          </button>
          <div className="h-4 w-px bg-white/10" />
          <button
            onClick={() => {
              toko.setStatus({ modelBuka: true });
              document.exitPointerLock?.();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-krem-100/75 transition hover:bg-white/10 hover:text-sky-300"
            title="Manajer Model 3D — pasang model Sketchfab (K)"
          >
            <Boxes size={15.5} />
          </button>
          <div className="h-4 w-px bg-white/10" />
          <button
            onClick={() => {
              toko.setStatus({ menuBuka: true });
              document.exitPointerLock?.();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-krem-100/75 transition hover:bg-white/10 hover:text-amber-300"
            title="Pengaturan (Esc)"
          >
            <Settings size={15.5} />
          </button>
        </div>
        <div
          className="kaca flex h-10 items-center gap-2 rounded-xl px-3"
          title="Mode VR tersedia — klik ikon kacamata di kanan bawah layar 3D dengan headset tersambung"
        >
          <Glasses size={15.5} className="text-amber-300" />
          <span className="teks-display text-[10.5px] font-bold tracking-wider text-krem-100/85">
            {status.dalamVR ? "VR AKTIF" : "VR SIAP"}
          </span>
          <span className="titik-hidup" style={{ background: "#34d399", color: "#34d399" }} />
        </div>
      </div>

      {/* ---------- Panel evaluasi + toast (kanan) ---------- */}
      <div className="absolute right-4 top-[72px] flex w-[334px] flex-col gap-2.5">
        <div className="kaca animate-masuk-kanan rounded-2xl p-3.5">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="titik-hidup" style={{ background: "#f59e0b", color: "#f59e0b" }} />
            <span className="teks-display text-[11px] font-extrabold tracking-[0.16em] text-krem-50">
              EVALUASI ERGONOMI
            </span>
            <span className="ml-auto rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-bold text-krem-100/55">
              LANGSUNG
            </span>
          </div>
          {k.masalah.length === 0 ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3">
              <Sparkles size={15} className="mt-0.5 shrink-0 text-emerald-300" />
              <div>
                <div className="teks-display text-[11.5px] font-bold text-emerald-200">Semua parameter optimal</div>
                <p className="mt-0.5 text-[10.5px] leading-snug text-emerald-200/75">
                  Dapur siap digunakan dengan aman, sehat, dan nyaman. Pertahankan!
                </p>
              </div>
            </div>
          ) : (
            <div className="bilah-halus max-h-44 space-y-1.5 overflow-y-auto pr-1">
              {k.masalah.map((m) => (
                <div
                  key={m.id}
                  className={`relative overflow-hidden rounded-xl p-2.5 pl-3 ${
                    m.tingkat === "buruk" ? "anim-pindar bg-red-400/[0.09]" : "bg-amber-400/[0.07]"
                  }`}
                >
                  <span
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{ background: warnaTingkat[m.tingkat] }}
                  />
                  <p className="text-[11px] leading-snug text-krem-100/88">{m.teks}</p>
                  <span
                    className="mt-1.5 inline-block rounded border px-1.5 py-px text-[8.5px] font-extrabold tracking-widest"
                    style={{
                      color: warnaTingkat[m.tingkat],
                      borderColor: `${warnaTingkat[m.tingkat]}45`,
                      background: `${warnaTingkat[m.tingkat]}12`,
                    }}
                  >
                    {CHIP_TINGKAT[m.tingkat] || "PERHATIAN"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Toast */}
        {k.toasts.map((t) => (
          <div
            key={t.id}
            className="kaca relative flex animate-masuk-kanan items-start gap-2.5 overflow-hidden rounded-xl p-3 pl-3.5"
          >
            <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: warnaTingkat[t.tingkat] }} />
            <span className="mt-px shrink-0">
              <IkonTingkat tingkat={t.tingkat} />
            </span>
            <p className="text-[11.5px] leading-snug text-krem-100/90">{t.teks}</p>
          </div>
        ))}
      </div>

      {/* ---------- Panel kurikulum modul (kiri bawah) ---------- */}
      <PanelModul />

      {/* ---------- Bantuan kontrol (bawah, di atas panel modul) ---------- */}
      <div className="kaca absolute bottom-[76px] right-4 hidden w-[240px] animate-masuk-atas flex-wrap items-center gap-x-2.5 gap-y-1.5 rounded-xl px-3 py-2.5 opacity-75 transition hover:opacity-100 lg:flex">
        {[
          ["W A S D", "bergerak"],
          ["Mouse", "melihat"],
          ["Klik", "ambil / letakkan"],
          ["C", "jongkok"],
          ["Shift", "berdiri tegak"],
          ["[ ]", "atur / geser"],
          ["G", "geser rak mendatar"],
          ["Q E", "putar objek"],
          ["R T", "tinggi / rendah"],
          ["K", "model 3D"],
          ["U", "sembunyikan UI"],
          ["Esc", "buka pengaturan"],
        ].map(([kunci, label]) => (
          <span key={kunci} className="flex items-center gap-1.5 text-[9.5px] text-krem-100/60">
            <span className="keycap">{kunci}</span> {label}
          </span>
        ))}
      </div>

      {/* ---------- Indikator Mode Tata Letak ---------- */}
      {status.modeTata && !uiTerbuka && (
        <div className="absolute left-1/2 top-[76px] -translate-x-1/2 animate-masuk-atas">
          <div
            className="kaca flex items-center gap-3 rounded-full px-4 py-2"
            style={{ borderColor: "rgba(52,211,153,0.4)", background: "rgba(16,32,26,0.72)" }}
          >
            <Move size={14} className="text-emerald-300" />
            <span className="teks-display text-[11.5px] font-extrabold tracking-wide text-emerald-200">
              MODE TATA LETAK
            </span>
            <span className="h-3.5 w-px bg-white/15" />
            <span className="flex items-center gap-1.5 text-[10px] text-krem-100/70">
              <span className="keycap">Klik</span>
              {status.dipegang ? "letakkan" : "ambil objek"}
            </span>
            {status.dipegang && (
              <span className="flex items-center gap-1.5 text-[10px] text-krem-100/70">
                <span className="keycap">Q / E</span> putar
              </span>
            )}
            {status.dipegang && (
              <span className="flex items-center gap-1.5 text-[10px] text-krem-100/70">
                <span className="keycap">R / T</span> tinggi / rendah
              </span>
            )}
            <span className="flex items-center gap-1.5 text-[10px] text-krem-100/70">
              <span className="keycap">Esc</span> buka pengaturan
            </span>
          </div>
          {status.dipegang && (
            <div className="mt-1.5 text-center text-[10.5px] font-semibold text-emerald-300/90 drop-shadow">
              Memindahkan: {status.dipegang === "meja-atas" ? "Pulau Meja Potong" : status.dipegang.replace("-", " ")}
              {" — gerakkan mouse ke lokasi tujuan"}
            </div>
          )}
        </div>
      )}

      {/* ---------- Indikator postur ---------- */}
      {status.sikap !== "berdiri" && (
        <div className="absolute bottom-[138px] left-1/2 flex -translate-x-1/2 animate-layu-masuk items-center gap-2 rounded-full border border-amber-400/40 bg-arang-900/85 px-3.5 py-1.5 shadow-lg shadow-amber-500/10 backdrop-blur">
          <PersonStanding size={14} className="text-amber-300" />
          <span className="text-[11px] font-semibold text-amber-200">
            {status.sikap === "jongkok" ? "Jongkok — postur aman untuk rak bawah" : "Berdiri tegak (Shift)"}
          </span>
        </div>
      )}

      {/* ---------- Prompt interaksi ---------- */}
      {prompt && !uiTerbuka && (
        <div key={status.target} className="absolute bottom-7 left-1/2 w-max max-w-[92vw] -translate-x-1/2 animate-masuk-atas">
          <div className="kaca flex items-center gap-4 rounded-2xl px-4 py-3">
            {IkonTarget && (
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10">
                <IkonTarget size={19} className="text-amber-300" />
                <span className="absolute inset-0 animate-nadi-lembut rounded-xl border border-amber-400/20" />
              </div>
            )}
            <div className="min-w-0">
              <div className="teks-display text-[13px] font-extrabold tracking-wide text-krem-50">{prompt.nama}</div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                {prompt.aksi.map((a) => (
                  <span key={a.kunci} className="flex items-center gap-1.5">
                    <span className="keycap">{a.kunci}</span>
                    <span className="text-[10.5px] font-medium text-krem-100/75">{a.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Petunjuk kunci kursor ---------- */}
      {!uiTerbuka && !status.kursorTerkunci && !status.dalamVR && (
        <div className="pointer-events-auto absolute left-1/2 top-[58%] -translate-x-1/2">
          <div className="kaca flex animate-nadi-lembut cursor-default items-center gap-2.5 rounded-full border-amber-400/30 px-5 py-2.5">
            <span className="titik-hidup" style={{ background: "#f59e0b", color: "#f59e0b" }} />
            <span className="teks-display text-[12px] font-bold text-krem-100/90">
              Klik untuk mengunci kursor FPS — klik objek untuk berinteraksi atau memindahkannya
            </span>
          </div>
        </div>
      )}

      {/* ---------- Spanduk kelas skor ---------- */}
      {spanduk && (
        <div className="absolute left-1/2 top-[20%] -translate-x-1/2 animate-masuk-atas">
          <div className="kaca flex items-center gap-3.5 rounded-2xl border-white/10 px-6 py-4">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: `${warnaSkor(k.skor)}18`, border: `1px solid ${warnaSkor(k.skor)}40` }}
            >
              <Sparkles size={20} style={{ color: warnaSkor(k.skor) }} />
            </span>
            <div>
              <div
                className="teks-display text-[22px] font-extrabold tracking-tight leading-none"
                style={{ color: warnaSkor(k.skor) }}
              >
                {k.skor}% — {spanduk}
              </div>
              <div className="mt-1 text-[11.5px] font-medium text-krem-100/70">
                Pengaturan dapur Anda kini {k.skor}% ergonomis
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Modal / Banner Evaluasi Ergonomi Langsung ---------- */}
      {status.evaluasiTerakhir && (
        <div className="pointer-events-auto absolute left-1/2 top-5 z-40 w-[94vw] max-w-lg -translate-x-1/2 animate-masuk-atas">
          {(() => {
            const ev = status.evaluasiTerakhir;
            const info =
              ev.skor >= 80
                ? { teks: "Baik (80–100%)", badge: "🟢 Hijau", hex: "#34d399", bg: "rgba(52, 211, 153, 0.15)", border: "rgba(52, 211, 153, 0.45)" }
                : ev.skor >= 50
                ? { teks: "Cukup (50–79%)", badge: "🟡 Kuning", hex: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.45)" }
                : { teks: "Buruk (<50%)", badge: "🔴 Merah", hex: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.45)" };
            return (
              <div
                className="kaca relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl border transition-all"
                style={{ borderColor: info.border, background: "rgba(15, 19, 24, 0.95)" }}
              >
                {/* Top indicator bar */}
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{ev.skor >= 80 ? "🟢" : ev.skor >= 50 ? "🟡" : "🔴"}</span>
                    <span className="teks-display text-[11px] font-extrabold tracking-wider text-krem-50">
                      EVALUASI ERGONOMI LANGSUNG
                    </span>
                    <span
                      className="rounded-md px-2 py-0.5 text-[9.5px] font-bold"
                      style={{ color: info.hex, background: info.bg, border: `1px solid ${info.border}` }}
                    >
                      {info.badge} : {info.teks}
                    </span>
                  </div>
                  <button
                    onClick={() => toko.tutupEvaluasi()}
                    className="rounded-lg p-1 text-krem-100/60 hover:bg-white/10 hover:text-white transition"
                    title="Tutup evaluasi (Klik)"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-3.5 flex items-start gap-3.5">
                  <div
                    className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border"
                    style={{ borderColor: info.border, background: info.bg, color: info.hex }}
                  >
                    <span className="teks-display text-base font-black leading-none">{ev.skor}%</span>
                    <span className="text-[8px] font-bold tracking-tight opacity-75">SKOR</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="teks-display text-[13.5px] font-extrabold text-krem-50 leading-snug">
                      {ev.judul}
                    </h3>
                    <p className="mt-1 text-[12px] font-semibold leading-relaxed" style={{ color: info.hex }}>
                      {ev.teks}
                    </p>
                    {ev.saran && (
                      <p className="mt-1.5 text-[11px] leading-relaxed text-krem-100/75 border-t border-white/5 pt-1.5">
                        <span className="font-bold text-amber-300">Tips Ergonomi: </span>
                        {ev.saran}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-white/10 text-[10.5px] text-krem-100/60">
                  <span className="flex items-center gap-1.5">
                    <span>Objek:</span>
                    <strong className="text-krem-50">{ev.namaObjek}</strong>
                  </span>
                  <button
                    onClick={() => toko.tutupEvaluasi()}
                    className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1 font-semibold text-krem-100 transition"
                  >
                    Tutup Evaluasi
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
