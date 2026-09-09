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
    jalur: "/models/kitchen_stove.glb",
    skala: 0.5,
    putarY: 0,
    offsetY: 0,
    sembunyikanPrimitif: false,
  },
  {
    id: "kulkas",
    nama: "Kulkas",
    keterangan: "Lemari pendingin dua pintu.",
    jalur: "/models/coca_cola_refrigerator.glb",
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
    jalur: "/models/spice_rack.glb",
    skala: 1,
    putarY: 0,
    offsetY: 0,
    sembunyikanPrimitif: true,
  },
  {
    id: "dekor-1",
    nama: "Dekorasi Bebas 1",
    keterangan: "Slot kosong — isi model apa pun, lalu pindahkan di Mode Tata.",
    jalur: "/models/barrel_stove.glb",
    skala: 1,
    putarY: 0,
    offsetY: 0.8,
    sembunyikanPrimitif: false,
  },
  {
    id: "dekor-2",
    nama: "Dekorasi Bebas 2",
    keterangan: "Slot kosong kedua untuk model tambahan dari Sketchfab.",
    jalur: "/models/dining_table.glb",
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

  /** Pasang berkas .glb/.gltf dari komputer pengguna.
   *  Di dev-server: upload ke /api/upload-model → pakai path permanen.
   *  Di produksi (tidak ada endpoint): fallback ke blob URL sementara.
   */
  async pasangBerkas(id: string, berkas: File): Promise<{ ok: boolean; jalur: string; namaFile: string; pesan: string }> {
    const namaFile = berkas.name;

    // Coba upload ke dev-server
    try {
      const form = new FormData();
      form.append("file", berkas, namaFile);

      const resp = await fetch("/api/upload-model", {
        method: "POST",
        body: form,
      });

      if (resp.ok) {
        const json = (await resp.json()) as { ok: boolean; path: string; filename: string };
        if (json.ok && json.path) {
          // Cabut blob URL lama jika ada
          const lama = this.urlSementara.get(id);
          if (lama) {
            URL.revokeObjectURL(lama);
            this.urlSementara.delete(id);
          }
          this.perbarui(id, { jalur: json.path });
          return {
            ok: true,
            jalur: json.path,
            namaFile: json.filename,
            pesan: `Model berhasil disimpan ke public/models/${json.filename}`,
          };
        }
        const err = (await resp.json().catch(() => ({ error: "Unknown error" }))) as { error?: string };
        throw new Error(err.error ?? "Server error");
      } else {
        const errJson = (await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }))) as { error?: string };
        throw new Error(errJson.error ?? `HTTP ${resp.status}`);
      }
    } catch (err) {
      // Fallback: blob URL sementara (hanya muncul di build / jika server tidak jalan)
      console.warn("[katalog] Upload ke server gagal, menggunakan blob URL sementara:", err);
      const lama = this.urlSementara.get(id);
      if (lama) URL.revokeObjectURL(lama);
      const url = URL.createObjectURL(berkas);
      this.urlSementara.set(id, url);
      this.perbarui(id, { jalur: url });
      return {
        ok: false,
        jalur: url,
        namaFile,
        pesan: `Gagal menyimpan permanen: ${String(err)}. Model ditampilkan sementara.`,
      };
    }
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
