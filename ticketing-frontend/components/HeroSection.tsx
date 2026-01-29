"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const Scene3D = dynamic(
  () => import("@/components/3d/Scene3D").then((mod) => mod.Scene3D),
  { ssr: false }
);
const Microphone3D = dynamic(
  () => import("@/components/3d/Microphone3D").then((mod) => mod.Microphone3D),
  { ssr: false }
);
const Ticket3D = dynamic(
  () => import("@/components/3d/Ticket3D").then((mod) => mod.Ticket3D),
  { ssr: false }
);
const FloatingParticles = dynamic(
  () =>
    import("@/components/3d/FloatingParticles").then(
      (mod) => mod.FloatingParticles
    ),
  { ssr: false }
);
const MusicNotes3D = dynamic(
  () => import("@/components/3d/MusicNotes3D").then((mod) => mod.MusicNotes3D),
  { ssr: false }
);

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[128px] animate-pulse-slow animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[128px]" />
      </div>

      {/* 3D Scene - background layer with particles and notes */}
      <div className="absolute inset-0 pointer-events-none">
        <Scene3D
          className="w-full h-full"
          camera={{ position: [0, 0, 8], fov: 45 }}
        >
          <FloatingParticles count={80} />
          <MusicNotes3D />
        </Scene3D>
      </div>

      {/* Text content */}
      <div className="relative z-10 text-center px-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-full backdrop-blur-sm">
            Powered by Blockchain
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
        >
          <span className="bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-transparent">
            Ticketing
          </span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">
            Decentralise
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          Cree des evenements, distribue des tickets NFT et valide les entrees
          directement sur la blockchain. Securise, transparent, immuable.
        </motion.p>

        <motion.div
          className="flex gap-4 justify-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
        >
          <a
            href="#create"
            className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105"
          >
            Creer un evenement
          </a>
          <a
            href="#events"
            className="px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl transition-all duration-300 border border-white/10 hover:border-white/20 backdrop-blur-sm"
          >
            Explorer
          </a>
        </motion.div>
      </div>

      {/* 3D Elements - Microphone + Ticket interactive */}
      <div className="relative z-10 w-full max-w-5xl mx-auto gap-4 px-6">
        <motion.div
          className="h-[350px] md:h-[400px]"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        >
          <Scene3D
            className="w-full h-full cursor-grab active:cursor-grabbing"
            camera={{ position: [0, 0, 4.5], fov: 45 }}
          >
            <Microphone3D />
          </Scene3D>
        </motion.div>

        {/*<motion.div*/}
        {/*  className="h-[350px] md:h-[400px]"*/}
        {/*  initial={{ opacity: 0, x: 50 }}*/}
        {/*  animate={{ opacity: 1, x: 0 }}*/}
        {/*  transition={{ duration: 1, delay: 0.65, ease: "easeOut" }}*/}
        {/*>*/}
        {/*  <Scene3D*/}
        {/*    className="w-full h-full cursor-grab active:cursor-grabbing"*/}
        {/*    camera={{ position: [0, 0, 4.5], fov: 45 }}*/}
        {/*  >*/}
        {/*    <Ticket3D />*/}
        {/*  </Scene3D>*/}
        {/*</motion.div>*/}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1.5">
          <motion.div
            className="w-1.5 h-1.5 bg-violet-400 rounded-full"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
