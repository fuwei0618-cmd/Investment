// 手續費估算：照國泰證券公告的費率，使用者沒填就用這個算。
// 美股（複委託 2026 優惠）：個股 0.08% 沒有低消；ETF 每筆 3 美元；碎股 0.08%。
// 台股：手續費 0.1425%、最低 20 元（不算折扣，寧可算多）；賣出加證交稅，ETF 0.1%、股票 0.3%。
import { US_INVERSE } from "./overnight";
import { US_ETF, US_SECTORS } from "./us";

export type Market = "tw" | "us";

const usEtf = (code: string) =>
  code === US_INVERSE.code ||
  code in US_ETF ||
  US_SECTORS.some(([c]) => c === code);

const r2 = (n: number) => Math.round(n * 100) / 100;

function brokerFee(
  market: Market,
  code: string,
  price: number,
  shares: number,
) {
  const amount = price * shares;
  if (market === "us")
    return Number.isInteger(shares) && usEtf(code) ? 3 : r2(amount * 0.0008);
  return Math.max(20, Math.floor(amount * 0.001425));
}

/** 買進手續費 */
export const buyFeeOf = (
  market: Market,
  code: string,
  price: number,
  shares: number,
) => brokerFee(market, code, price, shares);

/** 賣出手續費（台股含證交稅） */
export function sellFeeOf(
  market: Market,
  code: string,
  price: number,
  shares: number,
) {
  const fee = brokerFee(market, code, price, shares);
  if (market === "us") return fee;
  const tax = Math.floor(
    price * shares * (code.startsWith("00") ? 0.001 : 0.003),
  );
  return fee + tax;
}
