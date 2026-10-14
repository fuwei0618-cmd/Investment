import type { Metadata } from "next";
import Crumb from "@/components/Crumb";

export const metadata: Metadata = { title: "玩一圈：麵包店大富翁" };

// 把「看市場」的羅盤 8 關做成一個小鎮麵包店的遊戲：鎮＝總經、街＝產業、店＝個股。
// 遊戲本體是一頁獨立的 HTML（public/game/bakery.html），這裡用 iframe 包起來，
// 讓它可以用整個視窗寬度，手機直式、電腦橫式各有一套版面。
export default function GamePage() {
  return (
    <div className="space-y-3">
      <Crumb href="/market" area="看市場" here="🎲 玩一圈：麵包店大富翁" />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        擲骰子走一圈，每一站玩一個小動作，把八關的名詞當貼紙收集。電腦橫式可以一邊玩一邊對照整個投資系統。
      </p>
      <iframe
        src="/game/bakery.html"
        title="麵包店大富翁"
        className="relative left-1/2 w-screen -translate-x-1/2 rounded-none border-0 bg-[#f4eee2] dark:bg-[#18150f]"
        style={{ height: "calc(100vh - 160px)", minHeight: 560 }}
      />
    </div>
  );
}
