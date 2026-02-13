import { useRef, useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { Language } from '../../contexts/LanguageContext';
import { getProjects } from '../../data/projects';
import { getExperiences, getEducation } from '../../data/about';
import { getSkillCategories } from '../../data/skills';

// Generador pseudoaleatorio con seed para resultados determinísticos
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Función de ruido Simplex 3D simplificada para terreno procedural
function noise3D(x: number, y: number, z: number, seed: number = 0): number {
  const p = (n: number) => {
    const s = seed + n * 127.1;
    return Math.sin(s * 43758.5453) * 0.5 + 0.5;
  };
  
  const fx = Math.floor(x), fy = Math.floor(y), fz = Math.floor(z);
  const dx = x - fx, dy = y - fy, dz = z - fz;
  
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number) => a + t * (b - a);
  
  const hash = (xi: number, yi: number, zi: number) => {
    return p(xi * 374761393 + yi * 668265263 + zi * 1440670431);
  };
  
  const u = fade(dx), v = fade(dy), w = fade(dz);
  
  return lerp(
    lerp(
      lerp(hash(fx, fy, fz), hash(fx + 1, fy, fz), u),
      lerp(hash(fx, fy + 1, fz), hash(fx + 1, fy + 1, fz), u),
      v
    ),
    lerp(
      lerp(hash(fx, fy, fz + 1), hash(fx + 1, fy, fz + 1), u),
      lerp(hash(fx, fy + 1, fz + 1), hash(fx + 1, fy + 1, fz + 1), u),
      v
    ),
    w
  );
}

// Generar múltiples octavas de ruido para terreno más realista
function fbm(x: number, y: number, z: number, octaves: number = 4, seed: number = 0): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;
  
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise3D(x * frequency, y * frequency, z * frequency, seed + i * 100);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  
  return value / maxValue;
}

// Detectar dispositivo táctil
function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return ('ontouchstart' in window) || 
    (navigator.maxTouchPoints > 0) || 
    window.matchMedia('(pointer: coarse)').matches;
}

// Estado global para joysticks virtuales y botones
interface JoystickState {
  left: { x: number; y: number };
  right: { x: number; y: number };
  verticalMovement: number; // -1 = bajar, 0 = nada, 1 = subir
}

const joystickState: JoystickState = {
  left: { x: 0, y: 0 },
  right: { x: 0, y: 0 },
  verticalMovement: 0
};

// Datos de los planetas del sistema solar del portfolio
type PlanetType = 'terrestrial' | 'gas_giant' | 'ice' | 'volcanic';

interface PlanetData {
  id: string;
  name: { es: string; en: string };
  description: { es: string; en: string };
  color: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  planetType: PlanetType;
  items: PlanetItem[];
}

interface PlanetItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
}

// Props del planeta
interface PlanetProps {
  data: PlanetData;
  language: Language;
  cameraPosition: THREE.Vector3;
  onSelect: (planet: PlanetData | null) => void;
  selectedPlanet: PlanetData | null;
}

// Componente del Sol central
function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      {/* Sol principal */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[10, 32, 32]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ff8c00"
          emissiveIntensity={2}
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>
      
      {/* Halo de brillo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[12.5, 24, 24]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Luz del sol */}
      <pointLight color="#fff5e0" intensity={4} distance={500} />
    </group>
  );
}

