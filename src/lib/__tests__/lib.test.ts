import { describe, expect, it } from "vitest";
import { DEFAULT_INPUTS, mortgagePayment, simulate } from "../goals";
import { buildPositions, Trade } from "../portfolio";
import { applyTransform, parseFredCsv } from "../macro";

describe("goals.simulate", () => {
  it("每年一列，涵蓋目前年齡到預期壽命", () => {
    const r = simulate(DEFAULT_INPUTS);
    expect(r.rows[0].age).toBe(30);
    expect(r.rows.at(-1)!.age).toBe(85);
  });

  it("累積結存 = 前一年結存 + 結餘", () => {
    const { rows } = simulate(DEFAULT_INPUTS);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].balance).toBeCloseTo(rows[i - 1].balance + rows[i].net, 6);
    }
  });

  it("報酬率越高，轉負越晚或不轉負（課程 1-3 的結論）", () => {
    const low = simulate({ ...DEFAULT_INPUTS, returnRate: 0.01 }).negativeAge ?? Infinity;
    const high = simulate({ ...DEFAULT_INPUTS, returnRate: 0.09 }).negativeAge ?? Infinity;
    expect(high).toBeGreaterThanOrEqual(low);
  });

  it("退休後沒有薪資，提領率 = 支出 ÷ 年初結存", () => {
    const r = simulate({ ...DEFAULT_INPUTS, buyHouse: false, lumpExpenses: [] });
    const row = r.rows.find((x) => x.age === 70)!;
    expect(row.salary).toBe(0);
    const prev = r.rows.find((x) => x.age === 69)!;
    expect(row.withdrawalRate).toBeCloseTo((row.living + row.housing + row.other) / prev.balance, 6);
  });

  it("房貸本息平均攤還", () => {
    expect(mortgagePayment(1_000_000, 0, 10)).toBe(100_000);
    expect(mortgagePayment(8_800_000, 0.02, 20)).toBeCloseTo(538_179.12, 1);
  });
});

describe("portfolio.buildPositions", () => {
  const base = { market: "TW", name: "元大台灣50", assetClass: "stock", fee: 0, reason: "" } as const;
  it("平均成本法與已實現損益", () => {
    const trades: Trade[] = [
      { ...base, id: "1", date: "2026-01-01", symbol: "0050", side: "buy", price: 100, qty: 10 },
      { ...base, id: "2", date: "2026-02-01", symbol: "0050", side: "buy", price: 200, qty: 10 },
      { ...base, id: "3", date: "2026-03-01", symbol: "0050", side: "sell", price: 300, qty: 5 },
    ];
    const [p] = buildPositions(trades);
    expect(p.qty).toBe(15);
    expect(p.avgCost).toBe(150);
    expect(p.realized).toBe(750);
  });
});

describe("macro", () => {
  it("解析 FRED CSV 並略過缺值", () => {
    const obs = parseFredCsv("observation_date,T10Y2Y\n2026-01-01,0.5\n2026-01-02,.\n2026-01-03,\n2026-01-04,-0.1\n");
    expect(obs).toEqual([
      { date: "2026-01-01", value: 0.5 },
      { date: "2026-01-04", value: -0.1 },
    ]);
  });

  it("非農年增：千人 → 萬人", () => {
    const obs = [
      { date: "2025-01-01", value: 150_000 },
      { date: "2025-06-01", value: 151_000 },
      { date: "2026-01-01", value: 152_000 },
    ];
    expect(applyTransform(obs, "yoyDiff")).toEqual([{ date: "2026-01-01", value: 200 }]);
  });
});
