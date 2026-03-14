import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const DocumentPlane = () => {
  return (
    <group>
      {/* Main Document Body */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[3, 4]} />
        <meshStandardMaterial color="#1C2541" roughness={0.5} metalness={0.2} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Minimal grid / text lines to simulate document text */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[0, 1.2 - i * 0.4, 0.01]}>
          <planeGeometry args={[2.2, 0.05]} />
          <meshBasicMaterial color="#3A86FF" transparent opacity={0.6} />
        </mesh>
      ))}
      <mesh position={[-0.4, -1.2, 0.01]}>
         <planeGeometry args={[1.4, 0.05]} />
         <meshBasicMaterial color="#3A86FF" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

const Scanner = () => {
  const scannerRef = useRef();
  
  useFrame(({ clock }) => {
    // Oscillate scanner bar from top to bottom
    const y = Math.sin(clock.getElapsedTime()) * 2;
    if (scannerRef.current) {
      scannerRef.current.position.y = y;
    }
  });

  return (
    <group ref={scannerRef}>
      {/* The scanning line */}
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[3.2, 0.04]} />
        <meshBasicMaterial color="#5BC0EB" transparent opacity={0.9} />
      </mesh>
      
      {/* Light glow emanating from the scanner */}
      <pointLight position={[0, 0, 0.2]} distance={2} intensity={0.5} color="#5BC0EB" />
    </group>
  );
};

const HolographicUI = () => {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    // Subtle float and opacity breathing
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.1 + 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[2.5, 0.5, 0.5]} rotation={[0, -0.2, 0]}>
      <mesh position={[0, 1, 0]}>
        <planeGeometry args={[2, 0.6]} />
        <meshBasicMaterial color="#0B132B" transparent opacity={0.8} />
      </mesh>
      <Text position={[0, 1, 0.01]} fontSize={0.15} color="#5BC0EB" anchorX="center" anchorY="middle">
         Score: 82/100 (Safe)
      </Text>

      <mesh position={[0, 0.1, 0]}>
        <planeGeometry args={[2, 0.6]} />
        <meshBasicMaterial color="#0B132B" transparent opacity={0.8} />
      </mesh>
      <Text position={[0, 0.1, 0.01]} fontSize={0.12} color="#EAEAEA" anchorX="center" anchorY="middle">
         Summary Complete
      </Text>

      <mesh position={[0, -0.8, 0]}>
        <planeGeometry args={[2, 0.6]} />
        <meshBasicMaterial color="#0B132B" transparent opacity={0.8} />
      </mesh>
      <Text position={[0, -0.8, 0.01]} fontSize={0.12} color="#3A86FF" anchorX="center" anchorY="middle">
         Suggested Reply Ready
      </Text>
    </group>
  );
};

export default function HeroLegalScanner3D() {
  return (
    <div className="w-full h-[500px] sm:h-[600px] relative pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
        {/* Minimal ambient & directional lighting */}
        <ambientLight intensity={0.5} color="#1C2541" />
        <directionalLight position={[2, 5, 2]} intensity={1.5} color="#3A86FF" />
        <directionalLight position={[-2, -5, -2]} intensity={0.5} color="#5BC0EB" />

        {/* Soft particle effects (dust in server space) */}
        <Sparkles count={50} scale={8} size={2} speed={0.4} opacity={0.2} color="#5BC0EB" />

        {/* Floating document setup */}
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <group rotation={[0.2, 0.1, 0.05]} position={[-1, 0, 0]}>
            <DocumentPlane />
            <Scanner />
          </group>
          <HolographicUI />
        </Float>
      </Canvas>
    </div>
  );
}
