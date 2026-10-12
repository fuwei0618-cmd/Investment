import type { Light } from "@/lib/today";

const COLOR: Record<Light, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-400",
  red: "bg-red-500",
};

export default function LightDot({ light }: { light: Light | null }) {
  return <span className={`inline-block h-3 w-3 shrink-0 rounded-full ${light ? COLOR[light] : "bg-zinc-300"}`} />;
}
