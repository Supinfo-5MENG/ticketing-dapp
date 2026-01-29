"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const NOTES = ["♪", "♫", "♬", "♩"];

export function MusicNotes3D() {
  const groupRef = useRef<THREE.Group>(null);

  const notes = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        char: NOTES[i % NOTES.length],
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 6,
          -1 - Math.random() * 3,
        ] as [number, number, number],
        speed: 0.3 + Math.random() * 0.4,
        offset: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.5,
        scale: 0.15 + Math.random() * 0.2,
      })),
    []
  );

  useFrame(() => {
    if (!groupRef.current) return;
    const time = Date.now() * 0.001;

    groupRef.current.children.forEach((child, i) => {
      const note = notes[i];
      if (!note) return;
      child.position.y =
        note.position[1] + Math.sin(time * note.speed + note.offset) * 0.8;
      child.position.x =
        note.position[0] + Math.cos(time * note.speed * 0.5 + note.offset) * 0.3;
      child.rotation.z = Math.sin(time * note.rotSpeed + note.offset) * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {notes.map((note, i) => (
        <Text
          key={i}
          position={note.position}
          fontSize={note.scale}
          color="#a855f7"
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.25}
        >
          {note.char}
        </Text>
      ))}
    </group>
  );
}
