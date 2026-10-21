import { describe, expect, it } from "vitest";
import { marketOk, planShares, rankMomentum, rebalance } from "../momentum";

const line = (from: number, to: number, n = 250) =>
  Array.from({ length: n }, (_, i) => ({
    date: String(i),
    close: from + ((to - from) * i) / (n - 1),
    high: 0,
    volume: 0,
  }));

describe("動能 10 檔", () => {
  it("照一年扣掉最近一個月的漲幅排序", () => {
    const r = rankMomentum({
      "2330": line(100, 200),
      "2317": line(100, 120),
      "2454": line(100, 300, 100),
    });
    expect(r.map((p) => p.code)).toEqual(["2330", "2317"]);
    expect(r[0].price).toBe(200);
    expect(r[0].ret).toBeGreaterThan(0.8);
  });
  it("大盤在 200 日線上才進場", () => {
    expect(marketOk(line(100, 200))?.ok).toBe(true);
    expect(marketOk(line(200, 100))?.ok).toBe(false);
    expect(marketOk(line(100, 200, 50))).toBeNull();
  });
  it("預算平均分、算零股", () => {
    expect(planShares(10000, [{ price: 1000 }, { price: 33 }])).toEqual([
      5, 151,
    ]);
  });
  it("換月時算出要賣、要買的", () => {
    expect(rebalance(["A", "B"], ["B", "C"])).toEqual({
      sell: ["A"],
      keep: ["B"],
      buy: ["C"],
    });
  });
});
