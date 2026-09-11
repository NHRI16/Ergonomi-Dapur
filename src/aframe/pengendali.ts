// @ts-nocheck
// ============================================================
// ErgoDapur — Pengendali Utama Permainan
// Menghubungkan store (logika ergonomi) dengan scene A-Frame:
// animasi halus semua objek, aksi klik / Q/E/R/T / Esc,
// penerapan pengaturan grafis, dan mode siang/malam.
// ============================================================

import { toko, lebarLorong, labelSkor, jarakRakKompor, BATAS_TATA, jepit } from "../game/store";
import { audio } from "../game/audio";

const REDAM = (nilai: number, target: number, laju: number, dt: number) =>
  nilai + (target - nilai) * Math.min(1, (dt / 1000) * laju);

/** Objek yang dapat dipindahkan bebas pada Mode Tata Letak. */
export const OBJEK_TATA = ["kompor", "kulkas", "meja-atas", "dekor-1", "dekor-2"];
/** Peralatan tetap yang membuka opsi interaksi saat diklik. */
const OBJEK_AKSI_LANGSUNG = new Set([
  "stasiun-ukur", "rak-bumbu", "saklar-lampu", "lampu-meja", "wastafel",
  "hood", "talenan", "ventilasi", "rak-bawah", "papan-skor",
]);
const NAMA_TATA: Record<string, string> = {
  kompor: "Kompor",
  kulkas: "Kulkas",
  "meja-atas": "Pulau meja potong",
  "dekor-1": "Model tambahan 1",
  "dekor-2": "Model tambahan 2",
};

/** Hitbox anak meja tetap memilih seluruh meja saat Mode Tata Letak. */
const objekTataDariTarget = (id: string | null) => {
  if (id === "meja-rangka" || id === "meja-potong" || id === "talenan") return "meja-atas";
  return id;
};

const v3 = (a: number, b: number, c: number) => `${(+a.toFixed(3))} ${(+b.toFixed(3))} ${(+c.toFixed(3))}`;

/** Posisi target cincin penanda untuk tiap objek. */
function poseCincin(id: string, p: any) {
  switch (id) {
    case "kompor":
      return { pos: [-1.3, 1.02, -2.05 + p.komporJarak / 100 + 0.12], rot: [-90, 0, 0], r: 0.38 };
    case "meja-potong":
      return { pos: [-0.45, p.mejaTinggi / 100 + 0.03, -0.55], rot: [-90, 0, 0], r: 0.62 };
    case "talenan":
      return { pos: [-0.7, p.mejaTinggi / 100 + 0.04, -0.55], rot: [-90, 0, 0], r: 0.28 };
    case "rak-bumbu":
      return { pos: [0.45 + p.rakGeserX / 100, p.rakTinggi / 100 + 0.14, -2.08], rot: [-90, 0, 0], r: 0.48 };
    case "kulkas":
      return { pos: [1.45 - p.kulkasGeser / 100, 0.04, -1.45], rot: [-90, 0, 0], r: 0.55 };
    case "saklar-lampu":
      return { pos: [1.81, 1.25, 2.15], rot: [0, 90, 0], r: 0.12 };
    case "lampu-meja":
      return { pos: [-0.45, 1.97, -0.55], rot: [-90, 0, 0], r: 0.24 };
    case "ventilasi":
      return { pos: [2.32, 1.55, -0.4], rot: [0, -90, 0], r: 0.5 };
    case "wastafel":
      return { pos: [-0.1, 1.24, -1.88], rot: [-90, 0, 0], r: 0.3 };
    case "hood":
      return { pos: [-1.3, 2.08, -1.8], rot: [0, 0, 0], r: 0.34 };
    case "rak-bawah":
      return { pos: [0.56, 0.32, -1.7], rot: [-90, 0, 0], r: 0.32 };
    case "stasiun-ukur":
      return { pos: [-2.18, 0.03, 1.0], rot: [-90, 0, 0], r: 0.34 };
    case "papan-skor":
      return { pos: [2.42, 1.62, 1.0], rot: [0, -90, 0], r: 0.6 };
    default:
      return { pos: [0, -5, 0], rot: [-90, 0, 0], r: 0.3 };
  }
}

export class PengendaliDapur {
  private scene: any = null;
  private batalLangganan: (() => void) | null = null;
  private el: Record<string, any> = {};
  private v = {
    komporZ: -1.95,
    komporX: -1.3,
    mejaH: 0.78,
    mejaX: -0.45,
    mejaZ: -0.55,
    rakY: 1.75,
    rakX: 0.45,
    kulkasX: 1.25,
    kulkasZ: -1.86,
    pintu: 0,
    jendela: 0,
    matahari: 0.95,
    ambien: 0.5,
    peredup: 0,
    pemandanganGelap: false,
    cincinR: 0.3,
  };

