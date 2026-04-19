"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { TreeView } from "@/components/TreeView";
import { DetailPanel } from "@/components/DetailPanel";
import { SearchBar } from "@/components/SearchBar";

interface TreeEntry {
  name: string;
  displayName: string;
  path: string;
  type: "folder" | "file";
  children?: TreeEntry[];
  hasReadme?: boolean;
}

export default function Home() {
  const [tree, setTree] = useState<TreeEntry[]>([]);
  const [root, setRoot] = useState<string>("");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [panelWidth, setPanelWidth] = useState(400);
  const historyStack = useRef<string[]>([]);

  const navigateTo = useCallback((path: string | null) => {
    if (selectedPath && path !== selectedPath) {
      historyStack.current.push(selectedPath);
    }
    setSelectedPath(path);
  }, [selectedPath]);

  const goBack = useCallback(() => {
    const prev = historyStack.current.pop();
    if (prev) setSelectedPath(prev);
  }, []);

  const canGoBack = historyStack.current.length > 0;

  useEffect(() => {
    fetch("/api/tree")
      .then((r) => r.json())
      .then((data) => {
        setTree(data.tree ?? []);
        setRoot(data.root ?? "");
      });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("markshelf:panelWidth");
    if (saved) setPanelWidth(Number(saved) || 400);
  }, []);

  const fileRefs = useMemo(() => {
    function flatten(entries: TreeEntry[]): { path: string; displayName: string }[] {
      const refs: { path: string; displayName: string }[] = [];
      for (const e of entries) {
        if (e.type === "file") {
          refs.push({ path: e.path, displayName: e.displayName });
        }
        if (e.type === "folder") {
          if (e.hasReadme) {
            refs.push({ path: e.path + "/README.md", displayName: e.displayName });
          }
          if (e.children) refs.push(...flatten(e.children));
        }
      }
      return refs;
    }
    return flatten(tree);
  }, [tree]);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    const onMouseMove = (e: MouseEvent) => {
      const w = Math.max(280, Math.min(window.innerWidth * 0.6, window.innerWidth - e.clientX));
      setPanelWidth(w);
      localStorage.setItem("markshelf:panelWidth", String(w));
    };
    const onMouseUp = () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <header className="h-11 border-b border-[var(--border-default)] bg-[var(--bg-surface)] flex items-center px-5 shrink-0 gap-3">
        <span className="font-semibold text-[15px] tracking-tight leading-none">
          Mark<span className="text-[var(--brand-primary)]">Shelf</span>
        </span>
        {root && (
          <span className="text-[11px] text-[var(--text-muted)] font-[var(--font-mono)] truncate leading-none">
            {root}
          </span>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden flex flex-col">
          <SearchBar onSelect={navigateTo} />
          <div className="flex-1 overflow-hidden">
            <TreeView
              entries={tree}
              selectedPath={selectedPath}
              onSelect={navigateTo}
            />
          </div>
        </div>

        <div
          className="w-1.5 hover:bg-[var(--brand-primary)] bg-[var(--border-default)] cursor-col-resize shrink-0 transition-colors duration-150"
          onMouseDown={startResize}
        />

        <div
          className="border-l border-[var(--border-default)] bg-[var(--bg-surface)] overflow-y-auto shrink-0"
          style={{ width: panelWidth }}
        >
          {selectedPath ? (
            <DetailPanel
              filePath={selectedPath}
              fileRefs={fileRefs}
              onNavigate={navigateTo}
              onGoBack={goBack}
              canGoBack={canGoBack}
            />
          ) : (
            <div className="p-6 text-[var(--text-muted)] text-sm flex items-center justify-center h-full">
              ファイルをクリックして内容を表示
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
