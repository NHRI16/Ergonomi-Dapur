// ============================================================
// ErgoDapur — Pusat Data Permainan & Mesin Penilaian Ergonomi
// Seluruh logika skor (0–100%) dihitung di sini berdasarkan
// empat pilar: Keselamatan, Efisiensi, Kesehatan, Kenyamanan.
// ============================================================

import { useSyncExternalStore } from "react";
import { KURIKULUM, type KonteksNilai } from "./modul";

export type Tingkat = "baik" | "cukup" | "buruk" | "info";

export interface Masalah {
  id: string;
  teks: string;
  tingkat: Tingkat;
}

export interface Toast {
  id: number;
  teks: string;
  tingkat: Tingkat;
}

export interface Pilar {
  keselamatan: number; // maks 30
  efisiensi: number; // maks 25
  kesehatan: number; // maks 20
  kenyamanan: number; // maks 25
}

export const MAKS_PILAR: Pilar = { keselamatan: 30, efisiensi: 25, kesehatan: 20, kenyamanan: 25 };

export type ApiKomporLevel = "mati" | "rendah" | "sedang" | "tinggi";
export type PosisiPanci = "tengah" | "tepi";

export interface EvaluasiLangsung {
  id: string;
  objek: string;
  namaObjek: string;
  skor: number;
  tingkat: Tingkat;
  judul: string;
  teks: string;
  saran: string;
  waktu: number;
}

export interface ParameterDapur {
  komporNyala: boolean;
  komporApiLevel: ApiKomporLevel; // mati, rendah, sedang, tinggi
  panciAda: boolean; // panci ada di atas kompor
  panciPosisi: PosisiPanci; // tengah (aman) atau tepi (rawan tersenggol)
  komporJarak: number; // cm dari dinding (5..40) → menentukan koordinat Z
  komporX: number; // koordinat X kompor (meter)
  komporTinggi: number; // cm dari lantai saat Mode Tata Letak
  kulkasZ: number; // koordinat Z kulkas (meter)
  kulkasTinggi: number; // cm dari lantai saat Mode Tata Letak
  mejaX: number; // koordinat X pulau meja (meter)
  mejaZ: number; // koordinat Z pulau meja (meter)
  rotKompor: number; // rotasi Y (derajat)
  rotKulkas: number;
  rotMeja: number;
  dekor1X: number; // model tambahan 1
  dekor1Z: number;
  dekor1Tinggi: number;
  dekor1Rot: number;
  dekor2X: number; // model tambahan 2
  dekor2Z: number;
  dekor2Tinggi: number;
  dekor2Rot: number;
  mejaTinggi: number; // cm (60..100)
  rakTinggi: number; // cm dari lantai (60..190)
  rakGeserX: number; // cm horizontal (-70..10), negatif = mendekati kompor
  kulkasTerbuka: boolean;
  kulkasGeser: number; // cm ke kiri (0..60) — makin besar makin menghalangi
  lampuUmum: boolean;
  lampuLevel: number; // 1 redup, 2 sedang, 3 terang
  lampuMeja: boolean;
  lampuMejaFokus: boolean; // true = menyorot meja potong, false = menyebar
  ventilasiBuka: boolean;
  keranNyala: boolean; // air wastafel mengalir
  hoodNyala: boolean; // penyedot asap aktif
  tomatDipotong: boolean; // bahan sudah dipotong di talenan
  bahanDitaruh: boolean; // bahan diletakkan di talenan
  panciDiambil: number;

  // ----- Pelacakan capaian & urutan kerja (untuk kurikulum) -----
  sudahKalibrasi: boolean; // sudah mengukur tubuh di stasiun ukur
  potongPosturBaik: boolean; // memotong saat tinggi meja ideal
  panciAmbilJongkok: boolean; // mengangkat panci dengan jongkok
  bumbuAmbilBaik: boolean; // mengambil bumbu dari zona emas
  bahanDicuci: boolean; // mencuci bahan sebelum memotong
  hoodSebelumKompor: boolean; // sirkulasi aktif sebelum api menyala
  kulkasBukaJalurBebas: boolean; // membuka kulkas saat jalur lega
  modulTuntas: number; // jumlah modul 1–5 yang selesai
}

export interface Pengaturan {
  sensitivitas: number;
  kecepatan: number; // m/s
  volume: number; // 0 .. 1
  bisu: boolean;
  modeGelap: boolean;
  kualitas: "hemat" | "sedang" | "tinggi";
}

export type Sikap = "berdiri" | "jongkok" | "tegak";

export interface StatusPermainan {
  dimulai: boolean;
  /** Menyembunyikan seluruh antarmuka permainan; dapat diubah dengan tombol U. */
  antarmukaTersembunyi: boolean;
  menuBuka: boolean;
  bantuanBuka: boolean;
  kursorTerkunci: boolean;
  dalamVR: boolean;
  sikap: Sikap;
  target: string | null;
  targetJarak: number;
  /** Mode tata letak (build mode) aktif. */
  modeTata: boolean;
  /** Objek yang sedang diangkat/dipindahkan. */
  dipegang: string | null;
  /** Panel manajer model 3D terbuka. */
  modelBuka: boolean;
  /** Mode interaksi fokus objek (klik objek). */
  modeInteraksi: boolean;
  /** Objek yang sedang diinteraksikan dalam mode interaksi. */
  objekInteraksiAktif: string | null;
  /** Evaluasi langsung terakhir untuk banner feedback. */
  evaluasiTerakhir: EvaluasiLangsung | null;
}

