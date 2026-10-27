import { describe, expect, it } from "vitest";
import { cleanCode, epsSummary, instSummary, instWord, isCode, parseEps, peBand, quadrant, revenueYoy } from "../stock";

const inst = (date: string, name: string, net: number) => ({ date, name, buy: net > 0 ? net * 1000 : 0, sell: net < 0 ? -net * 1000 : 0 });

describe("查一檔", () => {
  it("法人買賣超：換算成張、算連買天數與合計", () => {
    const rows = [
      inst("2026-10-27", "Foreign_Investor", 300),
      inst("2026-10-27", "Investment_Trust", 50),
      inst("2026-10-24", "Foreign_Investor", 200),
      inst("2026-10-24", "Investment_Trust", -20),
      inst("2026-10-23", "Foreign_Investor", 100),
      inst("2026-10-23", "Dealer_self", 999), // 自營商不算
    ];
    const s = instSummary(rows);
    expect(s.days.map((d) => d.date)).toEqual(["2026-10-27", "2026-10-24", "2026-10-23"]);
    expect(s.foreign).toEqual({ total: 600, buyStreak: 3, sellStreak: 0 });
    expect(s.trust).toEqual({ total: 30, buyStreak: 1, sellStreak: 0 });
    expect(instWord(s).tone).toBe("meh");
  });

  it("法人一句話：兩邊連買三天才是排隊", () => {
    const rows = ["2026-10-27", "2026-10-24", "2026-10-23"].flatMap((d) => [inst(d, "Foreign_Investor", 10), inst(d, "Investment_Trust", 5)]);
    expect(instWord(instSummary(rows)).tone).toBe("good");
    const sell = rows.map((r) => ({ ...r, buy: r.sell, sell: r.buy }));
    expect(instWord(instSummary(sell)).tone).toBe("bad");
  });

  it("EPS：四季合計跟前四季比", () => {
    const qs = parseEps([
      { date: "2026-06-30", type: "EPS", value: 3 },
      { date: "2026-06-30", type: "Revenue", value: 999 },
      { date: "2026-03-31", type: "EPS", value: 2 },
      { date: "2025-12-31", type: "EPS", value: 2 },
      { date: "2025-09-30", type: "EPS", value: 2 },
      { date: "2025-06-30", type: "EPS", value: 1 },
      { date: "2025-03-31", type: "EPS", value: 1 },
      { date: "2024-12-31", type: "EPS", value: 1 },
      { date: "2024-09-30", type: "EPS", value: 1 },
    ]);
    const e = epsSummary(qs);
    expect(e.ttm).toBe(9);
    expect(e.prev).toBe(4);
    expect(e.growth).toBeCloseTo(125);
    expect(e.yoy).toBeCloseTo(200);
  });

  it("月營收：跟去年同月比", () => {
    const r = revenueYoy([
      { revenue_year: 2026, revenue_month: 9, revenue: 120 },
      { revenue_year: 2025, revenue_month: 9, revenue: 100 },
      { revenue_year: 2026, revenue_month: 8, revenue: 90 },
    ]);
    expect(r?.year).toBe(2026);
    expect(r?.month).toBe(9);
    expect(r?.yoy).toBeCloseTo(20);
  });

  it("本益比區間：平均加減一個標準差", () => {
    const rows = Array.from({ length: 100 }, (_, i) => ({ date: `2025-01-${String((i % 28) + 1).padStart(2, "0")}`, PER: 20 + (i % 5) }));
    rows.push({ date: "2026-10-27", PER: 40 });
    const b = peBand(rows)!;
    expect(b.now).toBe(40);
    expect(b.level).toBe("pricey");
    expect(b.rank).toBe(1);
    expect(peBand(rows.slice(0, 5))).toBeNull();
  });

  it("四象限結論", () => {
    const good = { last4: [], ttm: 9, prev: 4, growth: 125, yoy: 200 };
    const bad = { ...good, growth: -10 };
    const cheap = { now: 10, date: "", avg: 15, low: 12, high: 18, min: 8, max: 25, rank: 0.1, level: "cheap" as const };
    const pricey = { ...cheap, now: 30, level: "pricey" as const };
    expect(quadrant(good, { yoy: 10 }, cheap).cell).toBe("go");
    expect(quadrant(good, { yoy: 10 }, pricey).cell).toBe("wait");
    expect(quadrant(bad, { yoy: -5 }, cheap).cell).toBe("trap");
    expect(quadrant(bad, { yoy: -5 }, pricey).cell).toBe("run");
    expect(quadrant(good, { yoy: 10 }, null).cell).toBe("unknown");
  });

  it("股號清理", () => {
    expect(cleanCode(" 3008.tw ")).toBe("3008");
    expect(isCode("3008")).toBe(true);
    expect(isCode("00878")).toBe(true);
    expect(isCode("abc")).toBe(false);
  });
});
