// 伺服器端：抓 FRED 數字，算出看市場前 3 關的今日答案（首頁與看市場共用）。
import { cache } from "react";
import { getSeries } from "@/lib/fred";
import { FRED_VIEW, yoyPct } from "@/lib/compass";
import { valueDaysAgo } from "@/lib/industry";
import { economyAnswer, moneyAnswer, seasonAnswer } from "@/lib/today";

// 同一次請求裡多個區塊共用一份結果。
export const getTodayAnswers = cache(async () => {
  const [payems, sahm, retail, rate, pce, gdp, cpi] = await Promise.all(
    ["PAYEMS", "SAHMREALTIME", "RSAFS", "FEDFUNDS", "PCEPILFE", "GDPC1", "CPIAUCSL"].map((id) => getSeries(id)),
  );
  const growth = gdp ? yoyPct(gdp) : null;
  const inflation = cpi ? yoyPct(cpi) : null;
  return {
    economy: economyAnswer({
      payrollK: payems ? FRED_VIEW.PAYEMS.calc(payems) : null,
      sahm: sahm?.at(-1)?.value ?? null,
      retailYoy: retail ? yoyPct(retail) : null,
    }),
    money: moneyAnswer({
      rate: rate?.at(-1)?.value ?? null,
      rate6mAgo: rate ? (valueDaysAgo(rate, 180) ?? null) : null,
      corePce: pce ? yoyPct(pce) : null,
    }),
    season: seasonAnswer({ gdpYoy: growth, cpiYoy: inflation }),
    growth,
    inflation,
  };
});