/** Status satu sasaran pada modul kurikulum. */
export interface SasaranStatus {
  id: string;
  teks: string;
  cara: string;
  selesai: boolean;
  ukur?: { nilai: string; target: string };
}

/** Status satu modul kurikulum. */
export interface ModulStatus {
  id: string;
  nomor: number;
  judul: string;
  subjudul: string;
  briefing: string;
  standar: string;
  pelajaran: string[];
  sasaran: SasaranStatus[];
  selesai: number;
  total: number;
  tuntas: boolean;
  terbuka: boolean;
}

export interface Keadaan {
  versi: number;
  params: ParameterDapur;
  pilar: Pilar;
  skor: number;
  masalah: Masalah[];
  toasts: Toast[];
  modul: ModulStatus[];
  modulAktif: number; // indeks modul yang sedang dikerjakan
  debrief: ModulStatus | null; // modul yang baru saja tuntas
  pengaturan: Pengaturan;
  status: StatusPermainan;
}

export const PARAM_AWAL: ParameterDapur = {
  komporNyala: false,
  komporApiLevel: "mati",
  panciAda: true,
  panciPosisi: "tengah",
  komporJarak: 10,
  komporX: -1.3,
  komporTinggi: 0,
  kulkasZ: -1.86,
  kulkasTinggi: 0,
  mejaX: -0.45,
  mejaZ: -0.55,
  rotKompor: 0,
  rotKulkas: 0,
  rotMeja: 0,
  dekor1X: -1.9,
  dekor1Z: 1.5,
  dekor1Tinggi: 0,
  dekor1Rot: 0,
  dekor2X: 1.7,
  dekor2Z: 1.5,
  dekor2Tinggi: 0,
  dekor2Rot: 0,
  mejaTinggi: 78,
  rakTinggi: 175,
  rakGeserX: 0,
  kulkasTerbuka: false,
  kulkasGeser: 20,
  lampuUmum: true,
  lampuLevel: 3,
  lampuMeja: true,
  lampuMejaFokus: false,
  ventilasiBuka: false,
  keranNyala: false,
  hoodNyala: false,
  tomatDipotong: false,
  bahanDitaruh: true,
  panciDiambil: 0,
  sudahKalibrasi: false,
  potongPosturBaik: false,
  panciAmbilJongkok: false,
  bumbuAmbilBaik: false,
  bahanDicuci: false,
  hoodSebelumKompor: false,
  kulkasBukaJalurBebas: false,
  modulTuntas: 0,
};

const PENGATURAN_AWAL: Pengaturan = {
  sensitivitas: 1,
  kecepatan: 3,
  volume: 0.8,
  bisu: false,
  modeGelap: false,
  kualitas: "sedang",
};

// ============================================================
// Utilitas geometri dapur — semua dihitung dari POSISI NYATA
// objek di dunia 3D, sehingga memindahkan barang langsung
// mengubah skor ergonomi.
// ============================================================

export interface Titik {
  x: number;
  z: number;
}

/** Wastafel bersifat tetap (terikat instalasi pipa air). */
export const POS_WASTAFEL: Titik = { x: -0.1, z: -1.92 };

/** Batas gerak tiap objek yang dapat dipindahkan (meter). */
export const BATAS_TATA = {
  kompor: { xMin: -2.05, xMax: -0.75, zMin: -2.0, zMax: -1.65 },
  kulkas: { xMin: 0.55, xMax: 2.05, zMin: -1.95, zMax: -1.35 },
  meja: { xMin: -1.55, xMax: 0.75, zMin: -1.05, zMax: 1.25 },
} as const;

export const jepit = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Posisi kompor di atas meja panjang. */
export const posKompor = (p: { komporX: number; komporJarak: number }): Titik => ({
  x: p.komporX,
  z: -2.05 + p.komporJarak / 100,
});
/** Posisi kulkas (x diturunkan dari nilai geser). */
export const posKulkas = (p: { kulkasGeser?: number; kulkasZ?: number }): Titik => ({
  x: 1.45 - (p.kulkasGeser ?? 20) / 100,
  z: p.kulkasZ ?? -1.86,
});
/** Posisi pulau meja potong. */
export const posMeja = (p: { mejaX?: number; mejaZ?: number }): Titik => ({
  x: p.mejaX ?? -0.45,
  z: p.mejaZ ?? -0.55,
});

export const posisiKulkasX = (geserCm: number) => 1.45 - geserCm / 100;
export const jarak = (a: Titik, b: Titik) => Math.hypot(a.x - b.x, a.z - b.z);

/** Lebar lorong kerja antara pulau meja dan kulkas (meter). */
export function lebarLorong(pOrGeser: number | ParameterDapur): number {
  if (typeof pOrGeser === "number") return posisiKulkasX(pOrGeser) - 0.36 - 0.17;
  const k = posKulkas(pOrGeser);
  const m = posMeja(pOrGeser);
  return k.x - 0.36 - (m.x + 0.62);
}

/** Posisi X rak bumbu (meter). */
export const posisiRakX = (geserCm: number) => 0.45 + geserCm / 100;
/** Jarak mendatar rak bumbu ke kompor (meter). */
export function jarakRakKompor(geserOrParams: number | ParameterDapur): number {
  if (typeof geserOrParams === "number") return Math.abs(posisiRakX(geserOrParams) + 1.3);
  return Math.abs(posisiRakX(geserOrParams.rakGeserX) - geserOrParams.komporX);
}

