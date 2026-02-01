"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, ReactNode } from "react";

interface Scene3DProps {
  children: ReactNode;
  className?: string;
  camera?: { position: [number, number, number]; fov: number };
}

export function Scene3D({
  children,
  className = "",
  camera = { position: [0, 0, 5], fov: 45 },
}: Scene3DProps) {
  return (
    <div className={className}>
      <Canvas camera={camera} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <pointLight position={[-5, -5, -5]} intensity={0.3} color="#a855f7" />
          <pointLight position={[5, -2, 3]} intensity={0.3} color="#d946ef" />
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
