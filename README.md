# Ergonomi-Dapur — Simulasi Ergonomi Dapur 3D (FPS & VR)

Game edukasi ergonomi dapur interaktif berbasis **A-Frame + React + Vite + Tailwind CSS**.
Pemain menjelajahi dapur dari sudut pandang orang pertama (FPS), menata ulang perabot
secara bebas, dan melihat skor ergonomi berubah **langsung** mengikuti posisi nyata setiap objek.

---

## 1. Menjalankan Proyek di VS Code

```bash
npm install      # pasang dependensi (sekali saja)
npm run dev      # mode pengembangan  → http://localhost:5173
npm run build    # membangun versi produksi ke folder dist/
npm run preview  # menguji hasil build
```

> **Catatan:** buka folder proyek di VS Code, lalu jalankan perintah di
> Terminal (`Ctrl` + `` ` ``). Ekstensi yang disarankan: *ESLint*, *Tailwind CSS
> IntelliSense*, dan *vscode-aframe* (penyorot sintaks A-Frame).

---

## 2. Kontrol Permainan

| Tombol | Fungsi |
| --- | --- |
| `W` `A` `S` `D` | Bergerak di dalam dapur |
| `Mouse` | Melihat sekeliling (klik = kunci kursor FPS, atau seret mouse) |
| **`F`** | **Toggle Interaksi Objek**: Tekan sekali untuk masuk interaksi, tekan lagi untuk keluar & kembali ke kontrol FPS |
| `C` | Jongkok (mengambil panci di rak bawah / postur aman) |
| `Shift` | Berdiri tegak |
| `[` `]` | Atur tinggi / geser objek yang ditatap |
| `G` | Geser rak bumbu secara mendatar |
| **`B`** | **Mode Tata Letak** — pindahkan perabot secara bebas |
| **`K`** | **Manajer Model 3D** — pasang model Sketchfab |
| `Q` / `E` | Putar objek yang sedang diangkat (Mode Tata Letak) |
| `R` / `T` | Naikkan / turunkan objek yang sedang diangkat (Mode Tata Letak) |
| **`Esc`** | **Menu Pengaturan** (sensitivitas, kecepatan, audio, tema) |
| `H` | Bantuan & panduan bermain |
| `M` | Bisukan / aktifkan suara |

### Mode VR
Sambungkan headset WebXR (mis. Meta Quest), lalu klik ikon **VR** di kanan bawah
layar 3D. Tatap objek selama ±1 detik untuk berinteraksi tanpa pengontrol.

---

## 3. Mode Tata Letak (Memindahkan Barang)

1. Tekan **`B`** — grid kuning muncul di lantai.
2. Tatap objek yang bisa dipindahkan, tekan **`F`** untuk mengangkat.
   Objek yang dapat dipindahkan: **kompor, kulkas, pulau meja potong,
   serta dua slot model tambahan**.
3. Arahkan pandangan ke lantai — objek mengikuti titik hijau, terkunci ke
   grid 5 cm.
4. Arahkan mouse/pandangan untuk memindahkan objek. Tekan **`Q`** / **`E`** untuk memutar (kelipatan 15°), **`R`** untuk menaikkan, atau **`T`** untuk menurunkan, lalu **`F`** untuk meletakkan.
5. Tekan **`B`** lagi untuk keluar.

Setiap perpindahan **langsung menghitung ulang** segitiga kerja, lebar lorong,
jarak jangkauan, dan seluruh skor ergonomi.

---

## 4. Memasang Model 3D dari Sketchfab

### 4.1 Mengunduh model
1. Buka [sketchfab.com](https://sketchfab.com/search?features=downloadable&type=models&q=kitchen)
   dan gunakan filter **Downloadable**.
2. Pilih model, klik **Download 3D Model**.
3. Pilih format **glTF (.glb)** — format ini paling ringan dan didukung penuh
   oleh A-Frame.

> Perhatikan lisensi model (umumnya CC-BY: wajib mencantumkan nama pembuat).

### 4.2 Cara cepat — lewat panel dalam permainan
1. Jalankan permainan, tekan **`K`** (atau klik ikon kubus di kanan atas).
2. Pilih slot, klik **Pilih berkas .glb**, ambil berkas hasil unduhan.
3. Model langsung tampil. Setel **Skala**, **Tinggi**, dan **Putar** bila perlu.

### 4.3 Cara permanen — lewat folder proyek
1. Salin berkas ke folder **`public/models/`**, contoh:
   ```
   public/models/kompor.glb
   public/models/kulkas.glb
   ```
2. Buka **`src/game/katalog.ts`**, isi kolom `jalur` pada slot yang sesuai:
   ```ts
   {
     id: "kompor",
     nama: "Kompor",
     jalur: "/models/kompor.glb",   // ← isi di sini
     skala: 1,        // Sketchfab sering perlu 0.01 (satuan cm → m)
     putarY: 0,       // rotasi Y (derajat)
     offsetY: 0.87,   // geser vertikal agar menapak dengan benar
     sembunyikanPrimitif: true,
   }
   ```
3. Simpan berkas — Vite memuat ulang otomatis.

### 4.4 Slot yang tersedia

| ID slot | Objek | Catatan |
| --- | --- | --- |
| `kompor` | Kompor | Api & uap tetap tampil di atas model |
| `kulkas` | Kulkas | Animasi pintu bawaan tetap aktif |
| `meja-atas` | Pulau meja potong | Talenan tetap dapat digunakan |
| `rak-bumbu` | Rak bumbu dinding | Ikut naik-turun sesuai pengaturan |
| `dekor-1` | Model bebas 1 | Dapat dipindahkan di Mode Tata Letak |
| `dekor-2` | Model bebas 2 | Dapat dipindahkan di Mode Tata Letak |

### 4.5 Menambah slot baru
1. Tambahkan entri baru pada `SLOT_BAWAAN` di `src/game/katalog.ts`.
2. Tambahkan entitas di `src/aframe/markah.ts` dengan atribut
   `slot-model` dan `id` yang sama:
   ```html
   <a-entity id="slot-baru" class="interaktif" slot-model="slot: slot-baru"
             position="0 0 0"></a-entity>
   ```

### 4.6 Mengatasi masalah umum

| Gejala | Penyebab & solusi |
| --- | --- |
| Model tidak terlihat | Skala terlalu kecil/besar → coba `0.01`, `0.1`, atau `10` |
| Model melayang / tenggelam | Setel **Tinggi (offsetY)** di panel Manajer Model |
| Model menghadap arah salah | Ubah **Putar (putarY)**, mis. `180` |
| Muncul notifikasi "gagal dimuat" | Berkas bukan `.glb/.gltf` valid, atau jalur salah |
| Model hilang setelah muat ulang | Berkas lokal bersifat sementara — gunakan cara 4.3 agar permanen |

---

## 5. Sistem Penilaian Ergonomi

Skor 0–100% dihitung dari empat pilar, seluruhnya memakai **koordinat nyata**
objek di dalam ruangan:

| Pilar | Bobot | Yang dinilai |
| --- | --- | --- |
| Keselamatan | 30 | Jarak kompor dari dinding, sirkulasi udara, jalur pintu kulkas |
| Efisiensi | 25 | Panjang tiap sisi segitiga kerja, lebar lorong |
| Kesehatan | 20 | Ventilasi, zona jangkauan rak (tinggi & jarak) |
| Kenyamanan | 25 | Tinggi meja potong, pencahayaan umum & tugas |

Indikator warna: 🟢 hijau ≥ 80 · 🟡 kuning 60–79 · 🔴 merah < 60.

---

## 6. Kurikulum Pembelajaran (6 Modul)

1. **Antropometri & Postur Netral** — ukur tubuh, setel meja ke zona siku *(ISO 11226)*
2. **Zona Jangkauan & Penyimpanan** — rak bumbu di zona emas *(EN 1005-4)*
3. **Segitiga Kerja & Sirkulasi** — sisi 1,2–2,8 m, lorong ≥ 90 cm *(NKBA)*
4. **Pencahayaan Berlapis** — cahaya umum + cahaya tugas *(SNI 03-6197-2000)*
5. **Sesi Memasak Aman** — urutan kerja & kualitas udara *(SNI 03-6572-2001)*
6. **Audit Ergonomi Akhir** — skor ≥ 90% tanpa temuan merah

Setiap sasaran menampilkan **pembacaan terukur** (mis. `78 cm → 85–92 cm`) dan
diakhiri **debrief pembelajaran** berisi dasar ilmiahnya.

---

## 7. Struktur Proyek

```
public/
  models/          ← letakkan berkas .glb dari Sketchfab di sini
  textures/        ← tekstur dapur
src/
  aframe/
    markah.ts      ← seluruh markup scene 3D
    komponen.ts    ← komponen A-Frame (kontrol FPS, slot-model, dsb.)
    pengendali.ts  ← logika interaksi, Mode Tata Letak, animasi
  components/      ← antarmuka React (HUD, panel modul, manajer model)
  game/
    store.ts       ← state & mesin penilaian ergonomi
    modul.ts       ← kurikulum 6 modul
    katalog.ts     ← katalog model 3D (Sketchfab)
    audio.ts       ← efek suara prosedural
```
