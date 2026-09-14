// ============================================================
// ErgoDapur — Kurikulum Ergonomi Dapur (6 Modul Bertingkat)
// Setiap sasaran punya kriteria terukur + pembacaan nilai
// langsung, mengacu pada standar ergonomi yang berlaku.
// ============================================================

import type { ParameterDapur, Pilar, StatusPermainan } from "./store";
import { jarakRakKompor, lebarLorong, segitigaKerja } from "./store";

export interface KonteksNilai {
  p: ParameterDapur;
  pilar: Pilar;
  skor: number;
  skorPenataan: number;
  skorMemasak: number;
  status: StatusPermainan;
  merah: number; // jumlah temuan tingkat "buruk"
}

export interface Sasaran {
  id: string;
  teks: string;
  /** Petunjuk cara menyelesaikan. */
  cara: string;
  /** Pembacaan terukur langsung (angka nyata + target). */
  ukur?: (k: KonteksNilai) => { nilai: string; target: string };
  cek: (k: KonteksNilai) => boolean;
}

export interface Modul {
  id: string;
  nomor: number;
  judul: string;
  subjudul: string;
  briefing: string;
  sasaran: Sasaran[];
  pelajaran: string[];
  standar: string;
}

const cm = (v: number) => `${Math.round(v)} cm`;
const m = (v: number) => `${v.toFixed(2)} m`;

