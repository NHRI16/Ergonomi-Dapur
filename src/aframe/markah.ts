// ============================================================
// ErgoDapur — Markah (HTML) Pembangun Scene Dapur 3D
// Seluruh dapur dibangun prosedural dari primitif A-Frame
// dengan tekstur hasil generasi + material PBR ringan.
// ============================================================

const BAYANGAN = `shadow="cast: true; receive: true"`; // furnitur utama
const TERIMA = `shadow="cast: false; receive: true"`; // lantai & dinding

/** Botol-botol bumbu pada rak. */
function botolBumbu(): string {
  const warna = ["#d9a03c", "#b8452f", "#7d9b4e", "#c97e2e", "#8a5a2b", "#b8452f", "#d9c13c", "#7d9b4e", "#c9552e", "#a3642b", "#d9a03c", "#5f7d4f"];
  let out = "";
  for (let rak = 0; rak < 2; rak++) {
    const y = rak === 0 ? 0.075 : 0.355;
    for (let i = 0; i < 6; i++) {
      const x = -0.32 + i * 0.128;
      const c = warna[rak * 6 + i];
      const tinggi = 0.085 + ((i * 7 + rak * 3) % 3) * 0.02;
      out += `
        <a-entity geometry="primitive: cylinder; radius: 0.028; height: ${tinggi}" position="${x} ${y + tinggi / 2 - 0.055} 0.01"
          material="color: ${c}; roughness: 0.12; metalness: 0.05; transparent: true; opacity: 0.94"></a-entity>
        <a-entity geometry="primitive: cylinder; radius: 0.03; height: 0.022" position="${x} ${y + tinggi - 0.055 + 0.012} 0.01"
          material="color: #3d332a; roughness: 0.6"></a-entity>
        <a-entity geometry="primitive: plane; width: 0.04; height: 0.045" position="${x} ${y + 0.01} 0.0405"
          material="color: #f3ecdd; roughness: 0.9"></a-entity>`;
    }
  }
  return out;
}

/** Pintu-pintu kabinet bawah. */
function pintuKabinet(): string {
  const xs = [-2.0, -1.36, -0.72, -0.08];
  return xs
    .map(
      (x) => `
    <a-entity geometry="primitive: box; width: 0.58; height: 0.62; depth: 0.02" position="${x} 0.47 -1.572"
      material="src: #tx-kayu; color: #e8caa2; roughness: 0.55" ${TERIMA}></a-entity>
    <a-entity geometry="primitive: cylinder; radius: 0.011; height: 0.15" position="${x} 0.73 -1.545" rotation="0 0 90"
      material="color: #d9c9a8; metalness: 0.85; roughness: 0.25"></a-entity>`
    )
    .join("");
}

/** Daun-daun tanaman hias. */
function tanaman(): string {
  let out = "";
  for (let i = 0; i < 7; i++) {
    const sudut = (i / 7) * 360;
    const h = 0.45 + (i % 3) * 0.14;
    out += `<a-entity geometry="primitive: cone; radiusBottom: 0.035; radiusTop: 0.004; height: ${h}"
      position="0 ${0.28 + h / 2} 0" rotation="${18 + (i % 2) * 14} ${sudut} 0"
      material="color: ${i % 2 ? "#5c7d4f" : "#6d9159"}; roughness: 0.8; side: double"></a-entity>`;
  }
  return out;
}