/** Panjang tiap sisi segitiga kerja kompor–wastafel–kulkas (meter). */
export function segitigaKerja(p: ParameterDapur) {
  const kompor = posKompor(p);
  const kulkas = posKulkas(p);
  const kw = jarak(kompor, POS_WASTAFEL);
  const wk = jarak(POS_WASTAFEL, kulkas);
  const kk = jarak(kompor, kulkas);
  return { kw, wk, kk, total: kw + wk + kk };
}

export const warnaSkor = (skor: number) => (skor >= 80 ? "#34d399" : skor >= 60 ? "#fbbf24" : "#f87171");
export const labelSkor = (skor: number) =>
  skor >= 80 ? "Ergonomis" : skor >= 60 ? "Cukup Ergonomis" : "Perlu Perbaikan";

export const warnaTingkat: Record<Tingkat, string> = {
  baik: "#34d399",
  cukup: "#fbbf24",
  buruk: "#f87171",
  info: "#7dd3fc",
};

export function hitungLuxMeja(p: ParameterDapur, modeGelap = false): number {
  let lux = modeGelap ? 40 : 200;
  if (p.ventilasiBuka && !modeGelap) lux += 70;
  if (p.lampuUmum) {
    lux += [0, 80, 160, 240][p.lampuLevel] ?? 240;
  }
  if (p.lampuMeja) {
    lux += p.lampuMejaFokus ? 260 : 130;
  }
  return lux;
}

// ---------- Mesin penilaian ----------
interface HasilNilai {
  pilar: Pilar;
  skor: number;
  masalah: Masalah[];
}

