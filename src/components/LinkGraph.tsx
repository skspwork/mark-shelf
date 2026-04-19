"use client";

import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";

interface GraphNode {
  id: string;
  label: string;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function LinkGraph({ currentPath, onNavigate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setEmpty(false);
    setReady(false);

    fetch("/api/graph")
      .then((r) => r.json())
      .then((data: { nodes: GraphNode[]; edges: GraphEdge[] }) => {
        if (cancelled || !containerRef.current) return;

        // Filter to show only nodes connected to currentPath (1-hop neighborhood)
        const connectedPaths = new Set<string>();
        connectedPaths.add(currentPath);
        for (const e of data.edges) {
          if (e.source === currentPath) connectedPaths.add(e.target);
          if (e.target === currentPath) connectedPaths.add(e.source);
        }

        const localNodes = data.nodes.filter((n) => connectedPaths.has(n.id));
        const localEdges = data.edges.filter(
          (e) => connectedPaths.has(e.source) && connectedPaths.has(e.target),
        );

        if (localNodes.length === 0) {
          setEmpty(true);
          setLoading(false);
          return;
        }

        // Destroy previous instance
        cyRef.current?.destroy();

        const cy = cytoscape({
          container: containerRef.current,
          elements: [
            ...localNodes.map((n) => ({
              data: {
                id: n.id,
                label: n.label,
                isCurrent: n.id === currentPath,
              },
            })),
            ...localEdges.map((e, i) => ({
              data: {
                id: `e${i}`,
                source: e.source,
                target: e.target,
              },
            })),
          ],
          style: [
            {
              selector: "node",
              style: {
                label: "data(label)",
                "text-valign": "bottom",
                "text-halign": "center",
                "font-size": "11px",
                "font-family": "var(--font-sans)",
                color: "#4a5060",
                "text-margin-y": 6,
                "background-color": "#e8f0fe",
                "border-width": 2,
                "border-color": "#3b7ddb",
                width: 28,
                height: 28,
                "text-max-width": "100px",
                "text-wrap": "ellipsis",
                "cursor": "pointer",
              } as cytoscape.Css.Node,
            },
            {
              selector: "node[?isCurrent]",
              style: {
                "background-color": "#2563eb",
                "border-color": "#1d4ed8",
                color: "#1a1d23",
                "font-weight": "bold" as const,
                width: 36,
                height: 36,
              } as cytoscape.Css.Node,
            },
            {
              selector: "edge",
              style: {
                width: 1.5,
                "line-color": "#c8ccd3",
                "target-arrow-color": "#c8ccd3",
                "target-arrow-shape": "triangle",
                "curve-style": "bezier",
                "arrow-scale": 0.8,
              } as cytoscape.Css.Edge,
            },
            {
              selector: "node:active",
              style: {
                "overlay-opacity": 0,
              } as cytoscape.Css.Node,
            },
          ],
          layout: {
            name: "concentric",
            animate: false,
            padding: 50,
            minNodeSpacing: 80,
            concentric: (node: cytoscape.NodeSingular) =>
              node.data("isCurrent") ? 10 : 1,
            levelWidth: () => 1,
          } as cytoscape.ConcentricLayoutOptions,
          userZoomingEnabled: true,
          userPanningEnabled: true,
          boxSelectionEnabled: false,
          autoungrabify: false,
        });

        // Defer fit/center until container has layout dimensions
        requestAnimationFrame(() => {
          cy.resize();
          cy.fit(undefined, 50);
          if (cy.zoom() > 1.2) cy.zoom({ level: 1.2, renderedPosition: { x: containerRef.current!.clientWidth / 2, y: containerRef.current!.clientHeight / 2 } });
          cy.center(cy.nodes("[?isCurrent]"));
          setReady(true);
        });

        // Hover effects
        cy.on("mouseover", "node", (e) => {
          const node = e.target;
          if (!node.data("isCurrent")) {
            node.style({
              "background-color": "#dbeafe",
              "border-color": "#2563eb",
              color: "#1a1d23",
            });
          }
          containerRef.current!.style.cursor = "pointer";
        });

        cy.on("mouseout", "node", (e) => {
          const node = e.target;
          if (!node.data("isCurrent")) {
            node.style({
              "background-color": "#e8f0fe",
              "border-color": "#3b7ddb",
              color: "#4a5060",
            });
          }
          containerRef.current!.style.cursor = "default";
        });

        // Click to navigate
        cy.on("tap", "node", (e) => {
          const path = e.target.id();
          if (path !== currentPath) {
            onNavigate(path);
          }
        });

        cyRef.current = cy;
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setEmpty(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      cyRef.current?.destroy();
      cyRef.current = null;
    };
  }, [currentPath, onNavigate]);

  return (
    <div className="h-full flex flex-col relative">
      {(loading || empty) && (
        <div className="absolute inset-0 flex items-center justify-center text-[13px] text-[var(--text-muted)] z-10 bg-[var(--bg-surface)]">
          {loading ? "グラフを構築中..." : "このドキュメントへのリンクはありません"}
        </div>
      )}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 transition-opacity duration-150"
        style={{ opacity: ready ? 1 : 0 }}
      />
    </div>
  );
}
