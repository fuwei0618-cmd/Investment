// LINE 官方帳號（Messaging API）推一則文字訊息給自己。金鑰只放在 Vercel 環境變數。
export const lineReady = () =>
  !!(process.env.LINE_CHANNEL_ACCESS_TOKEN && process.env.LINE_USER_ID);

export async function pushLine(text: string) {
  const res = await fetch(
    `${process.env.LINE_BASE ?? "https://api.line.me"}/v2/bot/message/push`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: process.env.LINE_USER_ID,
        messages: [{ type: "text", text: text.slice(0, 4900) }],
      }),
    },
  );
  if (!res.ok)
    throw new Error(`LINE ${res.status}：${(await res.text()).slice(0, 200)}`);
}
