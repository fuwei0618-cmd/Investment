import PortfolioManager from "./PortfolioManager";

export default function PortfolioPage() {
  return (
    <div className="space-y-4">
      <header>
        <p className="text-sm text-zinc-500">步驟 7・王伯達 4-1～4-4、CodeGym 6-2、8-1、9-1</p>
        <h1 className="text-2xl font-semibold">持股與損益</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          資料只存在這台裝置的瀏覽器，可匯出 CSV 備份。台股報價來自 FinMind，美股需設定 FMP 金鑰，也可直接手動輸入現價。
        </p>
      </header>
      <PortfolioManager />
    </div>
  );
}
