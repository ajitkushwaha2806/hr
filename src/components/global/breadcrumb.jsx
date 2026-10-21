"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const currentTitle = segments[segments.length - 1] || "Dashboard";

  return (
    <div className="flex w-full items-center min-w-0 overflow-hidden">
      <div className="sm:hidden flex items-center gap-1.5 min-w-0">
        <span className="text-xs font-bold text-foreground capitalize tracking-tight truncate">
          {decodeURIComponent(currentTitle)}
        </span>
      </div>

      <nav className="hidden sm:flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-muted-foreground truncate">
        <Link href="/" className="hover:text-foreground shrink-0 transition-colors">
          Home
        </Link>

        {segments.map((segment, idx) => {
          const href = "/" + segments.slice(0, idx + 1).join("/");
          const isLast = idx === segments.length - 1;

          return (
            <span key={href} className="inline-flex items-center gap-1 sm:gap-1.5 min-w-0">
              <ChevronRight size={13} className="text-muted-foreground/60 shrink-0" />
              {isLast ? (
                <span className="text-foreground font-semibold capitalize truncate max-w-[130px] sm:max-w-none">
                  {decodeURIComponent(segment)}
                </span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-foreground capitalize truncate transition-colors max-w-[100px] sm:max-w-none"
                >
                  {decodeURIComponent(segment)}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
}