// Geometría de planeta con terreno procedural según tipo
function createPlanetGeometry(
  radius: number, 
  detail: number, 
  seed: number, 
  heightScale: number,
  planetType: PlanetType
): THREE.BufferGeometry {
  const geometry = new THREE.IcosahedronGeometry(radius, detail);
  const positions = geometry.attributes.position;
  
  // Crear nuevos arrays para las posiciones modificadas
  const newPositions = new Float32Array(positions.count * 3);
  const colors = new Float32Array(positions.count * 3);
  
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    // Normalizar para obtener dirección
    const length = Math.sqrt(x * x + y * y + z * z);
    const nx = x / length;
    const ny = y / length;
    const nz = z / length;
    
    // Generar altura con ruido - varía según tipo
    let noiseValue: number;
    let height: number;
    
    if (planetType === 'gas_giant') {
      // Gigante gaseoso: sin terreno real, superficie lisa con bandas
      noiseValue = fbm(nx * 0.5, ny * 8, nz * 0.5, 2, seed);
      height = radius + (noiseValue - 0.5) * heightScale * 0.1; // Casi plano
    } else if (planetType === 'ice') {
      // Planeta helado: suave con algunos cráteres
      noiseValue = fbm(nx * 3, ny * 3, nz * 3, 3, seed);
      height = radius + (noiseValue - 0.5) * heightScale * 0.5;
    } else if (planetType === 'volcanic') {
      // Volcánico: muy irregular con picos
      noiseValue = fbm(nx * 4, ny * 4, nz * 4, 4, seed);
      height = radius + (noiseValue - 0.5) * heightScale * 1.2;
    } else {
      // Terrestre: océanos, vegetación, montañas
      noiseValue = fbm(nx * 2, ny * 2, nz * 2, 3, seed);
      height = radius + (noiseValue - 0.5) * heightScale;
    }
    
    newPositions[i * 3] = nx * height;
    newPositions[i * 3 + 1] = ny * height;
    newPositions[i * 3 + 2] = nz * height;
    
    // Colores según tipo de planeta
    const heightNorm = (noiseValue - 0.3) / 0.4;
    
    if (planetType === 'terrestrial') {
      // Planeta tipo Tierra: océanos azules, vegetación verde, montañas marrones
      if (heightNorm < 0.35) {
        // Océano profundo
        colors[i * 3] = 0.05;
        colors[i * 3 + 1] = 0.15;
        colors[i * 3 + 2] = 0.5;
      } else if (heightNorm < 0.42) {
        // Océano costero
        colors[i * 3] = 0.1;
        colors[i * 3 + 1] = 0.35;
        colors[i * 3 + 2] = 0.6;
      } else if (heightNorm < 0.48) {
        // Playa/arena
        colors[i * 3] = 0.76;
        colors[i * 3 + 1] = 0.7;
        colors[i * 3 + 2] = 0.5;
      } else if (heightNorm < 0.58) {
        // Llanuras verdes
        colors[i * 3] = 0.2;
        colors[i * 3 + 1] = 0.55;
        colors[i * 3 + 2] = 0.15;
      } else if (heightNorm < 0.68) {
        // Bosque denso
        colors[i * 3] = 0.1;
        colors[i * 3 + 1] = 0.4;
        colors[i * 3 + 2] = 0.1;
      } else if (heightNorm < 0.8) {
        // Montañas rocosas
        colors[i * 3] = 0.45;
        colors[i * 3 + 1] = 0.35;
        colors[i * 3 + 2] = 0.25;
      } else {
        // Picos nevados
        colors[i * 3] = 0.95;
        colors[i * 3 + 1] = 0.97;
        colors[i * 3 + 2] = 1.0;
      }
    } else if (planetType === 'gas_giant') {
      // Gigante gaseoso: bandas de colores (naranjas, rojos, amarillos, marrones)
      const bandNoise = fbm(ny * 12, nx * 0.5, nz * 0.5, 2, seed + 100);
      const band = Math.sin(ny * 15 + bandNoise * 3);
      
      if (band < -0.5) {
        // Banda oscura marrón
        colors[i * 3] = 0.5;
        colors[i * 3 + 1] = 0.3;
        colors[i * 3 + 2] = 0.15;
      } else if (band < 0) {
        // Banda naranja
        colors[i * 3] = 0.85;
        colors[i * 3 + 1] = 0.5;
        colors[i * 3 + 2] = 0.2;
      } else if (band < 0.5) {
        // Banda crema/amarilla
        colors[i * 3] = 0.9;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 0.6;
      } else {
        // Banda roja/tormenta
        colors[i * 3] = 0.75;
        colors[i * 3 + 1] = 0.35;
        colors[i * 3 + 2] = 0.2;
      }
    } else if (planetType === 'ice') {
      // Planeta helado: blancos, azules claros, grietas azules
      if (heightNorm < 0.4) {
        // Hielo profundo azul
        colors[i * 3] = 0.6;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 0.95;
      } else if (heightNorm < 0.6) {
        // Hielo blanco
        colors[i * 3] = 0.9;
        colors[i * 3 + 1] = 0.95;
        colors[i * 3 + 2] = 1.0;
      } else if (heightNorm < 0.75) {
        // Nieve compacta
        colors[i * 3] = 0.85;
        colors[i * 3 + 1] = 0.88;
        colors[i * 3 + 2] = 0.92;
      } else {
        // Grietas/glaciares azul intenso
        colors[i * 3] = 0.4;
        colors[i * 3 + 1] = 0.6;
        colors[i * 3 + 2] = 0.85;
      }
    } else if (planetType === 'volcanic') {
      // Planeta volcánico: negro, rojo lava, naranja
      if (heightNorm < 0.3) {
        // Lava brillante
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.3;
        colors[i * 3 + 2] = 0.0;
      } else if (heightNorm < 0.45) {
        // Lava enfriándose
        colors[i * 3] = 0.8;
        colors[i * 3 + 1] = 0.2;
        colors[i * 3 + 2] = 0.05;
      } else if (heightNorm < 0.6) {
        // Roca caliente
        colors[i * 3] = 0.3;
        colors[i * 3 + 1] = 0.1;
        colors[i * 3 + 2] = 0.05;
      } else if (heightNorm < 0.8) {
        // Roca oscura
        colors[i * 3] = 0.15;
        colors[i * 3 + 1] = 0.12;
        colors[i * 3 + 2] = 0.1;
      } else {
        // Ceniza/humo
        colors[i * 3] = 0.25;
        colors[i * 3 + 1] = 0.22;
        colors[i * 3 + 2] = 0.2;
      }
    }
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  
  return geometry;
}

