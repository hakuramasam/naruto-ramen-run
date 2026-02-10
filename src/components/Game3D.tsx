import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Environment, Float, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, ObstacleType } from '../store/gameStore';

// Lane positions
const LANES = [-2.5, 0, 2.5];
const OBSTACLE_SPAWN_Z = -80;
const OBSTACLE_REMOVE_Z = 10;

// Naruto character (player)
function NarutoRunner() {
  const meshRef = useRef<THREE.Group>(null);
  const { playerLane, isJumping, gameState } = useGameStore();
  const [currentY, setCurrentY] = useState(0.5);
  const jumpStartTime = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Smooth lane transition
    const targetX = LANES[playerLane];
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      targetX,
      10 * delta
    );

    // Jump physics
    if (isJumping) {
      if (jumpStartTime.current === 0) {
        jumpStartTime.current = Date.now();
      }
      const elapsed = (Date.now() - jumpStartTime.current) / 1000;
      const jumpHeight = 3;
      const jumpDuration = 0.6;
      const progress = elapsed / jumpDuration;

      if (progress < 1) {
        const y = jumpHeight * Math.sin(progress * Math.PI) + 0.5;
        setCurrentY(y);
      } else {
        setCurrentY(0.5);
        jumpStartTime.current = 0;
        useGameStore.getState().land();
      }
    }

    meshRef.current.position.y = currentY;

    // Running animation
    if (gameState === 'playing') {
      meshRef.current.rotation.z = Math.sin(Date.now() * 0.02) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={[LANES[1], 0.5, 2]}>
      {/* Body */}
      <mesh position={[0, 0.3, 0]}>
        <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
        <meshStandardMaterial color="#FF6B00" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#FFD4A3" />
      </mesh>
      {/* Hair (spiky) */}
      <mesh position={[0, 1.2, 0]}>
        <coneGeometry args={[0.3, 0.3, 8]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      {/* Headband */}
      <mesh position={[0, 1.05, 0.2]}>
        <boxGeometry args={[0.4, 0.08, 0.1]} />
        <meshStandardMaterial color="#1E40AF" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.08, 0.95, 0.2]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#3B82F6" />
      </mesh>
      <mesh position={[0.08, 0.95, 0.2]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#3B82F6" />
      </mesh>
    </group>
  );
}

// Obstacle characters
function ObstacleCharacter({ type, position }: { type: ObstacleType; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);

  const getCharacterColors = () => {
    switch (type) {
      case 'sasuke':
        return { body: '#1E293B', hair: '#0F172A', accent: '#8B5CF6' };
      case 'sakura':
        return { body: '#F472B6', hair: '#EC4899', accent: '#FCD34D' };
      case 'hinata':
        return { body: '#A855F7', hair: '#1E293B', accent: '#E2E8F0' };
      case 'kakashi':
        return { body: '#374151', hair: '#9CA3AF', accent: '#3B82F6' };
      case 'jobs':
        return { body: '#4B5563', hair: '#D1D5DB', accent: '#F43F5E' };
      default:
        return { body: '#6B7280', hair: '#374151', accent: '#FCD34D' };
    }
  };

  const colors = getCharacterColors();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.4, 0.8, 8, 16]} />
        <meshStandardMaterial color={colors.body} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#FFD4A3" />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshStandardMaterial color={colors.hair} />
      </mesh>
      {/* Accent (like a headband or clothing detail) */}
      <mesh position={[0, 0.5, 0.35]}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial color={colors.accent} emissive={colors.accent} emissiveIntensity={0.3} />
      </mesh>
      {/* Name tag floating above */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
        <Text
          position={[0, 2.2, 0]}
          fontSize={0.3}
          color={colors.accent}
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2"
        >
          {type.toUpperCase()}
        </Text>
      </Float>
    </group>
  );
}

