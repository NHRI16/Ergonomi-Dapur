// ============================================================
// Script Pengujian Otomatis Fitur Ergonomi & Evaluasi Langsung
// ============================================================

import {
  toko,
  evaluasiObjek,
  hitungLuxMeja,
  lebarLorong,
  PARAM_AWAL,
  warnaSkor,
  labelSkor,
} from "../src/game/store.ts";

function pastikan(kondisi: boolean, keterangan: string) {
  if (!kondisi) {
    console.error(`❌ GAGAL: ${keterangan}`);
    process.exit(1);
  }
  console.log(`✅ LULUS: ${keterangan}`);
}

console.log("\n=== 1. PENGUJIAN TOGGLE INTERAKSI (TOMBOL F) & ESC SETTING ===");
// Tekan F sekali -> aktifkan interaksi objek
toko.masukInteraksi("kompor");
pastikan(toko.keadaan.status.modeInteraksi === true, "Tekan F sekali mengaktifkan modeInteraksi objek");
pastikan(toko.keadaan.status.objekInteraksiAktif === "kompor", "objekInteraksiAktif tersimpan sebagai 'kompor'");

// Esc hanya dipakai untuk membuka/menutup menu setting (tidak menutup modeInteraksi)
toko.setStatus({ menuBuka: true });
pastikan(toko.keadaan.status.menuBuka === true, "Esc membuka menu pengaturan");
pastikan(toko.keadaan.status.modeInteraksi === true, "modeInteraksi TETAP AKTIF saat menu pengaturan dibuka (Esc tidak menutup interaksi)");

toko.setStatus({ menuBuka: false });
pastikan(toko.keadaan.status.menuBuka === false, "Esc menutup menu pengaturan");
pastikan(toko.keadaan.status.modeInteraksi === true, "modeInteraksi TETAP AKTIF setelah menu pengaturan ditutup");

// Tekan F lagi -> keluar interaksi, kembali ke kontrol FPS
toko.keluarInteraksi();
pastikan(toko.keadaan.status.modeInteraksi === false, "Tekan F lagi mematikan modeInteraksi");
pastikan(toko.keadaan.status.objekInteraksiAktif === null, "objekInteraksiAktif direset");
pastikan(toko.keadaan.status.evaluasiTerakhir !== null, "Evaluasi seketika objek dihasilkan saat keluar interaksi");

console.log("\n=== 2. PENGUJIAN KOMPOR (API & POSISI PANCI) ===");
// Kasus Api Terlalu Besar
const evApiTinggi = evaluasiObjek("kompor", { ...PARAM_AWAL, komporNyala: true, komporApiLevel: "tinggi", panciAda: true, panciPosisi: "tengah" }, 70);
pastikan(
  evApiTinggi.teks.includes("Api kompor terlalu besar, risiko boros energi dan panas berlebih."),
  "Feedback api kompor tinggi sesuai spesifikasi"
);

// Kasus Panci di Tepi
const evPanciTepi = evaluasiObjek("kompor", { ...PARAM_AWAL, komporNyala: true, komporApiLevel: "sedang", panciAda: true, panciPosisi: "tepi" }, 45);
pastikan(
  evPanciTepi.teks.includes("Posisi panci di tepi tungku tidak stabil dan rawan tersenggol atau tumpah."),
  "Feedback panci di tepi terdeteksi bahaya"
);

// Kasus Kompor & Panci Aman
const evKomporAman = evaluasiObjek("kompor", { ...PARAM_AWAL, komporJarak: 20, komporNyala: true, komporApiLevel: "sedang", panciAda: true, panciPosisi: "tengah", ventilasiBuka: true }, 90);
pastikan(evKomporAman.tingkat === "baik", "Kompor dengan api sedang, ventilasi buka, panci tengah dinilai baik");

console.log("\n=== 3. PENGUJIAN MEJA POTONG (TINGGI & LUX) ===");
// Kasus Meja Terlalu Rendah
const evMejaRendah = evaluasiObjek("meja-potong", { ...PARAM_AWAL, mejaTinggi: 75 }, 40);
pastikan(
  evMejaRendah.teks.includes("Meja terlalu rendah, risiko sakit punggung."),
  "Feedback meja terlalu rendah (<85 cm) sesuai spesifikasi"
);

