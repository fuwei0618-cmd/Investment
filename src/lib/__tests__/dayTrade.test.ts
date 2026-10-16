import { describe, expect, it } from "vitest";
import {
  breakEven,
  isTradingTime,
  parseDayTrade,
  parseMis,
  parseVolumes,
  readTable,
  tick,
} from "../dayTrade";

describe("認識當沖", () => {
  it("成本：手續費兩邊各算、證交稅 0.15%，算出要漲幾檔", () => {
    const r = breakEven(100, 1000);
    expect(r).toMatchObject({ amount: 100000, fees: 286, tax: 150, cost: 436 });
    expect(r.pct).toBeCloseTo(0.00436);
    expect(r.ticks).toBe(1); // 100 元一檔是 0.5 元
    expect(breakEven(66.9, 1000).ticks).toBe(3);
    expect(breakEven(100, 1000, 0.28).fees).toBe(80);
  });
  it("跳動單位", () => {
    expect([
      tick(9),
      tick(30),
      tick(66.9),
      tick(255),
      tick(557),
      tick(1055),
    ]).toEqual([0.01, 0.05, 0.1, 0.5, 1, 5]);
  });
  it("讀 CSV（前面有標題列）和 tables 格式的 JSON", () => {
    const csv =
      '﻿"115年10月16日 當日沖銷交易統計"\n"證券代號","證券名稱","暫停註記","當日沖銷交易成交股數","買進金額","賣出金額"\n"2330","台積電","","5,000,000","1","1"\n"1802","台玻","","12,000,000","1","1"\n"0050","元大台灣50","","9,000,000","1","1"\n"備註"';
    const vol = parseVolumes(
      '"證券代號","證券名稱","成交股數"\n"2330","台積電","25,000,000"\n"1802","台玻","40,000,000"',
    );
    const rows = parseDayTrade(csv, vol);
    expect(rows.map((r) => r.code)).toEqual(["1802", "2330"]);
    expect(rows[0]).toMatchObject({ name: "台玻", lots: 12000 });
    expect(rows[0].ratio).toBeCloseTo(0.3);
    const json = {
      tables: [
        { fields: ["總計"], data: [] },
        {
          fields: ["證券代號", "證券名稱", "當日沖銷交易成交股數"],
          data: [["2330", "台積電", "1,000"]],
        },
      ],
    };
    expect(readTable(json, "當日沖銷交易成交股數")?.data.length).toBe(1);
  });
  it("即時報價還沒成交時用最佳買價", () => {
    const r = parseMis({
      msgArray: [
        {
          c: "2330",
          n: "台積電",
          z: "-",
          b: "1050.0000_1045.0000_",
          a: "1055.0000_",
          y: "1040.0000",
          h: "-",
          l: "-",
          v: "12",
          t: "09:00:05",
        },
      ],
    });
    expect(r[0]).toMatchObject({
      code: "2330",
      price: 1050,
      prev: 1040,
      high: null,
      vol: 12,
    });
  });
  it("盤中時間用台北時間算", () => {
    expect(isTradingTime(new Date("2026-10-16T02:00:00Z"))).toBe(true); // 週五 10:00
    expect(isTradingTime(new Date("2026-10-16T06:00:00Z"))).toBe(false); // 14:00
    expect(isTradingTime(new Date("2026-10-17T02:00:00Z"))).toBe(false); // 週六
  });
});