// Componente de terreno del planeta (versión detallada)
interface PlanetTerrainProps {
  size: number;
  color: string;
  seed: number;
  hovered: boolean;
  planetType: PlanetType;
}

function PlanetTerrain({ size, color, seed, hovered, planetType }: PlanetTerrainProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    return createPlanetGeometry(size, 3, seed, size * 0.3, planetType);
  }, [size, seed, planetType]);
  
  // Velocidad de rotación según tipo
  const rotationSpeed = planetType === 'gas_giant' ? 0.003 : 0.001;
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
    }
  });
  
  // Mezclar colores del terreno con el color temático del planeta
  const planetColor = useMemo(() => new THREE.Color(color), [color]);
  
  // Materiales diferentes según tipo
  const emissiveIntensity = planetType === 'volcanic' ? (hovered ? 0.5 : 0.3) : (hovered ? 0.3 : 0.1);
  const metalness = planetType === 'ice' ? 0.4 : 0.2;
  const roughness = planetType === 'gas_giant' ? 0.4 : 0.8;
  
  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        vertexColors
        emissive={planetColor}
        emissiveIntensity={emissiveIntensity}
        metalness={metalness}
        roughness={roughness}
        flatShading={planetType !== 'gas_giant'}
      />
    </mesh>
  );
}

