"use client";

import { useEffect, useState } from "react";
import { withBasePath } from "@/lib/basePath";

type Listener = (tick: number) => void;

let currentTick = 0;
const listeners = new Set<Listener>();
let eventSource: EventSource | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function bump() {
  currentTick++;
  for (const l of listeners) l(currentTick);
}

function ensureConnected() {
  if (eventSource || typeof window === "undefined") return;
  try {
    eventSource = new EventSource(withBasePath("/api/watch"));
  } catch {
    return;
  }
  eventSource.addEventListener("change", () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(bump, 150);
  });
  // If the connection errors out, EventSource will reconnect automatically.
}

/** Returns a tick that increments when any file under the docs root changes. */
export function useRefreshTick(): number {
  const [value, setValue] = useState(currentTick);
  useEffect(() => {
    ensureConnected();
    const listener: Listener = (t) => setValue(t);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return value;
}
