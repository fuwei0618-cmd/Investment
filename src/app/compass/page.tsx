import { redirect } from "next/navigation";

// 舊網址：思維羅盤已改名為「看市場」。
export default function CompassRedirect() {
  redirect("/market");
}
