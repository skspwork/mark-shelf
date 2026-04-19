"use client";

import { useEffect, useState, useRef } from "react";
import { Markdown } from "./Markdown";
import { ExternalLink } from "lucide-react";

interface Props {
  path: string | null;
  position: { x: number; y: number } | null;
  onNavigate: (path: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function PreviewPopup({ path, position, onNavigate, onMouseEnter, onMouseLeave }: Props) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!path) {
      setContent(null);
      return;
    }
    setLoading(true);
    setContent(null);
    fetch(`/api/file?path=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((data) => setContent(data.content ?? null))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [path]);

  // Adjust position to stay within viewport
  useEffect(() => {
    if (!position || !popupRef.current) {
      setAdjustedPos(position);
      return;
    }
    const rect = popupRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let { x, y } = position;

    if (x + rect.width > vw - 16) x = vw - rect.width - 16;
    if (x < 16) x = 16;
    if (y + rect.height > vh - 16) y = position.y - rect.height - 8;

    setAdjustedPos({ x, y });
  }, [position, content]);

  if (!path || !position) return null;

  const displayName = path.split("/").pop()?.replace(/\.md$/i, "") || path;

  return (
    <div
      ref={popupRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed z-50 w-[480px] max-h-[420px] overflow-y-auto bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg shadow-xl"
      style={{
        left: adjustedPos?.x ?? position.x,
        top: adjustedPos?.y ?? position.y,
      }}
    >
      <div className="sticky top-0 bg-[var(--bg-surface)] border-b border-[var(--border-default)] px-3 py-2 flex items-center gap-2">
        <button
          onClick={() => onNavigate(path)}
          className="text-xs font-medium text-[var(--brand-primary)] hover:underline truncate flex items-center gap-1"
        >
          {displayName}
          <ExternalLink size={10} />
        </button>
      </div>
      <div className="p-3">
        {loading ? (
          <div className="text-xs text-[var(--text-muted)]">読み込み中...</div>
        ) : content ? (
          <div className="text-[11px]">
            <Markdown>{content}</Markdown>
          </div>
        ) : (
          <div className="text-xs text-[var(--text-muted)]">プレビューを表示できません</div>
        )}
      </div>
    </div>
  );
}
