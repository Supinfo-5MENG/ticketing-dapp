"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial, RoundedBox, Sphere } from "@react-three/drei";
import * as THREE from "three";

export function Microphone3D() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Mouse follow with smooth lerp
    const targetRotationY = pointer.x * 0.4;
    const targetRotationX = -pointer.y * 0.3;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotationY,
      delta * 3
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotationX,
      delta * 3
    );
    // Gentle floating
    groupRef.current.position.y =
      Math.sin(Date.now() * 0.001) * 0.15;
  });

  return (
    <group ref={groupRef} scale={1.2}>
      {/* Microphone head - sphere with metallic look */}
      <Sphere args={[0.7, 32, 32]} position={[0, 1.0, 0]}>
        <meshStandardMaterial
          color="#a855f7"
          metalness={0.9}
          roughness={0.15}
          envMapIntensity={1.5}
        />
      </Sphere>

      {/* Mesh grille overlay */}
      <Sphere args={[0.72, 16, 16]} position={[0, 1.0, 0]}>
        <meshStandardMaterial
          color="#7c3aed"
          wireframe
          transparent
          opacity={0.4}
        />
      </Sphere>

      {/* Glow sphere behind */}
      <Sphere args={[0.85, 16, 16]} position={[0, 1.0, 0]}>
        <MeshDistortMaterial
          color="#d946ef"
          transparent
          opacity={0.12}
          distort={0.3}
          speed={2}
        />
      </Sphere>

      {/* Neck ring */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.32, 0.35, 0.15, 32]} />
        <meshStandardMaterial
          color="#52525b"
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>

      {/* Body / handle */}
      <RoundedBox
        args={[0.3, 1.6, 0.3]}
        radius={0.12}
        smoothness={4}
        position={[0, -0.65, 0]}
      >
        <meshStandardMaterial
          color="#27272a"
          metalness={0.8}
          roughness={0.2}
        />
      </RoundedBox>

      {/* Handle accent ring */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 32]} />
        <meshStandardMaterial
          color="#a855f7"
          metalness={0.9}
          roughness={0.1}
          emissive="#a855f7"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Bottom cap */}
      <mesh position={[0, -1.5, 0]}>
        <sphereGeometry args={[0.17, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#3f3f46"
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>
    </group>
  );
}
