import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/shows");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_color-mix(in_oklab,var(--color-accent)_14%,transparent)_0%,transparent_38%),linear-gradient(180deg,color-mix(in_oklab,var(--color-accent)_5%,var(--color-background))_0%,var(--color-background)_58%)]">
      {children}
    </div>
  );
}
