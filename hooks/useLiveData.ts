"use client";

import { useEffect, useRef, useState } from "react";
import { onDataChanged } from "@/lib/storage/localStorage";

export function useLiveData<T>(compute: () => T, extraDeps: unknown[] = []): T | null {
  const [data, setData] = useState<T | null>(null);
  const computeRef = useRef(compute);
  computeRef.current = compute;

  useEffect(() => {
    const run = () => setData(computeRef.current());
    run();
    return onDataChanged(run);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, extraDeps);

  return data;
}