  init(scene: any) {
    this.scene = scene;
    const q = (id: string) => scene.querySelector(`#${id}`);
    this.el = {
      kompor: q("kompor"),
      api: q("api-kompor"),
      apiBiru: q("api-biru"),
      apiOranye: q("api-oranye"),
      apiKuning: q("api-kuning"),
      cahayaApi: q("cahaya-api"),
      grupPanci: q("grup-panci"),
      panciMesh: q("panci-mesh"),
      uap: q("uap"),
      mejaAtas: q("meja-atas"),
      talenan: q("talenan"),
      mejaRangka: q("meja-rangka"),
      mejaKakiKiri: q("meja-kaki-kiri"),
      mejaKakiKanan: q("meja-kaki-kanan"),
      rakBumbu: q("rak-bumbu"),
      kulkas: q("kulkas"),
      pintuKulkas: q("pintu-kulkas"),
      cahayaKulkas: q("cahaya-kulkas"),
      daunJendela: q("daun-jendela"),
      aliranUdara: q("aliran-udara"),
      pemandangan: q("pemandangan"),
      peredup: q("peredup-jendela"),
      sorotMeja: q("sorot-meja"),
      kerucut: q("kerucut-cahaya"),
      bolaLampu: q("bola-lampu"),
      cahayaUmum: q("cahaya-umum"),
      plafon1: q("plafon-1"),
      plafon2: q("plafon-2"),
      plafon3: q("plafon-3"),
      strip1: q("strip-led-1"),
      strip2: q("strip-led-2"),
      cahayaStrip: q("cahaya-strip"),
      tuasSaklar: q("tuas-saklar"),
      cahayaMatahari: q("cahaya-matahari"),
      cahayaAmbien: q("cahaya-ambien"),
      cahayaHemisfer: q("cahaya-hemisfer"),
      cahayaKepala: q("cahaya-kepala"),
      cincin: q("cincin-target"),
      kursorVR: q("kursor-vr"),
      kipasHood: q("kipas-hood"),
      ledHood: q("led-hood"),
      aliranAir: q("aliran-air"),
      tomatUtuh: q("tomat-utuh"),
      tomatIris: q("tomat-iris"),
      mejaPalang: q("meja-palang"),
      gantungan: q("gantungan-lampu"),
      hoodGrup: q("hood-grup"),
      dekor1: q("dekor-1"),
      dekor2: q("dekor-2"),
      grid: q("grid-tata"),
      hantu: q("hantu-tata"),
      hantuBentuk: q("hantu-bentuk"),
      pemain: q("pemain"),
    };
    this.putaranKipas = 0;
    this.THREE = (window as any).AFRAME.THREE;
    this.vekArah = new this.THREE.Vector3();
    this.vekPos = new this.THREE.Vector3();
    this.vekHit = new this.THREE.Vector3();
    this.rayTata = new this.THREE.Ray();
    this.bidangTata = new this.THREE.Plane(new this.THREE.Vector3(0, 1, 0), 0);

    this.batalLangganan = toko.langganan(() => {
      const k = toko.keadaan;
      audio.sinkron(k.params, k.pengaturan);
      this.terapkanPengaturan();
    });

    window.addEventListener("keydown", this.padaTombol);
    // A-Frame memakai F untuk kontrol internal (mis. fullscreen/VR).
    // Tangkap lebih awal agar F benar-benar tidak memiliki fungsi di simulasi.
    window.addEventListener("keydown", this.nonaktifkanTombolF, true);
    window.addEventListener("keyup", this.nonaktifkanTombolF, true);
    scene.addEventListener("click", this.padaKlik);

    scene.addEventListener("enter-vr", () => {
      toko.setStatus({ dalamVR: true });
      if (this.el.kursorVR) this.el.kursorVR.setAttribute("visible", true);
      toko.toast("Mode VR aktif — tatap objek selama 1 detik untuk berinteraksi.", "info");
    });
    scene.addEventListener("exit-vr", () => {
      toko.setStatus({ dalamVR: false });
      if (this.el.kursorVR) this.el.kursorVR.setAttribute("visible", false);
    });

    this.terapkanPengaturan();
    audio.sinkron(toko.keadaan.params, toko.keadaan.pengaturan);
  }

  hancur() {
    window.removeEventListener("keydown", this.padaTombol);
    window.removeEventListener("keydown", this.nonaktifkanTombolF, true);
    window.removeEventListener("keyup", this.nonaktifkanTombolF, true);
    this.scene?.removeEventListener("click", this.padaKlik);
    this.batalLangganan?.();
  }

  // ---------------- Papan ketik ----------------
  private nonaktifkanTombolF = (e: KeyboardEvent) => {
    if (e.code !== "KeyF") return;
    e.preventDefault();
    e.stopImmediatePropagation();
  };

  private padaTombol = (e: KeyboardEvent) => {
    // Abaikan hanya saat pengguna sedang mengetik di kolom teks
    const t = e.target as HTMLElement | null;
    if (t) {
      if (t.tagName === "TEXTAREA" || t.isContentEditable) return;
      if (t.tagName === "INPUT") {
        const tipe = (t as HTMLInputElement).type?.toLowerCase();
        if (["text", "search", "url", "password", "email", "number", "tel"].includes(tipe)) return;
      }
    }

    const st = toko.keadaan.status;

    if (!st.dimulai) return;

    if (e.code === "Escape" && !e.repeat) {
      if (st.menuBuka) {
        toko.setStatus({ menuBuka: false });
        if (!st.modeInteraksi) {
          const kanvas = this.scene?.canvas;
          try { kanvas?.requestPointerLock?.(); } catch {}
        }
      } else {
        document.exitPointerLock?.();
        toko.setStatus({
          antarmukaTersembunyi: false,
          bantuanBuka: false,
          menuBuka: true,
          modeInteraksi: false,
          modelBuka: false,
          objekInteraksiAktif: null,
        });
      }
      return;
    }

    if (e.code === "KeyU" && !e.repeat) {
      toko.setStatus({ antarmukaTersembunyi: !st.antarmukaTersembunyi });
      return;
    }

    if (e.code === "KeyM") {
      const bisu = !toko.keadaan.pengaturan.bisu;
      toko.setPengaturan({ bisu });
      toko.toast(bisu ? "Suara dimatikan." : "Suara diaktifkan.", "info");
      return;
    }

    if (e.code === "KeyH") {
      toko.setStatus({ bantuanBuka: !st.bantuanBuka });
      if (!st.bantuanBuka && !st.modeInteraksi) {
        const cv = this.scene?.canvas;
        try { cv?.requestPointerLock?.(); } catch {}
      } else {
        document.exitPointerLock?.();
      }
      return;
    }

    if (st.menuBuka || st.bantuanBuka || st.modelBuka) return;

    if (e.code === "KeyQ" && !e.repeat) this.putarObjek(-1);
    if (e.code === "KeyE" && !e.repeat) this.putarObjek(1);
    if (e.code === "KeyR" && !e.repeat) this.ubahTinggiObjek(1);
    if (e.code === "KeyT" && !e.repeat) this.ubahTinggiObjek(-1);
    if (e.code === "BracketLeft" || e.code === "Minus") this.penyesuaian(-1);
    if (e.code === "BracketRight" || e.code === "Equal") this.penyesuaian(1);
    if (e.code === "KeyG") this.geserHorizontal();
    if (e.code === "KeyK" && !e.repeat) {
      toko.setStatus({ modelBuka: !st.modelBuka });
      if (!st.modelBuka) document.exitPointerLock?.();
    }
  };

