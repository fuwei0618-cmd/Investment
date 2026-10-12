"use client";

import { PHASES } from "@/lib/macro";
import { PHASE_SECTORS, sectorFits } from "@/lib/compass";
import type { PhaseKey } from "@/lib/industry";
import { usePersistentState } from "@/lib/storage";

// 依第 3 關選的季節，判斷某個產業現在順不順風。
export function useTailwind() {
  const [phase] = usePersistentState<string>("macro.phase.v1", "expansion");
  const p = PHASES.find((x) => x.key === phase) ?? PHASES[0];
  const pick = PHASE_SECTORS[p.key as PhaseKey];
  return { phaseName: p.name, focus: pick.focus, fits: (sector: string) => sectorFits(pick.sectors, sector) };
}

// 帶著產業鏈跳到第 5 關。
export function openChain(key: string) {
  try {
    localStorage.setItem("market.chain.v1", JSON.stringify(key));
  } catch {}
  window.location.hash = "level-5";
}