function nilaiDapur(p: ParameterDapur): HasilNilai {
  const m: Masalah[] = [];
  const pilar: Pilar = { keselamatan: 0, efisiensi: 0, kesehatan: 0, kenyamanan: 0 };
  const lorong = lebarLorong(p);
  const lux = hitungLuxMeja(p);

  // ======== KESELAMATAN (30) ========
  if (p.komporJarak >= 15) pilar.keselamatan += 15;
  else if (p.komporJarak >= 8) {
    pilar.keselamatan += 7;
    m.push({
      id: "jarak-kompor-dekat",
      teks: "Kompor agak dekat dengan dinding — sisakan jarak minimal 15 cm.",
      tingkat: "cukup",
    });
  } else {
    m.push({
      id: "jarak-kompor-rapat",
      teks: "Kompor terlalu dekat dengan dinding, risiko panas berlebih dan kebakaran.",
      tingkat: "buruk",
    });
  }

  // Posisi panci di atas tungku
  if (p.panciAda) {
    if (p.panciPosisi === "tengah") {
      pilar.keselamatan += 5;
    } else {
      m.push({
        id: "panci-posisi-tepi",
        teks: "Posisi panci di tepi tungku tidak stabil dan rawan tersenggol atau tumpah.",
        tingkat: "buruk",
      });
    }
  } else {
    pilar.keselamatan += 2;
  }

  // Sirkulasi saat memasak & keselamatan termal
  const apiAktif = p.komporNyala || p.komporApiLevel !== "mati";
  if (p.ventilasiBuka) {
    pilar.keselamatan += 10;
  } else if (p.hoodNyala) {
    pilar.keselamatan += 7;
    m.push({
      id: "jendela-tertutup",
      teks: "Hood menyala membantu — tetap buka jendela untuk sirkulasi terbaik.",
      tingkat: "cukup",
    });
  } else if (apiAktif) {
    m.push({
      id: "masak-tanpa-ventilasi",
      teks: "Kompor menyala tanpa sirkulasi — asap dan gas menumpuk. Buka jendela atau nyalakan hood!",
      tingkat: "buruk",
    });
  } else {
    pilar.keselamatan += 5;
    m.push({
      id: "ventilasi-tutup",
      teks: "Sirkulasi belum aktif — buka jendela atau nyalakan hood penyedot asap.",
      tingkat: "cukup",
    });
  }

  // Pintu kulkas & jalur kerja
  if (p.kulkasTerbuka && lorong < 0.85) {
    m.push({
      id: "pintu-kulkas-menghalangi",
      teks: "Pintu kulkas menghalangi jalur, geser posisi kulkas.",
      tingkat: "buruk",
    });
  }

  // ======== EFISIENSI (25) ========
  const sg = segitigaKerja(p);
  const kakiKomporWastafel = sg.kw;
  const kakiWastafelKulkas = sg.wk;
  const kakiKomporKulkas = sg.kk;
  const nilaiKaki = (d: number) => (d >= 1.2 && d <= 2.8 ? 5 : d >= 1.0 && d <= 3.0 ? 2 : 0);
  pilar.efisiensi += nilaiKaki(kakiKomporWastafel) + nilaiKaki(kakiWastafelKulkas) + nilaiKaki(kakiKomporKulkas);
  if (kakiKomporWastafel < 1.2 || kakiKomporWastafel > 2.8)
    m.push({
      id: "kaki-kompor-wastafel",
      teks: `Jarak kompor–wastafel ${kakiKomporWastafel.toFixed(2)} m di luar rentang ideal 1,2–2,8 m.`,
      tingkat: kakiKomporWastafel < 1.0 || kakiKomporWastafel > 3.0 ? "buruk" : "cukup",
    });
  if (kakiWastafelKulkas < 1.2)
    m.push({
      id: "kulkas-dekat-wastafel",
      teks: "Kulkas terlalu dekat dengan wastafel — segitiga kerja jadi sempit.",
      tingkat: "cukup",
    });

  // Efisiensi api kompor (api terlalu besar boros energi)
  if (p.komporApiLevel === "tinggi") {
    m.push({
      id: "api-kompor-besar",
      teks: "Api kompor terlalu besar, risiko boros energi dan panas berlebih.",
      tingkat: "cukup",
    });
  } else if (p.komporApiLevel === "sedang" || p.komporApiLevel === "rendah") {
    pilar.efisiensi += 3;
  } else {
    pilar.efisiensi += 2;
  }

  if (p.komporJarak >= 10 && p.komporJarak <= 35) pilar.efisiensi += 2;
  if (lorong >= 0.8) pilar.efisiensi += 5;
  else if (lorong >= 0.6) {
    pilar.efisiensi += 2;
    m.push({
      id: "jalur-sempit",
      teks: `Jalur antara meja dan kulkas hanya ${(lorong * 100).toFixed(0)} cm — idealnya minimal 80 cm.`,
      tingkat: "cukup",
    });
  } else {
    m.push({
      id: "jalur-buntu",
      teks: `Jalur kerja tersumbat (${(lorong * 100).toFixed(0)} cm) — geser kulkas menjauh dari meja.`,
      tingkat: "buruk",
    });
  }

  // ======== KESEHATAN (20) ========
  if (p.ventilasiBuka) pilar.kesehatan += 10;
  else if (p.hoodNyala) pilar.kesehatan += 5;

  // Rak bumbu: ketinggian (7) + jangkauan horizontal (3)
  let rakSkor = 0;
  if (p.rakTinggi >= 90 && p.rakTinggi <= 150) rakSkor += 7;
  else if (p.rakTinggi > 150) {
    m.push({
      id: "rak-terlalu-tinggi",
      teks: "Rak bumbu terlalu tinggi, sulit dijangkau.",
      tingkat: p.rakTinggi > 170 ? "buruk" : "cukup",
    });
  } else if (p.rakTinggi < 75) {
    m.push({
      id: "rak-terlalu-rendah",
      teks: "Rak bumbu terlalu rendah, Anda harus membungkuk.",
      tingkat: "buruk",
    });
  } else {
    rakSkor += 4;
    m.push({ id: "rak-agak-rendah", teks: "Rak bumbu agak rendah — naikkan ke zona emas 90–150 cm.", tingkat: "cukup" });
  }

  const dxRak = jarakRakKompor(p);
  if (dxRak <= 1.201) rakSkor += 3;
  else if (dxRak <= 1.45) {
    rakSkor += 2;
    m.push({
      id: "rak-agak-jauh",
      teks: "Rak bumbu agak jauh dari kompor — geser lebih dekat.",
      tingkat: "cukup",
    });
  } else {
    rakSkor += 1;
    m.push({
      id: "rak-jauh",
      teks: `Rak bumbu ${dxRak.toFixed(2)} m dari kompor — geser agar bumbu dalam jangkauan tangan.`,
      tingkat: "cukup",
    });
  }
  pilar.kesehatan += Math.min(10, rakSkor);

  // ======== KENYAMANAN (25) ========
  if (p.mejaTinggi >= 85 && p.mejaTinggi <= 92) pilar.kenyamanan += 12;
  else if (p.mejaTinggi < 85) {
    pilar.kenyamanan += p.mejaTinggi >= 80 ? 6 : 0;
    m.push({
      id: "meja-terlalu-rendah",
      teks: "Meja terlalu rendah, risiko sakit punggung.",
      tingkat: p.mejaTinggi < 80 ? "buruk" : "cukup",
    });
  } else {
    pilar.kenyamanan += p.mejaTinggi <= 95 ? 6 : 0;
    m.push({
      id: "meja-terlalu-tinggi",
      teks: "Meja potong terlalu tinggi, bahu dan lengan cepat tegang.",
      tingkat: p.mejaTinggi > 96 ? "buruk" : "cukup",
    });
  }

  // Pencahayaan meja potong (lux meter)
  if (lux < 300) {
    m.push({
      id: "pencahayaan-meja-kurang",
      teks: "Pencahayaan meja potong kurang, tambahkan lampu.",
      tingkat: "cukup",
    });
    if (p.lampuMeja) pilar.kenyamanan += 3;
  } else {
    pilar.kenyamanan += p.lampuMeja && p.lampuMejaFokus ? 8 : 6;
  }

  // Lampu utama
  if (p.lampuUmum) {
    pilar.kenyamanan += [0, 2, 4, 5][p.lampuLevel] ?? 5;
    if (p.lampuLevel === 1)
      m.push({ id: "lampu-redup", teks: "Lampu utama redup — naikkan intensitas pada saklar.", tingkat: "cukup" });
  } else {
    m.push({ id: "dapur-gelap", teks: "Lampu utama mati — dapur terlalu gelap untuk bekerja dengan aman.", tingkat: "cukup" });
  }

  const skor = Math.max(
    0,
    Math.min(100, Math.round(pilar.keselamatan + pilar.efisiensi + pilar.kesehatan + pilar.kenyamanan))
  );
  return { pilar, skor, masalah: m };
}

