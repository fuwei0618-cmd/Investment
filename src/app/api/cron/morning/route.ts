import type { NextRequest } from "next/server";
import { mood } from "@/lib/chips";
import { getChips } from "@/lib/chipsData";
import { cronOk } from "@/lib/cronAuth";
import { taipeiToday, upcoming, verdict } from "@/lib/desk";
import { getTaiex } from "@/lib/deskData";
import { pushLine } from "@/lib/line";
import { composeMorning } from "@/lib/notify";
import { getPicks, type PlayId } from "@/lib/pickData";
import { getTodayAnswers } from "@/lib/todayData";

const TITLES: Record<PlayId, string> = {
  breakout: "大戶進場的波段",
  trust: "跟著投信買",
};

// 每個交易日 8:30 左右（vercel.json 排程）：今天能不能出手、近兩天大事、策略卡名單
export async function GET(request: NextRequest) {
  if (!cronOk(request))
    return Response.json({ error: "只給排程用" }, { status: 401 });
  try {
    const plays: PlayId[] = ["breakout", "trust"];
    const [taiex, chips, t, ...lists] = await Promise.all([
      getTaiex(),
      getChips(),
      getTodayAnswers(),
      ...plays.map((p) => getPicks(p)),
    ]);
    const m = chips ? mood(chips.days, chips.margin?.change ?? null) : null;
    const text = composeMorning({
      date: taipeiToday(),
      verdict: verdict({
        above: taiex?.above ?? null,
        mood: m?.light ?? null,
        season: t.season?.light ?? null,
      }),
      events: upcoming(taipeiToday(), 1),
      picks: plays.map((p, i) => {
        const d = lists[i];
        return {
          title: TITLES[p],
          names:
            "picks" in d
              ? d.picks
                  .filter((x) => x.pass)
                  .slice(0, 3)
                  .map((x) => `${x.name} ${x.code}`)
              : [],
        };
      }),
    });
    await pushLine(text);
    return Response.json({ sent: text });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "失敗" },
      { status: 500 },
    );
  }
}