export const KURIKULUM: Modul[] = [
  {
    id: "mod1",
    nomor: 1,
    judul: "Ukur Tubuh & Atur Meja",
    subjudul: "Jadikan tubuh pemain sebagai dasar penataan",
    briefing: "Sebelum memindahkan perabot, ukur tinggi badan. Gunakan hasilnya untuk menentukan tinggi meja potong yang menjaga siku dan punggung tetap netral.",
    sasaran: [
      { id: "s1a", teks: "Ukur tinggi badan pemain", cara: "Klik pengukur tinggi badan sebelum memindahkan barang.", cek: (k) => k.p.sudahKalibrasi },
      { id: "s1b", teks: "Atur tinggi meja potong sesuai siku", cara: "Pegang meja potong, lalu gunakan R/T sampai masuk zona antropometri Anda.", ukur: (k) => ({ nilai: cm(k.p.mejaTinggi), target: `${cm((k.p.tinggiBadan * 0.62) - 15)}–${cm((k.p.tinggiBadan * 0.62) - 8)}` }), cek: (k) => { const a = k.p.tinggiBadan * 0.62; return k.p.mejaTinggi >= a - 15 && k.p.mejaTinggi <= a - 8; } },
      { id: "s1c", teks: "Letakkan meja potong di bawah lampu", cara: "Pindahkan meja hingga berada di bawah lampu gantung.", ukur: (k) => ({ nilai: `${Math.round(Math.hypot(k.p.mejaX + 0.45, k.p.mejaZ + 0.55) * 100)} cm`, target: "≤ 70 cm" }), cek: (k) => Math.hypot(k.p.mejaX + 0.45, k.p.mejaZ + 0.55) <= 0.7 },
    ],
    pelajaran: ["Tinggi meja potong mengikuti tinggi siku, bukan ukuran meja yang seragam.", "Area potong di bawah lampu mengurangi bayangan dan risiko cedera saat memakai pisau."],
    standar: "ISO 11226 — Evaluasi postur kerja statis",
  },
  {
    id: "mod2",
    nomor: 2,
    judul: "Kompor & Cerobong Hood",
    subjudul: "Pasangkan sumber panas dengan jalur pembuangan asap",
    briefing: "Kompor harus memiliki jarak aman dari dinding dan berada tepat di bawah cerobong hood agar panas serta asap tertangani.",
    sasaran: [
      { id: "s2a", teks: "Tempatkan kompor dengan jarak aman dari dinding", cara: "Pindahkan kompor menjauh dari dinding belakang.", ukur: (k) => ({ nilai: cm(k.p.komporJarak), target: "≥ 15 cm" }), cek: (k) => k.p.komporJarak >= 15 },
      { id: "s2b", teks: "Tempatkan kompor tepat di bawah hood", cara: "Atur posisi kompor pada sumbu cerobong hood.", ukur: (k) => ({ nilai: `${Math.round(Math.abs(k.p.komporX + 1.3) * 100)} cm`, target: "≤ 35 cm" }), cek: (k) => Math.abs(k.p.komporX + 1.3) <= 0.35 },
    ],
    pelajaran: ["Jarak dari dinding mengurangi akumulasi panas pada backsplash.", "Hood paling efektif saat sumber asap berada tepat di bawah area hisapnya."],
    standar: "SNI 03-6572-2001 — Tata cara perancangan ventilasi",
  },
  {
    id: "mod3",
    nomor: 3,
    judul: "Rak Bumbu dalam Jangkauan",
    subjudul: "Simpan bahan kecil dekat titik pemakaian",
    briefing: "Rak bumbu harus berada di zona emas dan cukup dekat dengan kompor agar tidak perlu menjinjit, membungkuk, atau berjalan jauh.",
    sasaran: [
      { id: "s3a", teks: "Tempatkan rak bumbu pada zona emas", cara: "Pindahkan rak bumbu dan atur ketinggiannya dengan R/T.", ukur: (k) => ({ nilai: cm(k.p.rakTinggi), target: "90–150 cm" }), cek: (k) => k.p.rakTinggi >= 90 && k.p.rakTinggi <= 150 },
      { id: "s3b", teks: "Dekatkan rak bumbu ke kompor", cara: "Geser rak bumbu hingga jaraknya maksimal 1,20 m dari kompor.", ukur: (k) => ({ nilai: m(jarakRakKompor(k.p)), target: "≤ 1,20 m" }), cek: (k) => jarakRakKompor(k.p) <= 1.2 },
    ],
    pelajaran: ["Zona emas 90–150 cm menjaga bahu tetap rileks.", "Bumbu yang sering dipakai sebaiknya berada dalam jangkauan langsung dari kompor."],
    standar: "EN 1005-4 — Zona jangkauan antropometrik",
  },
  {
    id: "mod4",
    nomor: 4,
    judul: "Kulkas & Wastafel",
    subjudul: "Bangun alur bahan yang pendek dan aman",
    briefing: "Kulkas dan wastafel harus cukup dekat untuk memindahkan bahan, tetapi tetap menyisakan ruang gerak dan jalur kerja yang lega.",
    sasaran: [
      { id: "s4a", teks: "Atur jarak kulkas–wastafel", cara: "Pindahkan kulkas sampai jaraknya 1,20–2,80 m dari wastafel.", ukur: (k) => ({ nilai: m(segitigaKerja(k.p).wk), target: "1,20–2,80 m" }), cek: (k) => segitigaKerja(k.p).wk >= 1.2 && segitigaKerja(k.p).wk <= 2.8 },
      { id: "s4b", teks: "Sisakan lorong kerja minimal 90 cm", cara: "Tempatkan kulkas tanpa menyempitkan lorong di samping meja.", ukur: (k) => ({ nilai: cm(lebarLorong(k.p) * 100), target: "≥ 90 cm" }), cek: (k) => lebarLorong(k.p) >= 0.9 },
    ],
    pelajaran: ["Jarak kerja yang terlalu jauh membuang langkah; jarak terlalu dekat membuat area sesak.", "Lorong 90 cm memberi ruang bagi satu orang untuk membuka kulkas dan bekerja."],
    standar: "NKBA Kitchen Planning Guidelines",
  },
  {
    id: "mod5",
    nomor: 5,
    judul: "Simulasi Memasak",
    subjudul: "Ikuti urutan kerja dari bahan mentah sampai masakan",
    briefing: "Setelah tata letak selesai, masak tanpa memindahkan perabot. Setiap langkah harus dilakukan melalui interaksi langsung dengan objek dapur.",
    sasaran: [
      { id: "s5a", teks: "Ambil bahan dari kulkas", cara: "Klik kulkas pada fase memasak.", cek: (k) => k.p.bahanDibawa },
      { id: "s5b", teks: "Cuci bahan di wastafel", cara: "Klik wastafel setelah bahan dibawa.", cek: (k) => k.p.bahanDicuci },
      { id: "s5c", teks: "Letakkan dan potong bahan di meja", cara: "Klik talenan untuk meletakkan bahan, lalu klik lagi untuk memotong.", cek: (k) => k.p.bahanDitaruh && k.p.tomatDipotong },
      { id: "s5d", teks: "Atur penerangan meja potong", cara: "Klik lampu meja agar sorotannya fokus ke meja.", cek: (k) => k.p.lampuMeja && k.p.lampuMejaFokus },
      { id: "s5e", teks: "Buka jendela sebelum menyalakan kompor", cara: "Klik jendela, lalu klik kompor.", cek: (k) => k.p.ventilasiBuka && k.p.hoodSebelumKompor },
      { id: "s5f", teks: "Nyalakan kompor, hood, dan masukkan bumbu", cara: "Klik kompor, lalu hood dan rak bumbu.", cek: (k) => k.p.komporNyala && k.p.hoodNyala && k.p.bumbuDiambil },
    ],
    pelajaran: ["Urutan higienis adalah ambil, cuci, letakkan, potong, lalu masak.", "Ventilasi dibuka sebelum api menyala agar asap tidak terakumulasi.", "Skor memasak menyumbang 30% dari penilaian akhir."],
    standar: "SNI 03-6572-2001 — Ventilasi dan keselamatan termal",
  },
  {
    id: "mod6",
    nomor: 6,
    judul: "Audit Akhir",
    subjudul: "Buktikan dapur siap dipakai",
    briefing: "Penilaian akhir menggabungkan kualitas tata letak dan keberhasilan simulasi memasak.",
    sasaran: [
      { id: "s6a", teks: "Selesaikan seluruh modul penataan dan memasak", cara: "Tuntaskan Modul 1 sampai 5.", ukur: (k) => ({ nilai: `${k.p.modulTuntas}/5`, target: "5/5" }), cek: (k) => k.p.modulTuntas >= 5 },
      { id: "s6b", teks: "Capai skor penataan minimal 70%", cara: "Penuhi lima syarat tata letak ergonomis.", ukur: (k) => ({ nilai: `${k.skorPenataan}%`, target: "100% dari komponen 70%" }), cek: (k) => k.skorPenataan >= 100 },
      { id: "s6c", teks: "Capai skor akhir minimal 90%", cara: "Optimalkan penataan dan selesaikan seluruh langkah memasak.", ukur: (k) => ({ nilai: `${k.skor}%`, target: "≥ 90%" }), cek: (k) => k.skor >= 90 },
    ],
    pelajaran: ["Skor akhir = 70% penataan ergonomi + 30% simulasi memasak.", "Penataan yang baik harus tetap mendukung urutan kerja nyata.", "Audit selesai saat semua sasaran tercapai dan tidak ada risiko utama yang tersisa."],
    standar: "Ringkasan ISO 11226 · EN 1005 · NKBA · SNI",
  },
];
