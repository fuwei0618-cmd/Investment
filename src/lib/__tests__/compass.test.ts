import { describe, expect, it } from "vitest";
import { FRED_VIEW, decide, estimatePhase, pickMethod, sectorFits } from "../compass";

describe("投資羅盤", () => {
  it("依成長與物價相對平均判斷象限", () => {
    expect(estimatePhase(3, 3.5)).toBe("expansion");
    expect(estimatePhase(1, 3.5)).toBe("slowdown");
    expect(estimatePhase(0.5, 1)).toBe("recession");
    expect(estimatePhase(2.5, 2)).toBe("recovery");
  });

  it("依獲利紀錄與營收成長選評價方式", () => {
    expect(pickMethod({ profitable3y: true, assetBased: false, revenueGrowth: 5 })).toBe("pe");
    expect(pickMethod({ profitable3y: true, assetBased: true, revenueGrowth: 5 })).toBe("pb");
    expect(pickMethod({ profitable3y: false, assetBased: false, revenueGrowth: 10 })).toBe("pb");
    expect(pickMethod({ profitable3y: false, assetBased: false, revenueGrowth: 30 })).toBe("ps");
  });

  it("課程例：目標價 240、股價 200、預期報酬 20% 為中立", () => {
    expect(decide(240, 200, 20).verdict).toBe("hold");
    expect(decide(172.5, 120, 20).verdict).toBe("buy");
    expect(decide(100, 120, 20).verdict).toBe("sell");
  });
});

describe("羅盤數據顯示", () => {
  it("非農顯示上月新增萬人、CPI 顯示年增", () => {
    expect(FRED_VIEW.PAYEMS.calc([{ date: "2026-08-01", value: 159000 }, { date: "2026-09-01", value: 159180 }])).toBeCloseTo(18);
    expect(
      FRED_VIEW.CPIAUCSL.calc([
        { date: "2025-09-01", value: 300 },
        { date: "2026-09-01", value: 309 },
      ]),
    ).toBeCloseTo(3);
  });
});

describe("順風產業比對", () => {
  it("必需消費不會誤中非必需消費，科技對到資訊科技", () => {
    expect(sectorFits(["非必需消費"], "必需消費")).toBe(false);
    expect(sectorFits(["科技"], "資訊科技")).toBe(true);
    expect(sectorFits(["必需消費"], "必需消費")).toBe(true);
  });
});
