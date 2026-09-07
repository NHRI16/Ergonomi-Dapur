// ============================================================
// ErgoDapur — Debrief Modul (pembelajaran setelah modul tuntas)
// ============================================================

import { Award, BookOpen, ChevronRight, Lightbulb } from "lucide-react";
import { gunakanToko, toko } from "../game/store";

export default function DebriefModul() {
  const debrief = gunakanToko((s) => s.debrief);
  const modul = gunakanToko((s) => s.modul);
  if (!debrief) return null;

  const semuaTuntas = modul.every((m) => m.tuntas);
  const berikutnya = modul.find((m) => !m.tuntas);

  const lanjut = () => {
    toko.tutupDebrief();
    const kanvas = document.querySelector<HTMLCanvasElement>(".bingkai-scene canvas");
    try {
      const r = kanvas?.requestPointerLock?.();
      if (r && (r as Promise<void>).catch) (r as Promise<void>).catch(() => {});
    } catch {
      /* abaikan */
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm animate-layu-masuk">
      <div className="kaca w-full max-w-xl animate-masuk-atas rounded-3xl p-6 md:p-7">
        {/* Kepala */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
            <Award size={22} className="text-arang-950" />
          </div>
          <div className="min-w-0">
            <div className="teks-display text-[10px] font-extrabold tracking-[0.28em] text-emerald-400">
              {semuaTuntas ? "SERTIFIKASI SELESAI" : `MODUL ${debrief.nomor} TUNTAS`}
            </div>
            <h2 className="teks-display mt-0.5 text-[22px] font-extrabold leading-tight text-krem-50">
              {debrief.judul}
            </h2>
            <p className="mt-0.5 text-[11.5px] text-krem-100/60">{debrief.subjudul}</p>
          </div>
          <span className="teks-display ml-auto shrink-0 rounded-lg border border-emerald-400/35 bg-emerald-400/12 px-2.5 py-1 text-[11px] font-extrabold text-emerald-300">
            {debrief.total}/{debrief.total}
          </span>
        </div>

        {/* Pembelajaran */}
        <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
          <div className="teks-display mb-3 flex items-center gap-2 text-[11px] font-extrabold tracking-[0.16em] text-krem-100/85">
            <Lightbulb size={13} className="text-amber-400" /> YANG ANDA PELAJARI
          </div>
          <div className="space-y-2.5">
            {debrief.pelajaran.map((teks, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="teks-display mt-px flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md bg-amber-400/15 text-[9.5px] font-extrabold text-amber-300" style={{ height: 18, width: 18 }}>
                  {i + 1}
                </span>
                <p className="text-[11.5px] leading-relaxed text-krem-100/80">{teks}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Standar acuan */}
        <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-sky-400/20 bg-sky-400/[0.06] px-3.5 py-2.5">
          <BookOpen size={14} className="shrink-0 text-sky-300" />
          <span className="text-[10.5px] leading-snug text-krem-100/75">
            <span className="font-bold text-sky-200">Acuan standar:</span> {debrief.standar}
          </span>
        </div>

        {/* Modul berikutnya */}
        {berikutnya && (
          <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-3.5 py-2.5">
            <span className="teks-display flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-[11px] font-extrabold text-amber-300">
              {berikutnya.nomor}
            </span>
            <div className="min-w-0">
              <div className="text-[9.5px] font-bold tracking-wider text-amber-400/80">MODUL BERIKUTNYA TERBUKA</div>
              <div className="teks-display truncate text-[12px] font-extrabold text-krem-50">{berikutnya.judul}</div>
            </div>
          </div>
        )}

        <button
          onClick={lanjut}
          className="cta-utama teks-display mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-terakota-500 px-6 py-3.5 text-[14px] font-extrabold text-arang-950 shadow-lg shadow-amber-600/25 transition hover:brightness-110 active:scale-[0.99]"
        >
          {semuaTuntas ? "Selesai — Kembali ke Dapur" : "Lanjut ke Modul Berikutnya"} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
