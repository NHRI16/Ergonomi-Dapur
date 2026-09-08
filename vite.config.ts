import path from "path";
import fs from "fs";
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
): { filename: string; data: Buffer } | null {
  const sep = Buffer.from("--" + boundary);
  const parts: Buffer[] = [];
  let start = 0;
  while (true) {
    const idx = body.indexOf(sep, start);
    if (idx === -1) break;
    if (start !== 0) parts.push(body.slice(start, idx - 2)); // strip \r\n before boundary
    start = idx + sep.length + 2; // skip \r\n after boundary
  }

  for (const part of parts) {
    const headerEnd = part.indexOf("\r\n\r\n");
    if (headerEnd === -1) continue;
    const header = part.slice(0, headerEnd).toString();
    const data = part.slice(headerEnd + 4);

    const fnMatch = header.match(/filename="([^"]+)"/);
    if (!fnMatch) continue;
    const filename = path.basename(fnMatch[1]);
    return { filename, data };
  }
  return null;
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

              const namaFinal = namaAman(modelsDir, filename);
              const tujuan = path.join(modelsDir, namaFinal);
              fs.writeFileSync(tujuan, data);

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
  plugins: [pluginUploadModel(), react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
