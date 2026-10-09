import { describe, expect, it } from "vitest";
import { COURSES, unitsForModule } from "../courses";
import { MODULES, findModule } from "../modules";

describe("課程對照", () => {
  it("每個單元對應的頁面都存在", () => {
    for (const c of COURSES)
      for (const ch of c.chapters)
        for (const x of ch.units) if (x.module) expect(findModule(x.module), `${c.name} ${x.code}`).toBeDefined();
  });

  it("每一頁都至少對應一個課程單元", () => {
    for (const m of MODULES) expect(unitsForModule(m.slug).length, m.slug).toBeGreaterThan(0);
  });

  it("AI Agent 課九章依序對應九個章節頁", () => {
    const agent = COURSES.find((c) => c.key === "ai-agent")!;
    const chapters = MODULES.filter((m) => m.group === "agent");
    expect(agent.chapters).toHaveLength(9);
    chapters.forEach((m, i) => {
      const units = agent.chapters[i].units.filter((x) => x.module);
      expect(units.every((x) => x.module === m.slug), `第 ${i + 1} 章`).toBe(true);
    });
  });

  it("同一門課裡單元編號不重複", () => {
    for (const c of COURSES) {
      const codes = c.chapters.flatMap((ch) => ch.units.map((x) => x.code));
      expect(new Set(codes).size, c.name).toBe(codes.length);
    }
  });
});