export function evaluasiObjek(
  target: string,
  p: ParameterDapur,
  skor: number,
  sikap: Sikap = "berdiri"
): EvaluasiLangsung {
  let judul = "";
  let teks = "";
  let saran = "";
  let tingkat: Tingkat = "baik";
  let namaObjek = target;

  switch (target) {
    case "kompor": {
      namaObjek = "Kompor";
      if (p.komporApiLevel === "tinggi") {
        judul = "Api Kompor Terlalu Besar";
        teks = "Api kompor terlalu besar, risiko boros energi dan panas berlebih.";
        saran = "Gunakan api sedang untuk memasak normal atau api kecil untuk memanaskan.";
        tingkat = "cukup";
      } else if (p.panciAda && p.panciPosisi === "tepi") {
        judul = "Posisi Panci Rawan Tersenggol";
        teks = "Posisi panci di tepi tungku tidak stabil dan rawan tersenggol atau tumpah.";
        saran = "Posisikan panci tepat di tengah tungku agar stabil dan aman.";
        tingkat = "buruk";
      } else if (p.komporJarak < 15) {
        judul = "Jarak Dinding Kurang Aman";
        teks = "Kompor terlalu dekat dengan dinding, risiko panas berlebih dan kebakaran.";
        saran = "Geser kompor menjauh dari dinding minimal 15 cm.";
        tingkat = "buruk";
      } else if (p.komporNyala && !p.ventilasiBuka && !p.hoodNyala) {
        judul = "Sirkulasi Udara Tidak Aktif";
        teks = "Kompor menyala tanpa sirkulasi — asap dan gas menumpuk. Buka jendela atau nyalakan hood!";
        saran = "Buka jendela atau aktifkan hood penyedot asap saat memasak.";
        tingkat = "buruk";
      } else {
        judul = "Pengaturan Kompor Aman & Ergonomis";
        teks = "Posisi panci aman di tengah tungku dan panas kompor terkendali baik.";
        saran = "Pertahankan posisi panci stabil dan sirkulasi udara aktif saat memasak.";
        tingkat = "baik";
      }
      break;
    }
    case "meja-potong":
    case "talenan": {
      namaObjek = "Meja Potong";
      const lux = hitungLuxMeja(p);
      if (p.mejaTinggi < 85) {
        judul = "Meja Terlalu Rendah";
        teks = "Meja terlalu rendah, risiko sakit punggung.";
        saran = "Atur tinggi meja ke zona siku ideal 85–92 cm agar punggung tetap tegak.";
        tingkat = "buruk";
      } else if (p.mejaTinggi > 92) {
        judul = "Meja Terlalu Tinggi";
        teks = "Meja potong terlalu tinggi, bahu dan lengan cepat tegang.";
        saran = "Turunkan meja ke zona 85–92 cm agar bahu dan leher tetap rileks.";
        tingkat = "cukup";
      } else if (lux < 300) {
        judul = "Pencahayaan Kurang";
        teks = "Pencahayaan meja potong kurang, tambahkan lampu.";
        saran = "Nyalakan lampu gantung meja dan arahkan fokus ke permukaan talenan (standar 300–500 lux).";
        tingkat = "cukup";
      } else {
        judul = "Meja Potong Ergonomis";
        teks = "Tinggi meja ideal (siku 90°), postur tubuh tegak dan nyaman.";
        saran = "Pencahayaan optimal (≥300 lux) dan postur netral siap untuk memotong bahan dengan aman.";
        tingkat = "baik";
      }
      break;
    }
    case "rak-bumbu": {
      namaObjek = "Rak Bumbu";
      const dx = jarakRakKompor(p);
      if (p.rakTinggi > 150) {
        judul = "Rak Bumbu Terlalu Tinggi";
        teks = "Rak bumbu terlalu tinggi, sulit dijangkau.";
        saran = "Turunkan rak ke zona emas 90–150 cm agar tidak memicu cedera bahu.";
        tingkat = "buruk";
      } else if (p.rakTinggi < 75) {
        if (sikap === "jongkok") {
          judul = "Postur Mengambil Aman";
          teks = "Posisi aman, punggung tidak terlalu membungkuk saat mengambil dari posisi rendah.";
          saran = "Teknik menekuk lutut (jongkok) melindungi diskus lumbal tulang belakang.";
          tingkat = "baik";
        } else {
          judul = "Rak Bumbu Terlalu Rendah";
          teks = "Rak bumbu terlalu rendah, Anda harus membungkuk.";
          saran = "Naikkan rak ke 90–150 cm atau gunakan tombol C untuk jongkok saat mengambil.";
          tingkat = "buruk";
        }
      } else if (dx > 1.25) {
        judul = "Rak Agak Jauh dari Kompor";
        teks = `Jarak rak bumbu ke kompor ${dx.toFixed(2)} m — di luar radius jangkauan tangan langsung.`;
        saran = "Geser rak mendekat ke kompor (≤ 1,20 m) agar bumbu mudah diraih saat memasak.";
        tingkat = "cukup";
      } else {
        judul = "Zona Jangkauan Rak Optimal";
        teks = "Ketinggian rak bumbu berada di zona emas (90–150 cm), mudah dijangkau dengan bahu rileks.";
        saran = "Penataan ini sesuai standar antropometrik jangkauan kerja.";
        tingkat = "baik";
      }
      break;
    }
    case "kulkas": {
      namaObjek = "Kulkas";
      const lorong = lebarLorong(p);
      if (p.kulkasTerbuka && lorong < 0.85) {
        judul = "Pintu Kulkas Menghalangi Jalur";
        teks = "Pintu kulkas menghalangi jalur, geser posisi kulkas.";
        saran = "Geser kulkas menjauh dari pulau meja potong agar jalur sirkulasi tetap bebas minimal 80–90 cm.";
        tingkat = "buruk";
      } else if (lorong < 0.8) {
        judul = "Lorong Kerja Sempit";
        teks = `Lebar lorong kerja hanya ${(lorong * 100).toFixed(0)} cm (ideal minimal 80–90 cm).`;
        saran = "Geser posisi kulkas agar mobilitas kerja di dapur tetap lancar.";
        tingkat = "cukup";
      } else {
        judul = "Penempatan Kulkas Ergonomis";
        teks = `Jalur kerja bebas ${(lorong * 100).toFixed(0)} cm. Pintu kulkas terbuka tanpa menghambat alur kerja.`;
        saran = "Segitiga kerja kulkas–wastafel–kompor berada dalam rentang efisien.";
        tingkat = "baik";
      }
      break;
    }
    case "lampu-meja":
    case "saklar-lampu": {
      namaObjek = "Lampu Dapur";
      const lux = hitungLuxMeja(p);
      if (lux < 300) {
        judul = "Pencahayaan Kurang";
        teks = "Pencahayaan meja potong kurang, tambahkan lampu.";
        saran = "Fokuskan lampu meja dan naikkan level cahaya utama agar area persiapan terang.";
        tingkat = "cukup";
      } else {
        judul = "Pencahayaan Dapur Optimal";
        teks = `Pencahayaan area kerja mencapai ${lux} lux. Meja potong cukup terang tanpa bayangan gelap.`;
        saran = "Pencahayaan berlapis mendukung ketelitian dan kenyamanan mata saat memasak.";
        tingkat = "baik";
      }
      break;
    }
    case "ventilasi":
    case "hood": {
      namaObjek = "Ventilasi Dapur";
      if (p.ventilasiBuka) {
        judul = "Sirkulasi Udara Baik";
        teks = "Ventilasi terbuka — sirkulasi udara baik, asap dan panas keluar.";
        saran = "Sirkulasi udara segar mencegah penumpukan gas dan menjaga suhu dapur tetap sejuk.";
        tingkat = "baik";
      } else if (p.hoodNyala) {
        judul = "Penyedot Asap Aktif";
        teks = "Hood menyala membantu menyedot asap masakan keluar ruangan.";
        saran = "Buka juga jendela untuk ventilasi silang yang lebih optimal.";
        tingkat = "baik";
      } else {
        judul = "Ventilasi Tertutup";
        teks = "Sirkulasi belum aktif — buka jendela atau nyalakan hood penyedot asap.";
        saran = "Aktifkan sirkulasi udara terutama sebelum menyalakan kompor.";
        tingkat = "cukup";
      }
      break;
    }
    case "rak-bawah": {
      namaObjek = "Rak Panci Bawah";
      if (sikap === "jongkok") {
        judul = "Teknik Mengangkat Ergonomis";
        teks = "Posisi aman, punggung tidak terlalu membungkuk saat mengambil panci dari rak bawah.";
        saran = "Beban ditopang otot paha dan kaki, bukan diskus lumbal tulang belakang.";
        tingkat = "baik";
      } else {
        judul = "Postur Mengangkat Berisiko";
        teks = "Anda membungkuk penuh untuk meraih rak bawah! Risiko cedera tulang belakang.";
        saran = "Tekan C untuk berjongkok sebelum mengambil barang di rak bagian bawah.";
        tingkat = "buruk";
      }
      break;
    }
    default: {
      judul = `Evaluasi ${namaObjek}`;
      teks = `Pengaturan dapur Anda ${skor}% ergonomis (${labelSkor(skor)}).`;
      saran = "Sesuaikan parameter dapur untuk memaksimalkan keselamatan, efisiensi, dan kesehatan.";
      tingkat = skor >= 80 ? "baik" : skor >= 60 ? "cukup" : "buruk";
      break;
    }
  }

  return {
    id: `${target}-${Date.now()}`,
    objek: target,
    namaObjek,
    skor,
    tingkat,
    judul,
    teks,
    saran,
    waktu: Date.now(),
  };
}