// Ramen shop (goal visualization at the end)
function RamenShop() {
  return (
    <group position={[0, 0, -100]}>
      {/* Shop building */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[8, 4, 4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 4.5, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[6, 2, 4]} />
        <meshStandardMaterial color="#DC2626" />
      </mesh>
      {/* Sign */}
      <mesh position={[0, 5, 2]}>
        <boxGeometry args={[4, 1, 0.2]} />
        <meshStandardMaterial color="#FEF3C7" emissive="#FEF3C7" emissiveIntensity={0.2} />
      </mesh>
      <Text
        position={[0, 5, 2.15]}
        fontSize={0.5}
        color="#DC2626"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2"
      >
        ICHIRAKU
      </Text>
      {/* Noren (curtains) */}
      <mesh position={[-1, 1.5, 2.1]}>
        <boxGeometry args={[1.5, 2, 0.1]} />
        <meshStandardMaterial color="#1E40AF" opacity={0.9} transparent />
      </mesh>
      <mesh position={[1, 1.5, 2.1]}>
        <boxGeometry args={[1.5, 2, 0.1]} />
        <meshStandardMaterial color="#1E40AF" opacity={0.9} transparent />
      </mesh>
      {/* Lanterns */}
      <Float speed={1} rotationIntensity={0.1}>
        <mesh position={[-3, 3, 2.5]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#FF6B00" emissive="#FF6B00" emissiveIntensity={0.5} />
        </mesh>
      </Float>
      <Float speed={1.2} rotationIntensity={0.1}>
        <mesh position={[3, 3, 2.5]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#FF6B00" emissive="#FF6B00" emissiveIntensity={0.5} />
        </mesh>
      </Float>
    </group>
  );
}

// Running track
function Track() {
  const trackRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (trackRef.current) {
      // Animate track lines for motion effect
      trackRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.userData.scrollable) {
          child.position.z = ((child.position.z + 0.5) % 20) - 10;
        }
      });
    }
  });

  return (
    <group ref={trackRef}>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -30]}>
        <planeGeometry args={[15, 100]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Lane dividers */}
      {[-1.25, 1.25].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, -30]}>
          <planeGeometry args={[0.1, 100]} />
          <meshStandardMaterial color="#FF6B00" emissive="#FF6B00" emissiveIntensity={0.3} />
        </mesh>
      ))}

      {/* Side walls */}
      {[-6, 6].map((x, i) => (
        <mesh key={i} position={[x, 1, -30]}>
          <boxGeometry args={[0.5, 3, 100]} />
          <meshStandardMaterial color="#16213e" />
        </mesh>
      ))}

      {/* Japanese-style torii gates along the path */}
      {[-40, -20, 0, 20].map((z, i) => (
        <group key={i} position={[0, 0, z]}>
          {/* Vertical posts */}
          <mesh position={[-5, 2, 0]}>
            <cylinderGeometry args={[0.2, 0.3, 5, 8]} />
            <meshStandardMaterial color="#DC2626" />
          </mesh>
          <mesh position={[5, 2, 0]}>
            <cylinderGeometry args={[0.2, 0.3, 5, 8]} />
            <meshStandardMaterial color="#DC2626" />
          </mesh>
          {/* Top beam */}
          <mesh position={[0, 4.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 11, 8]} />
            <meshStandardMaterial color="#DC2626" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Obstacles manager
function Obstacles() {
  const { obstacles, gameState, speed, score } = useGameStore();
  const lastSpawnTime = useRef(0);

  useFrame((_, delta) => {
    if (gameState !== 'playing') return;

    const store = useGameStore.getState();

    // Update obstacle positions
    store.updateObstacles(delta);

    // Remove obstacles that passed the player
    obstacles.forEach((obstacle) => {
      if (obstacle.z > OBSTACLE_REMOVE_Z) {
        store.removeObstacle(obstacle.id);
        store.incrementObstaclesAvoided();
        store.incrementScore(100);
      }
    });

    // Spawn new obstacles
    const now = Date.now();
    const baseSpawnInterval = 1500;
    const difficultyMultiplier = Math.max(0.3, 1 - score / 10000);
    const spawnInterval = baseSpawnInterval * difficultyMultiplier;

    if (now - lastSpawnTime.current > spawnInterval) {
      const obstacleTypes: ObstacleType[] = ['sasuke', 'sakura', 'hinata', 'kakashi', 'jobs'];
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const lane = Math.floor(Math.random() * 3);

      store.addObstacle({
        id: `obstacle-${now}`,
        type,
        lane,
        z: OBSTACLE_SPAWN_Z,
      });

      lastSpawnTime.current = now;
    }

    // Increase difficulty over time
    if (score > 0 && score % 500 === 0) {
      const newSpeed = Math.min(35, 15 + score / 200);
      store.setSpeed(newSpeed);
    }

    // Collision detection
    const playerLane = store.playerLane;
    const isJumping = store.isJumping;

    obstacles.forEach((obstacle) => {
      if (
        obstacle.lane === playerLane &&
        obstacle.z > 0 &&
        obstacle.z < 4 &&
        !isJumping
      ) {
        store.endGame();
      }
    });

    // Increment distance
    store.incrementDistance(speed * delta);
  });

  return (
    <>
      {obstacles.map((obstacle) => (
        <Trail
          key={obstacle.id}
          width={1}
          length={4}
          color={obstacle.type === 'sasuke' ? '#8B5CF6' : '#FF6B00'}
          attenuation={(t) => t * t}
        >
          <ObstacleCharacter
            type={obstacle.type}
            position={[LANES[obstacle.lane], 0, obstacle.z]}
          />
        </Trail>
      ))}
    </>
  );
}

// Camera controller
function CameraController() {
  const { camera } = useThree();
  const { gameState } = useGameStore();

  useEffect(() => {
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, -20);
  }, [camera]);

  useFrame(() => {
    if (gameState === 'playing') {
      // Subtle camera shake for intensity
      camera.position.x = Math.sin(Date.now() * 0.005) * 0.1;
    }
  });

  return null;
}

// Keyboard controls
function Controls() {
  const { moveLeft, moveRight, jump, gameState } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          moveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          moveRight();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
          jump();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, moveLeft, moveRight, jump]);

  return null;
}

// Main game component
export function Game3D() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 5, 10], fov: 60 }}
      style={{ background: 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)' }}
    >
      <Suspense fallback={null}>
        <fog attach="fog" args={['#0f0c29', 20, 80]} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[0, 10, -50]} intensity={1} color="#FF6B00" />

        <Environment preset="night" />

        <CameraController />
        <Controls />
        <Track />
        <NarutoRunner />
        <Obstacles />
        <RamenShop />

        {/* Stars/particles background */}
        <mesh position={[0, 30, -40]}>
          <sphereGeometry args={[80, 32, 32]} />
          <meshBasicMaterial color="#0a0a1a" side={THREE.BackSide} />
        </mesh>
      </Suspense>
    </Canvas>
  );
}
