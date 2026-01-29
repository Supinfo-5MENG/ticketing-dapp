"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = "/models/Microphone N260809.glb";

export function Microphone3D() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const { scene } = useGLTF(MODEL_PATH);

  // Apply metallic violet material to all meshes
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#a855f7"),
          metalness: 0.85,
          roughness: 0.15,
          envMapIntensity: 1.2,
        });
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);

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
    groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.15;
  });

  // Center and auto-scale the model
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.5 / maxDim;
    scene.scale.setScalar(scale);
    scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  }, [scene]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

// Preload the model
useGLTF.preload(MODEL_PATH);
