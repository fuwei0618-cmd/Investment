import { describe, expect, it } from "vitest";
import { upcoming } from "../desk";
import {
  isUsTradingTime,
  parseYahoo,
  usCheck,
  usPlan,
  type UsBar,
} from "../us";

const mk = (n: number, last: Partial<UsBar> = {}): UsBar[] =>
  Array.from({ length: n }, (_, i) => ({
    date: new Date(Date.UTC(2025, 0, 1 + i)).toISOString().slice(0, 10),
    close: 100 + i * 0.1,
    high: 101 + i * 0.1,
    volume: 1e6,
    ...(i === n - 1 ? last : {}),
  }));

describe("usCheck", () => {
  it("三個條件全過", () => {
    const k = usCheck(mk(220, { close: 130, high: 131, volume: 3e6 }))!;
    expect(k.pass).toBe(true);
    expect(k.stopAt).toBeCloseTo(Math.max(122.8, 130 * 0.93), 1);
  });
  it("量沒放大就只過 2 個", () => {
    expect(usCheck(mk(220, { close: 130, high: 131 }))!.score).toBe(2);
  });
  it("不到 200 天不判斷", () => {
    expect(usCheck(mk(150))).toBeNull();
  });
});

it("parseYahoo 讀出 K 線和最新價", () => {
  const d = parseYahoo({
    chart: {
      result: [
        {
          meta: { regularMarketPrice: 12, regularMarketTime: 1760640000 },
          timestamp: [1760486400, 1760572800, 1760659200],
          indicators: {
            quote: [
              {
                close: [10, null, 11],
                high: [10.5, null, 11.5],
                volume: [5, null, 6],
              },
            ],
          },
        },
      ],
    },
  })!;
  expect(d.bars.map((b) => b.close)).toEqual([10, 11]);
  expect(d.price).toBe(12);
  expect(d.prev).toBe(10);
});

it("usPlan 以股計", () => {
  const p = usPlan(10000, 99, 92, 0.15);
  expect(p.shares).toBe(10);
  expect(p.stopLoss).toBe(70);
  expect(p.odd).toBe(false);
  expect(p.half).toBe(5);
});

it("一成買不到一整股就改買碎股", () => {
  const p = usPlan(10000, 1136.36, 1056, 0.15);
  expect(p.odd).toBe(true);
  expect(p.shares).toBe(0.88);
  expect(p.half).toBe(0.44);
  expect(p.cost).toBeLessThanOrEqual(1000);
});

it("美股盤中：夏令台灣 22:00 是盤中、白天不是", () => {
  expect(isUsTradingTime(new Date("2026-10-16T14:00:00Z"))).toBe(true);
  expect(isUsTradingTime(new Date("2026-10-16T03:00:00Z"))).toBe(false);
  expect(isUsTradingTime(new Date("2026-10-17T14:00:00Z"))).toBe(false); // 週六
});

it("美股行事曆不放台指期結算，台股不放美股選擇權", () => {
  const us = upcoming("2026-10-16", 30, "us").map((e) => e.name);
  const tw = upcoming("2026-10-16", 30, "tw").map((e) => e.name);
  expect(us).not.toContain("台指期結算");
  expect(us.some((n) => n.includes("美國央行"))).toBe(true);
  expect(tw.some((n) => n.includes("美股"))).toBe(false);
});
