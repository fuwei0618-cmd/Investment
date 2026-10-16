import { describe, expect, it } from "vitest";
import { holdingAlert, taipeiToday, upcoming, verdict } from "../desk";

describe("verdict", () => {
  it("大盤在月線下就不買股票", () => {
    expect(
      verdict({ above: false, mood: "green", season: "green" }).light,
    ).toBe("red");
  });
  it("大盤在月線上、大戶在買就可以出手", () => {
    expect(
      verdict({ above: true, mood: "green", season: "yellow" }).light,
    ).toBe("green");
  });
  it("大戶撤退時只用一半的錢", () => {
    expect(
      verdict({ above: true, mood: "red", season: "green" }).title,
    ).toContain("一半");
  });
  it("抓不到大盤就不出手", () => {
    expect(
      verdict({ above: null, mood: "green", season: "green" }).light,
    ).toBeNull();
  });
});

describe("upcoming", () => {
  const list = upcoming("2026-10-16", 30);
  it("有美國央行 10/29 和 11 月營收公布", () => {
    expect(
      list.some((e) => e.date === "2026-10-29" && e.name.includes("美國央行")),
    ).toBe(true);
    expect(list.some((e) => e.date === "2026-11-10")).toBe(true);
  });
  it("台指期結算是第三個週三：10/21、11/18", () => {
    expect(
      upcoming("2026-10-16", 40)
        .filter((e) => e.name === "台指期結算")
        .map((e) => e.date),
    ).toEqual(["2026-10-21", "2026-11-18"]);
  });
  it("就業報告在第一個週五", () => {
    expect(list.find((e) => e.name === "美國就業報告")?.date).toBe(
      "2026-11-06",
    );
  });
  it("依日期排、不含過去", () => {
    expect(
      list.every(
        (e, i) =>
          e.date >= "2026-10-16" && (i === 0 || list[i - 1].date <= e.date),
      ),
    ).toBe(true);
  });
});

describe("holdingAlert", () => {
  const h = {
    saved: "2026-10-01",
    code: "2882",
    name: "國泰金",
    price: 70,
    shares: 1000,
    stop: 65,
    target: 80,
  };
  it("跌破停損要賣", () => expect(holdingAlert(h, 64).tone).toBe("red"));
  it("到停利先賣一半", () => expect(holdingAlert(h, 81).tone).toBe("green"));
  it("算賺賠", () => expect(holdingAlert(h, 72).pnl).toBe(2000));
});

it("台灣時間的今天", () => {
  expect(taipeiToday(new Date("2026-10-16T17:00:00Z"))).toBe("2026-10-17");
});
