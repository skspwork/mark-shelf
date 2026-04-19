"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { List } from "lucide-react";

export interface HeadingInfo {
  id: string;
  text: string;
  level: number;
}

interface Props {
  headings: HeadingInfo[];
  scrollContainer?: HTMLElement | null;
}

export function TableOfContents({ headings, scrollContainer }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!scrollContainer || headings.length === 0) return;

    observerRef.current?.disconnect();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { root: scrollContainer, rootMargin: "0px 0px -70% 0px", threshold: 0.1 },
    );
    observerRef.current = observer;

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings, scrollContainer]);

  const handleClick = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveId(id);
      }
    },
    [],
  );

  if (headings.length === 0) return null;

  return (
    <div className="border-b border-[var(--border-default)]">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)] w-full text-left transition-colors"
      >
        <List size={12} />
        <span className="tracking-wide uppercase">目次</span>
        <span className="text-[10px] opacity-60">({headings.length})</span>
        <span className="ml-auto text-[10px]">{collapsed ? "▶" : "▼"}</span>
      </button>
      {!collapsed && (
        <nav className="px-4 pb-2.5 space-y-px">
          {headings.map((h) => (
            <button
              key={h.id}
              onClick={() => handleClick(h.id)}
              className={`block w-full text-left text-[11px] leading-relaxed py-0.5 truncate transition-colors rounded px-1.5 ${
                activeId === h.id
                  ? "text-[var(--brand-primary)] font-medium bg-blue-50"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
              style={{ paddingLeft: `${(h.level - 1) * 14 + 6}px` }}
            >
              {h.text}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
