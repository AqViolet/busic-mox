import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { PlayerProvider } from "@/context/PlayerContext";
import GlobalPlayer from "@/components/GlobalPlayer";

const inconsolata = localFont({
  src: [
    {
      path: "../../public/Inconsolata-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/Inconsolata-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/Inconsolata-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-inconsolata",
});

export const metadata: Metadata = {
  title: "Busic Mox",
  description: "A minimalist music player.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inconsolata.variable} antialiased bg-black text-white font-sans`}>
        <PlayerProvider>
          <GlobalPlayer />
          <main>{children}</main>
        </PlayerProvider>
      </body>
    </html>
  );
}