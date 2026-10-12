import Link from "next/link";

// 子頁面最上方：告訴使用者現在在哪一區的第幾步，點一下回到那一區。
export default function Crumb({ href, area, here }: { href: string; area: string; here: string }) {
  return (
    <p className="text-sm text-zinc-500">
      <Link href={href} className="text-blue-600">
        ← {area}
      </Link>
      <span className="ml-2">{here}</span>
    </p>
  );
}
