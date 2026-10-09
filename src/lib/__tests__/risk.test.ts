import { describe, expect, it } from "vitest";
import { DIMENSIONS, QUESTIONS, scoreAnswers, typeOf } from "../risk";

const all = (v: number) => Object.fromEntries(QUESTIONS.map((q) => [q.id, v]));

describe("risk.scoreAnswers", () => {
  it("20 題、每維度 5 題、權重合計 100%", () => {
    expect(QUESTIONS).toHaveLength(20);
    for (const d of DIMENSIONS) expect(QUESTIONS.filter((q) => q.dimension === d.key)).toHaveLength(5);
    expect(DIMENSIONS.reduce((s, d) => s + d.weight, 0)).toBeCloseTo(1);
  });

  it("全選最低分 0、最高分 100", () => {
    expect(scoreAnswers(all(0)).total).toBe(0);
    expect(scoreAnswers(all(3)).total).toBe(100);
    expect(scoreAnswers(all(3)).type.name).toBe("積極型");
  });

  it("心理承受度權重最高（35%）", () => {
    const psychOnly = Object.fromEntries(QUESTIONS.map((q) => [q.id, q.dimension === "psychology" ? 3 : 0]));
    expect(scoreAnswers(psychOnly).total).toBe(35);
  });

  it("課程範例：總分 46 為穩健型", () => {
    expect(typeOf(46).name).toBe("穩健型");
    expect(typeOf(29).name).toBe("保守型");
    expect(typeOf(80).name).toBe("積極型");
  });
});
