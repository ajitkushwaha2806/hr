"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <div className="flex items-center min-w-0">
        <span className="text-xs sm:text-sm font-medium text-foreground/80">
          Dashboard
        </span>
      </div>
    );
  }

  const formatTitle = (str) => {
    const decoded = decodeURIComponent(str).replace(/-/g, " ");
    return decoded.charAt(0).toUpperCase() + decoded.slice(1);
  };

  return (
    <nav className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm min-w-0 truncate">
      {/* Home link on desktop */}
      <Link
        href="/"
        className="hidden sm:inline-flex hover:text-foreground shrink-0 transition-colors font-normal text-muted-foreground/70"
      >
        Home
      </Link>

      {segments.map((segment, idx) => {
        const href = "/" + segments.slice(0, idx + 1).join("/");
        const isLast = idx === segments.length - 1;
        const formatted = formatTitle(segment);

        return (
          <span
            key={href}
            className="inline-flex items-center gap-1 sm:gap-1.5 min-w-0"
          >
            {(idx > 0 || (idx === 0 && true)) && (
              <ChevronRight
                size={12}
                className={`${idx === 0 ? "hidden sm:inline-block" : "inline-block"} text-muted-foreground/40 shrink-0`}
              />
            )}
            {isLast ? (
              <span className="text-foreground/85 font-medium truncate max-w-[130px] sm:max-w-none">
                {formatted}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-foreground text-muted-foreground/70 font-normal truncate transition-colors max-w-[90px] sm:max-w-none"
              >
                {formatted}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}