"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";
import SignOutButton from "@/components/sign-out-button";
import {
  SearchIcon,
  TvIcon,
  ListVideoIcon,
  MenuIcon,
  ArrowRightIcon,
} from "lucide-react";
import clsx from "clsx";
import ShowCommandDialog from "./show-command-dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { href: "/shows", label: "My Shows", icon: TvIcon },
  { href: "/watch-list", label: "Watch List", icon: ListVideoIcon },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavBar({ userId }: { userId: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 shrink-0 border-b border-border/60 bg-background/82 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/shows"
              className="flex items-center gap-3 rounded-full border border-border/70 bg-card/80 px-3 py-2 shadow-sm transition hover:border-accent/35 hover:bg-accent/5"
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-accent/12 text-accent">
                <TvIcon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-lg font-semibold tracking-widest">
                  TV4Me
                </p>
              </div>
            </Link>

            <nav className="hidden flex-wrap gap-2 md:flex">
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
              <Button
                type="button"
                variant="ghost"
                className="h-10 rounded-full border border-border/65 bg-card/60 px-4 text-sm text-muted-foreground transition hover:border-accent/25 hover:bg-accent/5 hover:text-foreground"
                onClick={() => setCommandOpen(true)}
              >
                <SearchIcon className="size-4" />
                Search
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <SignOutButton
              variant="outline"
              className="hidden rounded-full border-border/70 bg-card/80 px-4 md:inline-flex"
            >
              Sign out
            </SignOutButton>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-border/70 bg-card/80 md:hidden"
                >
                  <MenuIcon className="size-5" />
                  <span className="sr-only">Open navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[min(88vw,360px)] border-border/70 bg-background/96 px-0"
              >
                <SheetHeader className="border-b border-border/60 px-5 pb-5">
                  <SheetTitle className="text-left text-lg tracking-[-0.03em]">
                    TV4Me
                  </SheetTitle>
                  <SheetDescription className="text-left">
                    Quick access to your library and watch list.
                  </SheetDescription>
                </SheetHeader>

                <div className="flex flex-1 flex-col gap-3 px-4 py-5">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto justify-between rounded-2xl border-border/65 bg-card/70 px-4 py-3"
                    onClick={() => {
                      setMobileOpen(false);
                      setCommandOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <SearchIcon className="size-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Search</p>
                        <p className="text-xs text-muted-foreground">
                          Find and manage shows
                        </p>
                      </div>
                    </div>
                    <ArrowRightIcon className="size-4 text-muted-foreground" />
                  </Button>

                  {navItems.map((item) => {
                    const active = isActive(pathname, item.href);

                    return (
                      <SheetClose key={item.href} asChild>
                        <Link
                          href={item.href}
                          className={clsx(
                            "flex items-center justify-between rounded-2xl border px-4 py-3 transition",
                            active
                              ? "border-accent/35 bg-accent/10"
                              : "border-border/65 bg-card/70 hover:border-accent/25 hover:bg-accent/5",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={clsx(
                                "flex size-10 items-center justify-center rounded-full",
                                active
                                  ? "bg-accent/15 text-accent"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              <item.icon className="size-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {item.label}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {active ? "Current view" : "Open section"}
                              </p>
                            </div>
                          </div>
                          <ArrowRightIcon className="size-4 text-muted-foreground" />
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>

                <div className="border-t border-border/60 p-4">
                  <SignOutButton
                    variant="outline"
                    className="w-full rounded-full border-border/70 bg-card/80"
                  >
                    Sign out
                  </SignOutButton>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <ShowCommandDialog
        userId={userId}
        open={commandOpen}
        onOpenChange={setCommandOpen}
      />
    </>
  );
}

export default NavBar;
