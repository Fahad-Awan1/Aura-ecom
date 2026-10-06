import Link from "next/link";
import clsx from "clsx";

export function StarMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
      <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1" />
    </svg>
  );
}

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={clsx("group flex items-center gap-2.5", className)} aria-label="Aura home">
      <StarMark className="h-5 w-5 transition-transform duration-700 group-hover:rotate-180" />
      <span className="font-display text-[1.45rem] leading-none tracking-tight">Aura</span>
    </Link>
  );
}
