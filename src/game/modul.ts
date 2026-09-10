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
  // ============================================================
  {
    id: "mod1",
    nomor: 1,
    judul: "Antropometri & Postur Netral",
    subjudul: "Sesuaikan dapur dengan tubuh, bukan sebaliknya",
    briefing:
      "Ergonomi selalu dimulai dari dimensi tubuh pengguna. Ukur tubuh Anda lebih dulu, lalu setel stasiun kerja agar punggung tetap tegak dan bahu rileks selama memasak.",
    sasaran: [
      {
        id: "s1a",
        teks: "Ukur dimensi tubuh di stasiun pengukur",
        cara: "Berdiri di depan meteran dinding (sisi kiri ruangan), lalu klik meteran.",
        cek: (k) => k.p.sudahKalibrasi,
      },
      {
        id: "s1b",
        teks: "Setel meja potong ke zona siku (85–92 cm)",
        cara: "Tatap meja potong, tekan [ atau ] untuk mengatur ketinggian.",
        ukur: (k) => ({ nilai: cm(k.p.mejaTinggi), target: "85–92 cm" }),
        cek: (k) => k.p.mejaTinggi >= 85 && k.p.mejaTinggi <= 92,
      },
      {
        id: "s1c",
        teks: "Potong bahan dengan postur punggung netral",
        cara: "Setelah tinggi meja benar, klik talenan.",
        cek: (k) => k.p.potongPosturBaik,
      },
      {
        id: "s1d",
        teks: "Angkat panci dari rak bawah dengan jongkok",
        cara: "Tekan C untuk jongkok, lalu klik rak panci bawah.",
        cek: (k) => k.p.panciAmbilJongkok,
      },
    ],
    pelajaran: [
      "Tinggi permukaan potong ideal = tinggi siku berdiri dikurangi 10–15 cm. Untuk postur dewasa Indonesia rata-rata, hasilnya 85–92 cm.",
      "Meja terlalu rendah memaksa fleksi tulang belakang > 20° — pemicu utama nyeri punggung bawah pada juru masak.",
      "Meja terlalu tinggi mengangkat bahu (abduksi) dan membuat otot trapezius bekerja statis sehingga cepat lelah.",
      "Mengangkat beban dengan jongkok memindahkan gaya ke otot paha, bukan ke diskus lumbal — menurunkan risiko cedera punggung secara signifikan.",
    ],
    standar: "ISO 11226 — Evaluasi postur kerja statis",
  },

  // ============================================================
  {
    id: "mod2",
    nomor: 2,
    judul: "Zona Jangkauan & Logika Penyimpanan",
    subjudul: "Barang yang sering dipakai harus mudah diraih",
    briefing:
      "Penyimpanan yang ergonomis mengikuti frekuensi pemakaian. Barang harian wajib berada di 'zona emas' antara pinggang dan bahu, sedekat mungkin dengan titik pemakaiannya.",
    sasaran: [
      {
        id: "s2a",
        teks: "Tempatkan rak bumbu di zona emas (90–150 cm)",
        cara: "Tatap rak bumbu, tekan [ atau ] untuk mengubah ketinggian.",
        ukur: (k) => ({ nilai: cm(k.p.rakTinggi), target: "90–150 cm" }),
        cek: (k) => k.p.rakTinggi >= 90 && k.p.rakTinggi <= 150,
      },
      {
        id: "s2b",
        teks: "Dekatkan rak bumbu ke kompor (≤ 1,20 m)",
        cara: "Tatap rak bumbu lalu tekan G untuk menggesernya mendatar.",
        ukur: (k) => ({ nilai: m(jarakRakKompor(k.p)), target: "≤ 1,20 m" }),
        cek: (k) => jarakRakKompor(k.p) <= 1.201,
      },
      {
        id: "s2c",
        teks: "Ambil bumbu tanpa menjinjit atau membungkuk",
        cara: "Setelah rak berada di zona emas, klik rak bumbu.",
        cek: (k) => k.p.bumbuAmbilBaik,
      },
    ],
    pelajaran: [
      "Zona emas (golden zone) berada di ketinggian 90–150 cm — rentang di mana lengan bekerja tanpa mengangkat bahu atau menekuk punggung.",
      "Menjangkau di atas 170 cm memerlukan elevasi bahu > 60°, memicu sindrom penjepitan (impingement) bila dilakukan berulang.",
      "Jarak jangkau nyaman maksimum sekitar 60 cm dari badan; bumbu yang dipakai saat memasak harus berada dalam radius tersebut dari kompor.",
      "Prinsip: makin sering dipakai, makin dekat dan makin tengah posisinya.",
    ],
    standar: "EN 1005-4 & prinsip zona jangkauan antropometrik",
  },

  // ============================================================
  {
    id: "mod3",
    nomor: 3,
    judul: "Segitiga Kerja & Ruang Sirkulasi",
    subjudul: "Efisiensi alur gerak kompor–wastafel–kulkas",
    briefing:
      "Tiga titik tersibuk di dapur membentuk segitiga kerja. Bila sisinya terlalu panjang Anda boros langkah; bila terlalu pendek ruang kerja jadi sesak dan berbahaya.",
    sasaran: [
      {
        id: "s3a",
        teks: "Sisi wastafel–kulkas dalam rentang 1,2–2,8 m",
        cara: "Tatap kulkas, tekan [ atau ] untuk menggeser posisinya.",
        ukur: (k) => ({ nilai: m(segitigaKerja(k.p).wk), target: "1,2–2,8 m" }),
        cek: (k) => {
          const s = segitigaKerja(k.p);
          return s.wk >= 1.2 && s.wk <= 2.8;
        },
      },
      {
        id: "s3b",
        teks: "Total keliling segitiga kerja 3,6–6,6 m",
        cara: "Seimbangkan posisi kulkas hingga total keliling masuk rentang.",
        ukur: (k) => ({ nilai: m(segitigaKerja(k.p).total), target: "3,6–6,6 m" }),
        cek: (k) => {
          const s = segitigaKerja(k.p);
          return s.total >= 3.6 && s.total <= 6.6;
        },
      },
      {
        id: "s3c",
        teks: "Lebar lorong kerja minimal 90 cm",
        cara: "Geser kulkas menjauh dari pulau meja agar jalur lega.",
        ukur: (k) => ({ nilai: cm(lebarLorong(k.p) * 100), target: "≥ 90 cm" }),
        cek: (k) => lebarLorong(k.p) >= 0.8995,
      },
      {
        id: "s3d",
        teks: "Buka pintu kulkas tanpa memblokir jalur",
        cara: "Setelah lorong cukup lebar, klik kulkas.",
        cek: (k) => k.p.kulkasBukaJalurBebas,
      },
    ],
    pelajaran: [
      "NKBA menganjurkan tiap sisi segitiga kerja 1,2–2,7 m dengan total 4–8 m; di luar rentang itu alur memasak menjadi tidak efisien.",
      "Lorong kerja minimal 90 cm untuk satu juru masak, dan 107 cm bila dapur dipakai dua orang bersamaan.",
      "Pintu kulkas yang membuka ke jalur sirkulasi adalah penyebab umum tabrakan dan tumpahan — perhatikan arah bukaan sejak tahap desain.",
      "Jalur segitiga kerja harus bebas hambatan: tidak dipotong pulau, meja makan, atau lalu-lalang orang lain.",
    ],
    standar: "NKBA Kitchen Planning Guidelines 5 & 6",
  },

  // ============================================================
  {
    id: "mod4",
    nomor: 4,
    judul: "Pencahayaan Berlapis",
    subjudul: "Cahaya umum + cahaya tugas tanpa bayangan",
    briefing:
      "Memotong bahan di bawah bayangan tubuh sendiri adalah penyebab kecelakaan pisau yang paling sering. Dapur ergonomis memakai dua lapis cahaya: umum dan tugas.",
    sasaran: [
      {
        id: "s4a",
        teks: "Nyalakan pencahayaan umum pada intensitas penuh",
        cara: "Klik saklar di dinding belakang, lalu ] hingga level 3.",
        ukur: (k) => ({
          nilai: k.p.lampuUmum ? `level ${k.p.lampuLevel}` : "mati",
          target: "level 3",
        }),
        cek: (k) => k.p.lampuUmum && k.p.lampuLevel === 3,
      },
      {
        id: "s4b",
        teks: "Fokuskan lampu tugas ke permukaan meja potong",
        cara: "Klik lampu gantung untuk menyalakan lalu [ untuk memfokuskan.",
        ukur: (k) => ({
          nilai: !k.p.lampuMeja ? "mati" : k.p.lampuMejaFokus ? "fokus" : "menyebar",
          target: "fokus",
        }),
        cek: (k) => k.p.lampuMeja && k.p.lampuMejaFokus,
      },
      {
        id: "s4c",
        teks: "Capai nilai penuh pilar Kenyamanan (25/25)",
        cara: "Gabungkan tinggi meja ideal + dua lapis pencahayaan aktif.",
        ukur: (k) => ({ nilai: `${k.pilar.kenyamanan}/25`, target: "25/25" }),
        cek: (k) => k.pilar.kenyamanan >= 25,
      },
    ],
    pelajaran: [
      "Dapur memerlukan sekitar 250–300 lux cahaya umum, dan 500 lux pada permukaan potong sebagai pencahayaan tugas.",
      "Sumber cahaya tunggal di plafon membuat tubuh Anda menaungi talenan; lampu tugas harus berada di depan atau di atas area kerja.",
      "Kontras berlebihan antara area terang dan gelap memaksa mata berakomodasi terus-menerus dan memicu kelelahan visual.",
      "Pencahayaan berlapis (ambient + task) adalah praktik standar desain dapur modern.",
    ],
    standar: "SNI 03-6197-2000 — Konservasi energi sistem pencahayaan",
  },

  // ============================================================
  {
    id: "mod5",
    nomor: 5,
    judul: "Sesi Memasak Aman",
    subjudul: "Urutan kerja, kualitas udara & keselamatan termal",
    briefing:
      "Ergonomi bukan hanya soal perabot, tetapi juga urutan tindakan. Sirkulasi harus aktif sebelum api menyala, dan bahan dicuci sebelum dipotong.",
    sasaran: [
      {
        id: "s5a",
        teks: "Beri jarak aman kompor dari dinding (≥ 15 cm)",
        cara: "Tatap kompor, tekan ] untuk menggesernya menjauh dari dinding.",
        ukur: (k) => ({ nilai: cm(k.p.komporJarak), target: "≥ 15 cm" }),
        cek: (k) => k.p.komporJarak >= 15,
      },
      {
        id: "s5b",
        teks: "Cuci bahan di air mengalir sebelum dipotong",
        cara: "Klik wastafel untuk membuka keran (lakukan sebelum memotong).",
        cek: (k) => k.p.bahanDicuci,
      },
      {
        id: "s5c",
        teks: "Aktifkan sirkulasi SEBELUM menyalakan api",
        cara: "Nyalakan hood atau buka jendela dulu, lalu gunakan opsi kompor.",
        cek: (k) => k.p.hoodSebelumKompor,
      },
      {
        id: "s5d",
        teks: "Buka jendela untuk ventilasi silang",
        cara: "Klik jendela di dinding kanan.",
        cek: (k) => k.p.ventilasiBuka,
      },
      {
        id: "s5e",
        teks: "Capai nilai penuh pilar Keselamatan (30/30)",
        cara: "Penuhi jarak kompor, ventilasi, dan jalur kulkas yang bebas.",
        ukur: (k) => ({ nilai: `${k.pilar.keselamatan}/30`, target: "30/30" }),
        cek: (k) => k.pilar.keselamatan >= 30,
      },
    ],
    pelajaran: [
      "Pembakaran gas menghasilkan CO, NO₂, dan PM2.5. Sirkulasi wajib aktif sejak sebelum api menyala, bukan setelah dapur penuh asap.",
      "Hood menangkap polutan di sumbernya; jendela memberi udara pengganti. Keduanya saling melengkapi, bukan saling menggantikan.",
      "Jarak minimal 15 cm antara kompor dan dinding mencegah akumulasi panas pada material di belakangnya.",
      "Urutan kerja higienis: simpan → cuci → potong → masak → sajikan. Memotong sebelum mencuci memindahkan kontaminan ke talenan.",
    ],
    standar: "SNI 03-6572-2001 — Tata cara perancangan sistem ventilasi",
  },

  // ============================================================
  {
    id: "mod6",
    nomor: 6,
    judul: "Audit Ergonomi Akhir",
    subjudul: "Sertifikasi dapur layak pakai",
    briefing:
      "Tahap terakhir: buktikan seluruh penataan Anda konsisten. Auditor menilai skor total, tidak boleh ada temuan berkategori merah, dan semua modul harus tuntas.",
    sasaran: [
      {
        id: "s6a",
        teks: "Selesaikan Modul 1 sampai 5",
        cara: "Tuntaskan seluruh sasaran pada modul sebelumnya.",
        ukur: (k) => ({ nilai: `${k.p.modulTuntas}/5`, target: "5/5" }),
        cek: (k) => k.p.modulTuntas >= 5,
      },
      {
        id: "s6b",
        teks: "Nol temuan berkategori merah (buruk)",
        cara: "Perbaiki semua peringatan merah pada panel evaluasi.",
        ukur: (k) => ({ nilai: `${k.merah} temuan`, target: "0 temuan" }),
        cek: (k) => k.merah === 0,
      },
      {
        id: "s6c",
        teks: "Capai skor ergonomi total minimal 90%",
        cara: "Optimalkan keempat pilar hingga skor menembus 90%.",
        ukur: (k) => ({ nilai: `${k.skor}%`, target: "≥ 90%" }),
        cek: (k) => k.skor >= 90,
      },
    ],
    pelajaran: [
      "Dapur ergonomis adalah hasil kompromi antar-parameter, bukan optimasi satu variabel saja.",
      "Audit berkala penting karena kebiasaan pakai berubah: rak bergeser, barang menumpuk, jalur menyempit tanpa disadari.",
      "Selamat! Anda telah memahami hubungan antara postur, jangkauan, alur gerak, pencahayaan, dan kualitas udara di dapur.",
    ],
    standar: "Ringkasan ISO 11226 · EN 1005 · NKBA · SNI",
  },
];
