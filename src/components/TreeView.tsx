"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, FileText } from "lucide-react";

interface TreeEntry {
  name: string;
  displayName: string;
  path: string;
  type: "folder" | "file";
  children?: TreeEntry[];
  hasReadme?: boolean;
}

interface Props {
  entries: TreeEntry[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
}

export function TreeView({ entries, selectedPath, onSelect }: Props) {
  return (
    <div className="h-full overflow-y-auto p-3 space-y-1.5 bg-[var(--bg-base)]">
      {entries.map((entry) => (
        <TreeNode
          key={entry.path}
          entry={entry}
          depth={0}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
      {entries.length === 0 && (
        <div className="text-[var(--text-muted)] text-[13px] p-4 text-center">
          マークダウンファイルが見つかりません
        </div>
      )}
    </div>
  );
}

function TreeNode({
  entry,
  depth,
  selectedPath,
  onSelect,
}: {
  entry: TreeEntry;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(depth > 0);
  const isFolder = entry.type === "folder";
  const isSelected = entry.type === "file"
    ? selectedPath === entry.path
    : entry.hasReadme && selectedPath === entry.path + "/README.md";

  const handleClick = () => {
    if (isFolder) {
      if (entry.hasReadme) onSelect(entry.path + "/README.md");
    } else {
      onSelect(entry.path);
    }
  };

  const handleDoubleClick = () => {
    if (isFolder) setCollapsed(!collapsed);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        className={`
          rounded-lg border cursor-pointer transition-all duration-150
          ${isFolder ? "px-3 py-2.5" : "px-2.5 py-2 ml-3"}
          ${isSelected ? "ring-2 ring-[var(--brand-primary)] shadow-sm" : "hover:shadow-sm"}
        `}
        style={{
          borderColor: isSelected
            ? "var(--brand-primary)"
            : isFolder ? "var(--folder-border)" : "var(--file-border)",
          borderLeftWidth: isFolder ? 3 : 1,
          backgroundColor: isFolder
            ? "color-mix(in srgb, var(--folder-bg) 30%, white)"
            : "var(--bg-surface)",
        }}
      >
        <div className="flex items-center gap-2">
          {isFolder && (
            <button
              onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}
              className="p-0.5 rounded hover:bg-[var(--bg-muted)] text-[var(--text-muted)] shrink-0"
            >
              {collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
          {isFolder ? (
            <Folder size={13} className="shrink-0" style={{ color: "var(--folder-border)" }} />
          ) : (
            <FileText size={13} className="shrink-0" style={{ color: "var(--file-border)" }} />
          )}
          <span
            className={`truncate leading-snug ${
              isFolder
                ? "font-medium text-[13px] text-[var(--folder-text)]"
                : "text-[12px] text-[var(--text-secondary)]"
            }`}
          >
            {entry.displayName}
          </span>
        </div>
      </div>

      {isFolder && !collapsed && entry.children && entry.children.length > 0 && (
        <div className="mt-1 space-y-1 ml-3">
          {entry.children.map((child) => (
            <TreeNode
              key={child.path}
              entry={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
