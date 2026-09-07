// ============================================================
// ErgoDapur — Panel Kurikulum (modul aktif + sasaran terukur)
// ============================================================

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, GraduationCap, Info, Lock, Target } from "lucide-react";
import { gunakanToko } from "../game/store";

export default function PanelModul() {
  const modul = gunakanToko((s) => s.modul);
  const aktifIdx = gunakanToko((s) => s.modulAktif);
  const [lipat, setLipat] = useState(false);

  if (!modul.length) return null;
  const aktif = modul[aktifIdx];
  const totalTuntas = modul.filter((m) => m.tuntas).length;

  return (
    <div className="kaca pointer-events-auto absolute bottom-4 left-4 w-[330px] animate-masuk-atas rounded-2xl p-3.5">
      {/* Kepala kurikulum */}
      <div className="flex items-center gap-2">
        <GraduationCap size={15} className="text-amber-400" />
        <span className="teks-display text-[11px] font-extrabold tracking-[0.16em] text-krem-50">
          KURIKULUM ERGONOMI
        </span>
        <span className="teks-display ml-auto text-[11px] font-extrabold tabular-nums text-amber-300">
          {totalTuntas}/{modul.length}
        </span>
        <button
          onClick={() => setLipat((v) => !v)}
          className="flex h-5 w-5 items-center justify-center rounded text-krem-100/50 transition hover:bg-white/10 hover:text-krem-50"
          title={lipat ? "Tampilkan sasaran" : "Sembunyikan sasaran"}
        >
          {lipat ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Peta modul */}
      <div className="mt-2.5 flex items-center gap-1">
        {modul.map((m, i) => (
          <div
            key={m.id}
            title={`Modul ${m.nomor} — ${m.judul}`}
            className="group relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]"
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(m.selesai / m.total) * 100}%`,
                background: m.tuntas ? "#34d399" : i === aktifIdx ? "linear-gradient(90deg,#f59e0b,#e08a63)" : "#6b7280",
              }}
            />
          </div>
        ))}
      </div>

      {/* Modul aktif */}
      <div className="mt-3 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-3">
        <div className="flex items-start gap-2.5">
          <span className="teks-display flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-[12px] font-extrabold text-amber-300">
            {aktif.nomor}
          </span>
          <div className="min-w-0 flex-1">
            <div className="teks-display text-[12.5px] font-extrabold leading-tight text-krem-50">{aktif.judul}</div>
            <div className="mt-0.5 text-[10px] leading-snug text-krem-100/60">{aktif.subjudul}</div>
          </div>
          <span className="teks-display shrink-0 text-[11px] font-extrabold tabular-nums text-amber-300">
            {aktif.selesai}/{aktif.total}
          </span>
        </div>

        {!lipat && (
          <>
            <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-arang-950/40 p-2">
              <Info size={11} className="mt-0.5 shrink-0 text-sky-300/80" />
              <p className="text-[10px] leading-snug text-krem-100/65">{aktif.briefing}</p>
            </div>

            {/* Daftar sasaran terukur */}
            <div className="mt-2.5 space-y-2">
              {aktif.sasaran.map((s) => (
                <div key={s.id} className="flex items-start gap-2">
                  {s.selesai ? (
                    <span className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-400/15">
                      <CheckCircle2 size={11.5} className="text-emerald-400" />
                    </span>
                  ) : (
                    <span className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-amber-400/40">
                      <Target size={9} className="text-amber-400/80" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-[10.5px] font-semibold leading-snug ${
                        s.selesai ? "text-krem-100/45 line-through decoration-emerald-400/40" : "text-krem-100/90"
                      }`}
                    >
                      {s.teks}
                    </div>
                    {/* Pembacaan terukur langsung */}
                    {s.ukur && !s.selesai && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="rounded border border-amber-400/30 bg-amber-400/10 px-1.5 py-px text-[9.5px] font-bold tabular-nums text-amber-200">
                          {s.ukur.nilai}
                        </span>
                        <span className="text-[9px] text-krem-100/40">→</span>
                        <span className="rounded border border-emerald-400/25 bg-emerald-400/[0.08] px-1.5 py-px text-[9.5px] font-bold tabular-nums text-emerald-300">
                          {s.ukur.target}
                        </span>
                      </div>
                    )}
                    {!s.selesai && !s.ukur && (
                      <div className="mt-0.5 text-[9.5px] leading-snug text-krem-100/45">{s.cara}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2.5 border-t border-white/[0.07] pt-2 text-[9px] italic leading-snug text-krem-100/40">
              Acuan: {aktif.standar}
            </div>
          </>
        )}
      </div>

      {/* Modul terkunci berikutnya */}
      {!lipat && aktifIdx < modul.length - 1 && (
        <div className="mt-2 flex items-center gap-2 px-1">
          <Lock size={10} className="shrink-0 text-krem-100/35" />
          <span className="truncate text-[9.5px] text-krem-100/40">
            Berikutnya — Modul {modul[aktifIdx + 1].nomor}: {modul[aktifIdx + 1].judul}
          </span>
        </div>
      )}
    </div>
  );
}
