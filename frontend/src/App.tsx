import React, { Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { create } from 'zustand';

// V4 State Management
interface GameState {
  tension: number;
  engineStatus: string;
}

const useGameStore = create<GameState>(() => ({
  tension: 0.1,
  engineStatus: 'V4 WEBGL2/WEBGPU ACTIVE',
}));

// Hyper-AAA Custom Shader Material (GLSL)
const GridShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0x00d4ff) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    void main() {
      float strength = step(0.98, mod(vUv.x * 20.0 + uTime * 0.1, 1.0));
      strength += step(0.98, mod(vUv.y * 20.0, 1.0));
      vec3 color = mix(vec3(0.005, 0.01, 0.02), uColor, strength * 0.5);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

function AnimatedGrid() {
  const meshRef = React.useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <shaderMaterial attach="material" {...GridShaderMaterial} />
    </mesh>
  );
}

function ProSphere() {
  return (
    <mesh position={[0, 1, 0]} castShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color="#00d4ff" 
        metalness={0.9} 
        roughness={0.1}
        envMapIntensity={0.5}
      />
    </mesh>
  );
}

export default function App() {
  const { engineStatus } = useGameStore();

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas shadows gl={{ antialias: true, alpha: false, stencil: false }}>
        <PerspectiveCamera makeDefault position={[6, 4, 6]} fov={50} />
        <Suspense fallback={null}>
          <color attach="background" args={['#000308']} />
          <fog attach="fog" args={['#000308', 5, 20]} />
          
          <ambientLight intensity={0.8} />
          <pointLight position={[-5, 5, -5]} intensity={1.5} color="#00d4ff" />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={2} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
          />
          
          <ProSphere />
          <AnimatedGrid />
          
          <Environment preset="night" />
          <ContactShadows opacity={0.4} scale={15} blur={2.5} far={5} />
          
          <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
        </Suspense>
      </Canvas>
      
      {/* V4 PRO HUD */}
      <div style={{ 
        position: 'absolute', 
        top: 30, 
        left: 30, 
        color: '#00d4ff', 
        fontFamily: "'Inter', monospace",
        letterSpacing: '2px',
        textShadow: '0 0 10px rgba(0, 212, 255, 0.5)'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>JETBRAIN V4.0</h1>
        <p style={{ margin: '5px 0', opacity: 0.8, fontSize: '12px' }}>{engineStatus}</p>
        <div style={{ width: '200px', height: '2px', background: 'rgba(0, 212, 255, 0.3)', marginTop: '10px' }}>
          <div style={{ width: '40%', height: '100%', background: '#00d4ff' }} />
        </div>
      </div>
    </div>
  );
}
