import { notFound } from "next/navigation";
import CourseRefs from "@/components/CourseRefs";
import { MODULES, findModule, moduleLabel } from "@/lib/modules";

export function generateStaticParams() {
  return MODULES.filter((m) => m.status === "planned").map((m) => ({ module: m.slug }));
}

export default async function PlannedModule({ params }: PageProps<"/[module]">) {
  const { module: slug } = await params;
  const mod = findModule(slug);
  if (!mod || mod.status !== "planned") notFound();
  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">{moduleLabel(mod)}・規劃中</p>
      <h1 className="text-2xl font-semibold">{mod.title}</h1>
      <p>{mod.summary}</p>
      <CourseRefs slug={mod.slug} />
    </div>
  );
}
