import { describe, expect, it } from "vitest";
import { CITY, GICS, LIFE, MARKET_MIX, TRENDS, TW_US_PAIRS } from "../views";
import { CHAINS } from "../chains";
import { NEED_SECTORS } from "../compassData";

const chainKeys = new Set(CHAINS.map((c) => c.key));
const sectors = new Set(NEED_SECTORS.map((n) => n.sector));

describe("產業的幾種看法", () => {
  it("GICS 是 11 個板塊、25 個行業組，名稱對得上產業表", () => {
    expect(GICS).toHaveLength(11);
    expect(GICS.reduce((n, g) => n + g.groups.length, 0)).toBe(25);
    for (const g of GICS) expect(sectors.has(g.sector)).toBe(true);
  });

  it("食衣住行與城市地圖的產業、產業鏈都存在", () => {
    for (const l of LIFE)
      for (const s of l.sectors) {
        expect(sectors.has(s.sector)).toBe(true);
        if (s.chain) expect(chainKeys.has(s.chain)).toBe(true);
      }
    const ids = new Set(CITY.map((c) => c.id));
    for (const c of CITY) {
      expect(sectors.has(c.sector)).toBe(true);
      if (c.chain) expect(chainKeys.has(c.chain)).toBe(true);
      for (const f of c.feeds) expect(ids.has(f)).toBe(true);
    }
  });
});

describe("新增的三種角度", () => {
  it("台灣、美國比重的產業都存在，加起來約 100", () => {
    const names = NEED_SECTORS.map((n) => n.sector);
    const keys = CHAINS.map((c) => c.key);
    for (const m of MARKET_MIX) expect(names).toContain(m.sector);
    const us = MARKET_MIX.reduce((a, m) => a + m.us, 0);
    const tw = MARKET_MIX.reduce((a, m) => a + m.tw, 0);
    expect(Math.abs(us - 100)).toBeLessThan(2);
    expect(Math.abs(tw - 100)).toBeLessThan(2);
    for (const t of TRENDS) {
      for (const s of t.sectors) expect(names).toContain(s);
      for (const c of t.chains) expect(keys).toContain(c);
    }
    for (const p of TW_US_PAIRS) expect(keys).toContain(p.chain);
  });
});
