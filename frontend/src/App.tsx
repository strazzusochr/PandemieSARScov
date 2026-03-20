import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { create } from 'zustand';

// Simple Store for V4
interface GameState {
  tension: number;
  increaseTension: () => void;
}

const useGameStore = create<GameState>((set) => ({
  tension: 0,
  increaseTension: () => set((state) => ({ tension: state.tension + 1 })),
}));

export default function App() {
  const { tension } = useGameStore();

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#030608' }}>
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 10]} intensity={2} castShadow />
          
          {/* Pro Rendering Layer */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#0a1420" roughness={0.1} metalness={0.9} />
          </mesh>
          
          <gridHelper args={[20, 20, 0x00d4ff, 0x0a1420]} position={[0, 0.01, 0]} />
          <ContactShadows opacity={0.4} scale={10} blur={2} far={10} />
          
          <OrbitControls makeDefault />
        </Suspense>
      </Canvas>
      
      {/* V4 UI Layer */}
      <div style={{ position: 'absolute', top: 20, left: 20, color: '#00d4ff', fontFamily: 'monospace' }}>
        <h1>JETBRAIN V4.0</h1>
        <p>STATUS: INITIALIZED</p>
        <p>SYSTEM: TS + PYTHON + GLSL</p>
        <p>TENSION: {tension}</p>
      </div>
    </div>
  );
}
