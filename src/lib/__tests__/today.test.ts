import { describe, expect, it } from "vitest";
import { economyAnswer, moneyAnswer, seasonAnswer } from "../today";

describe("今天的答案", () => {
  it("景氣：就業健康為綠燈、薩姆觸發為紅燈", () => {
    expect(economyAnswer({ payrollK: 18, sahm: 0.2, retailYoy: 4 })?.light).toBe("green");
    expect(economyAnswer({ payrollK: 3, sahm: 0.2, retailYoy: 4 })?.light).toBe("yellow");
    expect(economyAnswer({ payrollK: 10, sahm: 0.6, retailYoy: 4 })?.light).toBe("red");
    expect(economyAnswer({ payrollK: null, sahm: 0.2, retailYoy: 4 })).toBeNull();
  });

  it("資金：半年降息為綠燈、升息為紅燈", () => {
    expect(moneyAnswer({ rate: 3.75, rate6mAgo: 4.33, corePce: 2.2 })?.light).toBe("green");
    expect(moneyAnswer({ rate: 5.3, rate6mAgo: 4.8, corePce: 3 })?.light).toBe("red");
    expect(moneyAnswer({ rate: 4, rate6mAgo: 4, corePce: 3 })?.answer).toContain("物價還偏高");
  });

  it("季節：成長與物價都高於平均為擴張", () => {
    const a = seasonAnswer({ gdpYoy: 2.2, cpiYoy: 3.4 });
    expect(a?.phase).toBe("expansion");
    expect(a?.answer).toContain("擴張");
  });
});
