import type { Light } from "@/lib/today";

const EDGE: Record<Light | "none", string> = {
  green: "border-emerald-500",
  yellow: "border-amber-400",
  red: "border-red-500",
  none: "border-stone-300 dark:border-stone-600",
};

// 實戰頁最上面的三個問題卡（伺服器、瀏覽器兩邊共用）
export default function QCard({
  q,
  tone,
  children,
}: {
  q: string;
  tone: Light | null;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`space-y-0.5 rounded-2xl border-l-[6px] bg-white p-4 shadow-[0_1px_2px_rgba(20,25,30,.06),0_6px_16px_rgba(20,25,30,.08)] dark:bg-[#1f2328] ${EDGE[tone ?? "none"]}`}
    >
      <p className="text-sm text-stone-500">{q}</p>
      {children}
    </div>
  );
}