  /** Putar objek yang sedang dipegang (kelipatan 15°). */
  private putarObjek(arah: 1 | -1) {
    const st = toko.keadaan.status;
    if (!st.modeTata || !st.dipegang) return;
    const p = toko.keadaan.params;
    const tambah = (v: number) => (v + arah * 15 + 360) % 360;
    switch (st.dipegang) {
      case "kompor":
        toko.setParams({ rotKompor: tambah(p.rotKompor) }, true);
        break;
      case "kulkas":
        toko.setParams({ rotKulkas: tambah(p.rotKulkas) }, true);
        break;
      case "meja-atas":
        toko.setParams({ rotMeja: tambah(p.rotMeja) }, true);
        break;
      case "dekor-1":
        toko.setParams({ dekor1Rot: tambah(p.dekor1Rot) }, true);
        break;
      case "dekor-2":
        toko.setParams({ dekor2Rot: tambah(p.dekor2Rot) }, true);
        break;
    }
    audio.geser();
  }

  /** Naikkan/turunkan objek yang dipegang (R/T, kelipatan 5 cm). */
  private ubahTinggiObjek(arah: 1 | -1) {
    const st = toko.keadaan.status;
    if (!st.modeTata || !st.dipegang) return;
    const p = toko.keadaan.params;
    const batas = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    const tinggi = (v: number, maks = 150) => batas(v + arah * 5, 0, maks);
    switch (st.dipegang) {
      case "kompor": toko.setParams({ komporTinggi: tinggi(p.komporTinggi) }, true); break;
      case "kulkas": toko.setParams({ kulkasTinggi: tinggi(p.kulkasTinggi) }, true); break;
      case "meja-atas": toko.setParams({ mejaTinggi: batas(p.mejaTinggi + arah * 5, 60, 100) }, true); break;
      case "dekor-1": toko.setParams({ dekor1Tinggi: tinggi(p.dekor1Tinggi, 220) }, true); break;
      case "dekor-2": toko.setParams({ dekor2Tinggi: tinggi(p.dekor2Tinggi, 220) }, true); break;
    }
    audio.geser();
  }

  private padaKlik = (e: any) => {
    const st = toko.keadaan.status;
    // Klik kedua bisa di mana saja pada scene: letakkan barang di titik hijau.
    if (st.dipegang) {
      toko.setStatus({ modeTata: false, dipegang: null });
      audio.klik();
      toko.toast("Objek diletakkan.", "baik");
      return;
    }

    // Selama jeda pasca-interaksi, abaikan klik agar pemain tidak perlu
    // klik dua kali untuk menoleh setelah menutup panel.
    if (performance.now() < st.jedaInteraksiSampai) return;

    // Saat pointer-lock aktif, target DOM click biasanya adalah <canvas>,
    // bukan entitas A-Frame yang diklik. Gunakan hasil raycast crosshair
    // yang selalu disimpan oleh manajer-interaksi.
    const targetId = e.target?.closest?.(".interaktif")?.id || st.target;
    if (!targetId) return;
    const id = objekTataDariTarget(targetId);
    toko.setStatus({ target: targetId });

    // Klik pertama pada barang yang dapat dipindah = ambil barang.
    if (id && OBJEK_TATA.includes(id) && targetId !== "talenan") {
      toko.setStatus({ modeTata: true, dipegang: id, target: id, modeInteraksi: false, objekInteraksiAktif: null });
      const cv = this.scene?.canvas;
      try { cv?.requestPointerLock?.(); } catch {}
      audio.geser();
      toko.toast(`${NAMA_TATA[id]} diambil — gerakkan dengan mouse, klik untuk meletakkan.`, "info");
    } else if (OBJEK_AKSI_LANGSUNG.has(targetId) && !st.modeInteraksi && !st.menuBuka && !st.bantuanBuka && !st.modelBuka) {
      // Benda tetap memakai panel opsinya; tidak diperlakukan sebagai barang
      // yang dapat dipindahkan.
      toko.masukInteraksi(targetId);
      document.exitPointerLock?.();
      audio.klik();
    }
  };

