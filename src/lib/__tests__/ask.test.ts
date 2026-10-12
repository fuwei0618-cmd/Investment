import { describe, expect, it } from "vitest";
import { buildSystem, parseSections, splitLevels } from "../ask";
import { findTerms } from "../glossary";

describe("問 AI", () => {
  it("系統提示帶今天的判斷與產業鏈", () => {
    const s = buildSystem({ date: "2026-10-12", economy: "景氣不錯", money: null, season: "擴張", chains: ["半導體與 AI"] });
    expect(s).toContain("景氣：景氣不錯");
    expect(s).toContain("季節：擴張");
    expect(s).not.toContain("資金：");
    expect(s).toContain("半導體與 AI");
    expect(s).toContain("## 一句話結論");
  });

  it("沒有今天的數字時改請 AI 自己查", () => {
    expect(buildSystem({ date: "2026-10-12", chains: [] })).toContain("暫時抓不到");
  });

  it("依 ## 標題切段，開頭沒標題的放進「回答」", () => {
    const out = parseSections("先說一句\n\n## 一句話結論\n不錯\n\n## 要小心什麼\n- 貴\n- 景氣");
    expect(out.map((s) => s.title)).toEqual(["回答", "一句話結論", "要小心什麼"]);
    expect(out[2].body).toBe("- 貴\n- 景氣");
  });

  it("把「第 N 關」切出來做連結", () => {
    expect(splitLevels("去第 6 關打勾，再到第7關算價")).toEqual([
      "去",
      { level: 6, text: "第 6 關" },
      "打勾，再到",
      { level: 7, text: "第7關" },
      "算價",
    ]);
  });
});

describe("名詞小字典", () => {
  it("找出文字裡的名詞，長的優先、不重疊", () => {
    const parts = findTerms("看毛利率和本益比標準差");
    const terms = parts.filter((p) => typeof p !== "string").map((p) => (p as { term: string }).term);
    expect(terms).toEqual(["毛利率", "本益比標準差"]);
  });

  it("沒有名詞就原樣回傳", () => {
    expect(findTerms("今天天氣好")).toEqual(["今天天氣好"]);
  });
});
