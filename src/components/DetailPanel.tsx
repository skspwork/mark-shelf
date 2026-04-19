"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Markdown, FileRef } from "./Markdown";
import { HistoryPanel } from "./HistoryPanel";
import { TableOfContents, HeadingInfo } from "./TableOfContents";
import { PreviewPopup } from "./PreviewPopup";
import { LinkGraph } from "./LinkGraph";
import { FileText, History, Network } from "lucide-react";

interface Props {
  filePath: string;
  fileRefs?: FileRef[];
  onNavigate?: (path: string) => void;
}

export function DetailPanel({ filePath, fileRefs, onNavigate }: Props) {
  const [content, setContent] = useState<string | null>(null);
  const [tab, setTab] = useState<"content" | "history" | "links">("content");
  const [headings, setHeadings] = useState<HeadingInfo[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Preview popup state
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number } | null>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    setContent(null);
    setTab("content");
    setHeadings([]);
    fetch(`/api/file?path=${encodeURIComponent(filePath)}`)
      .then((r) => r.json())
      .then((data) => setContent(data.content ?? null))
      .catch(() => setContent(null));
  }, [filePath]);

  const handlePreviewShow = useCallback((path: string, rect: DOMRect) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (showTimer.current) clearTimeout(showTimer.current);
    showTimer.current = setTimeout(() => {
      setPreviewPath(path);
      setPreviewPos({ x: rect.left, y: rect.bottom + 4 });
    }, 200);
  }, []);

  const handlePreviewHide = useCallback(() => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setPreviewPath(null);
      setPreviewPos(null);
    }, 300);
  }, []);

  const handlePreviewEnter = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const handlePreviewLeave = useCallback(() => {
    handlePreviewHide();
  }, [handlePreviewHide]);

  const fileName = filePath.split("/").pop()?.replace(/\.md$/i, "") || filePath;

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-[var(--border-default)] px-4 py-2.5 shrink-0">
        <h2 className="font-semibold text-[14px] leading-snug truncate text-[var(--text-primary)] mb-2">
          {fileName}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => setTab("content")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
              tab === "content"
                ? "bg-[var(--brand-primary)] text-white"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <FileText size={12} />
            内容
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
              tab === "history"
                ? "bg-[var(--brand-primary)] text-white"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <History size={12} />
            変更履歴
          </button>
          <button
            onClick={() => setTab("links")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
              tab === "links"
                ? "bg-[var(--brand-primary)] text-white"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <Network size={12} />
            リンク
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        {tab === "content" ? (
          content !== null ? (
            <>
              <TableOfContents headings={headings} scrollContainer={scrollRef.current} />
              <div className="p-4">
                <Markdown
                  onHeadingsExtracted={setHeadings}
                  fileRefs={fileRefs}
                  currentPath={filePath}
                  onNavigate={onNavigate}
                  onPreviewShow={handlePreviewShow}
                  onPreviewHide={handlePreviewHide}
                >
                  {content}
                </Markdown>
              </div>
            </>
          ) : (
            <div className="p-4 text-[var(--text-muted)] text-sm">読み込み中...</div>
          )
        ) : tab === "history" ? (
          <HistoryPanel filePath={filePath} />
        ) : (
          <LinkGraph currentPath={filePath} onNavigate={(p) => onNavigate?.(p)} />
        )}
      </div>

      <PreviewPopup
        path={previewPath}
        position={previewPos}
        onNavigate={(p) => {
          setPreviewPath(null);
          setPreviewPos(null);
          onNavigate?.(p);
        }}
        onMouseEnter={handlePreviewEnter}
        onMouseLeave={handlePreviewLeave}
      />
    </div>
  );
}
