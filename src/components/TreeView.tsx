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
  const [collapsed, setCollapsed] = useState(depth > 0 && !entry.hasReadme);
  const isFolder = entry.type === "folder" && !entry.hasReadme;
  const isSelected = entry.type === "file"
    ? selectedPath === entry.path
    : entry.hasReadme && selectedPath === entry.path + "/README.md";

  const handleClick = () => {
    if (entry.type === "folder" && entry.hasReadme) {
      // README folder: behave like a file
      onSelect(entry.path + "/README.md");
    } else if (isFolder) {
      setCollapsed(!collapsed);
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
        {entry.type === "folder" && entry.children && entry.children.length > 0 ? (
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

      {entry.type === "folder" && !collapsed && entry.children && entry.children.length > 0 && (
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
