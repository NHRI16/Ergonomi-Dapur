// ============================================================
// ErgoDapur — Aplikasi Utama
// Merakit scene A-Frame, pengendali permainan, dan seluruh UI.
// ============================================================

import { useEffect, useRef } from "react";
import { pastikanKomponen } from "./aframe/komponen";
import { bangunMarkahDapur } from "./aframe/markah";
import { PengendaliDapur } from "./aframe/pengendali";
import HUD from "./components/HUD";
import MenuPengaturan from "./components/MenuPengaturan";
import ModulAwal from "./components/ModulAwal";
import DebriefModul from "./components/DebriefModul";
import ManajerModel from "./components/ManajerModel";
import PanelInteraksiObjek from "./components/PanelInteraksiObjek";
import { gunakanToko } from "./game/store";

export default function App() {
  const wadah = useRef<HTMLDivElement>(null);
  const status = gunakanToko((s) => s.status);
  const antarmukaTersembunyi = status.antarmukaTersembunyi;
  const tampilCrosshair = status.dimulai && !status.menuBuka && !status.bantuanBuka && !status.modelBuka && !status.modeInteraksi && !status.dalamVR;

  useEffect(() => {
    pastikanKomponen();
    const el = wadah.current!;
    el.innerHTML = bangunMarkahDapur();
    const scene = el.querySelector("a-scene")! as any;
    const pengendali = new PengendaliDapur();
    const mulaiPengendali = () => pengendali.init(scene);
    if (scene.hasLoaded) mulaiPengendali();
    else scene.addEventListener("loaded", mulaiPengendali, { once: true });
    (window as any).__pengendali = pengendali;

    return () => {
      pengendali.hancur();
      (window as any).__pengendali = undefined;
      el.innerHTML = "";
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-arang-950 font-sans text-krem-50">
      {/* Scene 3D A-Frame */}
      <div ref={wadah} className="bingkai-scene" />
      {/* Vignette lembut di atas kanvas */}
      <div className="vinyet pointer-events-none fixed inset-0 z-[5]" />
      {/* Penanda arah selalu tersedia saat bermain, bahkan bila UI disembunyikan dengan U. */}
      {tampilCrosshair && (
        <div aria-hidden="true" className="pointer-events-none fixed left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <div className={`crosshair-cincin h-9 w-9 rounded-full ${status.target ? "aktif" : "opacity-75"}`} />
          <div
            className={`absolute left-1/2 top-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-all ${
              status.target ? "scale-125 bg-amber-400" : "bg-krem-50/85"
            }`}
          />
        </div>
      )}
      {/* Panel interaksi objek selalu tampil saat aktif, tidak terpengaruh tombol U. */}
      <PanelInteraksiObjek />
      {/* Antarmuka permainan lainnya — tombol U menyembunyikan/menampilkannya. */}
      {!antarmukaTersembunyi && (
        <>
          <HUD />
          <DebriefModul />
          <ManajerModel />
          <MenuPengaturan />
          <ModulAwal />
        </>
      )}
    </div>
  );
}