// Kasus Pencahayaan Kurang (< 300 lux)
const evMejaGelap = evaluasiObjek("meja-potong", { ...PARAM_AWAL, mejaTinggi: 88, lampuUmum: false, lampuMeja: false, ventilasiBuka: false }, 60);
pastikan(
  evMejaGelap.teks.includes("Pencahayaan meja potong kurang, tambahkan lampu."),
  "Feedback pencahayaan meja potong kurang terdeteksi saat lux < 300"
);

// Perhitungan Lux Sensor
const luxTerang = hitungLuxMeja({ ...PARAM_AWAL, lampuUmum: true, lampuLevel: 3, lampuMeja: true, lampuMejaFokus: true, ventilasiBuka: true });
pastikan(luxTerang >= 500, `Lux area potong saat lampu lengkap optimal (${luxTerang} lux)`);

console.log("\n=== 4. PENGUJIAN RAK BUMBU (ZONA EMAS & JANGKAUAN) ===");
// Kasus Rak Terlalu Tinggi
const evRakTinggi = evaluasiObjek("rak-bumbu", { ...PARAM_AWAL, rakTinggi: 165 }, 48);
pastikan(
  evRakTinggi.teks.includes("Rak bumbu terlalu tinggi, sulit dijangkau."),
  "Feedback rak terlalu tinggi (>150 cm) sesuai spesifikasi"
);

// Kasus Rak Rendah Saat Berdiri
const evRakRendahBerdiri = evaluasiObjek("rak-bumbu", { ...PARAM_AWAL, rakTinggi: 60 }, 45, "berdiri");
pastikan(
  evRakRendahBerdiri.teks.includes("Rak bumbu terlalu rendah, Anda harus membungkuk."),
  "Feedback rak bumbu rendah membungkuk terdeteksi saat berdiri"
);

// Kasus Rak Rendah Saat Jongkok (C)
const evRakRendahJongkok = evaluasiObjek("rak-bumbu", { ...PARAM_AWAL, rakTinggi: 60 }, 85, "jongkok");
pastikan(
  evRakRendahJongkok.tingkat === "baik" && evRakRendahJongkok.teks.includes("Posisi aman, punggung tidak terlalu membungkuk"),
  "Teknik jongkok (C) melindungi tulang belakang saat menjangkau rak rendah"
);

console.log("\n=== 5. PENGUJIAN KULKAS (PINTU & LEBAR LORONG) ===");
// Kasus Pintu Kulkas Menghalangi Jalur
const testParamsKulkas = { ...PARAM_AWAL, kulkasTerbuka: true, kulkasZ: 0.9, mejaZ: 0.2 };
const evKulkasHalang = evaluasiObjek("kulkas", testParamsKulkas, 45);
pastikan(
  evKulkasHalang.teks.includes("Pintu kulkas menghalangi jalur, geser posisi kulkas."),
  "Feedback pintu kulkas menghalangi jalur (<85 cm) sesuai spesifikasi"
);

console.log("\n=== 6. PENGUJIAN INDIKATOR WARNA SKOR ===");
pastikan(warnaSkor(85) === "#34d399", "Skor 85 dinilai Hijau / Baik (#34d399)");
pastikan(warnaSkor(65) === "#fbbf24", "Skor 65 dinilai Kuning / Cukup (#fbbf24)");
pastikan(warnaSkor(45) === "#f87171", "Skor 45 dinilai Merah / Buruk (#f87171)");

console.log("\n=== 7. PENGUJIAN PENGATURAN (ESC) INSTAN ===");
toko.setPengaturan({ sensitivitas: 0.0035, kecepatan: 4.5, modeGelap: true });
pastikan(toko.keadaan.pengaturan.sensitivitas === 0.0035, "Sensitivitas tersimpan instan");
pastikan(toko.keadaan.pengaturan.kecepatan === 4.5, "Kecepatan gerak tersimpan instan");
pastikan(toko.keadaan.pengaturan.modeGelap === true, "Mode gelap tersimpan instan");

console.log("\n🎉 SELURUH SKENARIO ERGONOMI, TOGGLE F, EVALUASI LANGSUNG, DAN PENGATURAN ESC LULUS 100%!\n");
