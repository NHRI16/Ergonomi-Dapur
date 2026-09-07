// ============================================================
// ErgoDapur — Panel Interaksi Objek (Toggle Tombol F)
// Memungkinkan pemain mengatur parameter objek dapur secara realistis,
// mengevaluasi ergonomi langsung, dan kembali ke kontrol FPS dengan F.
// ============================================================

import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  ChefHat,
  CookingPot,
  Droplets,
  Fan,
  Flame,
  Lightbulb,
  PersonStanding,
  Refrigerator,
  Ruler,
  ShieldCheck,
  Sun,
  UtensilsCrossed,
  Wind,
  X,
} from "lucide-react";
import {
  gunakanToko,
  toko,
  warnaSkor,
  labelSkor,
  lebarLorong,
  jarakRakKompor,
  hitungLuxMeja,
  type ApiKomporLevel,
} from "../game/store";
import { audio } from "../game/audio";

export default function PanelInteraksiObjek() {
  const st = gunakanToko((s) => s.status);
  const p = gunakanToko((s) => s.params);
  const skor = gunakanToko((s) => s.skor);
  const pilar = gunakanToko((s) => s.pilar);

  if (!st.modeInteraksi || !st.objekInteraksiAktif) return null;

  const target = st.objekInteraksiAktif;
  const lux = hitungLuxMeja(p);
  const lorong = lebarLorong(p);
  const dxRak = jarakRakKompor(p);

  const tutup = () => {
    toko.keluarInteraksi();
    const cv = document.querySelector<HTMLCanvasElement>(".bingkai-scene canvas");
    try {
      cv?.requestPointerLock?.();
    } catch {}
    audio.beralih();
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/65 p-3 sm:p-5 backdrop-blur-md animate-layu-masuk">
      <div className="kaca relative flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/15 shadow-2xl shadow-black/80 max-h-[92vh]">
        {/* Header Panel */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/15 border border-amber-400/30">
              {target === "kompor" && <Flame size={20} className="text-amber-300" />}
              {(target === "meja-potong" || target === "talenan") && <ChefHat size={20} className="text-amber-300" />}
              {target === "rak-bumbu" && <CookingPot size={20} className="text-amber-300" />}
              {target === "kulkas" && <Refrigerator size={20} className="text-amber-300" />}
              {(target === "lampu-meja" || target === "saklar-lampu") && <Lightbulb size={20} className="text-amber-300" />}
              {(target === "ventilasi" || target === "hood") && <Wind size={20} className="text-amber-300" />}
              {target === "wastafel" && <Droplets size={20} className="text-amber-300" />}
              {target === "rak-bawah" && <CookingPot size={20} className="text-amber-300" />}
              {target === "stasiun-ukur" && <Ruler size={20} className="text-amber-300" />}
              {target === "papan-skor" && <Activity size={20} className="text-amber-300" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="teks-display text-base font-extrabold text-krem-50">
                  {target === "kompor" && "Interaksi Kompor & Panci"}
                  {(target === "meja-potong" || target === "talenan") && "Interaksi Meja Potong & Talenan"}
                  {target === "rak-bumbu" && "Interaksi Rak Bumbu"}
                  {target === "kulkas" && "Interaksi Kulkas & Jalur Kerja"}
                  {(target === "lampu-meja" || target === "saklar-lampu") && "Pengaturan Pencahayaan Dapur"}
                  {(target === "ventilasi" || target === "hood") && "Ventilasi & Sirkulasi Udara"}
                  {target === "wastafel" && "Wastafel & Cuci Bahan"}
                  {target === "rak-bawah" && "Rak Panci Bawah (Teknik Angkat)"}
                  {target === "stasiun-ukur" && "Stasiun Pengukur Antropometri"}
                  {target === "papan-skor" && "Evaluasi Lengkap Dapur"}
                </h2>
                <span className="rounded-md bg-amber-400/10 border border-amber-400/25 px-1.5 py-0.5 text-[9.5px] font-bold text-amber-300">
                  TOGGLE F
                </span>
              </div>
              <p className="text-[11px] text-krem-100/60">
                Ubah parameter dan perhatikan perubahan skor ergonomi seketika. Tekan F untuk kembali ke kontrol FPS.
              </p>
            </div>
          </div>

          {/* Quick Score Badge */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-1.5 border"
              style={{
                borderColor: `${warnaSkor(skor)}40`,
                background: `${warnaSkor(skor)}14`,
                color: warnaSkor(skor),
              }}
            >
              <Activity size={14} />
              <span className="teks-display text-sm font-extrabold">{skor}%</span>
              <span className="text-[10px] font-bold hidden sm:inline">{labelSkor(skor)}</span>
            </div>
            <button
              onClick={tutup}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-krem-100/60 transition hover:bg-white/10 hover:text-krem-50"
              title="Keluar interaksi & kembali ke FPS (F)"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="bilah-halus max-h-[62vh] space-y-5 overflow-y-auto p-5">
          {/* ===================== KOMPOR ===================== */}
          {target === "kompor" && (
            <div className="space-y-4">
              {/* Besar Api */}
              <div className="kartu-bagian p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-krem-100/90 flex items-center gap-2">
                    <Flame size={14} className="text-amber-400" /> Besar Api Kompor
                  </span>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded border"
                    style={{
                      color:
                        p.komporApiLevel === "tinggi"
                          ? "#f87171"
                          : p.komporApiLevel === "sedang"
                          ? "#34d399"
                          : p.komporApiLevel === "rendah"
                          ? "#7dd3fc"
                          : "#9ca3af",
                      borderColor: "currentColor",
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    {p.komporApiLevel.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(["mati", "rendah", "sedang", "tinggi"] as ApiKomporLevel[]).map((level) => {
                    const aktif = p.komporApiLevel === level;
                    return (
                      <button
                        key={level}
                        onClick={() => {
                          toko.setParams({ komporApiLevel: level });
                          audio.beralih();
                        }}
                        className={`rounded-xl border py-2.5 text-center transition ${
                          aktif
                            ? level === "tinggi"
                              ? "border-red-400/60 bg-red-400/20 text-red-200 shadow-md shadow-red-500/20"
                              : "border-amber-400/60 bg-amber-400/20 text-amber-200 shadow-md shadow-amber-500/20"
                            : "border-white/10 bg-white/5 text-krem-100/70 hover:bg-white/10"
                        }`}
                      >
                        <div className="teks-display text-[11px] font-bold capitalize">{level}</div>
                        <div className="text-[9px] text-krem-100/50 mt-0.5">
                          {level === "mati" && "Padam"}
                          {level === "rendah" && "Api Kecil"}
                          {level === "sedang" && "Optimal"}
                          {level === "tinggi" && "Boros Energi"}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {p.komporApiLevel === "tinggi" && (
                  <p className="mt-2 text-[11px] text-red-300 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="shrink-0" />
                    Api kompor terlalu besar, risiko boros energi dan panas berlebih.
                  </p>
                )}
              </div>

              {/* Posisi Panci */}
              <div className="kartu-bagian p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-krem-100/90 flex items-center gap-2">
                    <CookingPot size={14} className="text-amber-400" /> Penempatan Panci di Kompor
                  </span>
                  <button
                    onClick={() => {
                      toko.setParams({ panciAda: !p.panciAda });
                      audio.klik();
                    }}
                    className={`px-2.5 py-1 text-[10.5px] rounded-lg border transition ${
                      p.panciAda
                        ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                        : "border-white/10 bg-white/5 text-krem-100/50"
                    }`}
                  >
                    {p.panciAda ? "Panci di Kompor" : "Panci Diangkat"}
                  </button>
                </div>

                {p.panciAda && (
                  <div className="grid grid-cols-2 gap-2.5 mt-2">
                    <button
                      onClick={() => {
                        toko.setParams({ panciPosisi: "tengah" });
                        audio.klik();
                      }}
                      className={`flex flex-col items-center rounded-xl border p-3 text-center transition ${
                        p.panciPosisi === "tengah"
                          ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-200"
                          : "border-white/10 bg-white/5 text-krem-100/70 hover:bg-white/10"
                      }`}
                    >
                      <ShieldCheck size={18} className="text-emerald-400 mb-1" />
                      <span className="teks-display text-[11.5px] font-bold">Posisi Tengah (Aman)</span>
                      <span className="text-[9.5px] text-krem-100/60 mt-0.5">
                        Stabil di atas tungku, panas merata
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        toko.setParams({ panciPosisi: "tepi" });
                        audio.gagal();
                      }}
                      className={`flex flex-col items-center rounded-xl border p-3 text-center transition ${
                        p.panciPosisi === "tepi"
                          ? "border-red-400/60 bg-red-400/20 text-red-200 shadow-md shadow-red-500/20"
                          : "border-white/10 bg-white/5 text-krem-100/70 hover:bg-white/10"
                      }`}
                    >
                      <AlertTriangle size={18} className="text-red-400 mb-1" />
                      <span className="teks-display text-[11.5px] font-bold">Posisi Tepi (Rawan)</span>
                      <span className="text-[9.5px] text-krem-100/60 mt-0.5">
                        Berisiko tersenggol atau tumpah
                      </span>
                    </button>
                  </div>
                )}
                {p.panciAda && p.panciPosisi === "tepi" && (
                  <p className="mt-2 text-[11px] text-red-300 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="shrink-0" />
                    Posisi panci di tepi tungku tidak stabil dan rawan tersenggol atau tumpah.
                  </p>
                )}
              </div>

              {/* Jarak Dinding */}
              <div className="kartu-bagian p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-krem-100/90">Jarak Kompor ke Dinding Belakang</span>
                  <span className="teks-display text-[12px] font-bold text-amber-300">{Math.round(p.komporJarak)} cm</span>
                </div>
                <input
                  type="range"
                  className="geser w-full"
                  min={5}
                  max={40}
                  step={1}
                  value={p.komporJarak}
                  onChange={(e) => toko.setParams({ komporJarak: parseFloat(e.target.value) })}
                />
                <div className="flex justify-between text-[9.5px] text-krem-100/50 mt-1">
                  <span>5 cm (Rapat/Bahaya)</span>
                  <span className="text-emerald-400 font-semibold">≥ 15 cm (Standar Aman)</span>
                  <span>40 cm</span>
                </div>
              </div>
            </div>
          )}

          {/* ===================== MEJA POTONG / TALENAN ===================== */}
          {(target === "meja-potong" || target === "talenan") && (
            <div className="space-y-4">
              {/* Tinggi Meja */}
              <div className="kartu-bagian p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-krem-100/90 flex items-center gap-2">
                    <Ruler size={14} className="text-amber-400" /> Tinggi Meja Potong
                  </span>
                  <span
                    className={`teks-display text-[12px] font-bold px-2 py-0.5 rounded border ${
                      p.mejaTinggi >= 85 && p.mejaTinggi <= 92
                        ? "text-emerald-300 border-emerald-400/40 bg-emerald-400/10"
                        : "text-red-300 border-red-400/40 bg-red-400/10"
                    }`}
                  >
                    {Math.round(p.mejaTinggi)} cm
                  </span>
                </div>
                <input
                  type="range"
                  className="geser w-full"
                  min={60}
                  max={100}
                  step={1}
                  value={p.mejaTinggi}
                  onChange={(e) => toko.setParams({ mejaTinggi: parseFloat(e.target.value) })}
                />
                <div className="flex justify-between text-[9.5px] text-krem-100/50 mt-1">
                  <span>60 cm (Terlalu Rendah)</span>
                  <span className="text-emerald-400 font-semibold">85–92 cm (Zona Ideal Siku)</span>
                  <span>100 cm (Terlalu Tinggi)</span>
                </div>
                {p.mejaTinggi < 85 && (
                  <p className="mt-2.5 text-[11px] text-red-300 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="shrink-0" />
                    Meja terlalu rendah, risiko sakit punggung.
                  </p>
                )}
                {p.mejaTinggi > 92 && (
                  <p className="mt-2.5 text-[11px] text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="shrink-0" />
                    Meja potong terlalu tinggi, bahu dan lengan cepat tegang.
                  </p>
                )}
                {p.mejaTinggi >= 85 && p.mejaTinggi <= 92 && (
                  <p className="mt-2.5 text-[11px] text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="shrink-0" />
                    Tinggi meja ideal (siku 90°), postur tubuh tegak dan nyaman.
                  </p>
                )}
              </div>

              {/* Sensor Pencahayaan Meja (Lux Meter) */}
              <div className="kartu-bagian p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-krem-100/90 flex items-center gap-2">
                    <Sun size={14} className="text-amber-400" /> Sensor Pencahayaan Area Potong
                  </span>
                  <span
                    className={`teks-display text-[12px] font-bold px-2 py-0.5 rounded border ${
                      lux >= 300
                        ? "text-emerald-300 border-emerald-400/40 bg-emerald-400/10"
                        : "text-amber-300 border-amber-400/40 bg-amber-400/10"
                    }`}
                  >
                    {lux} LUX
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (lux / 600) * 100)}%`,
                      background: lux >= 300 ? "linear-gradient(90deg, #34d399, #10b981)" : "#f59e0b",
                    }}
                  />
                </div>
                <div className="flex justify-between text-[9.5px] text-krem-100/50 mt-1">
                  <span>0 Lux</span>
                  <span className="text-emerald-400 font-semibold">Min 300 Lux (Standar SNI)</span>
                  <span>600+ Lux</span>
                </div>
                {lux < 300 ? (
                  <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle size={13} className="shrink-0" />
                      Pencahayaan meja potong kurang, tambahkan lampu.
                    </span>
                    <button
                      onClick={() => {
                        toko.setParams({ lampuMeja: true, lampuMejaFokus: true });
                        audio.beralih();
                      }}
                      className="px-2 py-1 rounded bg-amber-400/20 text-amber-200 text-[10px] font-bold hover:bg-amber-400/30 whitespace-nowrap"
                    >
                      Nyalakan Lampu Meja
                    </button>
                  </div>
                ) : (
                  <p className="mt-2.5 text-[11px] text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="shrink-0" />
                    Pencahayaan meja potong optimal ({lux} lux), permukaan talenan jelas dan aman.
                  </p>
                )}
              </div>

              {/* Bahan Makanan & Potong */}
              <div className="kartu-bagian p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[12px] font-bold text-krem-50 flex items-center gap-2">
                    <UtensilsCrossed size={14} className="text-amber-400" /> Persiapan Bahan Makanan
                  </div>
                  <div className="text-[10.5px] text-krem-100/60 mt-0.5">
                    {p.tomatDipotong ? "Bahan sudah dipotong rapi" : "Bahan segar utuh di talenan"}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const posturBaik = p.mejaTinggi >= 85 && p.mejaTinggi <= 92;
                    toko.setParams({ tomatDipotong: !p.tomatDipotong, potongPosturBaik: posturBaik });
                    audio.cincang();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-terakota-500 text-arang-950 font-extrabold text-[11.5px] hover:brightness-110 active:scale-95 transition"
                >
                  {p.tomatDipotong ? "Reset Bahan" : "Potong Bahan (Tomat)"}
                </button>
              </div>
            </div>
          )}

          {/* ===================== RAK BUMBU ===================== */}
          {target === "rak-bumbu" && (
            <div className="space-y-4">
              {/* Ketinggian Rak */}
              <div className="kartu-bagian p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-krem-100/90 flex items-center gap-2">
                    <Ruler size={14} className="text-amber-400" /> Ketinggian Rak Bumbu dari Lantai
                  </span>
                  <span
                    className={`teks-display text-[12px] font-bold px-2 py-0.5 rounded border ${
                      p.rakTinggi >= 90 && p.rakTinggi <= 150
                        ? "text-emerald-300 border-emerald-400/40 bg-emerald-400/10"
                        : "text-red-300 border-red-400/40 bg-red-400/10"
                    }`}
                  >
                    {Math.round(p.rakTinggi)} cm
                  </span>
                </div>
                <input
                  type="range"
                  className="geser w-full"
                  min={60}
                  max={190}
                  step={1}
                  value={p.rakTinggi}
                  onChange={(e) => toko.setParams({ rakTinggi: parseFloat(e.target.value) })}
                />
                <div className="flex justify-between text-[9.5px] text-krem-100/50 mt-1">
                  <span>60 cm (Membungkuk)</span>
                  <span className="text-emerald-400 font-semibold">90–150 cm (Zona Emas Jangkauan)</span>
                  <span>190 cm (Menjinjit)</span>
                </div>
                {p.rakTinggi > 150 && (
                  <p className="mt-2.5 text-[11px] text-red-300 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="shrink-0" />
                    Rak bumbu terlalu tinggi, sulit dijangkau.
                  </p>
                )}
                {p.rakTinggi < 75 && (
                  <p className="mt-2.5 text-[11px] text-red-300 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="shrink-0" />
                    Rak bumbu terlalu rendah, Anda harus membungkuk.
                  </p>
                )}
                {p.rakTinggi >= 90 && p.rakTinggi <= 150 && (
                  <p className="mt-2.5 text-[11px] text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="shrink-0" />
                    Ketinggian rak bumbu optimal (zona emas), mudah dijangkau tanpa ketegangan bahu.
                  </p>
                )}
              </div>

              {/* Jarak Horizontal ke Kompor */}
              <div className="kartu-bagian p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-krem-100/90 flex items-center gap-2">
                    <ArrowLeftRight size={14} className="text-amber-400" /> Jarak Mendatar ke Kompor
                  </span>
                  <span
                    className={`teks-display text-[12px] font-bold px-2 py-0.5 rounded border ${
                      dxRak <= 1.201
                        ? "text-emerald-300 border-emerald-400/40 bg-emerald-400/10"
                        : "text-amber-300 border-amber-400/40 bg-amber-400/10"
                    }`}
                  >
                    {dxRak.toFixed(2)} m
                  </span>
                </div>
                <input
                  type="range"
                  className="geser w-full"
                  min={-65}
                  max={10}
                  step={1}
                  value={p.rakGeserX}
                  onChange={(e) => toko.setParams({ rakGeserX: parseFloat(e.target.value) })}
                />
                <div className="flex justify-between text-[9.5px] text-krem-100/50 mt-1">
                  <span className="text-emerald-400 font-semibold">Dekat Kompor (≤ 1.20 m)</span>
                  <span>Jauh dari Kompor</span>
                </div>
              </div>

              {/* Ambil Bumbu & Cek Postur */}
              <div className="kartu-bagian p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[12px] font-bold text-krem-50 flex items-center gap-2">
                    <PersonStanding size={15} className="text-amber-400" /> Sikap Tubuh Anda:{" "}
                    <span className="capitalize text-amber-300">{st.sikap}</span>
                  </div>
                  <div className="text-[10px] text-krem-100/60 mt-0.5">
                    {st.sikap === "jongkok"
                      ? "Posisi aman, punggung tidak terlalu membungkuk."
                      : "Berdiri tegak — tekan C untuk beralih jongkok."}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const tinggiPas = p.rakTinggi >= 90 && p.rakTinggi <= 150;
                    if (tinggiPas) {
                      toko.setParams({ bumbuAmbilBaik: true });
                      audio.sukses();
                      toko.toast("Bumbu terambil dengan bahu rileks di zona emas.", "baik");
                    } else if (p.rakTinggi > 150) {
                      audio.gagal();
                      toko.toast("Rak bumbu terlalu tinggi, sulit dijangkau.", "buruk");
                    } else if (st.sikap === "jongkok") {
                      audio.sukses();
                      toko.toast("Posisi aman, punggung tidak terlalu membungkuk.", "baik");
                    } else {
                      audio.gagal();
                      toko.toast("Rak bumbu terlalu rendah, Anda harus membungkuk.", "buruk");
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-200 font-bold text-[11.5px] hover:bg-amber-400/30 active:scale-95 transition"
                >
                  Ambil Bumbu
                </button>
              </div>
            </div>
          )}

          {/* ===================== KULKAS ===================== */}
          {target === "kulkas" && (
            <div className="space-y-4">
              {/* Buka/Tutup Pintu */}
              <div className="kartu-bagian p-4 flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-bold text-krem-50 flex items-center gap-2">
                    <Refrigerator size={15} className="text-amber-400" /> Pintu Lemari Es
                  </div>
                  <div className="text-[10.5px] text-krem-100/60 mt-0.5">
                    {p.kulkasTerbuka ? "Pintu terbuka ke arah lorong dapur" : "Pintu tertutup rapat"}
                  </div>
                </div>
                <button
                  onClick={() => {
                    toko.setParams({ kulkasTerbuka: !p.kulkasTerbuka });
                    audio.beralih();
                  }}
                  className={`px-3.5 py-2 rounded-xl text-[11.5px] font-bold border transition ${
                    p.kulkasTerbuka
                      ? "border-amber-400/40 bg-amber-400/15 text-amber-200"
                      : "border-white/15 bg-white/5 text-krem-100/80 hover:bg-white/10"
                  }`}
                >
                  {p.kulkasTerbuka ? "Tutup Pintu Kulkas" : "Buka Pintu Kulkas"}
                </button>
              </div>

              {/* Posisi Kulkas & Lebar Lorong */}
              <div className="kartu-bagian p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-krem-100/90">Lebar Lorong Kerja (Meja ke Kulkas)</span>
                  <span
                    className={`teks-display text-[12px] font-bold px-2 py-0.5 rounded border ${
                      lorong >= 0.85
                        ? "text-emerald-300 border-emerald-400/40 bg-emerald-400/10"
                        : "text-red-300 border-red-400/40 bg-red-400/10"
                    }`}
                  >
                    {(lorong * 100).toFixed(0)} cm
                  </span>
                </div>
                <input
                  type="range"
                  className="geser w-full"
                  min={0}
                  max={60}
                  step={1}
                  value={p.kulkasGeser}
                  onChange={(e) => toko.setParams({ kulkasGeser: parseFloat(e.target.value) })}
                />
                <div className="flex justify-between text-[9.5px] text-krem-100/50 mt-1">
                  <span className="text-emerald-400 font-semibold">Jalur Lega (≥ 90 cm)</span>
                  <span>Jalur Terhalang</span>
                </div>
                {p.kulkasTerbuka && lorong < 0.85 && (
                  <p className="mt-2.5 text-[11px] text-red-300 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="shrink-0" />
                    Pintu kulkas menghalangi jalur, geser posisi kulkas.
                  </p>
                )}
                {lorong >= 0.85 && (
                  <p className="mt-2.5 text-[11px] text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="shrink-0" />
                    Jalur sirkulasi bebas ({Math.round(lorong * 100)} cm), mobilitas segitiga kerja optimal.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ===================== PENCAHAYAAN (LAMPU MEJA & SAKLAR) ===================== */}
          {(target === "lampu-meja" || target === "saklar-lampu") && (
            <div className="space-y-4">
              {/* Lampu Utama */}
              <div className="kartu-bagian p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[12px] font-bold text-krem-50 flex items-center gap-2">
                      <Lightbulb size={14} className="text-amber-400" /> Lampu Utama Plafon
                    </div>
                    <div className="text-[10.5px] text-krem-100/60 mt-0.5">
                      Pencahayaan umum ruangan dapur
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      toko.setParams({ lampuUmum: !p.lampuUmum });
                      audio.beralih();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                      p.lampuUmum
                        ? "border-amber-400/40 bg-amber-400/15 text-amber-200"
                        : "border-white/10 bg-white/5 text-krem-100/50"
                    }`}
                  >
                    {p.lampuUmum ? "Menyala" : "Padam"}
                  </button>
                </div>
                {p.lampuUmum && (
                  <div>
                    <div className="text-[11px] text-krem-100/70 mb-1.5">Tingkat Intensitas:</div>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => {
                            toko.setParams({ lampuLevel: lvl });
                            audio.klik();
                          }}
                          className={`rounded-lg border py-1.5 text-[11px] font-bold transition ${
                            p.lampuLevel === lvl
                              ? "border-amber-400/60 bg-amber-400/20 text-amber-200"
                              : "border-white/10 bg-white/5 text-krem-100/60"
                          }`}
                        >
                          Level {lvl} ({lvl === 1 ? "Redup" : lvl === 2 ? "Sedang" : "Terang"})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Lampu Meja & Arah Sorotan */}
              <div className="kartu-bagian p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[12px] font-bold text-krem-50 flex items-center gap-2">
                      <Sun size={14} className="text-amber-400" /> Lampu Gantung Meja Potong
                    </div>
                    <div className="text-[10.5px] text-krem-100/60 mt-0.5">
                      Cahaya tugas terfokus (task light)
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      toko.setParams({ lampuMeja: !p.lampuMeja });
                      audio.beralih();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                      p.lampuMeja
                        ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
                        : "border-white/10 bg-white/5 text-krem-100/50"
                    }`}
                  >
                    {p.lampuMeja ? "Menyala" : "Padam"}
                  </button>
                </div>
                {p.lampuMeja && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => {
                        toko.setParams({ lampuMejaFokus: true });
                        audio.klik();
                      }}
                      className={`rounded-xl border p-2.5 text-center transition ${
                        p.lampuMejaFokus
                          ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-200"
                          : "border-white/10 bg-white/5 text-krem-100/70"
                      }`}
                    >
                      <div className="teks-display text-[11.5px] font-bold">Sorot Fokus Meja</div>
                      <div className="text-[9.5px] text-krem-100/50 mt-0.5">Menerangi talenan langsung</div>
                    </button>
                    <button
                      onClick={() => {
                        toko.setParams({ lampuMejaFokus: false });
                        audio.klik();
                      }}
                      className={`rounded-xl border p-2.5 text-center transition ${
                        !p.lampuMejaFokus
                          ? "border-amber-400/60 bg-amber-400/15 text-amber-200"
                          : "border-white/10 bg-white/5 text-krem-100/70"
                      }`}
                    >
                      <div className="teks-display text-[11.5px] font-bold">Cahaya Menyebar</div>
                      <div className="text-[9.5px] text-krem-100/50 mt-0.5">Menerangi area sekitar</div>
                    </button>
                  </div>
                )}
                <div className="mt-3 text-[11px] flex items-center justify-between border-t border-white/10 pt-2.5">
                  <span className="text-krem-100/70">Kecukupan Meja:</span>
                  <span className={lux >= 300 ? "text-emerald-300 font-bold" : "text-amber-300 font-bold"}>
                    {lux >= 300 ? `Optimal (${lux} Lux)` : "Pencahayaan meja potong kurang, tambahkan lampu."}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ===================== VENTILASI & HOOD ===================== */}
          {(target === "ventilasi" || target === "hood") && (
            <div className="space-y-4">
              {/* Jendela Ventilasi */}
              <div className="kartu-bagian p-4 flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-bold text-krem-50 flex items-center gap-2">
                    <Wind size={15} className="text-sky-300" /> Jendela Ventilasi Silang
                  </div>
                  <div className="text-[10.5px] text-krem-100/60 mt-0.5">
                    {p.ventilasiBuka ? "Jendela terbuka — udara segar mengalir" : "Jendela tertutup"}
                  </div>
                </div>
                <button
                  onClick={() => {
                    toko.setParams({ ventilasiBuka: !p.ventilasiBuka });
                    audio.beralih();
                  }}
                  className={`px-3.5 py-2 rounded-xl text-[11.5px] font-bold border transition ${
                    p.ventilasiBuka
                      ? "border-sky-400/40 bg-sky-400/15 text-sky-200"
                      : "border-white/15 bg-white/5 text-krem-100/80 hover:bg-white/10"
                  }`}
                >
                  {p.ventilasiBuka ? "Tutup Jendela" : "Buka Jendela"}
                </button>
              </div>

              {/* Hood Penyedot Asap */}
              <div className="kartu-bagian p-4 flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-bold text-krem-50 flex items-center gap-2">
                    <Fan size={15} className="text-amber-400" /> Hood Penyedot Asap Kompor
                  </div>
                  <div className="text-[10.5px] text-krem-100/60 mt-0.5">
                    {p.hoodNyala ? "Kipas hood berputar aktif menyedot asap" : "Hood nonaktif"}
                  </div>
                </div>
                <button
                  onClick={() => {
                    toko.setParams({ hoodNyala: !p.hoodNyala });
                    audio.beralih();
                  }}
                  className={`px-3.5 py-2 rounded-xl text-[11.5px] font-bold border transition ${
                    p.hoodNyala
                      ? "border-amber-400/40 bg-amber-400/15 text-amber-200"
                      : "border-white/15 bg-white/5 text-krem-100/80 hover:bg-white/10"
                  }`}
                >
                  {p.hoodNyala ? "Matikan Hood" : "Nyalakan Hood"}
                </button>
              </div>

              <div className="rounded-xl border border-sky-400/20 bg-sky-400/10 p-3 text-[11px] text-sky-200 leading-snug">
                {p.ventilasiBuka || p.hoodNyala
                  ? "Sirkulasi udara aktif — gas buang masakan dan asap terbuang, menjaga udara dapur tetap sehat."
                  : "Sirkulasi belum aktif. Buka jendela atau nyalakan hood penyedot asap sebelum menyalakan kompor."}
              </div>
            </div>
          )}

          {/* ===================== WASTAFEL ===================== */}
          {target === "wastafel" && (
            <div className="kartu-bagian p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-bold text-krem-50 flex items-center gap-2">
                    <Droplets size={15} className="text-sky-400" /> Keran Air Wastafel
                  </div>
                  <div className="text-[10.5px] text-krem-100/60 mt-0.5">
                    {p.keranNyala ? "Air mengalir segar" : "Keran air tertutup"}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const alir = !p.keranNyala;
                    toko.setParams({ keranNyala: alir, bahanDicuci: alir });
                    audio.beralih();
                  }}
                  className={`px-3.5 py-2 rounded-xl text-[11.5px] font-bold border transition ${
                    p.keranNyala
                      ? "border-sky-400/40 bg-sky-400/15 text-sky-200"
                      : "border-white/15 bg-white/5 text-krem-100/80 hover:bg-white/10"
                  }`}
                >
                  {p.keranNyala ? "Tutup Keran" : "Buka Keran (Cuci Bahan)"}
                </button>
              </div>
              <p className="text-[11px] text-krem-100/70 leading-snug">
                Urutan higienis yang benar: cuci bahan makanan di wastafel sebelum dipotong di talenan untuk mencegah kontaminasi silang.
              </p>
            </div>
          )}

          {/* ===================== RAK PANCI BAWAH ===================== */}
          {target === "rak-bawah" && (
            <div className="kartu-bagian p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-bold text-krem-50 flex items-center gap-2">
                    <CookingPot size={15} className="text-amber-400" /> Rak Panci Bagian Bawah
                  </div>
                  <div className="text-[10.5px] text-krem-100/60 mt-0.5">
                    Sikap Anda saat ini: <span className="font-bold text-amber-300 capitalize">{st.sikap}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    toko.setStatus({ sikap: st.sikap === "jongkok" ? "berdiri" : "jongkok" });
                    audio.klik();
                  }}
                  className="px-3 py-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 text-amber-200 text-[11px] font-bold"
                >
                  {st.sikap === "jongkok" ? "Berdiri" : "Jongkok (C)"}
                </button>
              </div>
              <button
                onClick={() => {
                  if (st.sikap === "jongkok") {
                    toko.setParams({ panciDiambil: p.panciDiambil + 1, panciAmbilJongkok: true });
                    audio.sukses();
                    toko.toast("Posisi aman, punggung tidak terlalu membungkuk.", "baik");
                  } else {
                    audio.gagal();
                    toko.toast("Anda membungkuk penuh! Tekan C untuk jongkok demi melindungi tulang belakang.", "buruk");
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-terakota-500 text-arang-950 font-extrabold text-[12px] hover:brightness-110 active:scale-95 transition"
              >
                Ambil Panci dari Rak Bawah
              </button>
            </div>
          )}

          {/* ===================== STASIUN UKUR ===================== */}
          {target === "stasiun-ukur" && (
            <div className="kartu-bagian p-4 space-y-3">
              <div className="text-[12px] font-bold text-krem-50 flex items-center gap-2">
                <Ruler size={15} className="text-amber-400" /> Hasil Antropometri Tubuh Anda
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                  <div className="text-[10px] text-krem-100/50">Tinggi Badan</div>
                  <div className="teks-display text-base font-extrabold text-amber-300">168 cm</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                  <div className="text-[10px] text-krem-100/50">Tinggi Siku Berdiri</div>
                  <div className="teks-display text-base font-extrabold text-amber-300">104 cm</div>
                </div>
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-2.5">
                  <div className="text-[10px] text-emerald-300/70">Tinggi Meja Ideal</div>
                  <div className="teks-display text-base font-extrabold text-emerald-300">85–92 cm</div>
                </div>
              </div>
              <p className="text-[11px] text-krem-100/70 leading-snug">
                Prinsip ISO 11226: tinggi meja potong harus 10–15 cm di bawah siku tangan agar lengan bawah netral 90° dan bahu tidak tegang.
              </p>
            </div>
          )}

          {/* ===================== PAPAN SKOR ===================== */}
          {target === "papan-skor" && (
            <div className="space-y-3">
              <div className="kartu-bagian p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-krem-50">Empat Pilar Ergonomi</span>
                  <span className="teks-display text-sm font-extrabold text-amber-300">{skor}% Total</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-[11px]">
                    <span className="text-krem-100/60">Keselamatan:</span>{" "}
                    <span className="font-bold text-krem-50">{pilar.keselamatan}/30</span>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-[11px]">
                    <span className="text-krem-100/60">Efisiensi:</span>{" "}
                    <span className="font-bold text-krem-50">{pilar.efisiensi}/25</span>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-[11px]">
                    <span className="text-krem-100/60">Kesehatan:</span>{" "}
                    <span className="font-bold text-krem-50">{pilar.kesehatan}/20</span>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-[11px]">
                    <span className="text-krem-100/60">Kenyamanan:</span>{" "}
                    <span className="font-bold text-krem-50">{pilar.kenyamanan}/25</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Panel with Toggle Button */}
        <div className="flex items-center justify-between border-t border-white/10 bg-arang-950/80 px-5 py-3.5">
          <div className="flex items-center gap-2 text-[11px] text-krem-100/65">
            <span className="keycap text-[10px]">F</span>
            <span>Tekan F lagi untuk keluar interaksi & kembali ke kontrol FPS</span>
          </div>

          <button
            onClick={tutup}
            className="teks-display flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-terakota-500 px-4 py-2.5 text-xs font-extrabold text-arang-950 shadow-md shadow-amber-500/20 transition hover:brightness-110 active:scale-95"
          >
            <CheckCircle2 size={14} /> Kembali ke Kontrol FPS (F)
          </button>
        </div>
      </div>
    </div>
  );
}
