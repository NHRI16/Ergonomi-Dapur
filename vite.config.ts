import path from "path";
import fs from "fs";
import crypto from "crypto";
import { execFile } from "child_process";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import type { IncomingMessage, ServerResponse } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Helper: parse multipart/form-data secara manual ─────────────────────────
function parseBoundary(contentType: string): string | null {
  const m = contentType.match(/boundary=([^\s;]+)/);
  return m ? m[1] : null;
}

function parseMultipart(
  body: Buffer,
  boundary: string,
): { filename: string; data: Buffer; slotId: string } | null {
  const sep = Buffer.from("--" + boundary);
  const parts: Buffer[] = [];
  let start = 0;
  while (true) {
    const idx = body.indexOf(sep, start);
    if (idx === -1) break;
    if (start !== 0) parts.push(body.slice(start, idx - 2)); // strip \r\n before boundary
    start = idx + sep.length + 2; // skip \r\n after boundary
  }

  let slotId = "";
  let berkas: { filename: string; data: Buffer } | null = null;
  for (const part of parts) {
    const headerEnd = part.indexOf("\r\n\r\n");
    if (headerEnd === -1) continue;
    const header = part.slice(0, headerEnd).toString();
    const data = part.slice(headerEnd + 4);
    const nameMatch = header.match(/name="([^"]+)"/);

    const fnMatch = header.match(/filename="([^"]+)"/);
    if (!fnMatch) {
      if (nameMatch?.[1] === "slotId") slotId = data.toString().trim();
      continue;
    }
    const filename = path.basename(fnMatch[1]);
    berkas = { filename, data };
  }
  return berkas ? { ...berkas, slotId } : null;
}

// ─── Resolve nama file yang aman (hindari overwrite tanpa konfirmasi) ─────────
function namaAman(dir: string, nama: string): string {
  const ext = path.extname(nama);
  const base = path.basename(nama, ext);
  let kandidat = nama;
  let counter = 1;
  while (fs.existsSync(path.join(dir, kandidat))) {
    kandidat = `${base}_${counter}${ext}`;
    counter++;
  }
  return kandidat;
}

function cariBerkasSama(dir: string, data: Buffer, ekstensi: string): string | null {
  const hash = crypto.createHash("sha256").update(data).digest("hex");
  if (!fs.existsSync(dir)) return null;
  for (const nama of fs.readdirSync(dir)) {
    if (path.extname(nama).toLowerCase() !== ekstensi) continue;
    const tujuan = path.join(dir, nama);
    if (fs.statSync(tujuan).isFile()) {
      const hashLama = crypto.createHash("sha256").update(fs.readFileSync(tujuan)).digest("hex");
      if (hashLama === hash) return nama;
    }
  }
  return null;
}

function stageModelFiles(...files: string[]) {
  execFile("git", ["add", "--", ...files], { cwd: __dirname }, (error) => {
    if (error) console.warn("[upload-model] File tersimpan, tetapi gagal di-stage Git:", error.message);
  });
}

type ManifestSlot = Record<string, Partial<{
  jalur: string;
  skala: number;
  putarY: number;
  offsetY: number;
  sembunyikanPrimitif: boolean;
}>>;

function pluginKatalogModel(): Plugin {
  const modelsDir = path.resolve(__dirname, "public/models");
  const manifestPath = path.join(modelsDir, "slot-model.json");
  const clients = new Set<ServerResponse>();

  const bacaManifest = (): ManifestSlot => {
    try {
      return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as ManifestSlot;
    } catch {
      return {};
    }
  };

  const simpanManifest = (manifest: ManifestSlot) => {
    fs.mkdirSync(modelsDir, { recursive: true });
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  };

  const kirim = (res: ServerResponse, manifest: ManifestSlot) => {
    res.write(`event: katalog\ndata: ${JSON.stringify(manifest)}\n\n`);
  };

  const siarkan = (manifest: ManifestSlot) => {
    clients.forEach((client) => {
      try {
        kirim(client, manifest);
      } catch {
        clients.delete(client);
      }
    });
  };

  siarkanKatalog = siarkan;

  const json = (res: ServerResponse, status: number, data: unknown) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };

  const validasiId = (id: unknown): id is string =>
    typeof id === "string" && /^[a-z0-9-]+$/.test(id);

  const validasiPatch = (patch: unknown): patch is Record<string, unknown> => {
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) return false;
    const nilai = patch as Record<string, unknown>;
    const kunciDiizinkan = ["jalur", "skala", "putarY", "offsetY", "sembunyikanPrimitif"];
    if (Object.keys(nilai).some((kunci) => !kunciDiizinkan.includes(kunci))) return false;
    if (nilai.jalur !== undefined && typeof nilai.jalur !== "string") return false;
    if (nilai.skala !== undefined && (typeof nilai.skala !== "number" || !Number.isFinite(nilai.skala))) return false;
    if (nilai.putarY !== undefined && (typeof nilai.putarY !== "number" || !Number.isFinite(nilai.putarY))) return false;
    if (nilai.offsetY !== undefined && (typeof nilai.offsetY !== "number" || !Number.isFinite(nilai.offsetY))) return false;
    return nilai.sembunyikanPrimitif === undefined || typeof nilai.sembunyikanPrimitif === "boolean";
  };

  return {
    name: "katalog-model-realtime",
    configureServer(server) {
      server.middlewares.use("/api/catalog/events", (_req: IncomingMessage, res: ServerResponse) => {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
        });
        clients.add(res);
        kirim(res, bacaManifest());
        res.on("close", () => clients.delete(res));
      });

      server.middlewares.use("/api/catalog", (req: IncomingMessage, res: ServerResponse) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        if (req.method === "OPTIONS") return res.end();

        if (req.method === "GET") return json(res, 200, { ok: true, slots: bacaManifest() });

        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer) => chunks.push(chunk));
        req.on("end", () => {
          try {
            const payload = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { id?: unknown; patch?: unknown };
            const manifest = bacaManifest();
            if (req.method === "POST" && payload.id === "__reset__") {
              simpanManifest({});
              stageModelFiles("public/models/slot-model.json");
              siarkan({});
              return json(res, 200, { ok: true, slots: {} });
            }
            if (req.method !== "PATCH" || !validasiId(payload.id) || !validasiPatch(payload.patch)) {
              return json(res, 400, { ok: false, error: "Payload katalog tidak valid" });
            }
            manifest[payload.id] = { ...(manifest[payload.id] ?? {}), ...payload.patch };
            simpanManifest(manifest);
            stageModelFiles("public/models/slot-model.json");
            siarkan(manifest);
            return json(res, 200, { ok: true, slots: manifest });
          } catch (err) {
            return json(res, 400, { ok: false, error: `JSON tidak valid: ${String(err)}` });
          }
        });
      });

    },
  };
}

