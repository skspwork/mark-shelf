import type { FileRef } from "./docs";

export interface GraphNode {
  id: string;
  label: string;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface LinkGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function buildLinkGraph(
  files: FileRef[],
  readFile: (path: string) => string | null,
): LinkGraph {
  const filtered = files
    .filter((f) => f.displayName.length > 2)
    .sort((a, b) => b.displayName.length - a.displayName.length);

  if (filtered.length === 0) return { nodes: [], edges: [] };

  // Build regex from all displayNames
  const escaped = filtered.map((f) =>
    f.displayName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const regex = new RegExp(`(${escaped.join("|")})`, "g");

  // Map displayName → path for lookup
  const nameToPath = new Map<string, string>();
  for (const f of filtered) {
    nameToPath.set(f.displayName, f.path);
  }

  const edgeSet = new Set<string>();
  const referencedPaths = new Set<string>();

  for (const file of files) {
    const content = readFile(file.path);
    if (!content) continue;

    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      const targetPath = nameToPath.get(match[0]);
      if (!targetPath || targetPath === file.path) continue;

      const key = `${file.path}\0${targetPath}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        referencedPaths.add(file.path);
        referencedPaths.add(targetPath);
      }
    }
  }

  // Only include nodes that have at least one edge
  const nodes: GraphNode[] = files
    .filter((f) => referencedPaths.has(f.path))
    .map((f) => ({ id: f.path, label: f.displayName }));

  const edges: GraphEdge[] = Array.from(edgeSet).map((key) => {
    const [source, target] = key.split("\0");
    return { source, target };
  });

  return { nodes, edges };
}

// ---- In-memory cache ----

let cachedGraph: LinkGraph | null = null;
let cachedSignature: string | null = null;

function computeSignature(
  files: FileRef[],
  statFile: (path: string) => number | null,
): string {
  // Sort paths for stability, then join "path\0mtime"
  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));
  const parts: string[] = [];
  for (const f of sorted) {
    const mtime = statFile(f.path) ?? 0;
    parts.push(`${f.path}\0${mtime}\0${f.displayName}`);
  }
  return parts.join("\n");
}

export function getCachedLinkGraph(
  files: FileRef[],
  readFile: (path: string) => string | null,
  statFile: (path: string) => number | null,
): LinkGraph {
  const signature = computeSignature(files, statFile);
  if (cachedGraph && cachedSignature === signature) {
    return cachedGraph;
  }
  const graph = buildLinkGraph(files, readFile);
  cachedGraph = graph;
  cachedSignature = signature;
  return graph;
}