// (Sistem misi lama digantikan oleh kurikulum modul di src/game/modul.ts)

// ---------- Deskripsi konteks target untuk HUD ----------
export function teksPrompt(
  target: string | null,
  p: ParameterDapur,
  _sikap: Sikap
): { nama: string; aksi: { kunci: string; label: string }[] } | null {
  if (!target) return null;
  switch (target) {
    case "kompor":
      return {
        nama: "Kompor & Panci",
        aksi: [
          { kunci: "Klik", label: "Ambil / letakkan kompor" },
          { kunci: "Q E · R T", label: "Putar · tinggi/rendah saat dipegang" },
          { kunci: "[ ]", label: `Jarak dinding (${Math.round(p.komporJarak)} cm)` },
        ],
      };
    case "meja-potong":
      return {
        nama: "Meja Potong",
        aksi: [
          { kunci: "Klik", label: "Ambil / letakkan meja" },
          { kunci: "Q E · R T", label: "Putar · tinggi/rendah saat dipegang" },
          { kunci: "[ ]", label: `Atur tinggi (${Math.round(p.mejaTinggi)} cm)` },
        ],
      };
    case "talenan":
      return {
        nama: "Talenan & Bahan",
        aksi: [
          { kunci: "Klik", label: "Buka opsi persiapan bahan & potong" },
        ],
      };
    case "stasiun-ukur":
      return {
        nama: "Stasiun Pengukur Tubuh",
        aksi: [{ kunci: "Klik", label: p.sudahKalibrasi ? "Buka hasil antropometri" : "Buka opsi ukur dimensi tubuh" }],
      };
    case "rak-bumbu":
      return {
        nama: "Rak Bumbu",
        aksi: [
          { kunci: "Klik", label: "Buka opsi tinggi & jangkauan" },
          { kunci: "[ ]", label: `Tinggi (${Math.round(p.rakTinggi)} cm)` },
          { kunci: "G", label: `Geser mendatar (${jarakRakKompor(p).toFixed(2)} m)` },
        ],
      };
    case "kulkas":
      return {
        nama: "Kulkas",
        aksi: [
          { kunci: "Klik", label: "Ambil / letakkan kulkas" },
          { kunci: "Q E · R T", label: "Putar · tinggi/rendah saat dipegang" },
          { kunci: "[ ]", label: `Geser posisi (jalur ${(lebarLorong(p) * 100).toFixed(0)} cm)` },
        ],
      };
    case "lampu-meja":
      return {
        nama: "Lampu Gantung Meja",
        aksi: [
          { kunci: "Klik", label: "Buka opsi arah sorot & intensitas" },
          { kunci: "[ ]", label: p.lampuMejaFokus ? "Ubah ke cahaya sebar" : "Fokuskan ke meja" },
        ],
      };
    case "saklar-lampu":
      return {
        nama: "Saklar Lampu Utama",
        aksi: [
          { kunci: "Klik", label: "Buka opsi saklar & tingkat cahaya" },
          { kunci: "[ ]", label: `Intensitas (level ${p.lampuLevel})` },
        ],
      };
    case "ventilasi":
      return {
        nama: "Jendela Ventilasi",
        aksi: [{ kunci: "Klik", label: "Buka opsi ventilasi & sirkulasi" }],
      };
    case "wastafel":
      return {
        nama: "Wastafel",
        aksi: [{ kunci: "Klik", label: "Buka opsi cuci bahan & keran air" }],
      };
    case "hood":
      return {
        nama: "Hood Penyedot Asap",
        aksi: [{ kunci: "Klik", label: "Buka opsi penyedot asap & udara" }],
      };
    case "rak-bawah":
      return {
        nama: "Rak Panci Bawah",
        aksi: [
          { kunci: "Klik", label: "Buka opsi rak panci & teknik angkat" },
        ],
      };
    case "papan-skor":
      return {
        nama: "Papan Skor Ergonomi",
        aksi: [{ kunci: "Klik", label: "Buka ringkasan & skor ergonomi" }],
      };
    default:
      return null;
  }
}

