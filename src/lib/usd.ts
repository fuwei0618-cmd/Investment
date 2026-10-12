// 美元專區：新台幣匯率在過去 10 年的位置、美台利差，以及美元代表什麼。
import type { Observation } from "./macro";

// 台灣央行政策利率（重貼現率）。FRED 沒有即時數列，央行每季開會後要手動更新。
export const TW_RATE = { rate: 2, date: "2026-09-17" };

export interface UsdStats {
  now: number;
  date: string;
  min: number;
  max: number;
  avg: number;
  pct: number; // 過去有幾 % 的日子比現在便宜（0–100）
  yearAgo: number | null;
}

// DEXTAUS：1 美元換多少新台幣。
export function usdStats(s: Observation[]): UsdStats | null {
  if (s.length < 2) return null;
  const last = s.at(-1)!;
  const vals = s.map((o) => o.value);
  const from = new Date(new Date(last.date).getTime() - 365 * 86_400_000).toISOString().slice(0, 10);
  const yearAgo = s.find((o) => o.date >= from)?.value ?? null;
  return {
    now: last.value,
    date: last.date,
    min: Math.min(...vals),
    max: Math.max(...vals),
    avg: vals.reduce((a, v) => a + v, 0) / vals.length,
    pct: Math.round((vals.filter((v) => v < last.value).length / vals.length) * 100),
    yearAgo,
  };
}

// 白話說現在美元算貴還便宜。
export function usdLevel(pct: number) {
  if (pct >= 80) return { word: "偏貴", tone: "red" as const };
  if (pct >= 60) return { word: "中間偏貴", tone: "amber" as const };
  if (pct > 40) return { word: "差不多中間", tone: "zinc" as const };
  if (pct > 20) return { word: "中間偏便宜", tone: "sky" as const };
  return { word: "偏便宜", tone: "emerald" as const };
}

export const USD_MEANINGS = [
  { icon: "🌊", title: "全世界的錢往哪跑", text: "美元變強，代表錢流回美國；借美元的新興國家還錢壓力變大，股市容易被賣。" },
  { icon: "🛟", title: "大家怕不怕", text: "市場一緊張，大家會搶美元避險。美元突然急漲，常是有壞消息的訊號。" },
  { icon: "💰", title: "利差", text: "美國利息比台灣高，存美元、買美債就多拿利息。這是美元定存和美元保單吸引人的原因。" },
  { icon: "🏃", title: "外資在不在台灣", text: "外資賣台股要把台幣換成美元匯出，所以新台幣突然變弱，常伴隨外資賣超。" },
  { icon: "🚢", title: "出口公司賺多賺少", text: "台積電這類賺美元的公司，新台幣變弱時換回的台幣變多，帳面獲利比較好看；變強時相反。" },
  { icon: "✈️", title: "你的荷包", text: "出國、買美股、繳美元保單，都直接看匯率。1 美元多 1 元台幣，10 萬美元就差 10 萬台幣。" },
];

// 客戶問「美元現在很貴，會不會換在高點？」時的誠實說法，數字跟著今天的匯率和利差變。
export function clientTalk(st: UsdStats | null, spread: number | null): { title: string; say: string }[] {
  const f = (v: number) => v.toFixed(2);
  const where = st
    ? `過去 10 年，1 美元在 ${f(st.min)} 到 ${f(st.max)} 台幣之間，平均約 ${f(st.avg)}。現在是 ${f(st.now)}，比過去 ${st.pct}% 的日子貴，算${usdLevel(st.pct).word}。`
    : "先查一下現在的匯率在過去 10 年的高低範圍，讓客戶自己看位置。";
  const carry =
    spread !== null && spread > 0
      ? `現在美國利率比台灣高約 ${spread.toFixed(1)} 個百分點。放一年多拿的利息，大約可以抵掉每 1 美元跌 ${((st?.now ?? 30) * spread / 100).toFixed(1)} 元台幣的損失${st ? `（例如從 ${f(st.now)} 跌到 ${f(st.now * (1 - spread / 100))}）` : ""}。`
      : "美元利率不一定比台幣高，要先看現在的利差，再說利息能不能抵匯率波動。";
  return [
    { title: "先讓客戶看位置", say: where },
    { title: "換美元是看用途，不是賭匯率", say: "以後要用美元的錢，例如留學、出國、美股、美元保單，本來就該準備一部分美元。用途確定，短期匯率高低就沒那麼重要。" },
    { title: "利息能抵掉一部分波動", say: carry },
    { title: "分批換，不用一次決定", say: "不用一次換完。分 3 到 6 次、每隔一段時間換一點，平均下來就不會剛好換在最高點。" },
    { title: "放越久，匯率影響越小", say: "短期匯率誰都猜不準。放得越久，累積的利息越多，進場那天的匯率影響就相對變小。" },
    { title: "不要說的話", say: "不要說「美元一定會漲」「穩賺匯差」。匯率會兩邊走，講實話，萬一美元跌了客戶才不會覺得被騙。" },
  ];
}
