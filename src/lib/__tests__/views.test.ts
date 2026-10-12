import { describe, expect, it } from "vitest";
import { CITY, GICS, LIFE } from "../views";
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