  // ---------------- Aksi utama (klik/VR) ----------------
  aksiUtama(idPaksa?: string) {
    const k = toko.keadaan;
    const id = idPaksa || k.status.target;

    // --- Mode Tata Letak: dipakai oleh klik / VR ---
    if (k.status.modeTata) {
      if (k.status.dipegang) {
        toko.setStatus({ dipegang: null });
        audio.klik();
        toko.toast("Objek diletakkan. Skor ergonomi diperbarui sesuai posisi baru.", "baik");
      } else {
        const objekTata = objekTataDariTarget(id);
        if (objekTata && OBJEK_TATA.includes(objekTata)) {
          toko.setStatus({ dipegang: objekTata, target: objekTata });
          audio.geser();
          toko.toast(
            `${NAMA_TATA[objekTata]} diambil — gerakkan dengan mouse, Q/E putar, R/T tinggi-rendah, lalu klik untuk meletakkan.`,
            "info"
          );
        } else {
          toko.toast("Objek ini tidak dapat dipindahkan. Coba kompor, kulkas, pulau meja, atau slot dekorasi.", "cukup");
        }
      }
      return;
    }

    if (!id) return;
    const p = k.params;
    switch (id) {
      case "stasiun-ukur": {
        audio.klik();
        // Tinggi mata kamera → estimasi antropometri pengguna
        const mata = 160; // cm, tinggi mata berdiri pada simulasi ini
        const badan = Math.round(mata + 8);
        const siku = Math.round(badan * 0.62);
        const idealBawah = siku - 15;
        const idealAtas = siku - 8;
        if (!p.sudahKalibrasi) toko.setParams({ sudahKalibrasi: true }, true);
        toko.toast(
          `Hasil ukur — tinggi badan ≈ ${badan} cm, tinggi siku ≈ ${siku} cm.`,
          "info"
        );
        toko.toast(
          `Tinggi meja potong ideal Anda: ${idealBawah}–${idealAtas} cm (siku dikurangi 10–15 cm).`,
          "baik"
        );
        break;
      }
      case "kompor": {
        const nyala = !p.komporNyala;
        const sirkulasiAktif = p.ventilasiBuka || p.hoodNyala;
        const patch: any = { komporNyala: nyala };
        if (nyala && sirkulasiAktif && !p.hoodSebelumKompor) patch.hoodSebelumKompor = true;
        toko.setParams(patch);
        audio.beralih();
        if (nyala && !sirkulasiAktif) {
          toko.toast(
            "Urutan kerja salah! Api menyala sebelum sirkulasi aktif — nyalakan hood atau buka jendela lebih dulu.",
            "buruk"
          );
          audio.gagal();
        } else if (nyala && p.komporJarak >= 15) {
          toko.toast("Kompor menyala dengan aman — jarak dinding ideal dan sirkulasi sudah aktif.", "baik");
        } else if (nyala) {
          toko.toast("Kompor menyala. Perhatikan jarak aman dari dinding.", "info");
        }
        break;
      }
      case "meja-potong":
      case "lampu-meja": {
        toko.setParams({ lampuMeja: !p.lampuMeja });
        audio.beralih();
        break;
      }
      case "rak-bumbu": {
        const t = p.rakTinggi;
        const dx = jarakRakKompor(p);
        if (t >= 90 && t <= 150) {
          if (!p.bumbuAmbilBaik) toko.setParams({ bumbuAmbilBaik: true }, true);
          audio.sukses();
          toko.toast(
            `Bumbu terambil dengan bahu rileks — rak ${Math.round(t)} cm berada di zona emas jangkauan.`,
            "baik"
          );
          if (dx > 1.15)
            toko.toast(
              `Namun rak masih ${dx.toFixed(2)} m dari kompor — tekan G agar bumbu dalam radius jangkauan kerja.`,
              "cukup"
            );
        } else if (t > 150) {
          audio.gagal();
          toko.toast(
            `Anda harus menjinjit dan mengangkat bahu untuk meraih rak ${Math.round(t)} cm — turunkan ke 90–150 cm dengan [.`,
            t > 170 ? "buruk" : "cukup"
          );
        } else {
          audio.gagal();
          toko.toast(
            `Anda harus membungkuk untuk meraih rak ${Math.round(t)} cm — naikkan ke 90–150 cm dengan ].`,
            t < 75 ? "buruk" : "cukup"
          );
        }
        break;
      }
      case "kulkas": {
        const buka = !p.kulkasTerbuka;
        const lorong = lebarLorong(p);
        const patch: any = { kulkasTerbuka: buka };
        if (buka && lorong >= 0.9 && !p.kulkasBukaJalurBebas) patch.kulkasBukaJalurBebas = true;
        toko.setParams(patch);
        audio.beralih();
        if (buka && lorong >= 0.9)
          toko.toast(
            `Pintu kulkas terbuka penuh dan jalur tetap lega (${(lorong * 100).toFixed(0)} cm) — penempatan ergonomis.`,
            "baik"
          );
        else if (buka)
          toko.toast(
            `Pintu kulkas memakan jalur — lorong tersisa hanya ${(lorong * 100).toFixed(0)} cm dari minimal 90 cm.`,
            "buruk"
          );
        break;
      }
      case "saklar-lampu": {
        toko.setParams({ lampuUmum: !p.lampuUmum });
        audio.beralih();
        break;
      }
      case "wastafel": {
        const alir = !p.keranNyala;
        // Membuka keran = mengambil bahan segar lalu mencucinya.
        // Bahan yang sudah dicuci siap dipotong (urutan kerja higienis).
        const patch: any = { keranNyala: alir };
        if (alir) {
          patch.bahanDicuci = true;
          patch.tomatDipotong = false; // sebatch bahan segar tersedia di talenan
        }
        toko.setParams(patch);
        audio.beralih();
        if (alir)
          toko.toast(
            "Bahan segar dicuci di bawah air mengalir — urutan higienis benar: cuci dulu, baru potong.",
            "baik"
          );
        break;
      }
      case "hood": {
        const nyala = !p.hoodNyala;
        toko.setParams({ hoodNyala: nyala });
        audio.beralih();
        if (nyala)
          toko.toast("Hood menyala — asap tersedot keluar. Jendela tetap disarankan untuk udara segar.", "baik");
        break;
      }
      case "talenan": {
        const posturBaik = p.mejaTinggi >= 85 && p.mejaTinggi <= 92;
        const patch: any = { tomatDipotong: true };
        if (posturBaik && !p.potongPosturBaik) patch.potongPosturBaik = true;
        toko.setParams(patch, false);
        audio.cincang();
        if (posturBaik) {
          audio.sukses();
          toko.toast(
            `Postur netral terjaga — meja ${Math.round(p.mejaTinggi)} cm membuat punggung tegak, siku ±90°, bahu rileks.`,
            "baik"
          );
        } else if (p.mejaTinggi < 85) {
          toko.toast(
            `Punggung Anda membungkuk >20°! Meja ${Math.round(p.mejaTinggi)} cm terlalu rendah — naikkan ke 85–92 cm lalu potong lagi.`,
            "buruk"
          );
          audio.gagal();
        } else {
          toko.toast(
            `Bahu Anda terangkat dan lengan tegang. Meja ${Math.round(p.mejaTinggi)} cm terlalu tinggi — turunkan ke 85–92 cm lalu potong lagi.`,
            "buruk"
          );
          audio.gagal();
        }
        if (!p.bahanDicuci)
          toko.toast("Catatan higiene: bahan belum dicuci di wastafel sebelum dipotong.", "cukup");
        break;
      }
      case "ventilasi": {
        const buka = !p.ventilasiBuka;
        toko.setParams({ ventilasiBuka: buka });
        audio.beralih();
        if (buka) toko.toast("Ventilasi terbuka — sirkulasi udara baik, asap dan panas keluar.", "baik");
        break;
      }
      case "rak-bawah": {
        if (k.status.sikap === "jongkok") {
          toko.setParams({ panciDiambil: p.panciDiambil + 1, panciAmbilJongkok: true });
          toko.toast(
            "Teknik angkat benar — lutut menekuk, punggung lurus, beban ditopang otot paha bukan diskus lumbal.",
            "baik"
          );
          audio.sukses();
        } else {
          toko.toast(
            "Anda membungkuk penuh untuk meraih rak bawah! Tekanan pada diskus lumbal melonjak — tekan C untuk jongkok.",
            "buruk"
          );
          audio.gagal();
        }
        break;
      }
      case "papan-skor": {
        audio.klik();
        const k2 = toko.keadaan;
        toko.toast(`Pengaturan Anda ${k2.skor}% ergonomis (${labelSkor(k2.skor)}).`, "info");
        if (k2.masalah[0]) toko.toast(`Saran: ${k2.masalah[0].teks}`, k2.masalah[0].tingkat);
        break;
      }
    }
  }

