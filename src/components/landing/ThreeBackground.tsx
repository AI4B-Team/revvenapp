import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars, Trail } from '@react-three/drei';
import * as THREE from 'three';

function GlowingSphere({ position, color, size = 1, speed = 1 }: { position: [number, number, number]; color: string; size?: number; speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={speed * 2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

function AnimatedDistortSphere({ position, color, speed, distort }: { position: [number, number, number]; color: string; speed: number; distort: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.3;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

function ParticleField() {
  const points = useRef<THREE.Points>(null);
  
  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.03;
      points.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={points} geometry={particlesGeometry}>
      <pointsMaterial
        size={0.05}
        color="#22c55e"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function FloatingRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const ring4Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.4;
      ring1Ref.current.rotation.y = t * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = t * 0.3;
      ring2Ref.current.rotation.z = t * 0.4;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = t * 0.5;
      ring3Ref.current.rotation.z = t * 0.3;
    }
    if (ring4Ref.current) {
      ring4Ref.current.rotation.x = t * 0.2;
      ring4Ref.current.rotation.y = t * 0.4;
    }
  });

  return (
    <>
      <mesh ref={ring1Ref} position={[4, 0, -3]}>
        <torusGeometry args={[2.5, 0.08, 16, 100]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} transparent opacity={0.9} />
      </mesh>
      <mesh ref={ring2Ref} position={[-5, 1, -2]}>
        <torusGeometry args={[2, 0.06, 16, 100]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.7} transparent opacity={0.8} />
      </mesh>
      <mesh ref={ring3Ref} position={[0, 3, -5]}>
        <torusGeometry args={[3, 0.05, 16, 100]} />
        <meshStandardMaterial color="#059669" emissive="#059669" emissiveIntensity={0.5} transparent opacity={0.7} />
      </mesh>
      <mesh ref={ring4Ref} position={[-3, -2, -4]}>
        <torusGeometry args={[1.8, 0.07, 16, 100]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.6} transparent opacity={0.8} />
      </mesh>
    </>
  );
}

function OrbitingCubes() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 5;
        return (
          <Float key={i} speed={1.5 + i * 0.2} rotationIntensity={0.5}>
            <mesh position={[Math.cos(angle) * radius, Math.sin(angle) * 0.5, Math.sin(angle) * radius - 5]}>
              <boxGeometry args={[0.3, 0.3, 0.3]} />
              <meshStandardMaterial 
                color="#22c55e" 
                emissive="#22c55e" 
                emissiveIntensity={0.5}
                transparent
                opacity={0.7}
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

function CentralGlow() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -8]}>
      <sphereGeometry args={[3, 32, 32]} />
      <meshStandardMaterial
        color="#22c55e"
        emissive="#22c55e"
        emissiveIntensity={0.3}
        transparent
        opacity={0.15}
      />
    </mesh>
  );
}

export default function ThreeBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.6} />
        <pointLight position={[-10, -10, -5]} intensity={0.4} color="#22c55e" />
        <pointLight position={[10, 5, 0]} intensity={0.3} color="#10b981" />
        
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        
        <ParticleField />
        <FloatingRings />
        <OrbitingCubes />
        <CentralGlow />
        
        <GlowingSphere position={[-6, 2, -4]} color="#22c55e" size={0.5} speed={1.2} />
        <GlowingSphere position={[6, -1, -3]} color="#10b981" size={0.4} speed={0.9} />
        <GlowingSphere position={[3, 3, -5]} color="#34d399" size={0.3} speed={1.5} />
        <GlowingSphere position={[-4, -2, -6]} color="#059669" size={0.6} speed={0.7} />
        
        <AnimatedDistortSphere position={[-7, 0, -6]} color="#22c55e" speed={1} distort={0.4} />
        <AnimatedDistortSphere position={[7, -2, -5]} color="#10b981" speed={0.8} distort={0.3} />
        
        <fog attach="fog" args={['#0f172a', 8, 30]} />
      </Canvas>
    </div>
  );
}
