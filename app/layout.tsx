import type { Metadata } from "next";
import "./globals.css";

import { inter } from "./ui/fonts";
import NavBar from "./ui/navbar";

export const metadata: Metadata = {
  title: "TV4Me",
  description:
    "TV4Me is a platform that provides users with a wide range of TV shows and movies to watch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={inter.className + "w-dvh h-screen flex flex-col bg-gray-600"}
      >
        <NavBar />
        {children}
      </body>
    </html>
  );
}
