import React, { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

// Singleton Socket for V4
let socketInstance: Socket | null = null;
const getSocket = () => {
  if (!socketInstance) {
    console.log('--- CREATING NEW SOCKET INSTANCE...');
    socketInstance = io('http://localhost:3000', {
      reconnectionAttempts: 5,
      timeout: 10000,
    });
  }
  return socketInstance;
};

// V4 State Management
interface GameState {
  tension: number;
  engineStatus: string;
  aiAction: string;
  setAiAction: (action: string) => void;
}

const useGameStore = create<GameState>((set) => ({
  tension: 0.1,
  engineStatus: 'V4 HYBRID ENGINE ACTIVE',
  aiAction: 'IDLE',
  setAiAction: (action) => set({ aiAction: action }),
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
    <mesh position={[0, 1.5, 0]} castShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color="#ffffff" 
        metalness={0.9} 
        roughness={0.1}
        envMapIntensity={1.0}
      />
    </mesh>
  );
}

export default function App() {
  const { engineStatus, aiAction, setAiAction } = useGameStore();

  React.useEffect(() => {
    const socket = getSocket();
    console.log('--- FRONTEND SOCKET INITIALIZING...');
    
    const onConnect = () => console.log('--- SOCKET CONNECTED:', socket.id);
    const onAiAction = (data: any) => {
      console.log('--- AI ACTION RECEIVED BY FRONTEND:', data.suggested_action);
      setAiAction(data.suggested_action);
    };
    const onConnectError = (err: Error) => console.error('--- SOCKET CONNECTION ERROR:', err.message);

    socket.on('connect', onConnect);
    socket.on('ai_action_received', onAiAction);
    socket.on('connect_error', onConnectError);
    
    // Interval to request AI decision
    const interval = setInterval(() => {
      if (socket.connected) {
        socket.emit('request_ai_action', {
          agent_id: 'SPHERE_01',
          x: 0, y: 1, z: 0,
          mood: 'NEUTRAL'
        });
      }
    }, 2000);

    return () => {
      socket.off('connect', onConnect);
      socket.off('ai_action_received', onAiAction);
      socket.off('connect_error', onConnectError);
      clearInterval(interval);
    };
  }, []);

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
        zIndex: 1000,
        color: '#00d4ff', 
        background: 'rgba(0, 5, 15, 0.8)',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        fontFamily: "'Inter', sans-serif",
        letterSpacing: '2px',
        textShadow: '0 0 10px rgba(0, 212, 255, 0.5)'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>JETBRAIN V4.0</h1>
        <p style={{ margin: '10px 0', opacity: 0.8, fontSize: '12px' }}>{engineStatus}</p>
        <p style={{ margin: '10px 0', color: '#ff0055', fontSize: '16px', fontWeight: 'bold', borderTop: '1px solid rgba(255, 0, 85, 0.3)', paddingTop: '10px' }}>
          LIVE_AI_ACTION: <span style={{ color: '#fff' }}>{aiAction}</span>
        </p>
        <div style={{ width: '200px', height: '4px', background: 'rgba(0, 212, 255, 0.1)', marginTop: '15px', overflow: 'hidden' }}>
          <div style={{ width: '80%', height: '100%', background: '#00d4ff', boxShadow: '0 0 10px #00d4ff' }} />
        </div>
      </div>
    </div>
  );
}
