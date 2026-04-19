"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

let initialized = false;

function ensureInit() {
  if (initialized) return;
  initialized = true;
  mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
    fontFamily: "system-ui, sans-serif",
  });
}

let counter = 0;

export function MermaidBlock({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mermaid-${++counter}`);

  useEffect(() => {
    let cancelled = false;
    ensureInit();

    (async () => {
      try {
        const { svg: rendered } = await mermaid.render(idRef.current, code);
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Mermaid render error");
          setSvg(null);
        }
        // Clean up any error element mermaid might have injected
        const errEl = document.getElementById("d" + idRef.current);
        errEl?.remove();
      }
    })();

    return () => { cancelled = true; };
  }, [code]);

  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 rounded p-3 text-xs text-red-700">
        <div className="font-medium mb-1">Mermaid エラー</div>
        <pre className="whitespace-pre-wrap">{code}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="text-xs text-[var(--text-muted)] py-2">図を描画中...</div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-2 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
