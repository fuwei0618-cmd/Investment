import { describe, expect, it } from "vitest";
import { changeOver, clockPhase, clockTrail, weekly } from "../live";

describe("看市場動態儀表板", () => {
  it("日資料壓成每週最後一筆", () => {
    const s = weekly([
      { date: "2026-10-05", value: 1 }, // 週一
      { date: "2026-10-08", value: 2 },
      { date: "2026-10-12", value: 3 }, // 下週一
    ]);
    expect(s.map((o) => o.value)).toEqual([2, 3]);
  });

  it("和 3 個月前比較", () => {
    const s = [
      { date: "2026-06-01", value: 10 },
      { date: "2026-07-01", value: 11 },
      { date: "2026-09-01", value: 13 },
    ];
    expect(changeOver(s, 91)).toBe(3);
  });

  it("景氣時鐘：成長高於平均且加速為擴張，低於平均且減速為衰退", () => {
    expect(clockPhase({ date: "", level: 3, accel: 0.5 }, 1)).toBe("expansion");
    expect(clockPhase({ date: "", level: 3, accel: -0.5 }, 1)).toBe("slowdown");
    expect(clockPhase({ date: "", level: 0, accel: -0.5 }, 1)).toBe("recession");
    expect(clockPhase({ date: "", level: 0, accel: 0.5 }, 1)).toBe("recovery");
  });

  it("時鐘軌跡取最近的月份，加速度是和 3 個月前比", () => {
    const yoy = Array.from({ length: 30 }, (_, i) => ({ date: `2024-${String((i % 12) + 1).padStart(2, "0")}-01`, value: i }));
    const { trail } = clockTrail(yoy, 24);
    expect(trail).toHaveLength(24);
    expect(trail.at(-1)!.accel).toBeCloseTo(3);
  });
});
