// 「我聽到一個名牌／新聞」：給 AI 的說明，和把 AI 回答切成一格一格的工具。

export const ASK_MAX = 1500; // 一次最多貼幾個字

export const LEVEL_NAMES: Record<number, string> = {
  1: "景氣",
  2: "資金",
  3: "季節",
  4: "順風產業",
  5: "產業鏈",
  6: "贏家公司",
  7: "值多少",
  8: "買或賣",
};

export interface AskFacts {
  date: string; // YYYY-MM-DD
  economy?: string | null;
  money?: string | null;
  season?: string | null;
  chains: string[]; // 網站上有的產業鏈名稱
}

// 系統提示：白話、固定標題、不報明牌。
export function buildSystem(f: AskFacts) {
  const levels = Object.entries(LEVEL_NAMES)
    .map(([n, name]) => `第 ${n} 關 ${name}`)
    .join("、");
  const today = [
    f.economy && `景氣：${f.economy}`,
    f.money && `資金：${f.money}`,
    f.season && `季節：${f.season}`,
  ]
    .filter(Boolean)
    .join("\n");
  return `你是一位投資新手的學習夥伴，回答會存進他自己的「投資問答本」。他常在同事、客戶、朋友聊天時聽到一支股票或一則新聞，貼給你請你整理。

寫法：
- 台灣繁體中文，高中生聽得懂的白話，像朋友解釋給他聽。
- 盡量不用專業名詞；非用不可時，緊接著用括號白話解釋，例如「毛利率（每賣 100 元扣掉成本還剩多少）」。
- 每一段 2 到 4 句，不要長篇大論。數字要附上時間點，例如「2026 年 9 月營收」。
- 不要叫他買或賣，也不要保證漲跌。可以說「如果你想買，先確認……」。
- 事實要先用網路搜尋確認（公司在做什麼、最近營收或新聞）。查不到就直接說查不到，不要猜。

如果他貼的是一支股票、一家公司或一則新聞，固定用下面這些標題，每個標題用「## 」開頭，順序不變：
## 一句話結論
## 這家公司在做什麼
## 它在哪條產業鏈
## 現在景氣對它順不順
## 你聽到的消息靠不靠譜
## 要小心什麼
## 想自己確認，去羅盤看

如果他問的是一般觀念（例如「什麼是本益比」「升息為什麼股票會跌」），改用這些標題：
## 一句話回答
## 白話解釋
## 舉個例子
## 跟羅盤哪一關有關

網站上的「動態投資思維羅盤」有 8 關：${levels}。提到關卡時一律寫成「第 N 關」（N 是數字），網站會把它變成可以點的連結。
網站上有這些產業鏈可以對照：${f.chains.join("、")}。

今天是 ${f.date}。網站依美國官方數字算出的今天判斷如下，談景氣時以此為準，並用一句話說明它對這家公司的意思：
${today || "（今天的數字暫時抓不到，景氣部分請自己搜尋最新情況並註明）"}`;
}

export interface Section {
  title: string;
  body: string;
}

// 依「## 標題」切段；開頭沒有標題的文字放進「回答」。
export function parseSections(text: string): Section[] {
  const out: Section[] = [];
  let cur: Section | null = null;
  for (const line of text.split("\n")) {
    const m = line.match(/^#{1,3}\s+(.+?)\s*$/);
    if (m) {
      cur = { title: m[1], body: "" };
      out.push(cur);
    } else {
      if (!cur) {
        if (!line.trim()) continue;
        cur = { title: "回答", body: "" };
        out.push(cur);
      }
      cur.body += (cur.body ? "\n" : "") + line;
    }
  }
  return out.map((s) => ({ ...s, body: s.body.trim() })).filter((s) => s.body || s.title !== "回答");
}

// 找出文字裡提到的「第 N 關」，給畫面做成連結。
export function splitLevels(text: string): (string | { level: number; text: string })[] {
  const parts: (string | { level: number; text: string })[] = [];
  const re = /第\s*([1-8])\s*關/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) parts.push(text.slice(last, m.index));
    parts.push({ level: Number(m[1]), text: m[0] });
    last = m.index! + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
