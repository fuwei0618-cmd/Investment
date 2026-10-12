import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import { ASK_MAX, buildSystem } from "@/lib/ask";
import { CHAINS } from "@/lib/chains";
import { getTodayAnswers } from "@/lib/todayData";

// 搜尋網路＋整理要一點時間。
export const maxDuration = 120;

type Source = { title: string; url: string };

// 「我聽到一支股票／一則新聞」：交給 Claude 上網查證後，用白話整理成固定幾格。
// 金鑰只放在 Vercel 環境變數 ANTHROPIC_API_KEY；有設 ASK_PASSCODE 時要先輸入通關密語，避免別人用掉額度。
export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "not-configured" }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as { q?: unknown; passcode?: unknown } | null;
  const pass = process.env.ASK_PASSCODE;
  if (pass && body?.passcode !== pass) {
    return Response.json({ error: "passcode" }, { status: 401 });
  }
  const q = typeof body?.q === "string" ? body.q.trim() : "";
  if (!q) return Response.json({ error: "請先輸入想問的內容" }, { status: 400 });
  if (q.length > ASK_MAX) return Response.json({ error: `太長了，請縮短到 ${ASK_MAX} 字以內` }, { status: 400 });

  const t = await getTodayAnswers().catch(() => null);
  const system = buildSystem({
    date: new Date().toISOString().slice(0, 10),
    economy: t?.economy?.answer,
    money: t?.money?.answer,
    season: t?.season?.answer,
    chains: CHAINS.map((c) => c.title),
  });

  const client = new Anthropic();
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: q }];
  try {
    let res: Anthropic.Beta.BetaMessage | null = null;
    // 搜尋太多次時伺服器會先暫停（pause_turn），把目前內容接回去讓它繼續。
    for (let round = 0; round < 3; round++) {
      res = await client.beta.messages.create({
        model: "claude-opus-5-5",
        max_tokens: 8000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "medium" },
        system,
        tools: [
          {
            type: "web_search_20260209",
            name: "web_search",
            max_uses: 4,
            user_location: { type: "approximate", country: "TW", timezone: "Asia/Taipei" },
          },
        ],
        messages,
      });
      if (res.stop_reason !== "pause_turn") break;
      messages.push({ role: "assistant", content: res.content });
    }
    if (!res) throw new Error("沒有回應");
    if (res.stop_reason === "refusal") {
      return Response.json({ error: "這個問題 AI 不方便回答，換個問法試試。" }, { status: 422 });
    }

    const sources = new Map<string, Source>();
    let answer = "";
    for (const block of res.content) {
      if (block.type !== "text") continue;
      answer += block.text;
      for (const c of block.citations ?? []) {
        if (c.type === "web_search_result_location" && !sources.has(c.url)) {
          sources.set(c.url, { title: c.title ?? c.url, url: c.url });
        }
      }
    }
    if (!answer.trim()) throw new Error("AI 沒有給出文字回答");
    return Response.json({ answer: answer.trim(), sources: [...sources.values()].slice(0, 8) });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) {
      return Response.json({ error: "AI 金鑰不正確，請到 Vercel 檢查 ANTHROPIC_API_KEY。" }, { status: 502 });
    }
    if (e instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "問得太快了，等一分鐘再試。" }, { status: 429 });
    }
    if (e instanceof Anthropic.APIError) {
      return Response.json({ error: `AI 暫時出錯（${e.status}），稍後再試。` }, { status: 502 });
    }
    return Response.json({ error: e instanceof Error ? e.message : "查詢失敗" }, { status: 502 });
  }
}
