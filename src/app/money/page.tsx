import MoneySteps from "./MoneySteps";

export default function MoneyPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">我的錢</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          投資之前先弄清楚自己。照順序做一次，之後每年回來更新。資料只存在你這台手機或電腦的瀏覽器裡。
        </p>
      </header>
      <MoneySteps />
    </div>
  );
}
