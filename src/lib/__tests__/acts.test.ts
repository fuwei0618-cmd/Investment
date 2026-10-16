import { describe, expect, it } from "vitest";
import { ACTS, actOf, isHere } from "../acts";

describe("六幕站牌", () => {
  it("每一頁對到正確的幕", () => {
    expect(actOf("/risk")?.n).toBe(1);
    expect(actOf("/money")?.n).toBe(1);
    expect(actOf("/tools/seasons")?.n).toBe(3);
    expect(actOf("/chips")?.n).toBe(5);
    expect(actOf("/courses")).toBeNull();
  });
  it("看市場照關卡分到第二、四、六幕", () => {
    expect([1, 3, 4, 6, 7, 8].map((l) => actOf("/market", l)?.n)).toEqual([2, 2, 4, 4, 6, 6]);
    expect(isHere(ACTS[3].pages[0], "/market", 5)).toBe(true);
    expect(isHere(ACTS[1].pages[0], "/market", 5)).toBe(false);
  });
});
