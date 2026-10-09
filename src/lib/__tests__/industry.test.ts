import { describe, expect, it } from "vitest";
import { SECTORS, evaluateIndustry, valueDaysAgo, IndustryCheck } from "../industry";

const base: IndustryCheck = {
  id: "x",
  name: "測試",
  growth: null,
  barriers: { material: false, tech: false, platform: false },
  top1: null,
  top3: null,
  note: "",
};

describe("evaluateIndustry 三大要領", () => {
  it("三項都符合", () => {
    const r = evaluateIndustry({ ...base, growth: 15, barriers: { ...base.barriers, tech: true }, top3: 70 });
    expect(r).toMatchObject({ market: true, barrier: true, competition: true, passed: 3, competitionLabel: "寡占" });
  });

  it("成長剛好 10% 不算（需大於 10%）", () => {
    expect(evaluateIndustry({ ...base, growth: 10 }).market).toBe(false);
  });

  it("第一大市占 > 50% 為獨佔", () => {
    expect(evaluateIndustry({ ...base, top1: 60, top3: 80 }).competitionLabel).toBe("獨佔");
    expect(evaluateIndustry({ ...base, top1: 30, top3: 45 }).competition).toBe(false);
  });
});

describe("產業自動訊號", () => {
  const series = [
    { date: "2026-01-01", value: 4.0 },
    { date: "2026-04-01", value: 4.5 },
    { date: "2026-07-01", value: 4.75 },
  ];

  it("valueDaysAgo 找到指定天數前的值", () => {
    expect(valueDaysAgo(series, 180)).toBe(4.0);
    expect(valueDaysAgo(series, 90)).toBe(4.5);
  });

  it("防禦股：央行 6 個月內升息為有利", () => {
    const defensive = SECTORS.find((s) => s.key === "defensive")!;
    expect(defensive.auto.judge(series).favorable).toBe(true);
  });

  it("科技股：CPI 年增 > 3% 為不利", () => {
    const tech = SECTORS.find((s) => s.key === "tech")!;
    expect(tech.auto.judge([{ date: "2026-09-01", value: 3.4 }]).favorable).toBe(false);
    expect(tech.auto.judge([{ date: "2026-09-01", value: 2.4 }]).favorable).toBe(true);
  });
});
