"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FloatingParticlesProps {
  count?: number;
}

export function FloatingParticles({ count = 60 }: FloatingParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6 - 2,
      ] as [number, number, number],
      speed: 0.2 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
      scale: 0.02 + Math.random() * 0.05,
    }));
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current) return;
    const time = Date.now() * 0.001;

    particles.forEach((p, i) => {
      dummy.position.set(
        p.position[0] + Math.sin(time * p.speed + p.offset) * 0.5,
        p.position[1] + Math.cos(time * p.speed * 0.7 + p.offset) * 0.3,
        p.position[2]
      );
      dummy.scale.setScalar(p.scale * (1 + Math.sin(time * 2 + p.offset) * 0.3));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#a855f7"
        emissive="#d946ef"
        emissiveIntensity={0.5}
        transparent
        opacity={0.6}
      />
    </instancedMesh>
  );
}
