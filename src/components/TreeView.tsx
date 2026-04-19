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
    <div className="h-full overflow-y-auto py-1 bg-[var(--bg-base)]">
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
      setCollapsed(!collapsed);
      if (entry.hasReadme) onSelect(entry.path + "/README.md");
    } else {
      onSelect(entry.path);
    }
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed(!collapsed);
  };

  const indent = depth * 16 + 8;

  return (
    <>
      <div
        onClick={handleClick}
        className={`
          flex items-center gap-1.5 cursor-pointer select-none
          h-7 pr-2 text-[12px] leading-none transition-colors
          ${isSelected
            ? "bg-[var(--brand-primary)]/10 text-[var(--text-primary)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          }
        `}
        style={{ paddingLeft: indent }}
      >
        {isFolder ? (
          <span
            onClick={handleChevronClick}
            className="shrink-0 text-[var(--text-muted)] w-4 flex items-center justify-center hover:text-[var(--text-primary)]"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </span>
        ) : (
          <span className="shrink-0 w-4" />
        )}
        {isFolder ? (
          <Folder size={14} className="shrink-0" style={{ color: "var(--folder-border)" }} />
        ) : (
          <FileText size={14} className="shrink-0" style={{ color: "var(--file-border)" }} />
        )}
        <span
          className={`truncate ${
            isFolder ? "font-medium text-[var(--folder-text)]" : ""
          } ${isSelected ? "font-medium" : ""}`}
        >
          {entry.displayName}
        </span>
      </div>

      {isFolder && !collapsed && entry.children && entry.children.length > 0 && (
        <>
          {entry.children.map((child) => (
            <TreeNode
              key={child.path}
              entry={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </>
      )}
    </>
  );
}