export function bangunMarkahDapur(): string {
  return `
<a-scene
  embedded
  vr-mode-ui="enabled: true"
  device-orientation-permission-ui="enabled: true"
  renderer="antialias: true; colorManagement: true"
  shadow="type: pcfsoft; autoUpdate: true"
  loading-screen="enabled: false"
  background="color: #101312"
  loop-permainan>

  <a-assets>
    <img id="tx-lantai" src="/textures/lantai.jpg" />
    <img id="tx-kayu" src="/textures/kayu.jpg" />
    <img id="tx-marmer" src="/textures/marmer.jpg" />
    <img id="tx-dinding" src="/textures/dinding.jpg" />
    <img id="tx-backsplash" src="/textures/backsplash.jpg" />
    <img id="img-pemandangan" src="/images/pemandangan.jpg" />
    <img id="img-pemandangan-gelap" src="/images/download (1).jpg" />
    <canvas id="kanvas-poster" width="512" height="640"></canvas>
    <canvas id="kanvas-panel" width="640" height="430"></canvas>
  </a-assets>

  <!-- ================= PEMAIN ================= -->
  <a-entity id="pemain"
    camera="fov: 72; near: 0.05; far: 60"
    position="-0.9 1.6 1.35"
    tampilan-sensitif
    gerak-pemain
    manajer-interaksi>
    <a-entity light="type: point; color: #fff2dc; intensity: 0.1; distance: 3.5" id="cahaya-kepala"></a-entity>
    <a-entity id="kursor-vr"
      geometry="primitive: ring; radiusInner: 0.008; radiusOuter: 0.015"
      material="color: #fbbf24; shader: flat; transparent: true; opacity: 0.9"
      position="0 0 -0.6" visible="false"></a-entity>
  </a-entity>

  <!-- ================= RUANG ================= -->
  <a-entity geometry="primitive: plane; width: 5; height: 4.5" rotation="-90 0 0"
    material="src: #tx-lantai; repeat: 3 2.6; roughness: 0.35; metalness: 0.04; color: #f2ede3" ${TERIMA}></a-entity>
  <a-entity geometry="primitive: plane; width: 5; height: 4.5" rotation="90 0 0" position="0 3 0"
    material="color: #efe9dd; roughness: 1"></a-entity>
  <a-entity geometry="primitive: plane; width: 5; height: 3" position="0 1.5 -2.25"
    material="src: #tx-dinding; repeat: 4 2.4; color: #f4ecdd; roughness: 0.96" ${TERIMA}></a-entity>
  <a-entity geometry="primitive: plane; width: 5; height: 3" position="0 1.5 2.25" rotation="0 180 0"
    material="src: #tx-dinding; repeat: 4 2.4; color: #f4ecdd; roughness: 0.96" ${TERIMA}></a-entity>
  <a-entity geometry="primitive: plane; width: 4.5; height: 3" position="-2.5 1.5 0" rotation="0 90 0"
    material="src: #tx-dinding; repeat: 3.6 2.4; color: #f4ecdd; roughness: 0.96" ${TERIMA}></a-entity>
  <!-- dinding kanan (dengan lubang jendela) -->
  <a-entity geometry="primitive: plane; width: 1.25; height: 3" position="2.5 1.5 -1.625" rotation="0 -90 0"
    material="src: #tx-dinding; repeat: 1.4 2.4; color: #f4ecdd; roughness: 0.96" ${TERIMA}></a-entity>
  <a-entity geometry="primitive: plane; width: 2.05; height: 3" position="2.5 1.5 1.225" rotation="0 -90 0"
    material="src: #tx-dinding; repeat: 2.2 2.4; color: #f4ecdd; roughness: 0.96" ${TERIMA}></a-entity>
  <a-entity geometry="primitive: plane; width: 1.2; height: 1.03" position="2.5 0.515 -0.4" rotation="0 -90 0"
    material="src: #tx-dinding; repeat: 1.2 1; color: #f4ecdd; roughness: 0.96" ${TERIMA}></a-entity>
  <a-entity geometry="primitive: plane; width: 1.2; height: 0.9" position="2.5 2.55 -0.4" rotation="0 -90 0"
    material="src: #tx-dinding; repeat: 1.2 0.9; color: #f4ecdd; roughness: 0.96" ${TERIMA}></a-entity>
  <!-- lis bawah -->
  <a-entity geometry="primitive: box; width: 5; height: 0.09; depth: 0.02" position="0 0.045 -2.24" material="color: #ded5c4; roughness: 0.9"></a-entity>
  <a-entity geometry="primitive: box; width: 5; height: 0.09; depth: 0.02" position="0 0.045 2.24" material="color: #ded5c4; roughness: 0.9"></a-entity>
  <a-entity geometry="primitive: box; width: 0.02; height: 0.09; depth: 4.5" position="-2.49 0.045 0" material="color: #ded5c4; roughness: 0.9"></a-entity>
  <a-entity geometry="primitive: box; width: 0.02; height: 0.09; depth: 4.5" position="2.49 0.045 0" material="color: #ded5c4; roughness: 0.9"></a-entity>

  <!-- karpet kerja -->
  <a-entity geometry="primitive: plane; width: 1.5; height: 1.0" rotation="-90 0 0" position="0.35 0.012 1.0" material="color: #b45a41; roughness: 1"></a-entity>
  <a-entity geometry="primitive: plane; width: 1.34; height: 0.86" rotation="-90 0 0" position="0.35 0.013 1.0" material="color: #c9704f; roughness: 1"></a-entity>
  <a-entity geometry="primitive: plane; width: 1.0; height: 0.55" rotation="-90 0 0" position="0.35 0.014 1.0" material="color: #d98d63; roughness: 1"></a-entity>

  <!-- ================= KABINET & MEJA KERJA BELAKANG ================= -->
  <a-entity geometry="primitive: box; width: 3.25; height: 0.84; depth: 0.62" position="-0.675 0.42 -1.89"
    material="src: #tx-kayu; repeat: 2.4 1; roughness: 0.6; color: #c99a68" ${BAYANGAN}></a-entity>
  <a-entity geometry="primitive: box; width: 3.21; height: 0.08; depth: 0.56" position="-0.675 0.04 -1.87" material="color: #3a2f26; roughness: 0.9"></a-entity>
  <a-entity geometry="primitive: box; width: 3.3; height: 0.05; depth: 0.68" position="-0.675 0.865 -1.88"
    material="src: #tx-marmer; repeat: 2.2 0.9; roughness: 0.22; metalness: 0.05" ${BAYANGAN}></a-entity>
  ${pintuKabinet()}
  <!-- backsplash -->
  <a-entity geometry="primitive: plane; width: 3.25; height: 0.62" position="-0.675 1.21 -2.243"
    material="src: #tx-backsplash; repeat: 3 0.6; roughness: 0.15; metalness: 0.02" ${TERIMA}></a-entity>
  <!-- strip LED bawah kabinet -->
  <a-entity id="strip-led-1" geometry="primitive: box; width: 0.74; height: 0.014; depth: 0.03" position="-1.9 1.538 -1.93"
    material="color: #7a6a52; emissive: #ffd9a0; emissiveIntensity: 0.9"></a-entity>
  <a-entity id="strip-led-2" geometry="primitive: box; width: 0.74; height: 0.014; depth: 0.03" position="-1.06 1.538 -1.93"
    material="color: #7a6a52; emissive: #ffd9a0; emissiveIntensity: 0.9"></a-entity>
  <a-entity id="cahaya-strip" light="type: point; color: #ffd9a0; intensity: 0.4; distance: 2.4" position="-1.45 1.45 -1.55"></a-entity>

  <!-- rel peralatan -->
  <a-entity geometry="primitive: cylinder; radius: 0.011; height: 0.55" position="-1.9 1.34 -2.02" rotation="0 0 90" material="color: #8f969e; metalness: 0.9; roughness: 0.25"></a-entity>
  <a-entity geometry="primitive: torus; radius: 0.025; radiusTubular: 0.005" position="-2.05 1.3 -2.02" material="color: #8f969e; metalness: 0.9; roughness: 0.25"></a-entity>
  <a-entity geometry="primitive: box; width: 0.045; height: 0.16; depth: 0.008" position="-2.05 1.2 -2.02" material="color: #d3d7db; metalness: 0.7; roughness: 0.35"></a-entity>
  <a-entity geometry="primitive: torus; radius: 0.025; radiusTubular: 0.005" position="-1.8 1.3 -2.02" material="color: #8f969e; metalness: 0.9; roughness: 0.25"></a-entity>
  <a-entity geometry="primitive: sphere; radius: 0.035" scale="1 0.6 1" position="-1.8 1.18 -2.02" material="color: #d3d7db; metalness: 0.7; roughness: 0.35"></a-entity>
  <a-entity geometry="primitive: cylinder; radius: 0.006; height: 0.09" position="-1.8 1.26 -2.02" material="color: #d3d7db; metalness: 0.7; roughness: 0.35"></a-entity>

  <!-- handuk -->
  <a-entity geometry="primitive: plane; width: 0.15; height: 0.24" position="-1.66 0.6 -1.555" rotation="0 0 4" material="color: #e9dfcc; roughness: 1; side: double"></a-entity>
  <a-entity geometry="primitive: plane; width: 0.15; height: 0.05" position="-1.66 0.565 -1.551" rotation="0 0 4" material="color: #c96f4a; roughness: 1; side: double"></a-entity>

  <!-- mangkuk buah -->
  <a-entity geometry="primitive: sphere; radius: 0.12" scale="1 0.42 1" position="0.32 0.905 -1.95" material="color: #e8e2d6; roughness: 0.4" ${BAYANGAN}></a-entity>
  <a-entity geometry="primitive: sphere; radius: 0.045" position="0.27 0.94 -1.92" material="color: #e8963c; roughness: 0.45"></a-entity>
  <a-entity geometry="primitive: sphere; radius: 0.045" position="0.37 0.94 -1.98" material="color: #e8963c; roughness: 0.45"></a-entity>
  <a-entity geometry="primitive: sphere; radius: 0.042" position="0.33 0.96 -1.94" material="color: #9db45c; roughness: 0.45"></a-entity>

  <!-- ================= KOMPOR (INTERAKTIF) ================= -->
  <a-entity id="kompor" class="interaktif"slot-model="slot: kompor" position="-1.3 0 -1.95">
    <a-entity geometry="primitive: box; width: 0.62; height: 0.045; depth: 0.52" position="0 0.895 0"
      material="color: #14161a; roughness: 0.18; metalness: 0.65" ${BAYANGAN}></a-entity>
    <a-entity geometry="primitive: torus; radius: 0.068; radiusTubular: 0.009" rotation="-90 0 0" position="-0.13 0.92 -0.11" material="color: #2a2d31; metalness: 0.7; roughness: 0.4"></a-entity>
    <a-entity geometry="primitive: torus; radius: 0.068; radiusTubular: 0.009" rotation="-90 0 0" position="0.13 0.92 -0.11" material="color: #2a2d31; metalness: 0.7; roughness: 0.4"></a-entity>
    <a-entity geometry="primitive: torus; radius: 0.068; radiusTubular: 0.009" rotation="-90 0 0" position="-0.13 0.92 0.11" material="color: #2a2d31; metalness: 0.7; roughness: 0.4"></a-entity>
    <a-entity geometry="primitive: torus; radius: 0.068; radiusTubular: 0.009" rotation="-90 0 0" position="0.13 0.92 0.11" material="color: #2a2d31; metalness: 0.7; roughness: 0.4"></a-entity>
    <a-entity geometry="primitive: cylinder; radius: 0.018; height: 0.02" rotation="90 0 0" position="-0.1 0.895 0.25" material="color: #c9ced4; metalness: 0.9; roughness: 0.2"></a-entity>
    <a-entity geometry="primitive: cylinder; radius: 0.018; height: 0.02" rotation="90 0 0" position="0.1 0.895 0.25" material="color: #c9ced4; metalness: 0.9; roughness: 0.2"></a-entity>
    <!-- panci di atas kompor (dapat digeser posisi tengah / tepi, atau diangkat) -->
    <a-entity id="grup-panci" class="tetap-tampil" position="-0.13 0 -0.11">
      <a-entity id="panci-mesh" geometry="primitive: cylinder; radius: 0.13; height: 0.14" position="0 0.99 0"
        material="color: #9fa8b2; metalness: 0.9; roughness: 0.32" ${BAYANGAN}></a-entity>
      <a-entity geometry="primitive: torus; radius: 0.11; radiusTubular: 0.012" rotation="-90 0 0" position="0 1.065 0" material="color: #878f99; metalness: 0.9; roughness: 0.3"></a-entity>
      <a-entity geometry="primitive: sphere; radius: 0.022" position="0 1.075 0" material="color: #2f3338; roughness: 0.5"></a-entity>
    </a-entity>
    <!-- api kompor (intensitas & visual adaptif mati, rendah, sedang, tinggi) -->
    <a-entity id="api-kompor" class="tetap-tampil" api-kompor position="-0.13 0.925 -0.11" visible="false">
      <!-- api biru inti (efisiensi tinggi) -->
      <a-entity id="api-biru" geometry="primitive: cone; radiusBottom: 0.05; radiusTop: 0.005; height: 0.07" position="0 0.035 0"
        material="color: #60a5fa; emissive: #3b82f6; emissiveIntensity: 2.5; transparent: true; opacity: 0.9; depthWrite: false"></a-entity>
      <!-- api oranye berkobar (intensitas tinggi) -->
      <a-entity id="api-oranye" geometry="primitive: cone; radiusBottom: 0.055; radiusTop: 0.007; height: 0.12" position="0.005 0.06 0.003"
        material="color: #ff9d2e; emissive: #ff7a00; emissiveIntensity: 2.2; transparent: true; opacity: 0.92; depthWrite: false"></a-entity>
      <a-entity id="api-kuning" geometry="primitive: cone; radiusBottom: 0.035; radiusTop: 0.004; height: 0.15" position="-0.008 0.075 -0.004"
        material="color: #ffd54f; emissive: #ffb300; emissiveIntensity: 2.4; transparent: true; opacity: 0.9; depthWrite: false"></a-entity>
      <a-entity id="cahaya-api" light="type: point; color: #ff8c3b; intensity: 0; distance: 2.2" position="0 0.28 0"></a-entity>
    </a-entity>
    <!-- uap panci -->
    <a-entity id="uap" class="tetap-tampil" uap-panci position="-0.13 1.1 -0.11" visible="false">
      <a-entity geometry="primitive: plane; width: 0.1; height: 0.13" material="color: #ffffff; transparent: true; opacity: 0.0; depthWrite: false; side: double"></a-entity>
      <a-entity geometry="primitive: plane; width: 0.08; height: 0.11" material="color: #ffffff; transparent: true; opacity: 0.0; depthWrite: false; side: double"></a-entity>
      <a-entity geometry="primitive: plane; width: 0.12; height: 0.15" material="color: #ffffff; transparent: true; opacity: 0.0; depthWrite: false; side: double"></a-entity>
    </a-entity>
  </a-entity>

  <!-- hood (dibungkus grup agar mengikuti kompor) -->
  <a-entity id="hood-grup" position="0 0 0" slot-model="slot: hood">
  <a-entity geometry="primitive: box; width: 0.7; height: 0.32; depth: 0.45" position="-1.3 2.16 -1.95"
    material="color: #ccd1d8; metalness: 0.85; roughness: 0.28" ${BAYANGAN}></a-entity>
  <a-entity geometry="primitive: box; width: 0.3; height: 0.72; depth: 0.28" position="-1.3 2.62 -1.98" material="color: #b8bec6; metalness: 0.85; roughness: 0.3"></a-entity>
  <a-entity geometry="primitive: box; width: 0.6; height: 0.02; depth: 0.4" position="-1.3 1.91 -1.95" material="color: #d8dde2; emissive: #ffe9c4; emissiveIntensity: 0.35"></a-entity>
  <!-- kipas hood (berputar saat menyala) -->
  <a-entity id="kipas-hood" position="-1.3 1.915 -1.95">
    <a-entity geometry="primitive: box; width: 0.26; height: 0.008; depth: 0.035" material="color: #5b6470; metalness: 0.6; roughness: 0.4"></a-entity>
    <a-entity geometry="primitive: box; width: 0.26; height: 0.008; depth: 0.035" rotation="0 60 0" material="color: #5b6470; metalness: 0.6; roughness: 0.4"></a-entity>
    <a-entity geometry="primitive: box; width: 0.26; height: 0.008; depth: 0.035" rotation="0 120 0" material="color: #5b6470; metalness: 0.6; roughness: 0.4"></a-entity>
  </a-entity>
  <a-entity id="led-hood" geometry="primitive: sphere; radius: 0.012" position="-1.05 2.02 -1.73"
    material="color: #3a3f45; emissiveIntensity: 0; emissive: #34d399"></a-entity>
  <a-entity id="hood" class="interaktif" geometry="primitive: box; width: 0.75; height: 0.45; depth: 0.55" position="-1.3 2.1 -1.9"
    material="color: #fbbf24; transparent: true; opacity: 0.001; depthWrite: false"></a-entity>
  </a-entity>

  <!-- ================= WASTAFEL ================= -->
  <a-entity geometry="primitive: box; width: 0.56; height: 0.2; depth: 0.42" position="-0.1 0.79 -1.92" material="color: #7c848d; metalness: 0.85; roughness: 0.35"></a-entity>
  <a-entity geometry="primitive: box; width: 0.5; height: 0.16; depth: 0.36" position="-0.1 0.83 -1.92" material="color: #4a5158; metalness: 0.7; roughness: 0.4"></a-entity>
  <a-entity geometry="primitive: cylinder; radius: 0.03; height: 0.05" position="-0.1 0.915 -2.1" material="color: #cdd4da; metalness: 0.95; roughness: 0.15"></a-entity>
  <a-entity geometry="primitive: cylinder; radius: 0.02; height: 0.3" position="-0.1 1.06 -2.1" material="color: #cdd4da; metalness: 0.95; roughness: 0.15"></a-entity>
  <a-entity geometry="primitive: torus; radius: 0.09; radiusTubular: 0.018; arc: 180" position="-0.1 1.2 -2.04" rotation="0 90 0" material="color: #cdd4da; metalness: 0.95; roughness: 0.15"></a-entity>
  <a-entity geometry="primitive: cylinder; radius: 0.016; height: 0.12" position="-0.1 1.14 -1.95" material="color: #cdd4da; metalness: 0.95; roughness: 0.15"></a-entity>
  <!-- keran wastafel (interaktif) -->
  <a-entity geometry="primitive: box; width: 0.05; height: 0.02; depth: 0.03" position="-0.04 1.22 -2.06" material="color: #3f7fae; metalness: 0.6; roughness: 0.3"></a-entity>
  <a-entity id="aliran-air" geometry="primitive: cylinder; radius: 0.013; height: 0.28" position="-0.1 1.0 -1.95"
    material="color: #9fd4f5; transparent: true; opacity: 0.0; emissive: #7dd3fc; emissiveIntensity: 0.25" visible="false"></a-entity>
  <a-entity id="wastafel" class="interaktif" slot-model="slot: wastafel" geometry="primitive: box; width: 0.62; height: 0.5; depth: 0.5" position="-0.1 1.05 -1.92"
    material="color: #fbbf24; transparent: true; opacity: 0.001; depthWrite: false"></a-entity>

  <!-- ================= RAK BUMBU (INTERAKTIF) ================= -->
  <a-entity id="rak-bumbu" class="interaktif" slot-model="slot: rak-bumbu" position="0.45 1.75 -2.14">
    <a-entity geometry="primitive: box; width: 0.84; height: 0.035; depth: 0.2" position="0 0 0" material="src: #tx-kayu; color: #c99a68; roughness: 0.6" ${BAYANGAN}></a-entity>
    <a-entity geometry="primitive: box; width: 0.84; height: 0.035; depth: 0.2" position="0 0.28 0" material="src: #tx-kayu; color: #c99a68; roughness: 0.6" ${BAYANGAN}></a-entity>
    <a-entity geometry="primitive: box; width: 0.03; height: 0.42; depth: 0.2" position="-0.42 0.14 0" material="color: #8a6a45; roughness: 0.6"></a-entity>
    <a-entity geometry="primitive: box; width: 0.03; height: 0.42; depth: 0.2" position="0.42 0.14 0" material="color: #8a6a45; roughness: 0.6"></a-entity>
    ${botolBumbu()}
  </a-entity>
  <!-- penanda zona nyaman rak -->
  <a-entity geometry="primitive: plane; width: 0.02; height: 0.6" position="1.02 1.2 -2.242" material="color: #7a8b6f; transparent: true; opacity: 0.35"></a-entity>

  <!-- ================= RAK PANCI BAWAH (INTERAKTIF) ================= -->
  <a-entity geometry="primitive: box; width: 0.6; height: 0.035; depth: 0.56" position="0.56 0.27 -1.89" material="src: #tx-kayu; color: #a97f52; roughness: 0.65"></a-entity>
  <a-entity geometry="primitive: cylinder; radius: 0.14; height: 0.12" position="0.48 0.35 -1.85" material="color: #4e565f; metalness: 0.8; roughness: 0.4"></a-entity>
  <a-entity geometry="primitive: cylinder; radius: 0.115; height: 0.1" position="0.5 0.45 -1.9" material="color: #5d6670; metalness: 0.8; roughness: 0.4"></a-entity>
  <a-entity geometry="primitive: cylinder; radius: 0.12; height: 0.045" position="0.72 0.315 -1.86" material="color: #33383e; metalness: 0.85; roughness: 0.35"></a-entity>
  <a-entity geometry="primitive: cylinder; radius: 0.012; height: 0.2" position="0.87 0.315 -1.83" rotation="0 0 78" material="color: #2b2f34; roughness: 0.5"></a-entity>
  <a-entity id="rak-bawah" class="interaktif" slot-model="slot: rak-bawah" geometry="primitive: box; width: 0.6; height: 0.55; depth: 0.55" position="0.56 0.32 -1.86"
    material="color: #fbbf24; transparent: true; opacity: 0.001; depthWrite: false"></a-entity>

  <!-- ================= KULKAS (INTERAKTIF) ================= -->
  <a-entity id="kulkas" class="interaktif" slot-model="slot: kulkas" position="1.25 0 -1.86">
    <a-entity geometry="primitive: box; width: 0.72; height: 1.84; depth: 0.62" position="0 0.92 0"
      material="color: #c9ced4; metalness: 0.65; roughness: 0.32" ${BAYANGAN}></a-entity>
    <!-- rongga & isi (terlihat saat pintu terbuka) -->
    <a-entity geometry="primitive: box; width: 0.62; height: 0.78; depth: 0.05" position="0 0.88 0.29" material="color: #10151a; roughness: 0.9"></a-entity>
    <a-entity geometry="primitive: box; width: 0.58; height: 0.015; depth: 0.05" position="0 0.62 0.315" material="color: #cfe3f0; transparent: true; opacity: 0.75"></a-entity>
    <a-entity geometry="primitive: box; width: 0.58; height: 0.015; depth: 0.05" position="0 0.83 0.315" material="color: #cfe3f0; transparent: true; opacity: 0.75"></a-entity>
    <a-entity geometry="primitive: box; width: 0.58; height: 0.015; depth: 0.05" position="0 1.04 0.315" material="color: #cfe3f0; transparent: true; opacity: 0.75"></a-entity>
    <a-entity geometry="primitive: cylinder; radius: 0.035; height: 0.12" position="-0.15 0.7 0.31" material="color: #d95f43; roughness: 0.4"></a-entity>
    <a-entity geometry="primitive: cylinder; radius: 0.032; height: 0.1" position="0.05 0.69 0.31" material="color: #e8c547; roughness: 0.4"></a-entity>
    <a-entity geometry="primitive: box; width: 0.12; height: 0.08; depth: 0.05" position="0.18 0.9 0.31" material="color: #8fbf6f; roughness: 0.5"></a-entity>
    <a-entity id="cahaya-kulkas" light="type: point; color: #cfe9ff; intensity: 0; distance: 1.3" position="0 0.95 0.5"></a-entity>
    <!-- pintu freezer (tetap) -->
    <a-entity geometry="primitive: box; width: 0.68; height: 0.5; depth: 0.035" position="0 1.55 0.32" material="color: #b9bfc7; metalness: 0.7; roughness: 0.3" ${BAYANGAN}></a-entity>
    <a-entity geometry="primitive: cylinder; radius: 0.013; height: 0.28" position="0.28 1.42 0.35" material="color: #aab2ba; metalness: 0.9; roughness: 0.2"></a-entity>
  </a-entity>

  <!-- ================= JENDELA VENTILASI (INTERAKTIF) ================= -->
  <a-entity geometry="primitive: plane; width: 1.38; height: 1.28" position="2.62 1.565 -0.4" rotation="0 -90 0"
    material="src: #img-pemandangan; shader: flat" id="pemandangan"></a-entity>
  <a-entity id="peredup-jendela" geometry="primitive: plane; width: 1.38; height: 1.28" position="2.615 1.565 -0.4" rotation="0 -90 0"
    material="color: #0a0f1c; transparent: true; opacity: 0"></a-entity>
  <!-- rangka jendela -->
  <a-entity geometry="primitive: box; width: 0.1; height: 0.07; depth: 1.46" position="2.47 2.1 -0.4" material="color: #f0ebe0; roughness: 0.7" ${BAYANGAN}></a-entity>
  <a-entity geometry="primitive: box; width: 0.12; height: 0.06; depth: 1.46" position="2.46 1.02 -0.4" material="color: #f0ebe0; roughness: 0.7" ${BAYANGAN}></a-entity>
  <a-entity geometry="primitive: box; width: 0.1; height: 1.14; depth: 0.07" position="2.47 1.56 -1.1" material="color: #f0ebe0; roughness: 0.7"></a-entity>
  <a-entity geometry="primitive: box; width: 0.1; height: 1.14; depth: 0.07" position="2.47 1.56 0.3" material="color: #f0ebe0; roughness: 0.7"></a-entity>
  <a-entity geometry="primitive: box; width: 0.06; height: 1.06; depth: 0.03" position="2.47 1.56 -0.4" material="color: #e5dfd2; roughness: 0.7"></a-entity>
  <!-- kaca atas (tetap) -->
  <a-entity geometry="primitive: plane; width: 1.14; height: 0.5" position="2.45 1.82 -0.4" rotation="0 -90 0"
    material="color: #bcd6e8; transparent: true; opacity: 0.22; side: double"></a-entity>
  <!-- daun jendela geser (bawah) -->
  <a-entity id="daun-jendela" position="2.44 1.28 -0.4">
    <a-entity geometry="primitive: plane; width: 1.14; height: 0.5" rotation="0 -90 0" material="color: #bcd6e8; transparent: true; opacity: 0.28; side: double"></a-entity>
    <a-entity geometry="primitive: box; width: 0.035; height: 0.05; depth: 1.18" position="0 0.27 0" material="color: #f0ebe0; roughness: 0.7"></a-entity>
    <a-entity geometry="primitive: box; width: 0.035; height: 0.05; depth: 1.18" position="0 -0.27 0" material="color: #f0ebe0; roughness: 0.7"></a-entity>
    <a-entity geometry="primitive: box; width: 0.035; height: 0.58; depth: 0.05" position="0 0 -0.57" material="color: #f0ebe0; roughness: 0.7"></a-entity>
    <a-entity geometry="primitive: box; width: 0.035; height: 0.58; depth: 0.05" position="0 0 0.57" material="color: #f0ebe0; roughness: 0.7"></a-entity>
    <a-entity geometry="primitive: box; width: 0.03; height: 0.04; depth: 0.2" position="-0.03 -0.22 0" material="color: #c9a86a; metalness: 0.6; roughness: 0.4"></a-entity>
  </a-entity>
  <!-- aliran udara masuk -->
  <a-entity id="aliran-udara" aliran-udara position="2.38 1.3 -0.4" visible="false">
    <a-entity geometry="primitive: torus; radius: 0.16; radiusTubular: 0.005; arc: 110" rotation="0 90 30" material="color: #ffffff; transparent: true; opacity: 0; depthWrite: false"></a-entity>
    <a-entity geometry="primitive: torus; radius: 0.12; radiusTubular: 0.005; arc: 110" rotation="0 90 -20" position="0 0.12 0.15" material="color: #ffffff; transparent: true; opacity: 0; depthWrite: false"></a-entity>
    <a-entity geometry="primitive: torus; radius: 0.2; radiusTubular: 0.005; arc: 100" rotation="0 90 60" position="0 -0.08 -0.12" material="color: #ffffff; transparent: true; opacity: 0; depthWrite: false"></a-entity>
  </a-entity>
  <a-entity id="ventilasi" class="interaktif" slot-model="slot: ventilasi" geometry="primitive: box; width: 0.25; height: 1.2; depth: 1.4" position="2.4 1.55 -0.4"
    material="color: #fbbf24; transparent: true; opacity: 0.001; depthWrite: false"></a-entity>

  <!-- ================= PULAU MEJA POTONG (INTERAKTIF) ================= -->
  <a-entity id="meja-rangka" class="interaktif" slot-model="slot: meja-atas" position="-0.45 0 -0.55">
  <a-entity id="meja-kaki-kiri" geometry="primitive: box; width: 0.06; height: 1; depth: 0.56" position="-0.56 0.39 0" material="src: #tx-kayu; color: #8a6a45; roughness: 0.6" ${BAYANGAN}></a-entity>
  <a-entity id="meja-kaki-kanan" geometry="primitive: box; width: 0.06; height: 1; depth: 0.56" position="0.56 0.39 0" material="src: #tx-kayu; color: #8a6a45; roughness: 0.6" ${BAYANGAN}></a-entity>
  <a-entity id="meja-palang" geometry="primitive: box; width: 1.06; height: 0.06; depth: 0.05" position="0 0.12 0" material="color: #6e5636; roughness: 0.7"></a-entity>
  <a-entity id="meja-atas" class="interaktif" position="0 0.78 0">
    <a-entity id="meja-potong" class="interaktif" geometry="primitive: box; width: 1.28; height: 0.5; depth: 0.7" position="0 -0.2 0"
      material="color: #fbbf24; transparent: true; opacity: 0.001; depthWrite: false"></a-entity>
    <a-entity id="meja-permukaan" geometry="primitive: box; width: 1.24; height: 0.06; depth: 0.66" position="0 -0.03 0"
      material="src: #tx-marmer; repeat: 1.6 0.9; roughness: 0.22; metalness: 0.05" ${BAYANGAN}></a-entity>
  </a-entity>
  <a-entity id="talenan" class="interaktif tetap-tampil" slot-model="slot: talenan" position="0 0.78 0">
    <a-entity geometry="primitive: box; width: 0.42; height: 0.018; depth: 0.3" position="-0.25 0.012 0" material="color: #cfa46f; roughness: 0.55" ${BAYANGAN}></a-entity>
    <a-entity id="pisau" geometry="primitive: box; width: 0.17; height: 0.004; depth: 0.032" position="-0.1 0.024 0.09" rotation="0 -18 0" material="color: #d7dce1; metalness: 0.9; roughness: 0.2"></a-entity>
    <a-entity geometry="primitive: box; width: 0.09; height: 0.014; depth: 0.026" position="0.035 0.028 0.115" rotation="0 -18 0" material="color: #2f3338; roughness: 0.5"></a-entity>
    <a-entity id="tomat-utuh" class="tetap-tampil">
      <a-entity geometry="primitive: sphere; radius: 0.045" position="0.28 0.045 0.1" material="color: #d84a3a; roughness: 0.35"></a-entity>
      <a-entity geometry="primitive: sphere; radius: 0.042" position="0.37 0.042 -0.08" material="color: #d84a3a; roughness: 0.35"></a-entity>
      <a-entity geometry="primitive: cylinder; radius: 0.008; height: 0.02" position="0.28 0.09 0.1" material="color: #4d6e3a; roughness: 0.6"></a-entity>
    </a-entity>
    <a-entity id="tomat-iris" class="tetap-tampil" visible="false">
      <a-entity geometry="primitive: cylinder; radius: 0.04; height: 0.012" position="0.26 0.03 0.08" material="color: #d84a3a; roughness: 0.4"></a-entity>
      <a-entity geometry="primitive: cylinder; radius: 0.038; height: 0.012" position="0.3 0.042 0.05" rotation="0 0 12" material="color: #e05a48; roughness: 0.4"></a-entity>
      <a-entity geometry="primitive: cylinder; radius: 0.036; height: 0.012" position="0.22 0.03 0.02" rotation="0 25 0" material="color: #d84a3a; roughness: 0.4"></a-entity>
      <a-entity geometry="primitive: cylinder; radius: 0.034; height: 0.012" position="0.34 0.03 -0.05" rotation="0 -20 -8" material="color: #e05a48; roughness: 0.4"></a-entity>
      <a-entity geometry="primitive: cylinder; radius: 0.032; height: 0.012" position="0.28 0.054 0.0" rotation="0 40 15" material="color: #d84a3a; roughness: 0.4"></a-entity>
    </a-entity>
    <a-entity geometry="primitive: box; width: 0.07; height: 0.006; depth: 0.02" position="-0.31 0.024 -0.07" material="color: #7d9b4e; roughness: 0.7"></a-entity>
    <a-entity geometry="primitive: box; width: 0.06; height: 0.006; depth: 0.02" position="-0.22 0.024 -0.09" rotation="0 30 0" material="color: #7d9b4e; roughness: 0.7"></a-entity>
  </a-entity>
  </a-entity>

  <!-- ================= LAMPU GANTUNG MEJA (INTERAKTIF) ================= -->
  <a-entity id="gantungan-lampu" position="0 0 0">
  <a-entity geometry="primitive: cylinder; radius: 0.006; height: 1.0" position="-0.45 2.5 -0.55" material="color: #1c1f22; roughness: 0.6"></a-entity>
    <a-entity geometry="primitive: cone; radiusBottom: 0.17; radiusTop: 0.055; height: 0.16" position="-0.45 2.02 -0.55"
    material="color: #232629; metalness: 0.75; roughness: 0.35; side: double" ${BAYANGAN}></a-entity>
  <a-entity id="bola-lampu" geometry="primitive: sphere; radius: 0.045" position="-0.45 1.94 -0.55"
    material="color: #fff1cf; emissive: #ffd9a0; emissiveIntensity: 1.6"></a-entity>
  <a-entity id="kerucut-cahaya" geometry="primitive: cone; radiusBottom: 0.5; radiusTop: 0.12; height: 1.0; openEnded: true" position="-0.45 1.42 -0.55"
    material="color: #ffe9c0; transparent: true; opacity: 0.0; side: double; depthWrite: false; emissive: #ffe9c0; emissiveIntensity: 0.25"></a-entity>
  <a-entity id="sorot-meja" light="type: point; color: #ffd9a0; intensity: 0.9; distance: 2.4; decay: 2" position="-0.45 1.7 -0.55"></a-entity>
  <a-entity id="lampu-meja" class="interaktif" slot-model="slot: lampu-meja" geometry="primitive: cylinder; radius: 0.2; height: 0.3" position="-0.45 1.98 -0.55"
    material="color: #fbbf24; transparent: true; opacity: 0.001; depthWrite: false"></a-entity>
  </a-entity>

  <!-- lampu plafon -->
  <a-entity id="cahaya-umum" light="type: point; color: #ffedd0; intensity: 0.85; distance: 9; decay: 1" position="0.2 2.55 0.1"></a-entity>
  <a-entity id="plafon-1" geometry="primitive: circle; radius: 0.09" rotation="90 0 0" position="-1.5 2.985 0.5" material="color: #efe8d8; emissive: #fff2d8; emissiveIntensity: 1.2"></a-entity>
  <a-entity id="plafon-2" geometry="primitive: circle; radius: 0.09" rotation="90 0 0" position="0.8 2.985 0.9" material="color: #efe8d8; emissive: #fff2d8; emissiveIntensity: 1.2"></a-entity>
  <a-entity id="plafon-3" geometry="primitive: circle; radius: 0.09" rotation="90 0 0" position="1.6 2.985 -1.2" material="color: #efe8d8; emissive: #fff2d8; emissiveIntensity: 1.2"></a-entity>

  <!-- saklar lampu utama -->
  <a-entity id="saklar-lampu" class="interaktif" position="1.9 1.25 2.243" rotation="0 180 0">
    <a-entity geometry="primitive: box; width: 0.09; height: 0.14; depth: 0.015" material="color: #eee8dc; roughness: 0.5"></a-entity>
    <a-entity id="tuas-saklar" geometry="primitive: box; width: 0.03; height: 0.05; depth: 0.02" position="0 0.005 0.015" rotation="18 0 0" material="color: #c96f4a; roughness: 0.5"></a-entity>
  </a-entity>

  <!-- ================= PANEL SKOR & POSTER ================= -->
  <a-entity geometry="primitive: box; width: 0.02; height: 0.75; depth: 1.06" position="2.495 1.62 1.0" material="color: #3a2f26; roughness: 0.7"></a-entity>
  <a-entity id="papan-skor" class="interaktif" panel-skor geometry="primitive: plane; width: 1.0; height: 0.67" position="2.48 1.62 1.0"
    rotation="0 -90 0" material="src: #kanvas-panel; shader: flat"></a-entity>

  <!-- ================= STASIUN PENGUKUR TUBUH (INTERAKTIF) ================= -->
  <a-entity geometry="primitive: box; width: 0.03; height: 2.0; depth: 0.28" position="-2.47 1.0 1.0"
    material="color: #f0ebe0; roughness: 0.7" ${TERIMA}></a-entity>
  <a-entity geometry="primitive: box; width: 0.035; height: 0.03; depth: 0.3" position="-2.455 1.0 1.0" material="color: #c96f4a; roughness: 0.6"></a-entity>
  ${[0.4, 0.7, 1.3, 1.6, 1.9]
    .map(
      (y) =>
        `<a-entity geometry="primitive: box; width: 0.03; height: 0.012; depth: ${y === 1.6 ? 0.26 : 0.16}" position="-2.453 ${y} ${y === 1.6 ? 1.0 : 1.06}" material="color: ${y === 1.6 ? "#c96f4a" : "#8a8478"}; roughness: 0.7"></a-entity>`
    )
    .join("")}
  <a-entity geometry="primitive: box; width: 0.06; height: 0.42; depth: 0.34" position="-2.44 2.2 1.0" material="color: #24303a; roughness: 0.5" ${BAYANGAN}></a-entity>
  <a-entity id="layar-ukur" geometry="primitive: plane; width: 0.3; height: 0.34" position="-2.405 2.2 1.0" rotation="0 90 0"
    material="color: #1b2a24; emissive: #34d399; emissiveIntensity: 0.35"></a-entity>
  <a-entity geometry="primitive: circle; radius: 0.16" rotation="-90 0 0" position="-2.18 0.014 1.0" material="color: #c96f4a; transparent: true; opacity: 0.45"></a-entity>
  <a-entity id="stasiun-ukur" class="interaktif" slot-model="slot: stasiun-ukur" geometry="primitive: box; width: 0.55; height: 2.2; depth: 0.6" position="-2.28 1.1 1.0"
    material="color: #fbbf24; transparent: true; opacity: 0.001; depthWrite: false"></a-entity>

  <a-entity geometry="primitive: box; width: 0.02; height: 0.78; depth: 0.62" position="-2.495 1.66 -0.3" material="color: #3a2f26; roughness: 0.7"></a-entity>
  <a-entity poster-ergonomi geometry="primitive: plane; width: 0.56; height: 0.7" position="-2.48 1.66 -0.3" rotation="0 90 0"
    material="src: #kanvas-poster; shader: flat"></a-entity>

  <!-- jam dinding -->
  <a-entity geometry="primitive: cylinder; radius: 0.15; height: 0.03" rotation="90 0 0" position="1.55 2.3 -2.235" material="color: #f3ecdd; roughness: 0.4" ${BAYANGAN}></a-entity>
  <a-entity geometry="primitive: torus; radius: 0.15; radiusTubular: 0.012" position="1.55 2.3 -2.225" material="color: #3a2f26; roughness: 0.6"></a-entity>
  <a-entity geometry="primitive: box; width: 0.012; height: 0.09; depth: 0.005" position="1.55 2.34 -2.23" rotation="0 0 -35" material="color: #24303a"></a-entity>
  <a-entity geometry="primitive: box; width: 0.009; height: 0.12; depth: 0.005" position="1.58 2.31 -2.23" rotation="0 0 -110" material="color: #c96f4a"></a-entity>

  <!-- tanaman hias -->
  <a-entity position="-2.2 0 1.85">
    <a-entity geometry="primitive: cylinder; radius: 0.135; height: 0.3" position="0 0.15 0" material="color: #b56545; roughness: 0.7" ${BAYANGAN}></a-entity>
    <a-entity geometry="primitive: cylinder; radius: 0.125; height: 0.03" position="0 0.29 0" material="color: #3d2f22; roughness: 1"></a-entity>
    ${tanaman()}
  </a-entity>

  <!-- cincin penanda target interaksi -->
  <a-entity id="cincin-target" geometry="primitive: torus; radius: 0.3; radiusTubular: 0.007" rotation="-90 0 0"
    material="color: #fbbf24; emissive: #f59e0b; emissiveIntensity: 1.4; transparent: true; opacity: 0.85; depthWrite: false"
    position="0 -5 0" visible="false"></a-entity>

  <!-- Grid bantu Mode Tata Letak -->
  <a-entity id="grid-tata" visible="false" position="0 0.008 0">
    ${(() => { let g = ""; for (let i = -10; i <= 10; i++) {
      const v = i * 0.25;
      g += `<a-entity geometry="primitive: plane; width: 5; height: 0.006" rotation="-90 0 0" position="0 0 ${v}" material="color: #fbbf24; transparent: true; opacity: 0.16; shader: flat"></a-entity>`;
      g += `<a-entity geometry="primitive: plane; width: 0.006; height: 4.5" rotation="-90 0 0" position="${v} 0 0" material="color: #fbbf24; transparent: true; opacity: 0.16; shader: flat"></a-entity>`;
    } return g; })()}
  </a-entity>

  <!-- Pratinjau hijau lokasi benda yang sedang dipindahkan -->
  <a-entity id="hantu-tata" visible="false" position="0 0.02 0">
    <a-entity id="hantu-bentuk" geometry="primitive: box; width: 0.8; height: 0.8; depth: 0.6"
      position="0 0.4 0" material="color: #34d399; transparent: true; opacity: 0.28; shader: flat; side: double"></a-entity>
    <a-entity geometry="primitive: circle; radius: 0.42" rotation="-90 0 0"
      material="color: #34d399; transparent: true; opacity: 0.22; shader: flat"></a-entity>
    <a-entity geometry="primitive: torus; radius: 0.44; radiusTubular: 0.012" rotation="-90 0 0"
      material="color: #34d399; emissive: #34d399; emissiveIntensity: 1.2; transparent: true; opacity: 0.85"></a-entity>
  </a-entity>

  <!-- ================= CAHAYA LINGKUNGAN ================= -->
  <a-entity id="cahaya-ambien" light="type: ambient; color: #f7ecd9; intensity: 0.5"></a-entity>
  <a-entity id="cahaya-hemisfer" light="type: hemisphere; color: #fff3e0; groundColor: #8a7a66; intensity: 0.32"></a-entity>
  <a-entity id="cahaya-matahari" light="type: directional; color: #ffd9a8; intensity: 0.95; castShadow: true; shadowMapWidth: 2048; shadowMapHeight: 2048; shadowCameraLeft: -5; shadowCameraRight: 5; shadowCameraTop: 5; shadowCameraBottom: -5; shadowCameraNear: 1; shadowCameraFar: 14"
    position="4.2 3.1 -0.4"></a-entity>
</a-scene>
`;
}
