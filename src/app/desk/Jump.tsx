"use client";

/** 跳到同一頁的某一區；那區收在「為什麼？」裡的話先打開 */
export default function Jump({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={`#${to}`}
      onClick={() => {
        let el = document.getElementById(to)?.parentElement;
        while (el) {
          if (el instanceof HTMLDetailsElement) el.open = true;
          el = el.parentElement;
        }
      }}
      className="font-bold text-[#1f2328] underline decoration-stone-400 underline-offset-2 dark:text-[#e8edf3]"
    >
      {children}
    </a>
  );
}
