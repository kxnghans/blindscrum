"use client";

/**
 * @file useIsMounted.ts
 * @description React 19 compliant client hydration detection using useSyncExternalStore.
 * Eliminates cascading renders and avoids react-hooks/set-state-in-effect warnings.
 */

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
