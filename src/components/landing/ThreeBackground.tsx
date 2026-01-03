import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Soft glowing orb
function GlowOrb({ position, color, size = 1, speed = 1 }: { position: [number, number, number]; color: string; size?: number; speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.1} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.6}
          roughness={0.8}
        />
      </mesh>
    </Float>
  );
}

// Main distorted sphere
function HeroSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[2.5, 64, 64]} position={[0, 0, -8]}>
        <MeshDistortMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0.15}
          distort={0.25}
          speed={1.5}
          roughness={0.4}
          metalness={0.6}
          transparent
          opacity={0.3}
        />
      </Sphere>
    </Float>
  );
}

// Subtle floating particles
function Particles() {
  const points = useRef<THREE.Points>(null);
  
  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(800 * 3);
    for (let i = 0; i < 800; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={points} geometry={particlesGeometry}>
      <pointsMaterial
        size={0.03}
        color="#22c55e"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

// Floating ring
function FloatingRing({ position, size, speed }: { position: [number, number, number]; size: number; speed: number }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = state.clock.elapsedTime * speed;
      ringRef.current.rotation.y = state.clock.elapsedTime * speed * 0.7;
    }
  });

  return (
    <mesh ref={ringRef} position={position}>
      <torusGeometry args={[size, 0.02, 16, 100]} />
      <meshStandardMaterial 
        color="#22c55e" 
        emissive="#22c55e" 
        emissiveIntensity={0.3} 
        transparent 
        opacity={0.5} 
      />
    </mesh>
  );
}

export default function ThreeBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.15} />
        <pointLight position={[10, 10, 10]} intensity={0.3} color="#22c55e" />
        <pointLight position={[-10, -10, 5]} intensity={0.2} color="#10b981" />
        
        <HeroSphere />
        <Particles />
        
        {/* Subtle floating rings */}
        <FloatingRing position={[4, 2, -5]} size={1.5} speed={0.3} />
        <FloatingRing position={[-5, -1, -6]} size={1.2} speed={0.25} />
        <FloatingRing position={[0, 3, -10]} size={2} speed={0.2} />
        
        {/* Soft glowing orbs */}
        <GlowOrb position={[-6, 2, -4]} color="#22c55e" size={0.3} speed={0.8} />
        <GlowOrb position={[5, -2, -5]} color="#10b981" size={0.25} speed={1.1} />
        <GlowOrb position={[3, 3, -6]} color="#34d399" size={0.2} speed={0.9} />
        <GlowOrb position={[-4, -3, -5]} color="#059669" size={0.35} speed={0.7} />
        
        <fog attach="fog" args={['#0f172a', 5, 25]} />
      </Canvas>
    </div>
  );
}
