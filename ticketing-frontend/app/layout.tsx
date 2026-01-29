import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Ticketing DApp - Billetterie Decentralisee",
  description:
    "Systeme de ticketing decentralise sur blockchain avec NFTs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className="bg-zinc-950 text-white min-h-screen antialiased"
        style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
      >
        <Web3Provider>
          <Header />
          <main className="pt-20">{children}</main>
        </Web3Provider>
      </body>
    </html>
  );
}
