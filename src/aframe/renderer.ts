import { katalog } from "../game/katalog";

export const DINDING_RUANG = {
  belakang: 1,
  depan: 2.14,
  kiri: 2,
  kanan: 1,
  tinggi: 3,
};

export const POSISI_TEMPEL = {
  rakBumbu: () => ({ x: 0.45, y: 1.75, z: -DINDING_RUANG.belakang + 0.1 }),
  jendela: () => ({ x: DINDING_RUANG.kanan - 0.1, y: 1.55, z: -0.4 }),
};

const MATERIAL_HITBOX =
  "color: #fbbf24; transparent: true; opacity: 0.001; depthWrite: false; side: double";

export type KonteksRendererModel = {
  el: any;
  wadah: any;
  modelIsi: any;
  hitbox: any;
  batasBawaan: any;
  batasModel: any;
  skalaNormalisasi: any;
  data: { slot: string };
};

function three() {
  return (window as any).AFRAME.THREE;
}

export function batasLokal(obj: any, induk: any) {
  const T = three();
  const dunia = obj?.isBox3 ? obj.clone() : new T.Box3().setFromObject(obj);
  if (dunia.isEmpty()) return null;

  const lokal = new T.Box3();
  for (const x of [dunia.min.x, dunia.max.x]) {
    for (const y of [dunia.min.y, dunia.max.y]) {
      for (const z of [dunia.min.z, dunia.max.z]) {
        lokal.expandByPoint(induk.worldToLocal(new T.Vector3(x, y, z)));
      }
    }
  }
  return lokal;
}

export function batasBawaan(konteks: KonteksRendererModel) {
  const T = three();
  const dunia = new T.Box3();
  const telusuri = (obj: any) => {
    if (!obj || obj === konteks.wadah || obj.el?.hasAttribute?.("slot-model")) return;
    if (obj.isMesh) dunia.expandByObject(obj);
    obj.children?.forEach((anak: any) => telusuri(anak));
  };

  konteks.el.object3D.children.forEach((anak: any) => telusuri(anak));
  if (!dunia.isEmpty()) return batasLokal(dunia, konteks.el.object3D);
  const target: Record<string, any> = {
    kompor: new T.Box3(new T.Vector3(-0.31, 0, -0.26), new T.Vector3(0.31, 0.94, 0.26)),
    wastafel: new T.Box3(new T.Vector3(-0.31, -0.26, -0.25), new T.Vector3(0.31, 0.26, 0.25)),
  };
  return target[konteks.data.slot] ?? null;
}

export function buatHitbox(konteks: KonteksRendererModel) {
  if (konteks.hitbox || !konteks.batasBawaan) return;
  const T = three();
  const ukuran = new T.Vector3();
  const tengah = new T.Vector3();
  konteks.batasBawaan.getSize(ukuran);
  konteks.batasBawaan.getCenter(tengah);

  const hitbox = document.createElement("a-entity");
  hitbox.classList.add("hitbox-model");
  hitbox.setAttribute(
    "geometry",
    `primitive: box; width: ${ukuran.x}; height: ${ukuran.y}; depth: ${ukuran.z}`,
  );
  hitbox.setAttribute("position", `${tengah.x} ${tengah.y} ${tengah.z}`);
  hitbox.setAttribute("material", MATERIAL_HITBOX);
  konteks.hitbox = hitbox;
  konteks.el.appendChild(hitbox);
}

export function normalisasiModel(konteks: KonteksRendererModel) {
  if (!konteks.modelIsi || !konteks.batasBawaan) return;
  const obj = konteks.modelIsi.getObject3D("mesh");
  if (!obj) return;

  konteks.batasModel = batasLokal(obj, konteks.modelIsi.object3D);
  if (!konteks.batasModel) return;

  const T = three();
  const ukuranTarget = new T.Vector3();
  const ukuranModel = new T.Vector3();
  const batasTarget = konteks.data.slot === "meja-atas"
    ? new T.Box3(new T.Vector3(-0.64, 0, -0.35), new T.Vector3(0.64, 0.78, 0.35))
    : konteks.data.slot === "kulkas"
      ? new T.Box3(new T.Vector3(-0.36, 0, -0.31), new T.Vector3(0.36, 1.84, 0.31))
      : konteks.data.slot === "wastafel"
        ? new T.Box3(new T.Vector3(-0.31, -0.25, -0.25), new T.Vector3(0.31, 0.25, 0.25))
      : konteks.batasBawaan;
  konteks.batasBawaan = batasTarget;
  batasTarget.getSize(ukuranTarget);
  konteks.batasModel.getSize(ukuranModel);
  if (ukuranModel.x < 0.001 || ukuranModel.y < 0.001 || ukuranModel.z < 0.001) return;

  konteks.skalaNormalisasi = new T.Vector3(
    ukuranTarget.x / ukuranModel.x,
    ukuranTarget.y / ukuranModel.y,
    ukuranTarget.z / ukuranModel.z,
  );
  buatHitbox(konteks);
  terapkanTransformasi(konteks, katalog.ambil(konteks.data.slot));
}

