import fs from "fs";
import type { NextRequest } from "next/server";

const DOCS_ROOT = process.env.MARKSHELF_ROOT || process.cwd();
const IGNORE_PATTERNS = [
  /(^|\/)node_modules(\/|$)/,
  /(^|\/)\.git(\/|$)/,
  /(^|\/)\.next(\/|$)/,
  /(^|\/)dist(\/|$)/,
  /(^|\/)\.turbo(\/|$)/,
];

function isIgnored(rel: string): boolean {
  if (rel.startsWith(".")) return true;
  return IGNORE_PATTERNS.some((p) => p.test(rel));
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  let watcher: fs.FSWatcher | null = null;
  let keepAlive: ReturnType<typeof setInterval> | null = null;
  let closed = false;

  const cleanup = () => {
    if (closed) return;
    closed = true;
    try {
      watcher?.close();
    } catch {
      /* ignore */
    }
    if (keepAlive) clearInterval(keepAlive);
  };

  request.signal.addEventListener("abort", cleanup);

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: object) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          cleanup();
        }
      };

      send("connected", { root: DOCS_ROOT });

      try {
        watcher = fs.watch(
          DOCS_ROOT,
          { recursive: true, persistent: false },
          (_eventType, filename) => {
            if (!filename) return;
            const rel = String(filename).replace(/\\/g, "/");
            if (isIgnored(rel)) return;
            send("change", { path: rel });
          },
        );
      } catch (e) {
        send("error", { message: String(e) });
      }

      keepAlive = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          cleanup();
        }
      }, 30000);
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
