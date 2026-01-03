import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

// Neural Network Nodes - interconnected glowing spheres
function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  
  const nodeCount = 30;
  const connections = useMemo(() => {
    const lines: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    const positions: THREE.Vector3[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      positions.push(new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6 - 5
      ));
    }
    
    // Create connections between nearby nodes
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        if (positions[i].distanceTo(positions[j]) < 4) {
          lines.push({ start: positions[i], end: positions[j] });
        }
      }
    }
    
    return { positions, lines };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Neural nodes */}
      {connections.positions.map((pos, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={0.2} floatIntensity={0.3}>
          <mesh position={pos}>
            <sphereGeometry args={[0.08 + Math.random() * 0.05, 16, 16]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#22c55e"
              emissiveIntensity={1}
              transparent
              opacity={0.9}
            />
          </mesh>
        </Float>
      ))}
      
      {/* Connection lines */}
      {connections.lines.map((line, i) => (
        <DataFlowLine key={i} start={line.start} end={line.end} delay={i * 0.1} />
      ))}
    </group>
  );
}

// Animated data flowing along connection lines
function DataFlowLine({ start, end, delay }: { start: THREE.Vector3; end: THREE.Vector3; delay: number }) {
  const particleRef = useRef<THREE.Mesh>(null);
  
  const points = useMemo(() => [start, end], [start, end]);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  
  useFrame((state) => {
    if (particleRef.current) {
      const t = ((state.clock.elapsedTime + delay) % 2) / 2;
      particleRef.current.position.lerpVectors(start, end, t);
      particleRef.current.scale.setScalar(0.5 + Math.sin(t * Math.PI) * 0.5);
    }
  });

  return (
    <>
      <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#22c55e', transparent: true, opacity: 0.2 }))} />

      <mesh ref={particleRef}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={2} />
      </mesh>
    </>
  );
}

// AI Brain - central pulsing sphere with orbiting data
function AIBrain() {
  const brainRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (brainRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      brainRef.current.scale.set(scale, scale, scale);
      brainRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group position={[0, 0, -6]}>
      {/* Core brain sphere */}
      <Sphere ref={brainRef} args={[1.2, 64, 64]}>
        <MeshDistortMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0.3}
          distort={0.3}
          speed={3}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.6}
        />
      </Sphere>
      
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#4ade80"
          emissive="#4ade80"
          emissiveIntensity={0.8}
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Orbiting data ring */}
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2, 0.02, 16, 100]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
        </mesh>
        
        {/* Data points on ring */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 2, 0, Math.sin(angle) * 2]}>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={1} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

// Circuit Pattern - geometric AI circuitry
function CircuitPattern() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.02;
    }
  });

  const circuits = useMemo(() => {
    const paths: THREE.Vector3[][] = [];
    for (let i = 0; i < 8; i++) {
      const startX = (Math.random() - 0.5) * 20;
      const startY = (Math.random() - 0.5) * 15;
      const path: THREE.Vector3[] = [new THREE.Vector3(startX, startY, -10)];
      
      let x = startX, y = startY;
      for (let j = 0; j < 5; j++) {
        const dir = Math.random() > 0.5;
        if (dir) {
          x += (Math.random() - 0.5) * 3;
        } else {
          y += (Math.random() - 0.5) * 3;
        }
        path.push(new THREE.Vector3(x, y, -10));
      }
      paths.push(path);
    }
    return paths;
  }, []);

  return (
    <group ref={groupRef}>
      {circuits.map((path, i) => (
        <CircuitLine key={i} points={path} delay={i * 0.5} />
      ))}
    </group>
  );
}

function CircuitLine({ points, delay }: { points: THREE.Vector3[]; delay: number }) {
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  const lineMaterial = useMemo(() => new THREE.LineBasicMaterial({ color: '#22c55e', transparent: true, opacity: 0.15 }), []);
  
  return (
    <>
      <primitive object={new THREE.Line(geometry, lineMaterial)} />
      {/* Circuit nodes */}
      {points.map((point, i) => (
        <mesh key={i} position={point}>
          <circleGeometry args={[0.05, 8]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.3} />
        </mesh>
      ))}
    </>
  );
}

// Floating AI Icons/Symbols
function FloatingAISymbols() {
  const symbols = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8 - 4
      ] as [number, number, number],
      scale: 0.2 + Math.random() * 0.3,
      speed: 0.5 + Math.random() * 1,
      type: Math.floor(Math.random() * 3)
    }));
  }, []);

  return (
    <>
      {symbols.map((symbol, i) => (
        <FloatingSymbol key={i} {...symbol} index={i} />
      ))}
    </>
  );
}

function FloatingSymbol({ position, scale, speed, type, index }: { position: [number, number, number]; scale: number; speed: number; type: number; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + index) * 0.5;
      meshRef.current.rotation.z = state.clock.elapsedTime * speed * 0.5;
    }
  });

  return (
    <Float speed={speed * 2} rotationIntensity={0.3}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {type === 0 && <octahedronGeometry args={[1, 0]} />}
        {type === 1 && <icosahedronGeometry args={[1, 0]} />}
        {type === 2 && <tetrahedronGeometry args={[1, 0]} />}
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0.5}
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

// Data Stream - vertical flowing data particles
function DataStream({ position }: { position: [number, number, number] }) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const count = 50;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] -= 0.05;
        if (positions[i * 3 + 1] < -4) {
          positions[i * 3 + 1] = 4;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef} position={position} geometry={particlesGeometry}>
      <pointsMaterial
        size={0.08}
        color="#4ade80"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// Particle Field Background
function ParticleField() {
  const points = useRef<THREE.Points>(null);
  
  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
      points.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={points} geometry={particlesGeometry}>
      <pointsMaterial
        size={0.04}
        color="#22c55e"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default function ThreeBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
        <pointLight position={[-10, -10, -5]} intensity={0.3} color="#22c55e" />
        <pointLight position={[5, 5, 0]} intensity={0.4} color="#4ade80" />
        
        <Stars radius={100} depth={50} count={1500} factor={4} saturation={0} fade speed={0.5} />
        
        {/* AI-themed elements */}
        <NeuralNetwork />
        <AIBrain />
        <CircuitPattern />
        <FloatingAISymbols />
        
        {/* Data streams */}
        <DataStream position={[-6, 0, -3]} />
        <DataStream position={[6, 0, -4]} />
        <DataStream position={[-3, 0, -5]} />
        <DataStream position={[4, 0, -6]} />
        
        <ParticleField />
        
        <fog attach="fog" args={['#0f172a', 8, 35]} />
      </Canvas>
    </div>
  );
}
