import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, Sparkles, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const DocumentLine = ({ position, width, scannerRef }) => {
  const materialRef = useRef();
  const baseColor   = useMemo(() => new THREE.Color('#1C2541'), []);
  const activeColor = useMemo(() => new THREE.Color('#3A86FF'), []);
  const emissiveCol = useMemo(() => new THREE.Color('#9333ea'), []);
  const black       = useMemo(() => new THREE.Color(0x000000),  []);

  useFrame(() => {
    if (!scannerRef.current || !materialRef.current) return;
    const dist = Math.abs(scannerRef.current.position.y - position[1]);
    if (dist < 0.3) {
      const t = 1.0 - dist / 0.3;
      materialRef.current.color.lerpColors(baseColor, activeColor, t);
      materialRef.current.emissive.lerpColors(black, emissiveCol, t * 0.8);
      materialRef.current.opacity = 0.3 + t * 0.7;
    } else {
      materialRef.current.color.copy(baseColor);
      materialRef.current.emissive.copy(black);
      materialRef.current.opacity = 0.3;
    }
  });

  return (
    <mesh position={position}>
      <boxGeometry args={[width, 0.05, 0.02]} />
      <meshStandardMaterial ref={materialRef} color="#1C2541" transparent opacity={0.3} roughness={0.4} />
    </mesh>
  );
};

const DocumentPlane = ({ scannerRef }) => {
  const lines = [
    { y: 1.1, w: 2.2 }, { y: 0.8, w: 2.5 }, { y: 0.5, w: 2.1 },
    { y: 0.2, w: 2.4 }, { y: -0.1, w: 1.8 }, { y: -0.4, w: 2.3 },
    { y: -0.7, w: 2.0 }, { y: -1.0, w: 1.5 }, { y: -1.3, w: 2.0 },
  ];

  return (
    <group>
      {/* Thick spine/binding on the left */}
      <mesh position={[-1.45, 0, 0]}>
        <boxGeometry args={[0.3, 4.2, 0.35]} />
        <meshStandardMaterial color="#0f1f3d" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Main glass body — thick */}
      <mesh position={[0.15, 0, 0]}>
        <boxGeometry args={[2.9, 4.2, 0.28]} />
        <meshStandardMaterial color="#0B132B" transparent opacity={0.92} roughness={0.2} metalness={0.5} />
      </mesh>

      {/* Top-right corner fold detail */}
      <mesh position={[1.3, 1.85, 0.15]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.28, 0.28, 0.06]} />
        <meshStandardMaterial color="#1C2541" />
      </mesh>

      {/* Bottom-left stamp block */}
      <mesh position={[-0.9, -1.75, 0.16]}>
        <boxGeometry args={[0.6, 0.22, 0.05]} />
        <meshStandardMaterial color="#9333ea" transparent opacity={0.7} />
      </mesh>

      {/* Divider rule under header */}
      <mesh position={[0.15, 1.42, 0.16]}>
        <boxGeometry args={[2.5, 0.025, 0.03]} />
        <meshStandardMaterial color="#3A86FF" />
      </mesh>

      {/* Right edge highlight strip */}
      <mesh position={[1.59, 0, 0]}>
        <boxGeometry args={[0.02, 4.2, 0.3]} />
        <meshStandardMaterial color="#5BC0EB" transparent opacity={0.5} />
      </mesh>

      {/* Spine accent glow line */}
      <mesh position={[-1.3, 0, 0.18]}>
        <boxGeometry args={[0.04, 4.0, 0.01]} />
        <meshStandardMaterial color="#3A86FF" emissive="#3A86FF" emissiveIntensity={0.6} />
      </mesh>

      {/* Header block */}
      <mesh position={[0.15, 1.6, 0.16]}>
        <boxGeometry args={[2.5, 0.32, 0.04]} />
        <meshStandardMaterial color="#1C2541" />
      </mesh>
      <Text position={[-1.0, 1.6, 0.3]} fontSize={0.11} color="#5BC0EB" anchorX="left" anchorY="middle" letterSpacing={0.08}>
        LEGAL_DOC_ANALYSIS
      </Text>

      {/* Interactive text lines */}
      <group position={[-1.05, 0, 0.16]}>
        {lines.map((line, i) => (
          <DocumentLine key={i} position={[line.w / 2, line.y, 0]} width={line.w} scannerRef={scannerRef} />
        ))}
      </group>
    </group>
  );
};

