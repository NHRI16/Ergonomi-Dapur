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
  const antarmukaTersembunyi = gunakanToko((s) => s.status.antarmukaTersembunyi);

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
      {/* Antarmuka permainan — tombol U menyembunyikan/menampilkannya. */}
      {!antarmukaTersembunyi && (
        <>
          <HUD />
          <PanelInteraksiObjek />
          <DebriefModul />
          <ManajerModel />
          <MenuPengaturan />
          <ModulAwal />
        </>
      )}
    </div>
  );
}
