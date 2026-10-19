import { describe, expect, it } from "vitest";
import { buyFeeOf, sellFeeOf } from "../fees";

describe("手續費估算", () => {
  it("美股 ETF 整股每筆 3 美元", () => {
    expect(buyFeeOf("us", "SH", 32.31, 3)).toBe(3);
    expect(sellFeeOf("us", "SH", 34.89, 3)).toBe(3);
    expect(buyFeeOf("us", "XLK", 200, 2)).toBe(3);
  });
  it("美股個股、碎股 0.08% 沒有低消", () => {
    expect(buyFeeOf("us", "NVDA", 100, 10)).toBe(0.8);
    expect(buyFeeOf("us", "SH", 32, 1.5)).toBe(0.04);
  });
  it("台股手續費最低 20 元，賣出加證交稅", () => {
    expect(buyFeeOf("tw", "2330", 50, 100)).toBe(20);
    expect(buyFeeOf("tw", "2330", 1000, 1000)).toBe(1425);
    expect(sellFeeOf("tw", "2330", 1000, 1000)).toBe(1425 + 3000);
    expect(sellFeeOf("tw", "00632R", 10, 1000)).toBe(20 + 10);
  });
});