let siarkanKatalog: ((manifest: ManifestSlot) => void) | null = null;

// ─── Vite plugin: endpoint upload model ──────────────────────────────────────
function pluginUploadModel(): Plugin {
  const modelsDir = path.resolve(__dirname, "public/models");

  return {
    name: "upload-model",
    // Hanya aktif di dev server
    configureServer(server) {
      server.middlewares.use(
        "/api/upload-model",
        (req: IncomingMessage, res: ServerResponse) => {
          // CORS headers agar fetch dari browser tidak diblokir
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");

          if (req.method === "OPTIONS") {
            res.writeHead(204);
            res.end();
            return;
          }

          if (req.method !== "POST") {
            res.writeHead(405);
            res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
            return;
          }

          const contentType = req.headers["content-type"] ?? "";
          const boundary = parseBoundary(contentType);

          if (!boundary) {
            res.writeHead(400);
            res.end(JSON.stringify({ ok: false, error: "Missing boundary" }));
            return;
          }

          // Kumpulkan body
          const chunks: Buffer[] = [];
          req.on("data", (chunk: Buffer) => chunks.push(chunk));
          req.on("end", () => {
            try {
              const body = Buffer.concat(chunks);
              const parsed = parseMultipart(body, boundary);

              if (!parsed) {
                res.writeHead(400);
                res.end(
                  JSON.stringify({ ok: false, error: "Tidak ada file ditemukan dalam body" }),
                );
                return;
              }

              const { filename, data } = parsed;

              // Validasi ekstensi
              if (!/\.(glb|gltf)$/i.test(filename)) {
                res.writeHead(400);
                res.end(
                  JSON.stringify({ ok: false, error: "Format tidak didukung. Gunakan .glb atau .gltf" }),
                );
                return;
              }

              // Pastikan folder ada
              if (!fs.existsSync(modelsDir)) {
                fs.mkdirSync(modelsDir, { recursive: true });
              }

              const ekstensi = path.extname(filename).toLowerCase();
              const namaFinal = cariBerkasSama(modelsDir, data, ekstensi) ?? namaAman(modelsDir, filename);
              const tujuan = path.join(modelsDir, namaFinal);
              if (!fs.existsSync(tujuan)) fs.writeFileSync(tujuan, data);

              if (parsed.slotId) {
                const manifestPath = path.join(modelsDir, "slot-model.json");
                let manifest: Record<string, Record<string, string>> = {};
                try {
                  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
                } catch {
                  /* buat manifest baru bila belum ada */
                }
                manifest[parsed.slotId] = { ...(manifest[parsed.slotId] ?? {}), jalur: `/models/${namaFinal}` };
                fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
                siarkanKatalog?.(manifest);
                stageModelFiles(`public/models/${namaFinal}`, "public/models/slot-model.json");
              } else {
                stageModelFiles(`public/models/${namaFinal}`);
              }

              const jalur = `/models/${namaFinal}`;
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ ok: true, path: jalur, filename: namaFinal }));
            } catch (err) {
              console.error("[upload-model]", err);
              res.writeHead(500);
              res.end(JSON.stringify({ ok: false, error: String(err) }));
            }
          });

          req.on("error", (err: Error) => {
            console.error("[upload-model] stream error", err);
            res.writeHead(500);
            res.end(JSON.stringify({ ok: false, error: String(err) }));
          });
        },
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [pluginKatalogModel(), pluginUploadModel(), react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