  // ---------------- Penyesuaian tata letak ([ dan ]) ----------------
  private penyesuaian(arah: 1 | -1) {
    const k = toko.keadaan;
    const id = k.status.target;
    if (!id) return;
    const p = k.params;
    const batas = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    switch (id) {
      case "kompor":
        toko.setParams({ komporJarak: batas(p.komporJarak + arah * 2, 5, 40) });
        audio.geser();
        break;
      case "meja-potong":
        toko.setParams({ mejaTinggi: batas(p.mejaTinggi + arah * 2, 60, 100) });
        audio.geser();
        break;
      case "rak-bumbu":
        toko.setParams({ rakTinggi: batas(p.rakTinggi + arah * 3, 60, 190) });
        audio.geser();
        break;
      case "kulkas":
        toko.setParams({ kulkasGeser: batas(p.kulkasGeser + arah * 2, 0, 60) });
        audio.geser();
        break;
      case "saklar-lampu": {
        if (!p.lampuUmum) {
          toko.toast("Nyalakan dulu lampu utama lewat opsi interaksi untuk mengatur intensitas.", "info");
          break;
        }
        const levelBaru = batas(p.lampuLevel + arah, 1, 3);
        toko.setParams({ lampuLevel: levelBaru });
        toko.toast(
          `Intensitas lampu utama: level ${levelBaru} (${["", "redup", "sedang", "terang"][levelBaru]}).`,
          "info"
        );
        audio.geser();
        break;
      }
      case "lampu-meja":
        toko.setParams({ lampuMejaFokus: !p.lampuMejaFokus });
        toko.toast(
          !p.lampuMejaFokus
            ? "Sorot lampu difokuskan ke permukaan meja potong."
            : "Lampu diubah ke mode cahaya sebar.",
          "info"
        );
        audio.beralih();
        break;
    }
  }

