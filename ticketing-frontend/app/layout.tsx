import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Ticketing DApp",
    description: "Système de ticketing décentralisé sur blockchain",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
        <body className={`${inter.className} bg-zinc-950 text-white min-h-screen`}>
        <Web3Provider>
            <Header />
            <main>{children}</main>
        </Web3Provider>
        </body>
        </html>
    );
}