"use client";

import { ConnectKitButton } from "connectkit";

export function Header() {
    return (
        <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center">
                        <span className="text-xl"></span>
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        Ticketing
                    </h1>
                </div>

                <ConnectKitButton />
            </div>
        </header>
    );
}