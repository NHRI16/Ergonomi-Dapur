// @ts-nocheck
// ============================================================
// ErgoDapur — Komponen A-Frame Kustom
// - tampilan-sensitif : kontrol pandang FPS dengan sensitivitas
// - gerak-pemain      : WASD + jongkok (C) + tegak (Shift) + batas ruang
// - manajer-interaksi : raycaster tengah layar untuk target F
// - api-kompor, uap-panci, aliran-udara : animasi visual
// - panel-skor, poster-ergonomi : tekstur kanvas dalam dunia 3D
// - loop-permainan    : delegasi tick ke pengendali utama
// ============================================================

import "aframe";
import { toko, warnaSkor, labelSkor, MAKS_PILAR } from "../game/store";
import { katalog } from "../game/katalog";

const AFRAME = (window as any).AFRAME;

let terdaftar = false;

export function pastikanKomponen() {
  if (terdaftar) return;
  terdaftar = true;

  // ---------- Kontrol pandang dengan sensitivitas ----------
  AFRAME.registerComponent("tampilan-sensitif", {
    init() {
      this.yaw = 0;
      this.pitch = 0;
      this.terkunci = false;
      this.mouseBebasX = null;
      this.mouseBebasY = null;
      this.el.object3D.rotation.order = "YXZ";
      this.kanvas = this.el.sceneEl.canvas;

      // Klik / mulai seret pada kanvas: coba kunci pointer (toleran gagal),
      // jika gagal maka mode SERET-UNTUK-MELIHAT aktif sebagai cadangan.
      this.padaMouseDown = (e) => {
        if (!(e.target instanceof HTMLCanvasElement)) return;
        const st = toko.keadaan.status;
        if (!st.dimulai || st.menuBuka || st.bantuanBuka || st.modeInteraksi || st.dalamVR) return;
        this.seret = true;
        this.seretX = e.clientX;
        this.seretY = e.clientY;
        if (!this.terkunci) {
          const cv = this.el.sceneEl.canvas;
          try {
            const r = cv?.requestPointerLock?.({ unadjustedMovement: true });
            if (r && r.catch) r.catch(() => { try { cv?.requestPointerLock?.(); } catch {} });
          } catch {
            try { cv?.requestPointerLock?.(); } catch {}
          }
        }
      };
      this.padaMouseUp = () => {
        this.seret = false;
      };
      this.padaUbahKunci = () => {
        const cv = this.el.sceneEl.canvas;
        const sekarang = document.pointerLockElement === cv;
        this.terkunci = sekarang;
        toko.setStatus({ kursorTerkunci: sekarang });
      };
      this.padaGerakMouse = (e) => {
        const st = toko.keadaan.status;
        if (!st.dimulai || st.dalamVR || st.menuBuka || st.bantuanBuka || st.modeInteraksi) return;
        let mx = 0,
          my = 0;
        if (this.terkunci) {
          mx = e.movementX;
          my = e.movementY;
        } else if (this.seret) {
          mx = e.clientX - this.seretX;
          my = e.clientY - this.seretY;
          this.seretX = e.clientX;
          this.seretY = e.clientY;
        } else {
          // Fallback tanpa pointer-lock: begitu panel opsi ditutup, mouse
          // langsung dapat memutar pandangan tanpa perlu klik lagi.
          if (this.mouseBebasX === null || this.mouseBebasY === null) {
            this.mouseBebasX = e.clientX;
            this.mouseBebasY = e.clientY;
            return;
          }
          mx = e.clientX - this.mouseBebasX;
          my = e.clientY - this.mouseBebasY;
          this.mouseBebasX = e.clientX;
          this.mouseBebasY = e.clientY;
        }
        const s = toko.keadaan.pengaturan.sensitivitas * 0.0021;
        this.yaw -= mx * s;
        this.pitch -= my * s;
        this.pitch = Math.max(-1.53, Math.min(1.53, this.pitch));
      };
      this.padaSentuhMulai = (e) => {
        if (e.touches.length === 1) {
          this.sentuhX = e.touches[0].clientX;
          this.sentuhY = e.touches[0].clientY;
        }
      };
      this.padaSentuhGerak = (e) => {
        if (e.touches.length !== 1 || this.terkunci) return;
        const s = toko.keadaan.pengaturan.sensitivitas * 0.0042;
        const t = e.touches[0];
        this.yaw -= (t.clientX - this.sentuhX) * s;
        this.pitch -= (t.clientY - this.sentuhY) * s;
        this.pitch = Math.max(-1.53, Math.min(1.53, this.pitch));
        this.sentuhX = t.clientX;
        this.sentuhY = t.clientY;
      };

      document.addEventListener("mousedown", this.padaMouseDown);
      document.addEventListener("mouseup", this.padaMouseUp);
      document.addEventListener("pointerlockchange", this.padaUbahKunci);
      document.addEventListener("mousemove", this.padaGerakMouse);
      this.kanvas?.addEventListener("touchstart", this.padaSentuhMulai, { passive: true });
      this.kanvas?.addEventListener("touchmove", this.padaSentuhGerak, { passive: true });
    },
    tick() {
      if (toko.keadaan.status.dalamVR) return;
      this.el.object3D.rotation.y = this.yaw;
      this.el.object3D.rotation.x = this.pitch;
    },
    remove() {
      document.removeEventListener("mousedown", this.padaMouseDown);
      document.removeEventListener("mouseup", this.padaMouseUp);
      document.removeEventListener("pointerlockchange", this.padaUbahKunci);
      document.removeEventListener("mousemove", this.padaGerakMouse);
    },
  });

  // ---------- Gerakan pemain + postur + batas ruangan ----------
  AFRAME.registerComponent("gerak-pemain", {
    init() {
      this.tombol = new Set();
      this.sikapY = 1.6;
      this.padaBawah = (e: KeyboardEvent) => {
        const t = e.target as HTMLElement | null;
        if (t) {
          if (t.tagName === "TEXTAREA" || t.isContentEditable) return;
          if (t.tagName === "INPUT") {
            const tipe = (t as HTMLInputElement).type?.toLowerCase();
            if (["text", "search", "url", "password", "email", "number", "tel"].includes(tipe)) return;
          }
        }
        if (
          ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ShiftLeft", "ShiftRight"].includes(e.code)
        )
          this.tombol.add(e.code);
        if (e.code === "KeyC" && !e.repeat) {
          const st = toko.keadaan.status;
          if (st.menuBuka || st.bantuanBuka || !st.dimulai) return;
          const s = st.sikap;
          toko.setStatus({ sikap: s === "jongkok" ? "berdiri" : "jongkok" });
        }
      };
      this.padaAtas = (e) => this.tombol.delete(e.code);
      // Pengaman: bersihkan tombol saat fokus jendela hilang / kunci berubah
      this.padaBlur = () => this.tombol.clear();
      window.addEventListener("blur", this.padaBlur);
      document.addEventListener("pointerlockchange", this.padaBlur);
      window.addEventListener("keydown", this.padaBawah);
      window.addEventListener("keyup", this.padaAtas);
    },
    remove() {
      window.removeEventListener("keydown", this.padaBawah);
      window.removeEventListener("keyup", this.padaAtas);
      window.removeEventListener("blur", this.padaBlur);
      document.removeEventListener("pointerlockchange", this.padaBlur);
    },
    tick(_t, dt) {
      const st = toko.keadaan.status;
      const uiTerbuka = !st.dimulai || st.menuBuka || st.bantuanBuka || st.modelBuka || st.modeInteraksi;
      const obj = this.el.object3D;
      const dtk = Math.min(dt, 50) / 1000;

      // --- Postur (tinggi kamera) ---
      let targetY = 1.6;
      if (st.sikap === "jongkok") targetY = 0.92;
      const tegak = this.tombolTekanTegak();
      if (st.sikap !== "jongkok" && tegak) targetY = 1.78;
      if (st.sikap !== "jongkok" && tegak && st.sikap !== "tegak") toko.setStatus({ sikap: "tegak" });
      if (!tegak && st.sikap === "tegak") toko.setStatus({ sikap: "berdiri" });
      this.sikapY += (targetY - this.sikapY) * Math.min(1, dtk * 7);
      obj.position.y = this.sikapY;

      if (uiTerbuka || st.dalamVR) return;

      // --- Gerakan WASD relatif arah pandang ---
      const kecepatan = toko.keadaan.pengaturan.kecepatan * (st.sikap === "jongkok" ? 0.45 : 1);
      let dx = 0,
        dz = 0;
      if (this.tombol.has("KeyW") || this.tombol.has("ArrowUp")) dz -= 1;
      if (this.tombol.has("KeyS") || this.tombol.has("ArrowDown")) dz += 1;
      if (this.tombol.has("KeyA") || this.tombol.has("ArrowLeft")) dx -= 1;
      if (this.tombol.has("KeyD") || this.tombol.has("ArrowRight")) dx += 1;
      if (dx !== 0 || dz !== 0) {
        const panjang = Math.hypot(dx, dz);
        dx /= panjang;
        dz /= panjang;
        const yaw = obj.rotation.y;
        const sin = Math.sin(yaw),
          cos = Math.cos(yaw);
        obj.position.x += (dx * cos + dz * sin) * kecepatan * dtk;
        obj.position.z += (dz * cos - dx * sin) * kecepatan * dtk;
      }

      // --- Batas ruangan & furnitur ---
      const p = obj.position;
      p.x = Math.max(-2.15, Math.min(2.15, p.x));
      p.z = Math.max(-1.55, Math.min(1.95, p.z));
      // Tabrakan mengikuti posisi objek yang dapat dipindahkan
      const par = toko.keadaan.params;
      this.tolakKotak(p, par.mejaX, par.mejaZ, 0.72, 0.43);
      const xk = 1.45 - par.kulkasGeser / 100;
      this.tolakKotak(p, xk, par.kulkasZ, 0.46, 0.48);
    },
    tolakKotak(p, cx, cz, rx, rz) {
      const dx = p.x - cx,
        dz = p.z - cz;
      if (Math.abs(dx) < rx && Math.abs(dz) < rz) {
        const px = rx - Math.abs(dx),
          pz = rz - Math.abs(dz);
        if (px < pz) p.x = cx + Math.sign(dx || 1) * rx;
        else p.z = cz + Math.sign(dz || 1) * rz;
      }
    },
    tombolTekanTegak() {
      return this.tombol.has("ShiftLeft") || this.tombol.has("ShiftRight");
    },
    padaBawah: null,
  });

  // ---------- Manajer interaksi ----------
  // Raycast dari tengah layar memakai THREE langsung (andal untuk
  // grup entitas beranak) + interaksi tatap (dwell) untuk mode VR.
  AFRAME.registerComponent("manajer-interaksi", {
    init() {
      const T = AFRAME.THREE;
      this.sin = new T.Raycaster();
      this.sin.far = 3.2;
      this.pusat = new T.Vector2(0, 0);
      this.objek = null;
      this.terakhirPindai = 0;
      this.targetSejak = 0;
      this.targetLama = null;
      this.sudahTembak = false;
    },
    tick(t) {
      if (toko.keadaan.status.modeInteraksi) return;
      if (t - this.terakhirPindai < 120) return;
      this.terakhirPindai = t;
      const scene = this.el.sceneEl;
      if (!scene || !scene.object3D) return;
      const kamera = this.el.getObject3D("camera");
      if (!kamera) return;
      if (!this.objek) {
        this.objek = Array.from(scene.querySelectorAll(".interaktif"))
          .map((e) => e.object3D)
          .filter(Boolean);
      }
      kamera.updateMatrixWorld();
      this.sin.setFromCamera(this.pusat, kamera);
      const hits = this.sin.intersectObjects(this.objek, true);
      let el = null;
      let jarak = 0;
      for (const h of hits) {
        let o = h.object;
        while (o) {
          if (o.el && o.el.classList && o.el.classList.contains("interaktif")) break;
          o = o.parent;
        }
        if (o) {
          el = o.el;
          jarak = h.distance;
          break;
        }
      }
      const id = el ? el.id : null;
      const st = toko.keadaan.status;
      if (id !== this.targetLama) {
        this.targetLama = id;
        this.targetSejak = t;
        this.sudahTembak = false;
        if (st.target !== id) toko.setStatus({ target: id, targetJarak: jarak });
      } else if (id && Math.abs((st.targetJarak || 0) - jarak) > 0.08) {
        toko.setStatus({ targetJarak: jarak });
      }
      // Mode VR: tatap objek 1 detik untuk berinteraksi (dwell click)
      if (st.dalamVR && id && !this.sudahTembak && t - this.targetSejak > 950) {
        this.sudahTembak = true;
        if (window.__pengendali) window.__pengendali.aksiUtama(id);
      }
    },
  });

  // ---------- Api kompor berkedip ----------
  AFRAME.registerComponent("api-kompor", {
    tick(t) {
      if (!this.el.object3D.visible) return;
      const cahaya = this.el.querySelector("#cahaya-api");
      const denyut = 0.85 + Math.sin(t * 0.02) * 0.12 + Math.sin(t * 0.053) * 0.06;
      if (cahaya) cahaya.setAttribute("light", "intensity", (0.65 * denyut).toFixed(3));
      this.el.childNodes.forEach((anak, i) => {
        if (!anak.object3D) return;
        const s = denyut * (1 + Math.sin(t * 0.017 + i * 1.7) * 0.18);
        anak.object3D.scale.set(s, s * (1 + Math.sin(t * 0.03 + i) * 0.1), s);
      });
    },
  });

  // ---------- Uap panci ----------
  AFRAME.registerComponent("uap-panci", {
    tick(t) {
      if (!this.el.object3D.visible) return;
      this.el.childNodes.forEach((anak, i) => {
        if (!anak.object3D) return;
        const fase = ((t * 0.00024 + i * 0.33) % 1 + 1) % 1;
        anak.object3D.position.y = 0.05 + fase * 0.5;
        anak.object3D.position.x = Math.sin(t * 0.0012 + i * 2.1) * 0.05;
        const skala = 0.35 + fase * 0.9;
        anak.object3D.scale.set(skala, skala, skala);
        anak.object3D.rotation.z = Math.sin(t * 0.0009 + i) * 0.4;
        const mat = anak.getAttribute("material");
        if (mat) anak.setAttribute("material", "opacity", (0.3 * (1 - fase)).toFixed(3));
      });
    },
  });

  // ---------- Aliran udara dari jendela ----------
  AFRAME.registerComponent("aliran-udara", {
    tick(t) {
      if (!this.el.object3D.visible) return;
      this.el.childNodes.forEach((anak, i) => {
        if (!anak.object3D) return;
        const fase = ((t * 0.00038 + i * 0.27) % 1 + 1) % 1;
        anak.object3D.position.x = -fase * 1.35;
        anak.object3D.position.y = Math.sin(t * 0.002 + i * 1.9) * 0.08;
        const mat = anak.getAttribute("material");
        if (mat) anak.setAttribute("material", "opacity", (0.42 * Math.sin(fase * Math.PI)).toFixed(3));
      });
    },
  });

  // ---------- Panel skor di dalam dunia 3D ----------
  AFRAME.registerComponent("panel-skor", {
    init() {
      this.kanvas = document.getElementById("kanvas-panel");
      this.ctx = this.kanvas?.getContext("2d");
      this.terakhir = -1;
      this.batal = toko.langganan(() => this.gambar());
      setTimeout(() => this.gambar(), 300);
    },
    remove() {
      this.batal && this.batal();
    },
    tick(t) {
      if (t - this.terakhir > 1500) {
        this.terakhir = t;
        this.gambar();
      }
    },
    gambar() {
      if (!this.ctx) return;
      const c = this.ctx,
        k = toko.keadaan;
      const W = 640,
        H = 430;
      c.clearRect(0, 0, W, H);
      // latar
      c.fillStyle = "#131719";
      c.fillRect(0, 0, W, H);
      c.fillStyle = "#1b2124";
      c.fillRect(0, 0, W, 64);
      c.fillStyle = "#f59e0b";
      c.fillRect(0, 62, W, 3);
      c.fillStyle = "#f3ecdd";
      c.font = "700 26px Sora, sans-serif";
      c.fillText("SKOR ERGONOMI DAPUR", 24, 41);
      // skor besar
      const warna = warnaSkor(k.skor);
      c.fillStyle = warna;
      c.font = "800 92px Sora, sans-serif";
      c.fillText(`${k.skor}%`, 24, 170);
      c.font = "600 20px 'Plus Jakarta Sans', sans-serif";
      c.fillText(labelSkor(k.skor), 28, 205);
      // pilar
      const pilar = [
        ["Keselamatan", k.pilar.keselamatan, MAKS_PILAR.keselamatan],
        ["Efisiensi", k.pilar.efisiensi, MAKS_PILAR.efisiensi],
        ["Kesehatan", k.pilar.kesehatan, MAKS_PILAR.kesehatan],
        ["Kenyamanan", k.pilar.kenyamanan, MAKS_PILAR.kenyamanan],
      ];
      c.font = "600 17px 'Plus Jakarta Sans', sans-serif";
      pilar.forEach(([nama, nil, maks], i) => {
        const x = 24 + i * 152;
        c.fillStyle = "rgba(243,236,221,0.75)";
        c.fillText(nama, x, 262);
        c.fillStyle = "rgba(243,236,221,0.14)";
        c.fillRect(x, 274, 128, 10);
        c.fillStyle = warnaSkor((nil / maks) * 100);
        c.fillRect(x, 274, 128 * (nil / maks), 10);
      });
      // saran
      c.fillStyle = "rgba(243,236,221,0.9)";
      c.font = "600 18px 'Plus Jakarta Sans', sans-serif";
      c.fillText(k.masalah.length ? "Saran perbaikan:" : "Semua parameter optimal!", 24, 330);
      c.font = "400 16px 'Plus Jakarta Sans', sans-serif";
      const saran = k.masalah.slice(0, 3);
      if (!saran.length) {
        c.fillStyle = "#34d399";
        c.fillText("Pertahankan tata letak ini. Kerja bagus!", 24, 362);
      } else {
        saran.forEach((m, i) => {
          c.fillStyle = m.tingkat === "buruk" ? "#f87171" : "#fbbf24";
          const teks = m.teks.length > 62 ? m.teks.slice(0, 60) + "…" : m.teks;
          c.fillText(`• ${teks}`, 24, 362 + i * 26);
        });
      }
      const jala = this.el.getObject3D("mesh");
      if (jala && jala.material.map) jala.material.map.needsUpdate = true;
    },
  });

  // ---------- Poster edukasi (digambar sekali) ----------
  AFRAME.registerComponent("poster-ergonomi", {
    init() {
      const kanvas = document.getElementById("kanvas-poster");
      const c = kanvas?.getContext("2d");
      if (!c) return;
      const gambar = () => this.gambarPoster(c);
      gambar();
      // Gambar ulang setelah font web siap agar tipografi presisi
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => gambar());
    },
    gambarPoster(c) {
      const W = 512,
        H = 640;
      c.fillStyle = "#f6efe2";
      c.fillRect(0, 0, W, H);
      c.strokeStyle = "#c96f4a";
      c.lineWidth = 10;
      c.strokeRect(14, 14, W - 28, H - 28);
      c.fillStyle = "#24303a";
      c.font = "800 34px Sora, sans-serif";
      c.textAlign = "center";
      c.fillText("SEGITIGA KERJA", W / 2, 78);
      c.fillText("DAPUR", W / 2, 116);
      c.font = "500 17px 'Plus Jakarta Sans', sans-serif";
      c.fillStyle = "#c96f4a";
      c.fillText("Prinsip dasar tata letak ergonomis", W / 2, 150);
      // diagram segitiga
      const A = { x: 130, y: 230 },
        B = { x: 382, y: 230 },
        Cpt = { x: 256, y: 420 };
      c.strokeStyle = "#24303a";
      c.lineWidth = 4;
      c.setLineDash([10, 8]);
      c.beginPath();
      c.moveTo(A.x, A.y);
      c.lineTo(B.x, B.y);
      c.lineTo(Cpt.x, Cpt.y);
      c.closePath();
      c.stroke();
      c.setLineDash([]);
      const titik = [
        [A, "KOMPOR", "#c96f4a"],
        [B, "WASTAFEL", "#3f7fae"],
        [Cpt, "KULKAS", "#5f7f5a"],
      ];
      titik.forEach(([p, nama, warna]) => {
        c.fillStyle = warna;
        c.beginPath();
        c.arc(p.x, p.y, 34, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#fff";
        c.font = "800 13px 'Plus Jakarta Sans', sans-serif";
        c.fillText(nama, p.x, p.y + 5);
      });
      c.fillStyle = "#24303a";
      c.font = "600 16px 'Plus Jakarta Sans', sans-serif";
      c.textAlign = "left";
      const tips = [
        "1. Setiap sisi idealnya 1,2 – 2,8 meter.",
        "2. Jalur antar titik bebas hambatan.",
        "3. Jarak aman kompor dari dinding ≥ 15 cm.",
        "4. Rak bumbu sejajar pinggang – bahu.",
        "5. Meja potong ideal setinggi 85–92 cm.",
        "6. Ventilasi terbuka saat memasak.",
      ];
      tips.forEach((t, i) => c.fillText(t, 42, 492 + i * 24));
      c.textAlign = "center";
      c.font = "700 14px Sora, sans-serif";
      c.fillStyle = "#c96f4a";
      c.fillText("ErgoDapur • Simulasi Ergonomi Interaktif", W / 2, 616);
      const jala = this.el.getObject3D("mesh");
      setTimeout(() => {
        const j = this.el.getObject3D("mesh");
        if (j && j.material.map) j.material.map.needsUpdate = true;
      }, 400);
    },
  });

  // ---------- Slot model 3D (integrasi Sketchfab) ----------
  // Memasang model GLB/glTF ke entitas dan menyembunyikan bentuk
  // primitif bawaan. Entitas ber-kelas "tetap-tampil" (api, uap,
  // lampu, talenan) tidak ikut disembunyikan.
  AFRAME.registerComponent("slot-model", {
    schema: { slot: { type: "string" } },
    init() {
      this.wadah = null;
      this.jalurAktif = "";
      this.terapkan();
      this.batal = katalog.langganan(() => this.terapkan());
    },
    remove() {
      this.batal && this.batal();
    },
    terapkan() {
      const s = katalog.ambil(this.data.slot);
      if (!s) return;
      const el = this.el;

      // Buat / hapus wadah model
      if (s.jalur) {
        if (!this.wadah) {
          this.wadah = document.createElement("a-entity");
          this.wadah.classList.add("wadah-model");
          el.appendChild(this.wadah);
        }
        if (this.jalurAktif !== s.jalur) {
          this.jalurAktif = s.jalur;
          this.wadah.setAttribute("gltf-model", `url(${s.jalur})`);
          this.wadah.addEventListener(
            "model-error",
            () => {
              toko.toast(
                `Model "${s.nama}" gagal dimuat. Pastikan berkas .glb valid dan dapat diakses.`,
                "buruk"
              );
            },
            { once: true }
          );
          this.wadah.addEventListener(
            "model-loaded",
            () => {
              toko.toast(`Model "${s.nama}" berhasil dipasang.`, "baik");
              // Aktifkan bayangan pada seluruh mesh model
              const obj = this.wadah.getObject3D("mesh");
              if (obj)
                obj.traverse((n) => {
                  if (n.isMesh) {
                    n.castShadow = true;
                    n.receiveShadow = true;
                  }
                });
            },
            { once: true }
          );
        }
        this.wadah.setAttribute("scale", `${s.skala} ${s.skala} ${s.skala}`);
        this.wadah.setAttribute("rotation", `0 ${s.putarY} 0`);
        this.wadah.setAttribute("position", `0 ${s.offsetY} 0`);
      } else if (this.wadah) {
        el.removeChild(this.wadah);
        this.wadah = null;
        this.jalurAktif = "";
      }

      // Tampilkan / sembunyikan primitif bawaan
      const sembunyi = !!s.jalur && s.sembunyikanPrimitif;
      Array.from(el.children).forEach((anak) => {
        if (anak === this.wadah) return;
        if (anak.classList && anak.classList.contains("tetap-tampil")) return;
        if (anak.hasAttribute && anak.hasAttribute("light")) return;
        anak.setAttribute("visible", !sembunyi);
      });
    },
  });

  // ---------- Loop permainan global ----------
  AFRAME.registerComponent("loop-permainan", {
    tick(t, dt) {
      if (window.__pengendali) window.__pengendali.tick(t, dt);
    },
  });
}
