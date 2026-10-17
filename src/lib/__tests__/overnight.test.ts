import { describe, expect, it } from "vitest";
import {
  dipCheck,
  downStreak,
  factsText,
  fromHigh,
  overnight,
  tenYear,
} from "../overnight";

const bars = (cs: number[]) =>
  cs.map((close, i) => ({
    date: `2026-10-${String(i + 1).padStart(2, "0")}`,
    close,
    high: close,
    volume: 1,
  }));

describe("昨晚發生什麼", () => {
  it("連跌天數、離高點、十年債", () => {
    expect(downStreak(bars([10, 12, 11, 10, 9]))).toBe(3);
    expect(fromHigh(bars([100, 120, 108]))).toBeCloseTo(-0.1);
    expect(tenYear(bars([45.1]))).toBeCloseTo(4.51);
    expect(tenYear(bars([5.1]))).toBe(5.1);
  });
  it("費半跌最兇時講半導體、利率、油價", () => {
    const r = overnight({
      spx: { name: "標普 500", close: 7659, d: -0.011 },
      ndx: { name: "那斯達克", close: 26140, d: -0.021 },
      sox: { name: "費城半導體", close: 11137, d: -0.038 },
      soxStreak: 8,
      sectors: [{ name: "科技", d: -0.03 }],
      tnx: 5.1,
      oil: { name: "原油", close: 101.8, d: 0.04 },
      gold: { name: "黃金", close: 4187, d: 0.004 },
    })!;
    expect(r.big).toBe(true);
    expect(r.head).toBe("美股大跌");
    expect(r.chipsWorst).toBe(true);
    expect(r.why.join("")).toContain("連跌 8 天");
    expect(r.why.join("")).toContain("十年美債利率 5.1%");
    expect(r.why.join("")).toContain("油價漲 4.0%");
  });
  it("低接卡條件", () => {
    expect(dipCheck(20, -0.05).pass).toBe(false);
    expect(dipCheck(32, -0.12).pass).toBe(true);
  });
});

describe("factsText", () => {
  it("只列數字，類股跌最多排前面", () => {
    const t = factsText({
      moves: [{ name: "標普 500", close: 7659, d: -0.011 }, null],
      soxStreak: 8,
      sectors: [
        { name: "金融", d: 0.002 },
        { name: "科技", d: -0.03 },
      ],
      tnx: 5.1,
    });
    expect(t).toBe(
      "標普 500 7659.0（-1.1%）\n費城半導體連跌 8 天\n各類股（跌最多排前面）：科技 -3.0%、金融 +0.2%\n十年美債利率 5.10%",
    );
  });
});
