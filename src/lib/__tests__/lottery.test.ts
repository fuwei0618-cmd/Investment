import { describe, expect, it } from "vitest";
import { judge, parseTwse, phaseOf, rocToIso } from "../lottery";

const json = {
  fields: ["序號", "抽籤日期", "證券名稱", "證券代號", "發行市場", "申購開始日", "申購結束日", "承銷股數", "實際承銷股數", "承銷價(元)", "實際承銷價(元)", "撥券日期(上市、上櫃日期)", "主辦券商", "申購股數", "總承銷金額(元)", "總合格件", "中籤率(%)", "取消公開抽籤 "],
  data: [
    ["1", "115/10/22", "和暢科技", "6825", "初上櫃", "115/10/16", "115/10/20", "1,042,000", "1,042,000", "25", "未訂出", "115/10/29", "宏遠", "1,000", "未訂出", "0", "0", ""],
    ["2", "115/10/14", "某公司", "1234", "上市增資", "115/10/08", "115/10/12", "500,000", "500,000", "50", "52.5", "115/10/21", "元大", "1,000", "", "300,000", "1.2", ""],
    ["3", "115/10/20", "115央債甲09", "A151IA", "中央登錄公債", "115/10/12", "115/10/16", "100,000", "100,000", "100", "100", "115/10/23", "中華郵政公司", "1,000", "10,000,000", "0", "0", ""],
    ["4", "115/10/20", "取消案", "9999", "上櫃增資", "115/10/12", "115/10/16", "1", "1", "10", "", "115/10/23", "x", "1,000", "", "0", "0", "取消"],
  ],
};

describe("股票抽籤", () => {
  it("民國日期轉西元", () => {
    expect(rocToIso("115/10/22")).toBe("2026-10-22");
    expect(rocToIso("未訂出")).toBe("");
  });

  it("解析公告：去掉公債和取消的，優先用實際承銷價", () => {
    const l = parseTwse(json);
    expect(l.map((x) => x.code)).toEqual(["6825", "1234"]);
    expect(l[0].price).toBe(25);
    expect(l[1].price).toBe(52.5);
    expect(l[1].winRate).toBe(1.2);
    expect(l[0].winRate).toBeNull();
  });

  it("依日期分成快開始、可以抽、等抽籤或剛抽完", () => {
    const [a, b] = parseTwse(json);
    expect(phaseOf(a, "2026-10-13")).toBe("soon");
    expect(phaseOf(a, "2026-10-18")).toBe("open");
    expect(phaseOf(b, "2026-10-13")).toBe("drawn");
    expect(phaseOf(b, "2026-11-30")).toBeNull();
  });

  it("算一張賺多少、划算的中籤率", () => {
    const [a, b] = parseTwse(json);
    expect(judge(a, null).tone).toBe("unknown");
    const v = judge(b, 70);
    expect(v.gain).toBe(17500);
    expect(v.tone).toBe("good");
    expect(v.breakEven!).toBeCloseTo((20 / 17450) * 100);
    expect(judge(b, 50).tone).toBe("bad");
    expect(judge(b, 54).tone).toBe("meh");
  });
});