// Atmósfera del planeta
function PlanetAtmosphere({ size, color }: { size: number; color: string }) {
  return (
    <mesh>
      <sphereGeometry args={[size * 1.05, 24, 24]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.15}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// Calcular ángulo inicial determinista basado en el id
function getInitialAngle(id: string): number {
  return id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 0.1 % (Math.PI * 2);
}

// Componente del Planeta con LOD (Level of Detail)
function Planet({ data, language, cameraPosition, onSelect, selectedPlanet }: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [angle, setAngle] = useState(() => getInitialAngle(data.id));
  const [showDetails, setShowDetails] = useState(false);
  const [showTerrain, setShowTerrain] = useState(false);
  
  // Seed único para cada planeta basado en su id
  const planetSeed = useMemo(() => {
    return data.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }, [data.id]);
  
  // Umbral de distancia para mostrar terreno (proporcional al tamaño)
  const terrainThreshold = data.size * 4;
  const detailsThreshold = data.size * 6;
  
  useFrame(() => {
    // Órbita
    setAngle(prev => prev + data.orbitSpeed * 0.01);
    
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle) * data.orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * data.orbitRadius;
      
      // Calcular distancia a la cámara
      const dist = cameraPosition.distanceTo(groupRef.current.position);
      setShowDetails(dist < detailsThreshold);
      setShowTerrain(dist < terrainThreshold);
    }
    
    if (meshRef.current && !showTerrain) {
      // Rotación propia del planeta (solo cuando es esfera simple)
      meshRef.current.rotation.y += 0.005;
      
      // Escala al hover
      const targetScale = hovered ? 1.1 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const handleClick = useCallback(() => {
    onSelect(selectedPlanet?.id === data.id ? null : data);
  }, [data, onSelect, selectedPlanet]);

  return (
    <group ref={groupRef}>
      {/* Hitbox invisible para interacción */}
      <mesh
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        onClick={handleClick}
        visible={false}
      >
        <sphereGeometry args={[data.size * 1.1, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Planeta simple (lejos) o con terreno (cerca) */}
      {showTerrain ? (
        <group>
          <PlanetTerrain 
            size={data.size} 
            color={data.color} 
            seed={planetSeed}
            hovered={hovered}
            planetType={data.planetType}
          />
          <PlanetAtmosphere size={data.size} color={data.color} />
        </group>
      ) : (
        <mesh ref={meshRef}>
          <sphereGeometry args={[data.size, 24, 24]} />
          <meshStandardMaterial
            color={data.color}
            emissive={data.color}
            emissiveIntensity={hovered ? 0.5 : 0.2}
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>
      )}
      
      {/* Anillos para planetas con anillos (gigante gaseoso) */}
      {data.planetType === 'gas_giant' && (
        <group rotation={[Math.PI / 2.2, 0.1, 0]}>
          <mesh>
            <ringGeometry args={[data.size * 1.3, data.size * 1.6, 64]} />
            <meshBasicMaterial color="#c9a86c" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <ringGeometry args={[data.size * 1.65, data.size * 1.9, 64]} />
            <meshBasicMaterial color="#8b7355" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <ringGeometry args={[data.size * 1.95, data.size * 2.1, 64]} />
            <meshBasicMaterial color="#a08060" transparent opacity={0.2} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
      
      {/* Nombre del planeta con Html para mejor rendimiento */}
      <Html
        center
        distanceFactor={15}
        position={[0, data.size + 3, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div className="planet-name-label">{data.name[language]}</div>
      </Html>
      
      {/* Luz del planeta */}
      <pointLight color={data.color} intensity={hovered ? 3 : 1} distance={data.size * 10} />
      
      {/* Indicador de distancia cuando estás cerca */}
      {showDetails && !showTerrain && (
        <Html
          center
          distanceFactor={12}
          position={[0, -data.size - 2, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="planet-approach-label">
            {language === 'es' ? 'Acércate más...' : 'Get closer...'}
          </div>
        </Html>
      )}
      
      {/* Información detallada al acercarse */}
      {showTerrain && (
        <Html
          center
          distanceFactor={12}
          position={[data.size + 8, 0, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="planet-details-popup planet-details-large">
            <h3>{data.name[language]}</h3>
            <p className="planet-description">{data.description[language]}</p>
            <div className="planet-items-preview">
              {data.items.slice(0, 5).map((item, idx) => (
                <div key={idx} className="planet-item-mini">
                  <span className="item-dot" style={{ background: data.color }}></span>
                  <span>{item.title}</span>
                </div>
              ))}
              {data.items.length > 5 && (
                <p className="more-items">+{data.items.length - 5} {language === 'es' ? 'más' : 'more'}</p>
              )}
            </div>
          </div>
        </Html>
      )}
      
      {/* Lunas (items) orbitando cuando estás muy cerca */}
      {showTerrain && data.items.slice(0, 8).map((item, idx) => (
        <Moon 
          key={item.id} 
          item={item} 
          index={idx} 
          total={Math.min(data.items.length, 8)}
          parentSize={data.size}
          color={data.color}
        />
      ))}
    </group>
  );
}

// Componente de Luna (item individual)
interface MoonProps {
  item: PlanetItem;
  index: number;
  total: number;
  parentSize: number;
  color: string;
}

function Moon({ item, index, total, parentSize, color }: MoonProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const angle = useRef((index / total) * Math.PI * 2);
  const moonOrbitRadius = parentSize * 1.5 + 3;
  const moonSize = Math.max(0.5, parentSize * 0.08);
  
  useFrame(() => {
    angle.current += 0.002; // Mucho más lento
    if (meshRef.current) {
      meshRef.current.position.x = Math.cos(angle.current) * moonOrbitRadius;
      meshRef.current.position.z = Math.sin(angle.current) * moonOrbitRadius;
      meshRef.current.position.y = Math.sin(angle.current * 2) * (parentSize * 0.2);
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <sphereGeometry args={[moonSize, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? 0.8 : 0.3}
      />
      {hovered && (
        <Html center distanceFactor={10}>
          <div className="moon-tooltip">
            <strong>{item.title}</strong>
            {item.subtitle && <span className="moon-subtitle">{item.subtitle}</span>}
          </div>
        </Html>
      )}
    </mesh>
  );
}

// Órbitas visuales
function OrbitRing({ radius, color }: { radius: number; color: string }) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      pts.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
    }
    return pts;
  }, [radius]);

  return (
    <Line
      points={points}
      color={color}
      transparent
      opacity={0.2}
      lineWidth={1}
    />
  );
}

// Controles de nave espacial
function SpaceshipControls() {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const rotation = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const keys = useRef<Set<string>>(new Set());
  const initialized = useRef(false);
  const isMobile = useRef(isTouchDevice());
  
  const SPEED = 0.15;
  const FRICTION = 0.92;
  const LOOK_SPEED = 0.025;
  
  // Sensibilidad reducida para joysticks móviles
  const MOBILE_MOVE_SENSITIVITY = 0.5;
  const MOBILE_LOOK_SENSITIVITY = 0.4;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.code.toLowerCase());
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'space'].includes(e.code.toLowerCase())) {
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current.delete(e.code.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!initialized.current) {
      camera.position.lerp(new THREE.Vector3(0, 75, 175), 0.02);
      camera.lookAt(0, 0, 0);
      rotation.current.setFromQuaternion(camera.quaternion);
      if (camera.position.distanceTo(new THREE.Vector3(0, 75, 175)) < 1) {
        initialized.current = true;
      }
      return;
    }

    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    
    camera.getWorldDirection(forward);
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    up.crossVectors(right, forward).normalize();
    
    const movement = new THREE.Vector3();
    
    if (keys.current.has('keyw')) movement.add(forward);
    if (keys.current.has('keys')) movement.sub(forward);
    if (keys.current.has('keya')) movement.sub(right);
    if (keys.current.has('keyd')) movement.add(right);
    if (keys.current.has('space')) movement.add(up);
    if (keys.current.has('shiftleft') || keys.current.has('shiftright')) movement.sub(up);

    if (keys.current.has('arrowleft')) rotation.current.y += LOOK_SPEED;
    if (keys.current.has('arrowright')) rotation.current.y -= LOOK_SPEED;
    if (keys.current.has('arrowup')) {
      rotation.current.x += LOOK_SPEED;
      rotation.current.x = Math.min(rotation.current.x, Math.PI / 2.5);
    }
    if (keys.current.has('arrowdown')) {
      rotation.current.x -= LOOK_SPEED;
      rotation.current.x = Math.max(rotation.current.x, -Math.PI / 2.5);
    }

    if (isMobile.current) {
      if (Math.abs(joystickState.left.x) > 0.1 || Math.abs(joystickState.left.y) > 0.1) {
        movement.add(forward.clone().multiplyScalar(joystickState.left.y * MOBILE_MOVE_SENSITIVITY));
        movement.add(right.clone().multiplyScalar(joystickState.left.x * MOBILE_MOVE_SENSITIVITY));
      }
      if (Math.abs(joystickState.right.x) > 0.1 || Math.abs(joystickState.right.y) > 0.1) {
        rotation.current.y -= joystickState.right.x * LOOK_SPEED * MOBILE_LOOK_SENSITIVITY;
        rotation.current.x += joystickState.right.y * LOOK_SPEED * MOBILE_LOOK_SENSITIVITY;
        rotation.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, rotation.current.x));
      }
      // Movimiento vertical con botones
      if (joystickState.verticalMovement !== 0) {
        movement.add(up.clone().multiplyScalar(joystickState.verticalMovement * MOBILE_MOVE_SENSITIVITY));
      }
    }
    
    if (movement.length() > 0) {
      movement.normalize();
      movement.multiplyScalar(SPEED);
      velocity.current.add(movement);
    }
    
    velocity.current.multiplyScalar(FRICTION);
    camera.position.add(velocity.current);
    
    const clampedPos = new THREE.Vector3(
      Math.max(-400, Math.min(400, camera.position.x)),
      Math.max(-200, Math.min(300, camera.position.y)),
      Math.max(-400, Math.min(400, camera.position.z))
    );
    camera.position.copy(clampedPos);
    camera.quaternion.setFromEuler(rotation.current);
  });

  return null;
}

// HUD de la nave (fuera del Canvas para evitar interferencia con eventos táctiles)
function SpaceshipHUD() {
  return (
    <div className="spaceship-hud">
      <div className="hud-crosshair">+</div>
    </div>
  );
}

// Componente de Joystick virtual
interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
}

function VirtualJoystick({ onMove }: VirtualJoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activeTouch = useRef<number | null>(null);
  const centerPos = useRef({ x: 0, y: 0 });

  const handleStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeTouch.current !== null) return;
    const touch = e.changedTouches[0];
    activeTouch.current = touch.identifier;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      centerPos.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
  }, []);

  const handleMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeTouch.current === null) return;
    const touch = Array.from(e.changedTouches).find(t => t.identifier === activeTouch.current);
    if (!touch || !knobRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const maxRadius = rect.width / 2 - 20;
    const dx = touch.clientX - centerPos.current.x;
    const dy = touch.clientY - centerPos.current.y;
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy), maxRadius);
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * distance;
    const knobY = Math.sin(angle) * distance;
    
    knobRef.current.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
    onMove(knobX / maxRadius, -knobY / maxRadius);
  }, [onMove]);

  const handleEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = Array.from(e.changedTouches).find(t => t.identifier === activeTouch.current);
    if (!touch) return;
    activeTouch.current = null;
    if (knobRef.current) knobRef.current.style.transform = 'translate(-50%, -50%)';
    onMove(0, 0);
  }, [onMove]);

  return (
    <div 
      ref={containerRef}
      className="virtual-joystick"
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div ref={knobRef} className="joystick-knob" />
    </div>
  );
}

