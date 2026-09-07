// ============================================================
// ErgoDapur — Manajer Model 3D (integrasi Sketchfab)
// Memasang berkas .glb/.gltf ke slot objek dapur secara langsung.
// ============================================================

import { useSyncExternalStore, useRef, useState } from "react";
import {
  Box,
  Boxes,
  ExternalLink,
  FolderOpen,
  Info,
  Link2,
  RotateCcw,
  RotateCw,
  Trash2,
  X,
} from "lucide-react";
import { katalog, type SlotModel } from "../game/katalog";
import { gunakanToko, toko } from "../game/store";
import { audio } from "../game/audio";

function gunakanKatalog(): SlotModel[] {
  return useSyncExternalStore(katalog.langganan, katalog.dapatkan);
}

function BarisSlot({ s }: { s: SlotModel }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const terpasang = !!s.jalur;

  const pasangBerkas = (f?: File | null) => {
    if (!f) return;
    if (!/\.(glb|gltf)$/i.test(f.name)) {
      toko.toast("Format tidak didukung. Gunakan berkas .glb atau .gltf.", "buruk");
      return;
    }
    katalog.pasangBerkas(s.id, f);
    audio.klik();
  };

  return (
    <div className={`kartu-bagian p-3.5 ${terpasang ? "border-emerald-400/30" : ""}`}>
      <div className="flex items-start gap-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: terpasang ? "rgba(52,211,153,0.14)" : "rgba(250,246,238,0.07)",
            border: `1px solid ${terpasang ? "rgba(52,211,153,0.35)" : "rgba(250,246,238,0.12)"}`,
          }}
        >
          <Box size={15} className={terpasang ? "text-emerald-300" : "text-krem-100/50"} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="teks-display text-[12.5px] font-extrabold text-krem-50">{s.nama}</span>
            {terpasang && (
              <span className="rounded border border-emerald-400/35 bg-emerald-400/10 px-1.5 py-px text-[8.5px] font-extrabold tracking-wider text-emerald-300">
                AKTIF
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[10px] leading-snug text-krem-100/55">{s.keterangan}</p>
        </div>
      </div>

      {/* Pilih berkas / URL */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <input
          ref={inputRef}
          type="file"
          accept=".glb,.gltf,model/gltf-binary"
          className="hidden"
          onChange={(e) => pasangBerkas(e.target.files?.[0])}
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.06] px-2.5 py-1.5 text-[10.5px] font-semibold text-krem-100/85 transition hover:border-amber-400/45 hover:bg-amber-400/10 hover:text-amber-200"
        >
          <FolderOpen size={12} /> Pilih berkas .glb
        </button>
        {terpasang && (
          <button
            onClick={() => {
              katalog.kosongkan(s.id);
              audio.beralih();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.06] px-2.5 py-1.5 text-[10.5px] font-semibold text-krem-100/70 transition hover:border-red-400/45 hover:bg-red-400/10 hover:text-red-200"
          >
            <Trash2 size={12} /> Lepas
          </button>
        )}
      </div>

      <div className="mt-1.5 flex gap-1.5">
        <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-white/10 bg-arang-950/50 px-2">
          <Link2 size={11} className="shrink-0 text-krem-100/40" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="atau /models/nama.glb"
            className="w-full bg-transparent py-1.5 text-[10.5px] text-krem-100/85 outline-none placeholder:text-krem-100/30"
          />
        </div>
        <button
          onClick={() => {
            if (!url.trim()) return;
            katalog.perbarui(s.id, { jalur: url.trim() });
            audio.klik();
          }}
          className="rounded-lg border border-amber-400/40 bg-amber-400/12 px-2.5 py-1.5 text-[10.5px] font-bold text-amber-200 transition hover:bg-amber-400/20"
        >
          Pasang
        </button>
      </div>

      {/* Penyesuaian transformasi */}
      {terpasang && (
        <div className="mt-2.5 grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-2.5">
          <label className="block">
            <span className="text-[9px] font-bold tracking-wider text-krem-100/45">SKALA</span>
            <input
              type="number"
              step="0.01"
              value={s.skala}
              onChange={(e) => katalog.perbarui(s.id, { skala: parseFloat(e.target.value) || 0.01 })}
              className="mt-0.5 w-full rounded-md border border-white/10 bg-arang-950/50 px-1.5 py-1 text-[10.5px] tabular-nums text-krem-100/90 outline-none focus:border-amber-400/40"
            />
          </label>
          <label className="block">
            <span className="text-[9px] font-bold tracking-wider text-krem-100/45">TINGGI (m)</span>
            <input
              type="number"
              step="0.05"
              value={s.offsetY}
              onChange={(e) => katalog.perbarui(s.id, { offsetY: parseFloat(e.target.value) || 0 })}
              className="mt-0.5 w-full rounded-md border border-white/10 bg-arang-950/50 px-1.5 py-1 text-[10.5px] tabular-nums text-krem-100/90 outline-none focus:border-amber-400/40"
            />
          </label>
          <div>
            <span className="text-[9px] font-bold tracking-wider text-krem-100/45">PUTAR</span>
            <div className="mt-0.5 flex gap-1">
              <button
                onClick={() => katalog.perbarui(s.id, { putarY: (s.putarY + 315) % 360 })}
                className="flex flex-1 items-center justify-center rounded-md border border-white/10 bg-arang-950/50 py-1 text-krem-100/70 transition hover:text-amber-300"
              >
                <RotateCcw size={11} />
              </button>
              <span className="teks-display flex-1 rounded-md border border-white/10 bg-arang-950/50 py-1 text-center text-[10px] tabular-nums text-krem-100/80">
                {s.putarY}°
              </span>
              <button
                onClick={() => katalog.perbarui(s.id, { putarY: (s.putarY + 45) % 360 })}
                className="flex flex-1 items-center justify-center rounded-md border border-white/10 bg-arang-950/50 py-1 text-krem-100/70 transition hover:text-amber-300"
              >
                <RotateCw size={11} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ManajerModel() {
  const buka = gunakanToko((s) => s.status.modelBuka);
  const slot = gunakanKatalog();
  if (!buka) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-layu-masuk">
      <div className="kaca w-full max-w-2xl animate-masuk-atas rounded-3xl p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-sky-600">
            <Boxes size={18} className="text-arang-950" />
          </div>
          <div className="min-w-0">
            <h2 className="teks-display text-lg font-extrabold text-krem-50">Manajer Model 3D</h2>
            <p className="text-[11.5px] text-krem-100/60">
              Pasang model GLB/glTF dari Sketchfab ke objek dapur — langsung tampil tanpa membangun ulang.
            </p>
          </div>
          <button
            onClick={() => toko.setStatus({ modelBuka: false })}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-krem-100/60 transition hover:bg-white/10 hover:text-krem-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Panduan singkat */}
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-sky-400/25 bg-sky-400/[0.07] p-3.5">
          <Info size={15} className="mt-0.5 shrink-0 text-sky-300" />
          <div className="text-[10.5px] leading-relaxed text-krem-100/78">
            <span className="font-bold text-sky-200">Cara pakai:</span> unduh model dari Sketchfab dalam format{" "}
            <span className="font-semibold text-krem-50">glTF / GLB</span> (tombol{" "}
            <em>Download 3D Model</em>), lalu klik <span className="font-semibold text-krem-50">Pilih berkas .glb</span>{" "}
            di bawah. Untuk permanen, salin berkas ke folder{" "}
            <code className="rounded bg-arang-950/70 px-1 py-px text-[10px] text-amber-200">public/models/</code> lalu
            isi jalur{" "}
            <code className="rounded bg-arang-950/70 px-1 py-px text-[10px] text-amber-200">/models/nama.glb</code>.
            <a
              href="https://sketchfab.com/search?features=downloadable&type=models&q=kitchen"
              target="_blank"
              rel="noreferrer"
              className="ml-1 inline-flex items-center gap-1 font-bold text-sky-300 underline decoration-sky-400/40 hover:text-sky-200"
            >
              Cari model dapur <ExternalLink size={9} />
            </a>
          </div>
        </div>

        <div className="bilah-halus max-h-[52vh] space-y-2.5 overflow-y-auto pr-1.5">
          {slot.map((s) => (
            <BarisSlot key={s.id} s={s} />
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              katalog.aturUlangSemua();
              toko.toast("Semua slot model dikembalikan ke bentuk primitif bawaan.", "info");
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-[12px] font-semibold text-krem-100/80 transition hover:border-red-400/35 hover:bg-red-400/10 hover:text-red-200"
          >
            <RotateCcw size={13} /> Atur Ulang Semua Slot
          </button>
          <button
            onClick={() => {
              toko.setStatus({ modelBuka: false });
              const kanvas = document.querySelector<HTMLCanvasElement>(".bingkai-scene canvas");
              try {
                const r = kanvas?.requestPointerLock?.();
                if (r && (r as Promise<void>).catch) (r as Promise<void>).catch(() => {});
              } catch {
                /* abaikan */
              }
            }}
            className="teks-display flex-1 rounded-xl bg-amber-500 px-4 py-2.5 text-[13px] font-extrabold text-arang-950 transition hover:bg-amber-400"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
