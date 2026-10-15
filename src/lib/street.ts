// 麵包鎮風險大街：十八種工具都是鎮上的一間房子。
// 左右＝會跳多大（五區，跟工具卡的風險分數一樣），上下＝錢從哪裡來（五種）。

export const ZONES = ["銀行區", "借據巷", "商店街", "市集", "賭場邊"] as const;

export type Role = "interest" | "rent" | "owner" | "thing" | "deal";

export const ROLES: { id: Role; name: string; line: string }[] = [
  { id: "interest", name: "🏦 收利息", line: "借錢或存錢，約好給你利息" },
  { id: "rent", name: "🏢 收租金", line: "當房東，每月收租" },
  { id: "owner", name: "🥐 當老闆", line: "買公司的一小塊，分紅加漲價" },
  { id: "thing", name: "🥇 抓實物", line: "不生錢，只等漲價" },
  { id: "deal", name: "📝 押約定", line: "小錢押大，會到期" },
];

/** 每間房子：錢從哪裡來、在麵包鎮叫什麼 */
export const HOUSE: Record<string, { role: Role; nick: string }> = {
  deposit: { role: "interest", nick: "銀行金庫" },
  "savings-insurance": { role: "interest", nick: "存錢罐" },
  bond: { role: "interest", nick: "借錢給店" },
  fx: { role: "interest", nick: "換隔壁鎮的錢" },
  "high-yield": { role: "interest", nick: "借給快倒的店" },
  reits: { role: "rent", nick: "當店面房東" },
  "us-stock": { role: "owner", nick: "大城市的店" },
  "jp-stock": { role: "owner", nick: "老街和菓子店" },
  "index-fund": { role: "owner", nick: "整條街都買" },
  "mutual-fund": { role: "owner", nick: "請店長挑店" },
  "investment-linked": { role: "owner", nick: "保險套餐" },
  "tw-stock": { role: "owner", nick: "當一家店的股東" },
  gold: { role: "thing", nick: "金幣" },
  commodity: { role: "thing", nick: "囤麵粉" },
  bitcoin: { role: "thing", nick: "網路代幣" },
  futures: { role: "deal", nick: "先約好價格" },
  options: { role: "deal", nick: "付訂金保留" },
  warrants: { role: "deal", nick: "會過期的優惠券" },
};