const Scanner = ({ scannerRef }) => {
  useFrame(({ clock }) => {
    const y = Math.sin(clock.getElapsedTime() * 1.2) * 2.2;
    if (scannerRef.current) scannerRef.current.position.y = y;
  });

  return (
    <group ref={scannerRef}>
      {/* Main neon scan beam */}
      <mesh position={[0, 0, 0.19]}>
        <boxGeometry args={[3.4, 0.04, 0.06]} />
        <meshStandardMaterial color="#9333ea" transparent opacity={0.9} />
      </mesh>
      {/* Bright white inner core */}
      <mesh position={[0, 0, 0.2]}>
        <boxGeometry args={[2.8, 0.01, 0.07]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
      </mesh>
      {/* Reading zone soft glow */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[3.2, 0.8]} />
        <meshBasicMaterial color="#3A86FF" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight position={[0, 0, 0.3]} distance={3} intensity={1.2} color="#3A86FF" />
    </group>
  );
};

const HolographicPanel = ({ position, title, value, status, color }) => (
  <group position={position}>
    <mesh>
      <boxGeometry args={[2.8, 0.9, 0.03]} />
      <meshStandardMaterial color="#0B132B" transparent opacity={0.8} roughness={0.3} metalness={0.4} />
    </mesh>
    <mesh position={[-1.38, 0, 0.02]}>
      <boxGeometry args={[0.04, 0.9, 0.04]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
    <Text position={[-1.2, 0.2, 0.03]} fontSize={0.12} color="#8b9bb4" anchorX="left" anchorY="middle">{title}</Text>
    <Text position={[-1.2, -0.1, 0.03]} fontSize={0.24} color="#ffffff" anchorX="left" anchorY="middle">{value}</Text>
    <Text position={[1.2, -0.15, 0.03]} fontSize={0.1} color={color} anchorX="right" anchorY="middle">{status}</Text>
  </group>
);

const HolographicUI = () => {
  const groupRef = useRef();
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 1.5) * 0.05 + 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[3.2, 0, 0.2]} rotation={[0, -0.15, 0]}>
      <HolographicPanel position={[0,  1.2, 0]} title="CLAUSE ANALYSIS" value="98.5%" status="VERIFIED" color="#10B981" />
      <HolographicPanel position={[0,  0.1, 0]} title="RISK FACTORS"    value="Minimal" status="SAFE"     color="#3A86FF" />
      <HolographicPanel position={[0, -1.0, 0]} title="AI SUGGESTION"   value="Ready"   status="COMPILED" color="#9333ea" />
    </group>
  );
};

export default function HeroLegalScanner3D() {
  const scannerRef = useRef();

  return (
    <div className="w-full h-[500px] sm:h-[600px] relative cursor-grab active:cursor-grabbing z-10">
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.2}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />

        <ambientLight intensity={0.5} color="#0B132B" />
        <directionalLight position={[2, 5, 2]}   intensity={1.5} color="#3A86FF" />
        <directionalLight position={[-2, -5, -2]} intensity={1.0} color="#9333ea" />

        {/* Reduced to 40 particles — prevents GPU overload */}
        <Sparkles count={40} scale={10} size={2} speed={0.3} opacity={0.5} color="#5BC0EB" />

        <Float speed={2} rotationIntensity={0.15} floatIntensity={0.4}>
          <group rotation={[0.1, 0.15, 0.02]} position={[-1.5, 0, 0]} scale={[0.65, 0.65, 0.65]}>
            <DocumentPlane scannerRef={scannerRef} />
            <Scanner scannerRef={scannerRef} />
          </group>
        </Float>

        {/* Stats panels are outside Float — stay fixed in space */}
        <HolographicUI />
      </Canvas>
    </div>
  );
}
