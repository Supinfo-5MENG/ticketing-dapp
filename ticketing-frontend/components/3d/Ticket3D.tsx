"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";

export function Ticket3D() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetRotationY = pointer.x * 0.5;
    const targetRotationX = -pointer.y * 0.3;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotationY + 0.2,
      delta * 3
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotationX,
      delta * 3
    );
    groupRef.current.position.y =
      Math.sin(Date.now() * 0.0008 + 1) * 0.12;
  });

  return (
    <group ref={groupRef} scale={1.1}>
      {/* Main ticket body */}
      <RoundedBox
        args={[3.2, 1.8, 0.08]}
        radius={0.08}
        smoothness={4}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#18181b"
          metalness={0.3}
          roughness={0.4}
        />
      </RoundedBox>

      {/* Gradient overlay - top part */}
      <RoundedBox
        args={[3.18, 1.78, 0.085]}
        radius={0.07}
        smoothness={4}
        position={[0, 0, 0.001]}
      >
        <meshStandardMaterial
          color="#1e1b4b"
          metalness={0.2}
          roughness={0.5}
          transparent
          opacity={0.7}
        />
      </RoundedBox>

      {/* Accent line top */}
      <mesh position={[0, 0.7, 0.05]}>
        <boxGeometry args={[2.8, 0.03, 0.01]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Perforation dots - left side */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`perf-l-${i}`} position={[-1.2, -0.5 + i * 0.3, 0.05]}>
          <circleGeometry args={[0.04, 16]} />
          <meshStandardMaterial color="#27272a" />
        </mesh>
      ))}

      {/* Perforation dots - right side */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`perf-r-${i}`} position={[1.2, -0.5 + i * 0.3, 0.05]}>
          <circleGeometry args={[0.04, 16]} />
          <meshStandardMaterial color="#27272a" />
        </mesh>
      ))}

      {/* Title text */}
      <Text
        position={[0, 0.35, 0.06]}
        fontSize={0.22}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        CONCERT LIVE
      </Text>

      {/* Subtitle */}
      <Text
        position={[0, 0.05, 0.06]}
        fontSize={0.12}
        color="#a1a1aa"
        anchorX="center"
        anchorY="middle"
      >
        NFT TICKET #001
      </Text>

      {/* Bottom info */}
      <Text
        position={[-0.8, -0.4, 0.06]}
        fontSize={0.09}
        color="#7c3aed"
        anchorX="center"
        anchorY="middle"
      >
        BLOCKCHAIN VERIFIED
      </Text>

      {/* Barcode visual lines */}
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh key={`bar-${i}`} position={[0.6 + i * 0.06, -0.4, 0.05]}>
          <boxGeometry args={[0.03, 0.2, 0.01]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#a855f7" : "#ffffff"}
            transparent
            opacity={i % 2 === 0 ? 0.8 : 0.4}
          />
        </mesh>
      ))}

      {/* Glow edges */}
      <RoundedBox
        args={[3.25, 1.85, 0.02]}
        radius={0.09}
        smoothness={4}
        position={[0, 0, -0.03]}
      >
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.15}
          transparent
          opacity={0.3}
        />
      </RoundedBox>
    </group>
  );
}
