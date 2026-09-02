import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';

// Helper component for floating particles
const Particles = ({ count = 50 }) => {
  const pointsRef = useRef();
  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.0 + Math.random() * 2.0;
      arr[i * 3] = Math.cos(angle) * radius;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      arr[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return arr;
  });

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial 
        color="#06b6d4"
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.8}
      />
    </points>
  );
};

// Scene elements
const OrbScene = () => {
  const sphereRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (sphereRef.current) {
      sphereRef.current.rotation.y = elapsed * 0.15;
      sphereRef.current.rotation.x = elapsed * 0.1;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = elapsed * 0.2;
      ring1Ref.current.rotation.x = elapsed * 0.1;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -elapsed * 0.15;
      ring2Ref.current.rotation.y = elapsed * 0.08;
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#7c3aed" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#06b6d4" />

      <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1.2}>
        <mesh ref={sphereRef}>
          <sphereGeometry args={[1.5, 64, 64]} />
          <meshPhysicalMaterial 
            color="#7c3aed" 
            emissive="#2e1065"
            roughness={0.05}
            metalness={0.1}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            transmission={0.65}
            thickness={1.5}
          />
        </mesh>
      </Float>

      {/* Ring 1 (Cyan) */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.4, 0.03, 16, 100]} />
        <meshBasicMaterial color="#06b6d4" opacity={0.6} transparent />
      </mesh>

      {/* Ring 2 (Violet) */}
      <mesh ref={ring2Ref} rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[3.0, 0.02, 16, 100]} />
        <meshBasicMaterial color="#7c3aed" opacity={0.4} transparent />
      </mesh>

      <Particles count={60} />
    </>
  );
};

// Main container component with WebGL support checks
const AIIntelligenceCore = () => {
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const supported = !!(
        window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      setWebglSupported(supported);
    } catch (e) {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) {
    return (
      <div className="fallback-3d glass-panel" style={{ background: 'rgba(15, 19, 28, 0.4)' }}>
        <div className="fallback-orb"></div>
        <div className="orb-tag orb-tag-1 glass-card badge-cyan">Match Intelligence</div>
        <div className="orb-tag orb-tag-2 glass-card badge-violet">Bias Monitoring</div>
        <div className="orb-tag orb-tag-3 glass-card badge-success">Talent Signals</div>
      </div>
    );
  }

  return (
    <div className="three-canvas-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 6.5], fov: 45 }}>
        <OrbScene />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default AIIntelligenceCore;