  // ---------------- Mode Tata Letak: pemindahan bebas ----------------
  /**
   * Menghitung titik lantai yang ditatap pemain, lalu memindahkan objek
   * yang sedang dipegang ke sana. Skor ergonomi ikut diperbarui langsung
   * karena seluruh penilaian memakai koordinat nyata objek.
   */
  private prosesModeTata(k: any, _dt: number) {
    const st = k.status;
    const el = this.el;
    // Indikator hijau adalah pratinjau lokasi barang yang sedang dibawa.
    // Jangan tampilkan ketika pemain belum memilih barang dengan klik.
    const memindahkan = st.modeTata && st.dimulai && !!st.dipegang;

    el.grid?.setAttribute("visible", memindahkan);
    if (!memindahkan || !el.pemain) {
      el.hantu?.setAttribute("visible", false);
      return;
    }

    // Sama seperti controller Projek-2-Enuma: gunakan ray kamera yang benar-benar
    // memotong bidang penempatan, bukan jarak tebakan dari arah pandang.
    // Pitch dari mouse berada pada kamera A-Frame, bukan entitas pemain.
    const cam = el.pemain.getObject3D("camera") || el.pemain.object3D;
    cam.getWorldPosition(this.vekPos);
    cam.getWorldDirection(this.vekArah);
    const p = k.params;
    const bidangY =
      st.dipegang === "kompor" ? p.komporTinggi / 100 :
      st.dipegang === "kulkas" ? p.kulkasTinggi / 100 :
      st.dipegang === "dekor-1" ? p.dekor1Tinggi / 100 :
      st.dipegang === "dekor-2" ? p.dekor2Tinggi / 100 : 0;
    this.bidangTata.constant = -bidangY;
    let titik = this.rayTata.set(this.vekPos, this.vekArah).intersectPlane(this.bidangTata, this.vekHit);
    // Saat pandangan sejajar lantai, ray tidak pernah memotong bidang. Dalam
    // kondisi itu, letakkan titik pegangan 1,8 m di depan pemain agar mouse
    // tetap langsung memindahkan objek seperti controller Projek-2-Enuma.
    if (!titik) {
      const panjangMendatar = Math.hypot(this.vekArah.x, this.vekArah.z) || 1;
      this.vekHit.set(
        this.vekPos.x + (this.vekArah.x / panjangMendatar) * 1.8,
        bidangY,
        this.vekPos.z + (this.vekArah.z / panjangMendatar) * 1.8
      );
      titik = this.vekHit;
    }
    let x = titik.x;
    let z = titik.z;

    // Kunci ke grid 5 cm agar penataan rapi
    x = Math.round(x * 20) / 20;
    z = Math.round(z * 20) / 20;

    const B = BATAS_TATA;
    const patch: any = {};
    switch (st.dipegang) {
      case "kompor": {
        const nx = jepit(x, B.kompor.xMin, B.kompor.xMax);
        const nz = jepit(z, B.kompor.zMin, B.kompor.zMax);
        patch.komporX = nx;
        patch.komporJarak = jepit(Math.round((nz + 2.05) * 100), 5, 40);
        break;
      }
      case "kulkas": {
        const nx = jepit(x, B.kulkas.xMin, B.kulkas.xMax);
        patch.kulkasGeser = jepit(Math.round((1.45 - nx) * 100), 0, 60);
        patch.kulkasZ = jepit(z, B.kulkas.zMin, B.kulkas.zMax);
        break;
      }
      case "meja-atas": {
        patch.mejaX = jepit(x, B.meja.xMin, B.meja.xMax);
        patch.mejaZ = jepit(z, B.meja.zMin, B.meja.zMax);
        break;
      }
      case "dekor-1": {
        patch.dekor1X = jepit(x, -2.2, 2.2);
        patch.dekor1Z = jepit(z, -2.1, 2.1);
        break;
      }
      case "dekor-2": {
        patch.dekor2X = jepit(x, -2.2, 2.2);
        patch.dekor2Z = jepit(z, -2.1, 2.1);
        break;
      }
    }

    // Tulis hanya bila benar-benar berubah (hindari render berlebih)
    const berubah = Object.keys(patch).some((key) => Math.abs((p as any)[key] - patch[key]) > 0.001);
    if (berubah) toko.setParams(patch, true);

    // Pratinjau lokasi penempatan
    if (el.hantu) {
      el.hantu.setAttribute("visible", true);
      const px = patch.komporX ?? patch.mejaX ?? patch.dekor1X ?? patch.dekor2X ?? (patch.kulkasGeser !== undefined ? 1.45 - patch.kulkasGeser / 100 : x);
      const pz =
        patch.komporJarak !== undefined
          ? -2.05 + patch.komporJarak / 100
          : patch.mejaZ ?? patch.kulkasZ ?? patch.dekor1Z ?? patch.dekor2Z ?? z;
      el.hantu.setAttribute("position", v3(px, 0.02, pz));
    }

    // Siluet hijau transparan menegaskan benda sedang dibawa, bukan hanya
    // titik tujuan di lantai.
    const bentuk = el.hantuBentuk;
    if (bentuk) {
      const ukuran: Record<string, [number, number, number, number]> = {
        kompor: [0.82, 0.78, 0.58, p.komporTinggi / 100],
        kulkas: [0.78, 1.75, 0.72, p.kulkasTinggi / 100],
        "meja-atas": [1.28, p.mejaTinggi / 100, 0.7, 0],
        "dekor-1": [0.58, 0.9, 0.58, p.dekor1Tinggi / 100],
        "dekor-2": [0.58, 0.9, 0.58, p.dekor2Tinggi / 100],
      };
      const [lebar, tinggi, dalam, alas] = ukuran[st.dipegang] || ukuran["dekor-1"];
      const putar: Record<string, number> = {
        kompor: p.rotKompor,
        kulkas: p.rotKulkas,
        "meja-atas": p.rotMeja,
        "dekor-1": p.dekor1Rot,
        "dekor-2": p.dekor2Rot,
      };
      bentuk.setAttribute("geometry", `primitive: box; width: ${lebar}; height: ${tinggi}; depth: ${dalam}`);
      bentuk.setAttribute("position", v3(0, alas + tinggi / 2, 0));
      bentuk.setAttribute("rotation", v3(0, putar[st.dipegang] || 0, 0));
    }
  }

  // ---------------- Geser horizontal rak bumbu (G) ----------------
  private geserHorizontal() {
    const k = toko.keadaan;
    if (k.status.target !== "rak-bumbu") return;
    const p = k.params;
    let gx = p.rakGeserX - 10;
    if (gx < -60) gx = 10; // memutar kembali ke ujung kanan
    toko.setParams({ rakGeserX: gx });
    toko.toast(`Rak bumbu digeser — jarak ke kompor kini ${(Math.abs(0.45 + gx / 100 + 1.3)).toFixed(2)} m.`, "info");
    audio.geser();
  }

  // ---------------- Pengaturan grafis ----------------
  private tandaPengaturan = "";
  private terapkanPengaturan() {
    if (!this.scene) return;
    const pg = toko.keadaan.pengaturan;
    // Lewati jika pengaturan tidak berubah (hindari pemrosesan ulang renderer)
    const tanda = `${pg.kualitas}|${pg.modeGelap}`;
    if (tanda === this.tandaPengaturan) return;
    this.tandaPengaturan = tanda;
    const renderer = this.scene.renderer;
    if (renderer) {
      const rasio = pg.kualitas === "hemat" ? 0.7 : pg.kualitas === "sedang" ? 1 : Math.min(window.devicePixelRatio, 1.75);
      if (renderer.getPixelRatio() !== rasio) {
        renderer.setPixelRatio(rasio);
        this.scene.resize?.();
      }
    }
    const bayanganAktif = pg.kualitas !== "hemat";
    if (this.el.cahayaMatahari) {
      this.el.cahayaMatahari.setAttribute("light", "castShadow", bayanganAktif);
      this.el.cahayaMatahari.setAttribute("light", "shadowMapWidth", pg.kualitas === "tinggi" ? 2048 : 1024);
      this.el.cahayaMatahari.setAttribute("light", "shadowMapHeight", pg.kualitas === "tinggi" ? 2048 : 1024);
    }
    this.scene.setAttribute("shadow", "enabled", bayanganAktif);
  }