// ---------- Toko (store) ----------
type Pendengar = () => void;

class TokoDapur {
  private pendengar = new Set<Pendengar>();
  private idToast = 0;
  keadaan: Keadaan;

  constructor() {
    const nilai = nilaiDapur(PARAM_AWAL);
    this.keadaan = {
      versi: 0,
      params: { ...PARAM_AWAL },
      pilar: nilai.pilar,
      skor: nilai.skor,
      masalah: nilai.masalah,
      toasts: [],
      modul: [],
      modulAktif: 0,
      debrief: null,
      pengaturan: { ...PENGATURAN_AWAL },
      status: {
        dimulai: false,
        antarmukaTersembunyi: false,
        menuBuka: false,
        bantuanBuka: false,
        kursorTerkunci: false,
        dalamVR: false,
        sikap: "berdiri",
        target: null,
        targetJarak: 0,
        modeTata: false,
        dipegang: null,
        modelBuka: false,
        modeInteraksi: false,
        objekInteraksiAktif: null,
        evaluasiTerakhir: null,
      },
    };
    this.perbaruiModul(true);
  }

  langganan = (fn: Pendengar) => {
    this.pendengar.add(fn);
    return () => this.pendengar.delete(fn);
  };

  dapatkan = () => this.keadaan;

  private emit() {
    this.keadaan = { ...this.keadaan, versi: this.keadaan.versi + 1 };
    this.pendengar.forEach((fn) => fn());
  }

  /** Hitung ulang seluruh modul kurikulum + deteksi capaian baru. */
  private perbaruiModul(diam = false) {
    const k = this.keadaan;
    const ctx: KonteksNilai = {
      p: k.params,
      pilar: k.pilar,
      skor: k.skor,
      status: k.status,
      merah: k.masalah.filter((m) => m.tingkat === "buruk").length,
    };
    const sebelum = k.modul;

    // Hitung dulu modul 1–5 untuk mengetahui berapa yang tuntas
    const dasar = KURIKULUM.slice(0, 5).map((mod) => mod.sasaran.every((s) => s.cek(ctx)));
    ctx.p = { ...k.params, modulTuntas: dasar.filter(Boolean).length };
    k.params.modulTuntas = ctx.p.modulTuntas;

    const sesudah: ModulStatus[] = KURIKULUM.map((mod, i) => {
      const sasaran: SasaranStatus[] = mod.sasaran.map((s) => ({
        id: s.id,
        teks: s.teks,
        cara: s.cara,
        selesai: s.cek(ctx),
        ukur: s.ukur ? s.ukur(ctx) : undefined,
      }));
      const selesai = sasaran.filter((s) => s.selesai).length;
      return {
        id: mod.id,
        nomor: mod.nomor,
        judul: mod.judul,
        subjudul: mod.subjudul,
        briefing: mod.briefing,
        standar: mod.standar,
        pelajaran: mod.pelajaran,
        sasaran,
        selesai,
        total: sasaran.length,
        tuntas: selesai === sasaran.length,
        // Modul terbuka bila modul sebelumnya sudah tuntas
        terbuka: i === 0 || sebelum.length === 0 || (sebelum[i - 1]?.tuntas ?? false),
      };
    });
    // Perbaiki status terbuka memakai hasil terbaru (berantai)
    sesudah.forEach((mod, i) => {
      mod.terbuka = i === 0 ? true : sesudah[i - 1].tuntas;
    });

    // Kumpulkan pemberitahuan dulu — JANGAN memanggil toast() di sini karena
    // toast() mengganti objek keadaan sehingga penulisan di bawah bisa hilang.
    const antrean: { teks: string; tingkat: Tingkat }[] = [];
    let debriefBaru: ModulStatus | null = null;
    if (!diam && sebelum.length) {
      sesudah.forEach((mod, i) => {
        const lama = sebelum[i];
        if (!lama) return;
        mod.sasaran.forEach((s, j) => {
          const sl = lama.sasaran[j];
          if (s.selesai && sl && !sl.selesai)
            antrean.push({ teks: `Sasaran tercapai: ${s.teks}`, tingkat: "baik" });
        });
        if (mod.tuntas && !lama.tuntas) {
          debriefBaru = mod;
          antrean.push({ teks: `Modul ${mod.nomor} tuntas — ${mod.judul}!`, tingkat: "baik" });
        }
      });
    }

    // Tulis hasil langsung ke keadaan terkini (bukan salinan lama)
    const aktif = sesudah.findIndex((mod) => !mod.tuntas);
    this.keadaan.modul = sesudah;
    this.keadaan.modulAktif = aktif === -1 ? sesudah.length - 1 : aktif;
    if (debriefBaru) this.keadaan.debrief = debriefBaru;

    // Baru kirim pemberitahuan setelah state tersimpan
    antrean.forEach((a) => this.toast(a.teks, a.tingkat));
  }

