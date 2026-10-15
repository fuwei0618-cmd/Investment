import { describe, expect, it } from "vitest";
import { GROUPS, TOOLS } from "../tools";

describe("投資工具比較", () => {
  it("id 不重複、每張卡都填滿", () => {
    expect(new Set(TOOLS.map((t) => t.id)).size).toBe(TOOLS.length);
    for (const t of TOOLS) {
      for (const k of ["name", "what", "earn", "lose", "course", "src"] as const) expect(t[k].length).toBeGreaterThan(0);
      expect(t.client.q && t.client.a).toBeTruthy();
      expect(GROUPS.some((g) => g.id === t.group)).toBe(true);
    }
  });
  it("客戶常問的都有", () => {
    const names = TOOLS.map((t) => t.name).join();
    for (const w of ["黃金", "期貨", "外匯", "比特幣", "債券", "基金"]) expect(names).toContain(w);
  });
});
