"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/theme-toggle";
import SignOutButton from "@/components/sign-out-button";
import { SearchIcon, TvIcon, ListVideoIcon } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/shows", label: "My Shows", icon: TvIcon },
  { href: "/watch-list", label: "Watch List", icon: ListVideoIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-border/60 bg-background/82 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/shows"
              className="flex items-center gap-3 rounded-full border border-border/70 bg-card/80 px-3 py-2 shadow-sm transition hover:border-accent/35 hover:bg-accent/5"
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-accent/12 text-accent">
                <TvIcon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-[-0.02em]">
                  TV4Me
                </p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Personal tracker
                </p>
              </div>
            </Link>
            <Badge
              variant="outline"
              className="hidden rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground md:inline-flex"
            >
              Library
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <SignOutButton
              variant="outline"
              className="rounded-full border-border/70 bg-card/80 px-4"
            >
              Sign out
            </SignOutButton>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <Button
                key={item.href}
                variant="ghost"
                asChild
                className={clsx(
                  "h-10 rounded-full border px-4 text-sm transition",
                  active
                    ? "border-accent/35 bg-accent/10 text-foreground hover:bg-accent/15"
                    : "border-border/65 bg-card/60 text-muted-foreground hover:border-accent/25 hover:bg-accent/5 hover:text-foreground",
                )}
              >
                <Link href={item.href}>
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default NavBar;