export function terapkanTransformasi(konteks: KonteksRendererModel, slot: any) {
  if (!konteks.wadah || !konteks.modelIsi || !konteks.batasModel || !konteks.batasBawaan || !konteks.skalaNormalisasi || !slot) return;

  const T = three();
  const pengali = Number(slot.skala) > 0 ? Number(slot.skala) : 1;
  const skala = new T.Vector3(
    konteks.skalaNormalisasi.x * pengali,
    konteks.skalaNormalisasi.y * pengali,
    konteks.skalaNormalisasi.z * pengali,
  );
  const pusatModel = new T.Vector3();
  const pusatTarget = new T.Vector3();
  konteks.batasModel.getCenter(pusatModel);
  konteks.batasBawaan.getCenter(pusatTarget);
  if (konteks.data.slot === "talenan") {
    pusatTarget.x = 0;
    pusatTarget.z = 0;
  }

  konteks.modelIsi.object3D.scale.copy(skala);
  konteks.modelIsi.object3D.position.set(
    pusatTarget.x - pusatModel.x * skala.x,
    konteks.batasBawaan.min.y - konteks.batasModel.min.y * skala.y,
    pusatTarget.z - pusatModel.z * skala.z,
  );
  konteks.wadah.object3D.rotation.set(0, (Number(slot.putarY) || 0) * Math.PI / 180, 0);
  konteks.wadah.object3D.position.y = Number(slot.offsetY) || 0;
}

export function aturTinggiMeja(konteks: KonteksRendererModel, tinggi: number) {
  if (!konteks.modelIsi || !konteks.batasModel || !konteks.batasBawaan || !konteks.skalaNormalisasi) return;
  const slot = katalog.ambil(konteks.data.slot);
  terapkanTransformasi(konteks, slot);
  const rasio = tinggi / 0.78;
  konteks.modelIsi.object3D.scale.y *= rasio;
  konteks.modelIsi.object3D.position.y =
    konteks.batasBawaan.min.y - konteks.batasModel.min.y * konteks.modelIsi.object3D.scale.y;
}

export function aturVisibilitas(konteks: KonteksRendererModel, slot: any, modelSiap: boolean) {
  const sembunyi = !!slot.jalur && modelSiap;
  const ai = konteks.el.sceneEl?.querySelectorAll?.(`[data-model-ai="${slot.id}"]`) ?? [];
  ai.forEach((anak: any) => anak.setAttribute("visible", !sembunyi));
  const terapkanKePrimitif = (anak: any) => {
    if (anak === konteks.wadah || anak === konteks.hitbox) return;
    if (anak.hasAttribute?.("slot-model")) return;
    if (anak.classList?.contains("tetap-tampil")) return;
    if (anak.hasAttribute?.("light")) return;
    const punyaSlotAnak = anak.querySelector?.("[slot-model]");
    if (punyaSlotAnak) {
      Array.from(anak.children).forEach((turunan) => terapkanKePrimitif(turunan));
    } else {
      anak.setAttribute("visible", !sembunyi);
    }
  };
  Array.from(konteks.el.children).forEach((anak) => terapkanKePrimitif(anak));
}

export function bersihkanModel(konteks: KonteksRendererModel) {
  if (konteks.wadah) konteks.el.removeChild(konteks.wadah);
  if (konteks.hitbox) konteks.el.removeChild(konteks.hitbox);
  konteks.wadah = null;
  konteks.modelIsi = null;
  konteks.hitbox = null;
  konteks.batasBawaan = null;
  konteks.batasModel = null;
  konteks.skalaNormalisasi = null;
}