// Botón de movimiento vertical
interface VerticalButtonProps {
  direction: 'up' | 'down';
  label: string;
}

function VerticalButton({ direction, label }: VerticalButtonProps) {
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    joystickState.verticalMovement = direction === 'up' ? 1 : -1;
  }, [direction]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    joystickState.verticalMovement = 0;
  }, []);

  return (
    <button
      className={`vertical-button vertical-${direction}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );
}

// Controles móviles
function MobileControls() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return isTouchDevice();
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(isTouchDevice());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLeftMove = useCallback((x: number, y: number) => {
    joystickState.left = { x, y };
  }, []);

  const handleRightMove = useCallback((x: number, y: number) => {
    joystickState.right = { x, y };
  }, []);

  if (!isMobile) return null;

  return (
    <div className="mobile-controls">
      <VirtualJoystick onMove={handleLeftMove} />
      <div className="vertical-buttons">
        <VerticalButton direction="up" label="▲" />
        <VerticalButton direction="down" label="▼" />
      </div>
      <VirtualJoystick onMove={handleRightMove} />
    </div>
  );
}

// Partículas de fondo
function FloatingParticles({ count = 300, seed = 12345 }: { count?: number; seed?: number }) {
  const geometry = useMemo(() => {
    const random = seededRandom(seed);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (random() - 0.5) * 500;
      positions[i * 3 + 1] = (random() - 0.5) * 500;
      positions[i * 3 + 2] = (random() - 0.5) * 500;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count, seed]);

  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial size={0.4} color="#ffffff" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

// Hook para obtener posición de cámara
function useCameraPosition() {
  const { camera } = useThree();
  const [position, setPosition] = useState(new THREE.Vector3());
  
  useFrame(() => {
    setPosition(camera.position.clone());
  });
  
  return position;
}

// Escena interna que tiene acceso al contexto de Three
function SolarSystemScene({ planets, language, selectedPlanet, onSelectPlanet }: {
  planets: PlanetData[];
  language: Language;
  selectedPlanet: PlanetData | null;
  onSelectPlanet: (planet: PlanetData | null) => void;
}) {
  const cameraPosition = useCameraPosition();
  
  return (
    <>
      <ambientLight intensity={0.2} />
      
      <Stars radius={750} depth={400} count={5000} factor={6} saturation={0} fade speed={0.3} />
      <FloatingParticles count={300} />
      
      <Sun />
      
      {planets.map((planet) => (
        <group key={planet.id}>
          <OrbitRing radius={planet.orbitRadius} color={planet.color} />
          <Planet
            data={planet}
            language={language}
            cameraPosition={cameraPosition}
            onSelect={onSelectPlanet}
            selectedPlanet={selectedPlanet}
          />
        </group>
      ))}
      
      <SpaceshipControls />
    </>
  );
}

// Componente principal
interface PortfolioSolarSystemProps {
  language: Language;
}

export default function PortfolioSolarSystem({ language }: PortfolioSolarSystemProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  
  // Obtener datos del portfolio
  const projects = useMemo(() => getProjects(language), [language]);
  const experiences = useMemo(() => getExperiences(language), [language]);
  const educationItems = useMemo(() => getEducation(language), [language]);
  const skillCategories = useMemo(() => getSkillCategories(language), [language]);
  
  // Convertir datos a planetas
  const planets: PlanetData[] = useMemo(() => [
    {
      id: 'projects',
      name: { es: 'Proyectos', en: 'Projects' },
      description: { 
        es: 'Mis proyectos destacados y trabajos realizados', 
        en: 'My featured projects and completed works' 
      },
      color: '#60a5fa',
      size: 5,
      orbitRadius: 50,
      orbitSpeed: 0.02,
      planetType: 'terrestrial' as PlanetType,
      items: projects.map(p => ({
        id: `project-${p.id}`,
        title: p.title,
        subtitle: p.tech.slice(0, 3).join(', '),
        description: p.description,
      })),
    },
    {
      id: 'experience',
      name: { es: 'Experiencia', en: 'Experience' },
      description: { 
        es: 'Mi trayectoria profesional', 
        en: 'My professional journey' 
      },
      color: '#e8a850',
      size: 9,
      orbitRadius: 85,
      orbitSpeed: 0.012,
      planetType: 'gas_giant' as PlanetType,
      items: experiences.map((exp, idx) => ({
        id: `exp-${idx}`,
        title: exp.title,
        subtitle: exp.company,
        description: exp.description,
      })),
    },
    {
      id: 'education',
      name: { es: 'Educación', en: 'Education' },
      description: { 
        es: 'Mi formación académica', 
        en: 'My academic background' 
      },
      color: '#88ccff',
      size: 4,
      orbitRadius: 125,
      orbitSpeed: 0.01,
      planetType: 'ice' as PlanetType,
      items: educationItems.map((edu, idx) => ({
        id: `edu-${idx}`,
        title: edu.degree,
        subtitle: edu.institution,
        description: edu.description,
      })),
    },
    {
      id: 'skills',
      name: { es: 'Habilidades', en: 'Skills' },
      description: { 
        es: 'Tecnologías y herramientas que domino', 
        en: 'Technologies and tools I master' 
      },
      color: '#ff6644',
      size: 4.5,
      orbitRadius: 160,
      orbitSpeed: 0.008,
      planetType: 'volcanic' as PlanetType,
      items: skillCategories.flatMap(cat => 
        cat.skills.slice(0, 3).map(skill => ({
          id: `skill-${skill.name}`,
          title: skill.name,
          subtitle: `${skill.level}%`,
          description: cat.title,
        }))
      ),
    },
  ], [projects, experiences, educationItems, skillCategories]);

  const handleSelectPlanet = useCallback((planet: PlanetData | null) => {
    setSelectedPlanet(planet);
  }, []);

  return (
    <div className="solar-system-container">
      <Canvas
        camera={{ position: [0, 75, 175], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <SolarSystemScene
            planets={planets}
            language={language}
            selectedPlanet={selectedPlanet}
            onSelectPlanet={handleSelectPlanet}
          />
        </Suspense>
      </Canvas>

      <SpaceshipHUD />
      <MobileControls />

      {/* Panel de información del planeta seleccionado */}
      {selectedPlanet && (
        <div className="planet-info-panel">
          <button 
            className="planet-info-close"
            onClick={() => setSelectedPlanet(null)}
          >
            ×
          </button>
          <h3 style={{ color: selectedPlanet.color }}>{selectedPlanet.name[language]}</h3>
          <p className="planet-info-description">{selectedPlanet.description[language]}</p>
          <div className="planet-info-items">
            <h4>{language === 'es' ? 'Contenido' : 'Contents'} ({selectedPlanet.items.length})</h4>
            <ul>
              {selectedPlanet.items.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong>
                  {item.subtitle && <span className="item-subtitle"> - {item.subtitle}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="space-instructions desktop-only">
        <span>⌨️ WASD {language === 'es' ? 'mover' : 'move'}</span>
        <span>🎯 {language === 'es' ? 'Flechas mirar' : 'Arrows look'}</span>
        <span>⬆️ {language === 'es' ? 'Espacio subir' : 'Space up'}</span>
        <span>⬇️ {language === 'es' ? 'Shift bajar' : 'Shift down'}</span>
        <span>🌍 {language === 'es' ? 'Acércate a los planetas' : 'Get close to planets'}</span>
      </div>
    </div>
  );
}
