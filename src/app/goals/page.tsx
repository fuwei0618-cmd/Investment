import GoalsCalculator from "./GoalsCalculator";

export default function GoalsPage() {
  return (
    <div className="space-y-4">
      <header>
        <p className="text-sm text-zinc-500">步驟 1・王伯達 1-2～1-4、4-5、5-3</p>
        <h1 className="text-2xl font-semibold">財務目標試算</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          逐年推算薪資、投資收入與支出。累積結存轉負代表開始負債；退休所需資產用 4% 法則（年支出 × 25）。
          儲蓄率目標 25%–50%，報酬率是最關鍵的因子。
        </p>
      </header>
      <GoalsCalculator />
    </div>
  );
}