  /** Tutup panel debrief modul. */
  tutupDebrief() {
    this.keadaan.debrief = null;
    this.emit();
  }

  masukInteraksi(targetId: string) {
    this.keadaan.status = {
      ...this.keadaan.status,
      modeInteraksi: true,
      objekInteraksiAktif: targetId,
    };
    this.emit();
  }

  keluarInteraksi() {
    const target = this.keadaan.status.objekInteraksiAktif || this.keadaan.status.target || "dapur";
    const ev = evaluasiObjek(target, this.keadaan.params, this.keadaan.skor, this.keadaan.status.sikap);
    this.keadaan.status = {
      ...this.keadaan.status,
      modeInteraksi: false,
      objekInteraksiAktif: null,
      evaluasiTerakhir: ev,
    };
    this.toast(ev.teks, ev.tingkat);
    this.emit();
  }

  tutupEvaluasi() {
    this.keadaan.status = {
      ...this.keadaan.status,
      evaluasiTerakhir: null,
    };
    this.emit();
  }

  setParams(patch: Partial<ParameterDapur>, senyap = false) {
    if (patch.komporApiLevel !== undefined) {
      patch.komporNyala = patch.komporApiLevel !== "mati";
    } else if (patch.komporNyala !== undefined) {
      if (!patch.komporNyala) patch.komporApiLevel = "mati";
      else if (this.keadaan.params.komporApiLevel === "mati") patch.komporApiLevel = "sedang";
    }

    const sebelum = this.keadaan.masalah;
    this.keadaan.params = { ...this.keadaan.params, ...patch };
    const nilai = nilaiDapur(this.keadaan.params);
    this.keadaan.pilar = nilai.pilar;
    this.keadaan.skor = nilai.skor;
    this.keadaan.masalah = nilai.masalah;
    if (!senyap) {
      const idSebelum = new Set(sebelum.map((m) => m.id));
      const idSesudah = new Set(nilai.masalah.map((m) => m.id));
      nilai.masalah.forEach((m) => {
        if (!idSebelum.has(m.id)) this.toast(m.teks, m.tingkat);
      });
      sebelum.forEach((m) => {
        if (!idSesudah.has(m.id)) this.toast(`Teratasi: ${m.teks}`, "baik");
      });
    }
    this.perbaruiModul(senyap);
    this.emit();
  }

  setStatus(patch: Partial<StatusPermainan>) {
    this.keadaan.status = { ...this.keadaan.status, ...patch };
    this.emit();
  }

  setPengaturan(patch: Partial<Pengaturan>) {
    this.keadaan.pengaturan = { ...this.keadaan.pengaturan, ...patch };
    this.emit();
  }

  toast(teks: string, tingkat: Tingkat = "info") {
    const id = ++this.idToast;
    this.keadaan.toasts = [...this.keadaan.toasts.slice(-4), { id, teks, tingkat }];
    this.keadaan = { ...this.keadaan, versi: this.keadaan.versi + 1 };
    this.pendengar.forEach((fn) => fn());
    setTimeout(() => {
      this.keadaan.toasts = this.keadaan.toasts.filter((t) => t.id !== id);
      this.emit();
    }, 6500);
  }

  aturUlangDapur() {
    this.keadaan.params = { ...PARAM_AWAL };
    const nilai = nilaiDapur(this.keadaan.params);
    this.keadaan.pilar = nilai.pilar;
    this.keadaan.skor = nilai.skor;
    this.keadaan.masalah = nilai.masalah;
    this.perbaruiModul(true);
    this.toast("Tata letak dapur dikembalikan ke kondisi awal.", "info");
    this.emit();
  }
}

export const toko = new TokoDapur();

// Ekspos untuk diagnosis (debug dari konsol browser)
if (typeof window !== "undefined") (window as any).__toko = toko;

export function gunakanToko<T>(pilih: (k: Keadaan) => T): T {
  return useSyncExternalStore(toko.langganan, () => pilih(toko.dapatkan()));
}