  // ---------------- Loop animasi ----------------
  tick(t: number, dt: number) {
    if (!this.scene) return;
    const k = toko.keadaan;
    const p = k.params;
    const v = this.v;
    const el = this.el;

    // --- Mode Tata Letak: pindahkan objek yang sedang dipegang ---
    this.prosesModeTata(k, dt);

    // Kompor: posisi X bebas + jarak dari dinding (Z)
    v.komporZ = REDAM(v.komporZ, -2.05 + p.komporJarak / 100, 8, dt);
    v.komporX = REDAM(v.komporX, p.komporX, 8, dt);
    el.kompor?.setAttribute("position", v3(v.komporX, p.komporTinggi / 100, v.komporZ));
    el.kompor?.setAttribute("rotation", v3(0, p.rotKompor, 0));

    // Posisi panci (tengah aman vs tepi rawan)
    el.grupPanci?.setAttribute("visible", p.panciAda);
    const targetPanciX = p.panciPosisi === "tepi" ? 0.05 : -0.13;
    const targetPanciZ = p.panciPosisi === "tepi" ? 0.04 : -0.11;
    el.grupPanci?.setAttribute("position", v3(targetPanciX, 0, targetPanciZ));

    // Api dinamis kompor
    const apiAktif = p.komporNyala && p.komporApiLevel !== "mati";
    el.api?.setAttribute("visible", apiAktif);
    if (apiAktif) {
      el.api?.setAttribute("position", v3(targetPanciX, 0.925, targetPanciZ));
      if (p.komporApiLevel === "rendah") {
        el.apiBiru?.setAttribute("visible", true);
        el.apiBiru?.setAttribute("scale", "1 1 1");
        el.apiOranye?.setAttribute("visible", false);
        el.apiKuning?.setAttribute("visible", false);
        el.cahayaApi?.setAttribute("light", "intensity", 0.45);
        el.cahayaApi?.setAttribute("light", "color", "#60a5fa");
      } else if (p.komporApiLevel === "sedang") {
        el.apiBiru?.setAttribute("visible", true);
        el.apiBiru?.setAttribute("scale", "1.1 1.2 1.1");
        el.apiOranye?.setAttribute("visible", true);
        el.apiOranye?.setAttribute("scale", "0.95 0.95 0.95");
        el.apiKuning?.setAttribute("visible", false);
        el.cahayaApi?.setAttribute("light", "intensity", 0.75);
        el.cahayaApi?.setAttribute("light", "color", "#ff9800");
      } else {
        // tinggi / besar
        el.apiBiru?.setAttribute("visible", true);
        el.apiBiru?.setAttribute("scale", "1.2 1.4 1.2");
        el.apiOranye?.setAttribute("visible", true);
        el.apiOranye?.setAttribute("scale", "1.35 1.45 1.35");
        el.apiKuning?.setAttribute("visible", true);
        el.apiKuning?.setAttribute("scale", "1.25 1.45 1.25");
        el.cahayaApi?.setAttribute("light", "intensity", 1.35);
        el.cahayaApi?.setAttribute("light", "color", "#ff5722");
      }
    }

    // Uap panci
    const uapAktif = apiAktif && p.panciAda;
    el.uap?.setAttribute("visible", uapAktif);
    if (uapAktif) {
      el.uap?.setAttribute("position", v3(targetPanciX, 1.1, targetPanciZ));
      const sUap = p.komporApiLevel === "tinggi" ? 1.4 : p.komporApiLevel === "sedang" ? 1.0 : 0.6;
      el.uap?.setAttribute("scale", v3(sUap, sUap, sUap));
    }

    // Hood & cerobong mengikuti kompor
    el.hoodGrup?.setAttribute("position", v3(v.komporX + 1.3, 0, 0));

    // Meja potong: tinggi + posisi bebas
    v.mejaH = REDAM(v.mejaH, p.mejaTinggi / 100, 8, dt);
    v.mejaX = REDAM(v.mejaX, p.mejaX, 8, dt);
    v.mejaZ = REDAM(v.mejaZ, p.mejaZ, 8, dt);
    // Semua bagian meja memakai satu rangka, agar kaki/palang ikut saat meja dipindah atau diputar.
    el.mejaRangka?.setAttribute("position", v3(v.mejaX, 0, v.mejaZ));
    el.mejaRangka?.setAttribute("rotation", v3(0, p.rotMeja, 0));
    el.mejaAtas?.setAttribute("position", v3(0, v.mejaH, 0));
    el.talenan?.setAttribute("position", v3(0, v.mejaH - 0.003, 0));
    el.mejaRangka?.components?.["slot-model"]?.aturTinggiMeja?.(v.mejaH);
    if (el.mejaKakiKiri) {
      el.mejaKakiKiri.setAttribute("scale", v3(1, v.mejaH, 1));
      el.mejaKakiKiri.setAttribute("position", v3(-0.56, v.mejaH / 2, 0));
    }
    if (el.mejaKakiKanan) {
      el.mejaKakiKanan.setAttribute("scale", v3(1, v.mejaH, 1));
      el.mejaKakiKanan.setAttribute("position", v3(0.56, v.mejaH / 2, 0));
    }
    el.mejaPalang?.setAttribute("position", v3(0, 0.12, 0));
    // Lampu gantung mengikuti pulau meja
    el.gantungan?.setAttribute("position", v3(v.mejaX + 0.45, 0, v.mejaZ + 0.55));

    // Slot model tambahan (Sketchfab)
    el.dekor1?.setAttribute("position", v3(p.dekor1X, p.dekor1Tinggi / 100, p.dekor1Z));
    el.dekor1?.setAttribute("rotation", v3(0, p.dekor1Rot, 0));
    el.dekor2?.setAttribute("position", v3(p.dekor2X, p.dekor2Tinggi / 100, p.dekor2Z));
    el.dekor2?.setAttribute("rotation", v3(0, p.dekor2Rot, 0));

    // Rak bumbu: ketinggian + posisi horizontal
    v.rakY = REDAM(v.rakY, p.rakTinggi / 100, 8, dt);
    v.rakX = REDAM(v.rakX, 0.45 + p.rakGeserX / 100, 8, dt);
    el.rakBumbu?.setAttribute("position", v3(v.rakX, v.rakY, -2.14));

    // Hood: kipas berputar + LED status
    if (p.hoodNyala) {
      this.putaranKipas = (this.putaranKipas + dt * 0.6) % 360;
      el.kipasHood?.setAttribute("rotation", v3(0, this.putaranKipas, 0));
    }
    el.ledHood?.setAttribute("material", "emissiveIntensity", p.hoodNyala ? 1.6 : 0);

    // Wastafel: aliran air berkilau
    el.aliranAir?.setAttribute("visible", p.keranNyala);
    if (p.keranNyala)
      el.aliranAir?.setAttribute("material", "opacity", 0.42 + Math.sin(t * 0.02) * 0.1);

    // Talenan: tomat utuh / irisan
    el.tomatUtuh?.setAttribute("visible", !p.tomatDipotong);
    el.tomatIris?.setAttribute("visible", p.tomatDipotong);

    // Kulkas: geser + posisi Z bebas + pintu
    v.kulkasX = REDAM(v.kulkasX, 1.45 - p.kulkasGeser / 100, 8, dt);
    v.kulkasZ = REDAM(v.kulkasZ, p.kulkasZ, 8, dt);
    el.kulkas?.setAttribute("position", v3(v.kulkasX, p.kulkasTinggi / 100, v.kulkasZ));
    el.kulkas?.setAttribute("rotation", v3(0, p.rotKulkas, 0));
    v.pintu = REDAM(v.pintu, p.kulkasTerbuka ? -112 : 0, 5.5, dt);
    el.pintuKulkas?.setAttribute("rotation", v3(0, v.pintu, 0));
    el.cahayaKulkas?.setAttribute("light", "intensity", p.kulkasTerbuka ? 0.5 : 0);

    // Jendela: geser vertikal + aliran udara
    v.jendela = REDAM(v.jendela, p.ventilasiBuka ? 0.5 : 0, 5, dt);
    el.daunJendela?.setAttribute("position", v3(2.44, 1.28 + v.jendela, -0.4));
    el.aliranUdara?.setAttribute("visible", p.ventilasiBuka && v.jendela > 0.2);

    // Lampu meja: sorot fokus / sebar
    const sorotIntens = p.lampuMeja ? (p.lampuMejaFokus ? 1.05 : 0.65) : 0;
    el.sorotMeja?.setAttribute("light", "intensity", sorotIntens);
    el.sorotMeja?.setAttribute("light", "distance", p.lampuMejaFokus ? 2.0 : 3.4);
    el.sorotMeja?.setAttribute("position", v3(-0.45, p.lampuMejaFokus ? 1.55 : 1.95, -0.55));
    el.bolaLampu?.setAttribute("material", "emissiveIntensity", p.lampuMeja ? 1.6 : 0.05);
    el.kerucut?.setAttribute("material", "opacity", p.lampuMeja && p.lampuMejaFokus ? 0.1 : 0);

    // Lampu umum (3 level intensitas)
    const umum = p.lampuUmum;
    const faktorLevel = [0, 0.4, 0.7, 1][p.lampuLevel] ?? 1;
    el.cahayaUmum?.setAttribute(
      "light",
      "intensity",
      umum ? (k.pengaturan.modeGelap ? 1.05 : 0.85) * faktorLevel : 0
    );
    [el.plafon1, el.plafon2, el.plafon3].forEach((pl) =>
      pl?.setAttribute("material", "emissiveIntensity", umum ? 1.2 * faktorLevel : 0.04)
    );
    [el.strip1, el.strip2].forEach((s) => s?.setAttribute("material", "emissiveIntensity", umum ? 0.9 : 0.02));
    el.cahayaStrip?.setAttribute("light", "intensity", umum ? 0.4 : 0);
    el.tuasSaklar?.setAttribute("rotation", v3(umum ? 18 : -18, 0, 0));
    el.tuasSaklar?.setAttribute("material", "color", umum ? "#c96f4a" : "#8a8478");

    // Mode siang / malam
    const gelap = k.pengaturan.modeGelap;
    if (gelap !== v.pemandanganGelap) {
      v.pemandanganGelap = gelap;
      el.pemandangan?.setAttribute("material", "src", gelap ? "#img-pemandangan-gelap" : "#img-pemandangan");
    }
    v.matahari = REDAM(v.matahari, gelap ? 0.045 : 0.95, 3, dt);
    v.ambien = REDAM(v.ambien, gelap ? 0.13 : 0.5, 3, dt);
    v.peredup = REDAM(v.peredup, gelap ? 0.78 : 0, 3, dt);
    el.cahayaMatahari?.setAttribute("light", "intensity", +v.matahari.toFixed(3));
    el.cahayaMatahari?.setAttribute("light", "color", gelap ? "#8fa8d0" : "#ffd9a8");
    el.cahayaAmbien?.setAttribute("light", "intensity", +v.ambien.toFixed(3));
    el.cahayaHemisfer?.setAttribute("light", "intensity", gelap ? 0.1 : 0.32);
    el.peredup?.setAttribute("material", "opacity", +v.peredup.toFixed(3));
    el.cahayaKepala?.setAttribute("light", "intensity", gelap && !umum ? 0.5 : 0.1);

    // Cincin penanda target
    const target = k.status.target;
    if (target && el.cincin) {
      const pose = poseCincin(target, p);
      el.cincin.setAttribute("visible", true);
      el.cincin.setAttribute("position", v3(pose.pos[0], pose.pos[1], pose.pos[2]));
      el.cincin.setAttribute("rotation", v3(pose.rot[0], pose.rot[1], pose.rot[2]));
      v.cincinR = REDAM(v.cincinR, pose.r, 10, dt);
      const denyut = 1 + Math.sin(t * 0.006) * 0.06;
      const s = (v.cincinR / 0.3) * denyut;
      el.cincin.setAttribute("scale", v3(s, s, s));
    } else if (el.cincin) {
      el.cincin.setAttribute("visible", false);
      v.cincinR = 0.3;
    }
  }
}
