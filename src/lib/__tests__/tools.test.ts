import { describe, expect, it } from "vitest";
import { GROUPS, TOOLS } from "../tools";

describe("投資工具比較", () => {
  it("id 不重複、每張卡都填滿", () => {
    expect(new Set(TOOLS.map((t) => t.id)).size).toBe(TOOLS.length);
    for (const t of TOOLS) {
      for (const k of ["name", "what", "earn", "lose", "course", "town", "src"] as const) expect(t[k].length).toBeGreaterThan(0);
      expect(t.client.q && t.client.a).toBeTruthy();
      expect(GROUPS.some((g) => g.id === t.group)).toBe(true);
    }
  });
  it("客戶常問的都有", () => {
    const names = TOOLS.map((t) => t.name).join();
    for (const w of ["黃金", "期貨", "外匯", "比特幣", "債券", "基金"]) expect(names).toContain(w);
  });
});

describe("六種放法總表", () => {
  it("每一欄都連得到工具卡，四季都有表情和原因", async () => {
    const { SIX, SEASONS } = await import("../six");
    expect(SIX).toHaveLength(6);
    for (const w of SIX) {
      expect(TOOLS.some((t) => t.id === w.toolId)).toBe(true);
      for (const s of SEASONS) expect(w.mood[s.id].every((x) => x.length > 0)).toBe(true);
    }
  });
});

describe("六種放法的一年", () => {
  it("六種都有四季劇本和開關說明", async () => {
    const { SIX, SEASONS } = await import("../six");
    const { YEARS, LISTENS } = await import("../sixYear");
    for (const w of SIX) {
      const y = YEARS.find((x) => x.toolId === w.toolId);
      expect(y).toBeTruthy();
      expect(LISTENS[w.toolId]).toBeTruthy();
      for (const s of SEASONS) expect(y!.seasons[s.id].say).toHaveLength(3);
    }
  });
});

describe("風險大街", () => {
  it("每種工具都有一間房子", async () => {
    const { HOUSE } = await import("../street");
    for (const t of TOOLS) expect(HOUSE[t.id]).toBeTruthy();
    expect(Object.keys(HOUSE)).toHaveLength(TOOLS.length);
  });
});

describe("賺錢撇步", () => {
  it("每種工具都有三級玩法", async () => {
    const { PLAYS } = await import("../plays");
    for (const t of TOOLS) expect(PLAYS[t.id]?.map((p) => p.level)).toEqual([1, 2, 3]);
  });
  it("每種工具都有長期、中期、短線三種放法", async () => {
    const { BY_TERM, TERMS } = await import("../plays");
    expect(Object.keys(BY_TERM)).toHaveLength(TOOLS.length);
    for (const t of TOOLS) for (const term of TERMS) expect(BY_TERM[t.id]?.[term.id]?.how.length).toBeGreaterThan(0);
  });
});

describe("衝一把操作卡", () => {
  it("每種工具都有操作卡或不適合的原因", async () => {
    const { FAST, STEPS } = await import("../fastPlay");
    for (const t of TOOLS) {
      const f = FAST[t.id];
      expect(f).toBeTruthy();
      if (typeof f !== "string") for (const s of STEPS) expect(f[s.key].length).toBeGreaterThan(0);
    }
  });
});
