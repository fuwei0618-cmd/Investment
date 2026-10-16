import { describe, expect, it } from "vitest";
import { parseInstitutional, parseMargin, streak } from "../chips";

describe("麵包鎮的大戶", () => {
  const rows = [
    { date: "2026-10-13", name: "Foreign_Investor", buy: 5e9, sell: 3e9 },
    { date: "2026-10-13", name: "Foreign_Dealer_Self", buy: 1e8, sell: 0 },
    { date: "2026-10-13", name: "Investment_Trust", buy: 1e9, sell: 2e9 },
    { date: "2026-10-13", name: "total", buy: 9e9, sell: 9e9 },
    { date: "2026-10-14", name: "Foreign_Investor", buy: 4e9, sell: 1e9 },
    { date: "2026-10-14", name: "Dealer_Hedging", buy: 0, sell: 5e8 },
  ];
  it("三大法人照日期加總成億元，總計那行不算", () => {
    const days = parseInstitutional(rows);
    expect(days.map((d) => d.date)).toEqual(["2026-10-13", "2026-10-14"]);
    expect(days[0].net.foreign).toBeCloseTo(21);
    expect(days[0].net.trust).toBeCloseTo(-10);
    expect(days[1].net.dealer).toBeCloseTo(-5);
  });
  it("連續買超天數", () => {
    const days = parseInstitutional(rows);
    expect(streak(days, "foreign")).toBe(2);
    expect(streak(days, "dealer")).toBe(-1);
  });
  it("融資餘額", () => {
    const m = parseMargin([{ date: "2026-10-14", name: "MarginPurchaseMoney", TodayBalance: 3.1e11, YesBalance: 3e11 }]);
    expect(m?.today).toBeCloseTo(3100);
    expect(m?.change).toBeCloseTo(100);
  });
});

describe("大戶劇場、氣氛燈、逛街地圖", async () => {
  const { mood, story, parseStreets, hotStreets } = await import("../chips");
  const day = (date: string, foreign: number, trust = 0) => ({ date, net: { foreign, trust, dealer: 0 } });
  it("外資大賣、鎮民還在借錢買是紅燈", () => {
    const days = [day("1", -200), day("2", -300), day("3", -100)];
    expect(mood(days, 50)?.name).toBe("大戶撤退、鎮民在接");
    expect(mood([day("1", 300, 10), day("2", 300, 10)], -5)?.light).toBe("green");
  });
  it("劇場四格都有字", () => {
    const s = story([day("1", -100), day("2", -3026, 293)], { change: -51 }, { sell: "半導體" });
    expect(s).toHaveLength(4);
    expect(s[0].text).toContain("半導體");
    expect(s[0].text).toContain("連續賣 2 天");
  });
  it("股數乘收盤價加到每條街，ETF 自成一條街", () => {
    const t86 = {
      fields: ["證券代號", "證券名稱", "外陸資買進股數(不含外資自營商)", "外陸資賣出股數(不含外資自營商)", "外陸資買賣超股數(不含外資自營商)", "投信買賣超股數"],
      data: [
        ["2330", "台積電", "0", "0", "-10,000,000", "1,000,000"],
        ["2303", "聯電", "0", "0", "20,000,000", "0"],
        ["0050", "元大台灣50", "0", "0", "5,000,000", "0"],
        ["9999", "沒價格", "0", "0", "1", "0"],
      ],
    };
    const st = parseStreets(
      t86,
      [
        { Code: "2330", ClosingPrice: "1000.00" },
        { Code: "2303", ClosingPrice: "50" },
        { Code: "0050", ClosingPrice: "60" },
      ],
      [
        { 公司代號: "2330", 產業別: "24" },
        { 公司代號: "2303", 產業別: "24" },
      ],
    );
    const semi = st.find((s) => s.id === "24")!;
    expect(semi.name).toBe("半導體");
    expect(semi.foreign).toBeCloseTo(-90);
    expect(semi.shops[0].name).toBe("台積電");
    expect(st.find((s) => s.id === "ETF")?.foreign).toBeCloseTo(3);
    expect(hotStreets(st)).toEqual({ buy: "整條街都買（指數基金）", sell: "半導體" });
  });
});
