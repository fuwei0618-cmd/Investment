import { notFound } from "next/navigation";
import { MODULES, findModule } from "@/lib/modules";

export function generateStaticParams() {
  return MODULES.filter((m) => m.status === "planned").map((m) => ({ module: m.slug }));
}

export default async function PlannedModule({ params }: PageProps<"/[module]">) {
  const { module: slug } = await params;
  const mod = findModule(slug);
  if (!mod || mod.status !== "planned") notFound();
  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-500">步驟 {mod.step}・規劃中</p>
      <h1 className="text-2xl font-semibold">{mod.title}</h1>
      <p>{mod.summary}</p>
      <p className="text-sm text-zinc-500">對應課程：{mod.courses.join("・")}</p>
    </div>
  );
}
