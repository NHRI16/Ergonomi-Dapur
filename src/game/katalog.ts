// ============================================================
// ErgoDapur — Katalog Model 3D (integrasi Sketchfab)
//
// Setiap "slot" mewakili satu objek dapur yang dapat diganti
// dengan model GLB/glTF hasil unduhan dari Sketchfab.
//
// DUA CARA MEMASANG MODEL:
//  1) Permanen  : letakkan berkas .glb di folder `public/models/`
//                 lalu isi `jalur` di bawah, mis. "/models/kompor.glb".
//  2) Cepat/uji : buka panel "Manajer Model 3D" di dalam permainan
//                 (tombol K), lalu pilih berkas .glb dari komputer
//                 atau tempel URL — langsung tampil tanpa build ulang.
//
// Penyesuaian skala/rotasi/offset tersedia agar model dari
// Sketchfab (yang ukurannya beragam) pas dengan ruangan.
// ============================================================

export interface SlotModel {
  /** ID entitas A-Frame tempat model dipasang. */
  id: string;
  nama: string;
  keterangan: string;
  /** Jalur berkas GLB. Kosong = pakai model primitif bawaan. */
  jalur: string;
  /** Skala seragam. Model Sketchfab sering perlu 0.01 (cm→m). */
  skala: number;
  /** Rotasi Y dalam derajat. */
  putarY: number;
  /** Geser vertikal (meter) agar model menapak lantai. */
  offsetY: number;
  /** Sembunyikan bentuk primitif bawaan saat model aktif. */
  sembunyikanPrimitif: boolean;
}

/** Definisi slot bawaan — silakan isi `jalur` dengan model Anda. */
export const SLOT_BAWAAN: SlotModel[] = [
  {
    id: "kompor",
    nama: "Kompor",
    keterangan: "Kompor gas beserta panci di atasnya.",
    jalur: "",
    skala: 1,
    putarY: 0,
    offsetY: 0.87,
    sembunyikanPrimitif: true,
  },
  {
    id: "kulkas",
    nama: "Kulkas",
    keterangan: "Lemari pendingin dua pintu.",
    jalur: "",
    skala: 1,
    putarY: 180,
    offsetY: 0,
    sembunyikanPrimitif: true,
  },
  {
    id: "meja-atas",
    nama: "Pulau Meja Potong",
    keterangan: "Permukaan kerja utama (tinggi tetap mengikuti pengaturan ergonomi).",
    jalur: "",
    skala: 1,
    putarY: 0,
    offsetY: -0.03,
    sembunyikanPrimitif: true,
  },
  {
    id: "rak-bumbu",
    nama: "Rak Bumbu",
    keterangan: "Rak dinding beserta botol bumbu.",
    jalur: "",
    skala: 1,
    putarY: 0,
    offsetY: 0,
    sembunyikanPrimitif: true,
  },
  {
    id: "dekor-1",
    nama: "Dekorasi Bebas 1",
    keterangan: "Slot kosong — isi model apa pun, lalu pindahkan di Mode Tata.",
    jalur: "",
    skala: 1,
    putarY: 0,
    offsetY: 0,
    sembunyikanPrimitif: false,
  },
  {
    id: "dekor-2",
    nama: "Dekorasi Bebas 2",
    keterangan: "Slot kosong kedua untuk model tambahan dari Sketchfab.",
    jalur: "",
    skala: 1,
    putarY: 0,
    offsetY: 0,
    sembunyikanPrimitif: false,
  },
];

const KUNCI_SIMPAN = "ergodapur.katalog.v1";

type Pendengar = () => void;

class KatalogModel {
  private pendengar = new Set<Pendengar>();
  slot: SlotModel[];
  /** URL objek sementara dari berkas lokal (tidak ikut disimpan). */
  private urlSementara = new Map<string, string>();

  constructor() {
    this.slot = SLOT_BAWAAN.map((s) => ({ ...s }));
    this.muat();
  }

  private muat() {
    try {
      const mentah = localStorage.getItem(KUNCI_SIMPAN);
      if (!mentah) return;
      const tersimpan = JSON.parse(mentah) as Partial<SlotModel>[];
      this.slot = this.slot.map((s) => {
        const t = tersimpan.find((x) => x.id === s.id);
        // Jalur blob:// tidak berlaku lagi setelah halaman dimuat ulang
        const jalur = t?.jalur && !t.jalur.startsWith("blob:") ? t.jalur : s.jalur;
        return t ? { ...s, ...t, id: s.id, nama: s.nama, keterangan: s.keterangan, jalur } : s;
      });
    } catch {
      /* abaikan penyimpanan rusak */
    }
  }

  private simpan() {
    try {
      const bersih = this.slot.map(({ id, jalur, skala, putarY, offsetY, sembunyikanPrimitif }) => ({
        id,
        jalur: jalur.startsWith("blob:") ? "" : jalur,
        skala,
        putarY,
        offsetY,
        sembunyikanPrimitif,
      }));
      localStorage.setItem(KUNCI_SIMPAN, JSON.stringify(bersih));
    } catch {
      /* penyimpanan penuh / ditolak */
    }
  }

  langganan = (fn: Pendengar) => {
    this.pendengar.add(fn);
    return () => this.pendengar.delete(fn);
  };

  dapatkan = () => this.slot;

  ambil = (id: string) => this.slot.find((s) => s.id === id);

  private emit() {
    this.slot = [...this.slot];
    this.pendengar.forEach((fn) => fn());
  }

  perbarui(id: string, patch: Partial<SlotModel>) {
    this.slot = this.slot.map((s) => (s.id === id ? { ...s, ...patch } : s));
    this.simpan();
    this.emit();
  }

  /** Pasang berkas .glb/.gltf dari komputer pengguna. */
  pasangBerkas(id: string, berkas: File) {
    const lama = this.urlSementara.get(id);
    if (lama) URL.revokeObjectURL(lama);
    const url = URL.createObjectURL(berkas);
    this.urlSementara.set(id, url);
    this.perbarui(id, { jalur: url });
    return url;
  }

  kosongkan(id: string) {
    const lama = this.urlSementara.get(id);
    if (lama) {
      URL.revokeObjectURL(lama);
      this.urlSementara.delete(id);
    }
    this.perbarui(id, { jalur: "" });
  }

  aturUlangSemua() {
    this.urlSementara.forEach((u) => URL.revokeObjectURL(u));
    this.urlSementara.clear();
    this.slot = SLOT_BAWAAN.map((s) => ({ ...s }));
    this.simpan();
    this.emit();
  }
}

export const katalog = new KatalogModel();

if (typeof window !== "undefined") (window as any).__katalog = katalog;
