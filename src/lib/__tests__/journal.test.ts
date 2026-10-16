import { describe, expect, it } from "vitest";
import { close, stats, summary } from "../journal";

const h = {
  saved: "2026-10-01",
  code: "2882",
  name: "國泰金",
  price: 70,
  shares: 1000,
  stop: 65,
  target: 80,
  play: "台股大戶進場的波段",
};

describe("交易成績單", () => {
  it("賣價碰停損就記停損、碰停利記停利", () => {
    expect(close(h, "tw", 64, 70, "2026-10-10").why).toBe("stop");
    expect(close(h, "tw", 81, 70, "2026-10-10").why).toBe("target");
    expect(close(h, "tw", 72, 70, "2026-10-10").why).toBe("other");
  });
  it("勝率、平均賺賠", () => {
    const s = stats([
      close(h, "tw", 80.5, 70, "2026-10-10"),
      close(h, "tw", 66.5, 70, "2026-10-11"),
      close(h, "tw", 77, 70, "2026-10-12"),
    ]);
    expect(s.n).toBe(3);
    expect(s.wins).toBe(2);
    expect(s.rate).toBeCloseTo(2 / 3);
    expect(s.avgLoss).toBeCloseTo(-0.05);
    expect(s.total).toBe(10500 - 3500 + 7000);
    expect(summary(s)).toContain("勝率 67%");
  });
  it("沒有紀錄", () => {
    expect(summary(stats([]))).toBe("還沒有賣掉的紀錄。");
  });
});
