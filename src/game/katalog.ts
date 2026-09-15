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
    id: "talenan",
    nama: "Tatakan Potong",
    keterangan: "Tatakan yang menjadi area interaksi untuk memotong bahan.",
    jalur: "",
    skala: 1,
    putarY: 0,
    offsetY: 0,
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
    id: "rak-bawah",
    nama: "Rak Bawah Kompor",
    keterangan: "Rak tetap di bawah area kompor.",
    jalur: "",
    skala: 1,
    putarY: 0,
    offsetY: 0,
    sembunyikanPrimitif: true,
  },
  {
    id: "lampu-meja",
    nama: "Lampu Meja",
    keterangan: "Lampu tetap di atas meja potong.",
    jalur: "",
    skala: 1,
    putarY: 0,
    offsetY: 0,
    sembunyikanPrimitif: true,
  },
  {
    id: "hood",
    nama: "Cerobong Hood",
    keterangan: "Cerobong tetap di atas kompor.",
    jalur: "",
    skala: 1,
    putarY: 0,
    offsetY: 0,
    sembunyikanPrimitif: true,
  },
  {
    id: "ventilasi",
    nama: "Jendela",
    keterangan: "Jendela tetap untuk ventilasi silang.",
    jalur: "",
    skala: 1,
    putarY: 0,
    offsetY: 0,
    sembunyikanPrimitif: true,
  },
  {
    id: "wastafel",
    nama: "Wastafel",
    keterangan: "Wastafel tetap dengan instalasi air.",
    jalur: "",
    skala: 1,
    putarY: 0,
    offsetY: 0,
    sembunyikanPrimitif: true,
  },
  {
    id: "stasiun-ukur",
    nama: "Pengukur Tinggi Badan",
    keterangan: "Stasiun tetap untuk mengukur tinggi badan pemain.",
    jalur: "",
    skala: 1,
    putarY: 0,
    offsetY: 0,
    sembunyikanPrimitif: true,
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
    void this.muatManifestProyek();
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

  private async muatManifestProyek() {
    try {
      const resp = await fetch("/models/slot-model.json", { cache: "no-store" });
      if (!resp.ok) return;
      const manifest = (await resp.json()) as Record<string, Partial<SlotModel>>;
      let berubah = false;
      this.slot = this.slot.map((s) => {
        const konfigurasi = manifest[s.id];
        if (!konfigurasi) return s;
        berubah = true;
        const lokal = s.jalur.startsWith("blob:") ? s.jalur : "";
        return {
          ...s,
          ...konfigurasi,
          jalur: konfigurasi.jalur || lokal || s.jalur,
          id: s.id,
          nama: s.nama,
          keterangan: s.keterangan,
        };
      });
      if (berubah) this.emit();
    } catch {
      /* manifest tidak tersedia saat build statis lama */
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
      form.append("slotId", id);

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
