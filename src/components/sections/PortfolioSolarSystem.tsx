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

// Ajustar brillo de un color hexadecimal
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
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

// Estado del modo de vuelo: espacio o superficie de planeta
interface FlightMode {
  mode: 'space' | 'surface';
  planetData: PlanetData | null;
  planetPosition: THREE.Vector3;
  surfaceRadius: number; // Radio de la superficie donde vuela la nave
  altitude: number; // Altura actual sobre la superficie
  entryPosition: THREE.Vector3; // Posición donde entró al planeta
}

const flightModeState: FlightMode = {
  mode: 'space',
  planetData: null,
  planetPosition: new THREE.Vector3(),
  surfaceRadius: 100,
  altitude: 50,
  entryPosition: new THREE.Vector3()
};

// Eventos para comunicar cambios de modo
type FlightModeListener = (mode: FlightMode) => void;
const flightModeListeners: FlightModeListener[] = [];
const notifyFlightModeChange = () => {
  flightModeListeners.forEach(l => l({ ...flightModeState }));
};

// Estado global para teclas presionadas (compartido entre controles y nave)
interface ThrusterState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

const thrusterState: ThrusterState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  up: false,
  down: false
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
  onPositionUpdate?: (position: THREE.Vector3) => void;
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

// Ruido ridged multifractal para montañas más realistas
function ridgedNoise(x: number, y: number, z: number, octaves: number, seed: number): number {
  let sum = 0;
  let amplitude = 1;
  let frequency = 1;
  let weight = 1;
  
  for (let i = 0; i < octaves; i++) {
    let n = noise3D(x * frequency, y * frequency, z * frequency, seed + i * 31);
    n = 1 - Math.abs(n); // Ridged
    n = n * n; // Sharpen ridges
    n *= weight;
    weight = Math.min(1, Math.max(0, n * 2));
    sum += n * amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return sum;
}

// Geometría de planeta con terreno procedural según tipo
function createPlanetGeometry(
  radius: number, 
  detail: number, 
  seed: number, 
  heightScale: number,
  planetType: PlanetType
): THREE.BufferGeometry {
  // Mayor detalle para terreno más realista
  const actualDetail = Math.max(detail, 5);
  const geometry = new THREE.IcosahedronGeometry(radius, actualDetail);
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
    
    // Generar altura con ruido multicapa - varía según tipo
    let noiseValue: number;
    let height: number;
    
    if (planetType === 'gas_giant') {
      // Gigante gaseoso: sin terreno real, superficie lisa con bandas
      noiseValue = fbm(nx * 0.5, ny * 8, nz * 0.5, 2, seed);
      height = radius + (noiseValue - 0.5) * heightScale * 0.1;
    } else if (planetType === 'ice') {
      // Planeta helado: suave con algunos cráteres y grietas
      const base = fbm(nx * 2, ny * 2, nz * 2, 4, seed);
      const cracks = ridgedNoise(nx * 6, ny * 6, nz * 6, 3, seed + 50) * 0.3;
      const detail = fbm(nx * 8, ny * 8, nz * 8, 2, seed + 100) * 0.15;
      noiseValue = base + cracks - detail;
      height = radius + (noiseValue - 0.5) * heightScale * 0.6;
    } else if (planetType === 'volcanic') {
      // Volcánico: picos dramáticos con lava en bajos
      const mountains = ridgedNoise(nx * 3, ny * 3, nz * 3, 5, seed);
      const base = fbm(nx * 4, ny * 4, nz * 4, 3, seed + 50);
      const lavaChannels = 1 - ridgedNoise(nx * 5, ny * 5, nz * 5, 2, seed + 100) * 0.4;
      noiseValue = mountains * 0.6 + base * 0.3 + lavaChannels * 0.1;
      height = radius + (noiseValue - 0.4) * heightScale * 1.5;
    } else {
      // Terrestre: continentes, océanos, montañas realistas
      const continents = fbm(nx * 1.5, ny * 1.5, nz * 1.5, 2, seed); // Forma de continentes
      const mountains = ridgedNoise(nx * 4, ny * 4, nz * 4, 4, seed + 50); // Cadenas montañosas
      const detail = fbm(nx * 8, ny * 8, nz * 8, 3, seed + 100); // Detalle fino
      
      // Combinar: montañas solo en tierra alta
      const landMask = Math.max(0, (continents - 0.4) * 2.5);
      noiseValue = continents + mountains * landMask * 0.4 + detail * 0.1;
      height = radius + (noiseValue - 0.5) * heightScale * 1.2;
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
function Planet({ data, language, cameraPosition, onSelect, selectedPlanet, onPositionUpdate }: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [angle, setAngle] = useState(() => getInitialAngle(data.id));
  const [showDetails, setShowDetails] = useState(false);
  
  // Seed único para cada planeta basado en su id
  const planetSeed = useMemo(() => {
    return data.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }, [data.id]);
  
  // Umbral de distancia para mostrar detalles (tarjeta expandida)
  const detailsThreshold = data.size * 6;
  
  useFrame(() => {
    // Órbita
    setAngle(prev => prev + data.orbitSpeed * 0.01);
    
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle) * data.orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * data.orbitRadius;
      
      // Notificar posición actualizada
      if (onPositionUpdate) {
        onPositionUpdate(groupRef.current.position.clone());
      }
      
      // Calcular distancia a la cámara
      const dist = cameraPosition.distanceTo(groupRef.current.position);
      setShowDetails(dist < detailsThreshold);
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
      
      {/* Planeta siempre con terreno detallado */}
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
      
      {/* Satélites decorativos (siempre visibles) */}
      <PlanetSatellites planetSize={data.size} planetSeed={planetSeed} color={data.color} />
      
      {/* Tarjeta flotante con información (siempre visible) */}
      <Html
        center
        distanceFactor={8}
        position={[data.size + 6, data.size * 0.3, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div className={`planet-details-popup planet-floating-card ${showDetails ? 'expanded' : ''}`}>
          <h3>{data.name[language]}</h3>
          <p className="planet-description">{data.description[language]}</p>
          <div className="planet-items-preview">
            {data.items.slice(0, showDetails ? 5 : 3).map((item, idx) => (
              <div key={idx} className="planet-item-mini">
                <span className="item-dot" style={{ background: data.color }}></span>
                <span>{item.title}</span>
              </div>
            ))}
            {data.items.length > (showDetails ? 5 : 3) && (
              <p className="more-items">+{data.items.length - (showDetails ? 5 : 3)} {language === 'es' ? 'más' : 'more'}</p>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}

// Satélites decorativos que orbitan el planeta
function PlanetSatellites({ planetSize, planetSeed, color }: { planetSize: number; planetSeed: number; color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generar satélites basados en la seed
  const satellites = useMemo(() => {
    const random = seededRandom(planetSeed + 5000);
    const count = 2 + Math.floor(random() * 3); // 2-4 satélites
    const sats = [];
    
    for (let i = 0; i < count; i++) {
      const orbitRadius = planetSize * 1.4 + random() * planetSize * 0.8;
      const size = planetSize * 0.08 + random() * planetSize * 0.06;
      const speed = 0.003 + random() * 0.004;
      const inclination = (random() - 0.5) * 0.5;
      const startAngle = random() * Math.PI * 2;
      
      sats.push({ orbitRadius, size, speed, inclination, startAngle });
    }
    return sats;
  }, [planetSize, planetSeed]);
  
  const angles = useRef(satellites.map(s => s.startAngle));
  
  useFrame(() => {
    satellites.forEach((sat, i) => {
      angles.current[i] += sat.speed;
    });
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        if (i < satellites.length) {
          const sat = satellites[i];
          child.position.x = Math.cos(angles.current[i]) * sat.orbitRadius;
          child.position.z = Math.sin(angles.current[i]) * sat.orbitRadius;
          child.position.y = Math.sin(angles.current[i] * 2) * sat.orbitRadius * sat.inclination;
        }
      });
    }
  });
  
  return (
    <group ref={groupRef}>
      {satellites.map((sat, i) => (
        <mesh key={i}>
          <sphereGeometry args={[sat.size, 12, 12]} />
          <meshStandardMaterial
            color={adjustColor(color, -30 + i * 15)}
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

// Componente de Luna (item individual)
// ============================================
// SISTEMA DE EXPLORACIÓN PLANETARIA
// ============================================

// Configuración por tipo de planeta para su superficie
interface SurfaceConfig {
  planetType: PlanetType;
  groundColor1: string;
  groundColor2: string;
  detailColor: string;
  fogColor: string;
  fogDensity: number;
  skyColor: string;
  horizonColor: string;
  heightScale: number;
  noiseScale: number;
  hasWater: boolean;
  waterLevel: number;
  waterColor: string;
  hasAtmosphere: boolean;
}

function getSurfaceConfig(planetType: PlanetType): SurfaceConfig {
  switch (planetType) {
    case 'terrestrial':
      return {
        planetType: 'terrestrial',
        groundColor1: '#2d5a27',
        groundColor2: '#8b7355',
        detailColor: '#4a7c44',
        fogColor: '#87ceeb',
        fogDensity: 0.008,
        skyColor: '#1e90ff',
        horizonColor: '#ffb347',
        heightScale: 8,
        noiseScale: 0.03,
        hasWater: true,
        waterLevel: 0.35,
        waterColor: '#1a5276',
        hasAtmosphere: true
      };
    case 'gas_giant':
      return {
        planetType: 'gas_giant',
        groundColor1: '#c9a86c',
        groundColor2: '#8b5a2b',
        detailColor: '#e8a850',
        fogColor: '#d4a574',
        fogDensity: 0.015,
        skyColor: '#b5651d',
        horizonColor: '#ff6347',
        heightScale: 2,
        noiseScale: 0.01,
        hasWater: false,
        waterLevel: 0,
        waterColor: '',
        hasAtmosphere: true
      };
    case 'ice':
      return {
        planetType: 'ice',
        groundColor1: '#e8f4f8',
        groundColor2: '#b0c4de',
        detailColor: '#add8e6',
        fogColor: '#000000',
        fogDensity: 0.001,
        skyColor: '#000008',
        horizonColor: '#101020',
        heightScale: 6,
        noiseScale: 0.025,
        hasWater: true,
        waterLevel: 0.2,
        waterColor: '#5f9ea0',
        hasAtmosphere: false
      };
    case 'volcanic':
      return {
        planetType: 'volcanic',
        groundColor1: '#1a1a1a',
        groundColor2: '#4a3728',
        detailColor: '#ff4500',
        fogColor: '#2f1810',
        fogDensity: 0.012,
        skyColor: '#8b0000',
        horizonColor: '#ff6600',
        heightScale: 10,
        noiseScale: 0.04,
        hasWater: true, // Lava
        waterLevel: 0.25,
        waterColor: '#ff2200',
        hasAtmosphere: true
      };
    default:
      return getSurfaceConfig('terrestrial');
  }
}

// Crear geometría de terreno esférico detallado con texturas y relieve realista
function createDetailedSurfaceGeometry(
  radius: number,
  segments: number,
  seed: number,
  config: SurfaceConfig
): { geometry: THREE.BufferGeometry; colors: Float32Array; heightData: Float32Array } {
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const positions = geometry.attributes.position;
  
  const newPositions = new Float32Array(positions.count * 3);
  const colors = new Float32Array(positions.count * 3);
  const uvs = new Float32Array(positions.count * 2);
  const heightData = new Float32Array(positions.count);
  
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    // Normalizar
    const length = Math.sqrt(x * x + y * y + z * z);
    const nx = x / length;
    const ny = y / length;
    const nz = z / length;
    
    // Generar ruido multicapa para terreno realista
    let combinedNoise: number;
    let height: number;
    
    if (config.planetType === 'terrestrial') {
      // Terrestre: continentes, montañas, valles
      const continents = fbm(nx * 2, ny * 2, nz * 2, 3, seed);
      const mountains = ridgedNoise(nx * 8, ny * 8, nz * 8, 5, seed + 50);
      const valleys = fbm(nx * 4, ny * 4, nz * 4, 4, seed + 100);
      const fineDetail = fbm(nx * 20, ny * 20, nz * 20, 2, seed + 200);
      
      const landMask = Math.max(0, (continents - 0.35) * 2.5);
      combinedNoise = continents * 0.5 + mountains * landMask * 0.35 + valleys * 0.1 + fineDetail * 0.05;
      height = radius + (combinedNoise - 0.4) * config.heightScale * 2;
    } else if (config.planetType === 'volcanic') {
      // Volcánico: picos dramáticos, calderas, ríos de lava
      const volcanoes = ridgedNoise(nx * 3, ny * 3, nz * 3, 4, seed);
      const craters = 1 - Math.pow(fbm(nx * 6, ny * 6, nz * 6, 3, seed + 50), 2);
      const lavaChannels = ridgedNoise(nx * 10, ny * 10, nz * 10, 2, seed + 100);
      const roughness = fbm(nx * 15, ny * 15, nz * 15, 3, seed + 200);
      
      combinedNoise = volcanoes * 0.5 + craters * 0.25 + lavaChannels * 0.15 + roughness * 0.1;
      height = radius + (combinedNoise - 0.3) * config.heightScale * 2.5;
    } else if (config.planetType === 'ice') {
      // Helado: glaciares, grietas, formaciones de hielo
      const glaciers = fbm(nx * 2, ny * 2, nz * 2, 4, seed);
      const cracks = ridgedNoise(nx * 12, ny * 12, nz * 12, 3, seed + 50) * 0.4;
      const iceFormations = ridgedNoise(nx * 5, ny * 5, nz * 5, 4, seed + 100);
      const snowDrifts = fbm(nx * 8, ny * 8, nz * 8, 2, seed + 200);
      
      combinedNoise = glaciers * 0.4 + iceFormations * 0.35 - cracks * 0.15 + snowDrifts * 0.1;
      height = radius + (combinedNoise - 0.4) * config.heightScale * 1.8;
    } else {
      // Gigante gaseoso: capas de nubes ondulantes
      const bands = Math.sin(ny * 20 + fbm(nx * 3, ny * 3, nz * 3, 2, seed) * 5);
      const storms = fbm(nx * 4, ny * 4, nz * 4, 3, seed + 50);
      const turbulence = fbm(nx * 10, ny * 10, nz * 10, 2, seed + 100);
      
      combinedNoise = 0.5 + bands * 0.3 + storms * 0.15 + turbulence * 0.05;
      height = radius + (combinedNoise - 0.5) * config.heightScale * 0.8;
    }
    
    heightData[i] = (height - radius) / config.heightScale;
    
    newPositions[i * 3] = nx * height;
    newPositions[i * 3 + 1] = ny * height;
    newPositions[i * 3 + 2] = nz * height;
    
    // Calcular UVs esféricos
    uvs[i * 2] = 0.5 + Math.atan2(nz, nx) / (2 * Math.PI);
    uvs[i * 2 + 1] = 0.5 - Math.asin(ny) / Math.PI;
    
    // Colorear basado en altura y tipo de planeta
    const heightNorm = heightData[i];
    const finalColor = new THREE.Color();
    const fineNoise = fbm(nx * 30, ny * 30, nz * 30, 2, seed + 300);
    
    if (config.planetType === 'terrestrial') {
      if (config.hasWater && heightNorm < config.waterLevel - 0.1) {
        // Océano profundo
        finalColor.set('#0a3d62');
        finalColor.offsetHSL(0, 0, fineNoise * 0.1);
      } else if (config.hasWater && heightNorm < config.waterLevel) {
        // Agua costera
        finalColor.lerpColors(new THREE.Color('#1a5276'), new THREE.Color('#2e86ab'), fineNoise);
      } else if (heightNorm < config.waterLevel + 0.08) {
        // Playa/arena
        finalColor.set('#c9b896');
        finalColor.offsetHSL(fineNoise * 0.05, 0, fineNoise * 0.1);
      } else if (heightNorm < 0.5) {
        // Llanuras verdes/bosques
        finalColor.lerpColors(new THREE.Color('#2d5a27'), new THREE.Color('#4a7c44'), fineNoise);
      } else if (heightNorm < 0.7) {
        // Montañas rocosas
        finalColor.lerpColors(new THREE.Color('#6b5b4f'), new THREE.Color('#8b7355'), fineNoise);
      } else {
        // Picos nevados
        finalColor.lerpColors(new THREE.Color('#e8e8e8'), new THREE.Color('#ffffff'), fineNoise);
      }
    } else if (config.planetType === 'volcanic') {
      if (heightNorm < config.waterLevel) {
        // Lava brillante
        finalColor.set('#ff3300');
        finalColor.offsetHSL(fineNoise * 0.05, 0, fineNoise * 0.2);
      } else if (heightNorm < 0.35) {
        // Lava enfriándose
        finalColor.lerpColors(new THREE.Color('#cc2200'), new THREE.Color('#661100'), fineNoise);
      } else if (heightNorm < 0.5) {
        // Roca caliente
        finalColor.lerpColors(new THREE.Color('#3d2817'), new THREE.Color('#2a1a0f'), fineNoise);
      } else if (heightNorm < 0.75) {
        // Roca volcánica oscura
        finalColor.lerpColors(new THREE.Color('#1a1410'), new THREE.Color('#2a2420'), fineNoise);
      } else {
        // Ceniza y humo solidificado
        finalColor.lerpColors(new THREE.Color('#3a3530'), new THREE.Color('#4a4540'), fineNoise);
      }
    } else if (config.planetType === 'ice') {
      if (config.hasWater && heightNorm < config.waterLevel) {
        // Agua helada
        finalColor.set('#4a90a4');
        finalColor.offsetHSL(0, fineNoise * 0.1, fineNoise * 0.1);
      } else if (heightNorm < 0.4) {
        // Hielo azulado
        finalColor.lerpColors(new THREE.Color('#a8d8ea'), new THREE.Color('#c8e8f8'), fineNoise);
      } else if (heightNorm < 0.6) {
        // Nieve compacta
        finalColor.lerpColors(new THREE.Color('#e8f0f5'), new THREE.Color('#f5faff'), fineNoise);
      } else if (heightNorm < 0.8) {
        // Formaciones de hielo
        finalColor.lerpColors(new THREE.Color('#b0d4e8'), new THREE.Color('#d0e8f8'), fineNoise);
      } else {
        // Picos de hielo cristalino
        finalColor.lerpColors(new THREE.Color('#e0f0ff'), new THREE.Color('#ffffff'), fineNoise);
      }
    } else {
      // Gigante gaseoso - bandas de colores
      const bandVal = Math.sin(ny * 20 + fineNoise * 3);
      if (bandVal < -0.5) {
        finalColor.lerpColors(new THREE.Color('#8b5a2b'), new THREE.Color('#6b4423'), fineNoise);
      } else if (bandVal < 0) {
        finalColor.lerpColors(new THREE.Color('#d4a574'), new THREE.Color('#c9986c'), fineNoise);
      } else if (bandVal < 0.5) {
        finalColor.lerpColors(new THREE.Color('#e8c896'), new THREE.Color('#f0d8a8'), fineNoise);
      } else {
        finalColor.lerpColors(new THREE.Color('#b86b4b'), new THREE.Color('#a85a3b'), fineNoise);
      }
    }
    
    colors[i * 3] = finalColor.r;
    colors[i * 3 + 1] = finalColor.g;
    colors[i * 3 + 2] = finalColor.b;
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  
  return { geometry, colors, heightData };
}

// Componente del cielo esférico del planeta
interface PlanetarySkyProps {
  config: SurfaceConfig;
  radius: number;
}

function PlanetarySky({ config, radius }: PlanetarySkyProps) {
  const skyRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  
  // Crear gradiente de cielo procedural o cielo estrellado
  const skyMaterial = useMemo(() => {
    const skyColor = new THREE.Color(config.skyColor);
    const horizonColor = new THREE.Color(config.horizonColor);
    
    if (!config.hasAtmosphere) {
      // Cielo estrellado para planetas sin atmósfera
      return new THREE.ShaderMaterial({
        uniforms: {
          topColor: { value: skyColor },
          bottomColor: { value: horizonColor },
          time: { value: 0 },
        },
        vertexShader: `
          varying vec3 vWorldPosition;
          varying vec3 vNormal;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            vNormal = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          uniform float time;
          varying vec3 vWorldPosition;
          varying vec3 vNormal;
          
          // Función de hash mejorada para estrellas
          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }
          
          float hash3(vec3 p) {
            return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
          }
          
          void main() {
            float h = normalize(vWorldPosition).y;
            float t = max(pow(max(h + 0.4, 0.0), 0.6), 0.0);
            vec3 baseColor = mix(bottomColor, topColor, t);
            
            // Usar coordenadas esféricas para mejor distribución
            vec3 dir = normalize(vNormal);
            
            // Múltiples capas de estrellas con diferentes densidades
            vec3 starColor = vec3(0.0);
            
            // Capa 1: Estrellas muy pequeñas y numerosas (la mayoría)
            vec2 starUv1 = dir.xy * 800.0 + dir.z * 400.0;
            float star1 = hash(floor(starUv1));
            float starBright1 = step(0.9992, star1) * 0.15;
            
            // Capa 2: Estrellas pequeñas
            vec2 starUv2 = dir.xz * 600.0 + dir.y * 300.0;
            float star2 = hash(floor(starUv2));
            float starBright2 = step(0.9994, star2) * 0.2;
            
            // Capa 3: Estrellas medianas (pocas)
            vec2 starUv3 = dir.yz * 400.0 + dir.x * 200.0;
            float star3 = hash(floor(starUv3));
            float starBright3 = step(0.9997, star3) * 0.35;
            
            // Capa 4: Estrellas brillantes (muy pocas)
            vec2 starUv4 = dir.xy * 150.0;
            float star4 = hash(floor(starUv4));
            float starBright4 = step(0.9998, star4) * 0.6;
            
            // Parpadeo muy sutil solo en estrellas más brillantes
            float twinkle = 0.9 + 0.1 * sin(time * 0.5 + star4 * 50.0);
            
            starColor = vec3(starBright1 + starBright2 + starBright3 + starBright4 * twinkle);
            
            gl_FragColor = vec4(baseColor + starColor, 1.0);
          }
        `,
        side: THREE.BackSide,
      });
    }
    
    return new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: skyColor },
        bottomColor: { value: horizonColor },
        offset: { value: 0.4 },
        exponent: { value: 0.6 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y;
          float t = max(pow(max(h + offset, 0.0), exponent), 0.0);
          gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
        }
      `,
      side: THREE.BackSide,
    });
  }, [config.skyColor, config.horizonColor, config.hasAtmosphere]);
  
  // Guardar referencia al material
  useEffect(() => {
    materialRef.current = skyMaterial;
  }, [skyMaterial]);
  
  // Animar estrellas si no hay atmósfera
  useFrame(({ clock }) => {
    if (!config.hasAtmosphere && materialRef.current?.uniforms.time) {
      materialRef.current.uniforms.time.value = clock.elapsedTime;
    }
  });
  
  return (
    <mesh ref={skyRef}>
      <sphereGeometry args={[radius * 2, 32, 32]} />
      <primitive object={skyMaterial} attach="material" />
    </mesh>
  );
}

// Componente de niebla atmosférica
interface AtmosphericFogProps {
  config: SurfaceConfig;
}

function AtmosphericFog({ config }: AtmosphericFogProps) {
  const fogColor = useMemo(() => new THREE.Color(config.fogColor), [config.fogColor]);
  
  return (
    <fogExp2 attach="fog" args={[fogColor, config.fogDensity]} />
  );
}

// Nubes atmosféricas por encima del límite de altura de la nave
interface AtmosphericCloudsProps {
  radius: number;
  seed: number;
  config: SurfaceConfig;
}

function AtmosphericClouds({ radius, seed, config }: AtmosphericCloudsProps) {
  const cloudsRef = useRef<THREE.Group>(null);
  
  // Altura de las nubes (por encima del límite de vuelo de la nave que es radius + 25)
  const cloudAltitude = radius + 35;
  
  // Generar posiciones y formas de nubes
  const clouds = useMemo(() => {
    if (!config.hasAtmosphere) return [];
    
    const random = seededRandom(seed + 8000);
    const cloudCount = config.planetType === 'gas_giant' ? 60 : 40;
    const positions: { 
      pos: THREE.Vector3; 
      scaleX: number; 
      scaleY: number; 
      scaleZ: number; 
      opacity: number;
      rotY: number;
    }[] = [];
    
    for (let i = 0; i < cloudCount; i++) {
      // Distribución esférica
      const phi = Math.acos(1 - 2 * random());
      const theta = random() * Math.PI * 2;
      
      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.sin(theta);
      
      // Altura variable de las nubes
      const altVariation = cloudAltitude + random() * 15;
      
      // Formas variadas: algunas alargadas, otras redondeadas
      const baseScale = 3 + random() * 6;
      const shapeType = random();
      let scaleX, scaleY, scaleZ;
      
      if (shapeType < 0.3) {
        // Nube alargada horizontal
        scaleX = baseScale * (1.5 + random() * 1.5);
        scaleY = baseScale * 0.4;
        scaleZ = baseScale * (0.8 + random() * 0.4);
      } else if (shapeType < 0.6) {
        // Nube redondeada (cúmulo)
        scaleX = baseScale * (0.9 + random() * 0.3);
        scaleY = baseScale * (0.7 + random() * 0.5);
        scaleZ = baseScale * (0.9 + random() * 0.3);
      } else {
        // Nube alargada irregular
        scaleX = baseScale * (1.2 + random());
        scaleY = baseScale * (0.3 + random() * 0.3);
        scaleZ = baseScale * (0.6 + random() * 0.8);
      }
      
      positions.push({
        pos: new THREE.Vector3(x * altVariation, y * altVariation, z * altVariation),
        scaleX,
        scaleY,
        scaleZ,
        opacity: 0.25 + random() * 0.35,
        rotY: random() * Math.PI * 2
      });
    }
    return positions;
  }, [seed, cloudAltitude, config.planetType, config.hasAtmosphere]);
  
  // Colores de nubes según tipo de planeta
  const cloudColor = useMemo(() => {
    switch (config.planetType) {
      case 'volcanic': return '#3d2817';
      case 'gas_giant': return '#c9a86c';
      default: return '#ffffff';
    }
  }, [config.planetType]);
  
  // Animación de movimiento lento
  useFrame(({ clock }) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = clock.elapsedTime * 0.002;
    }
  });
  
  // No renderizar si no hay atmósfera
  if (!config.hasAtmosphere || clouds.length === 0) return null;
  
  return (
    <group ref={cloudsRef}>
      {clouds.map((cloud, i) => {
        const normal = cloud.pos.clone().normalize();
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        
        // Añadir rotación local para variedad
        const localRot = new THREE.Quaternion();
        localRot.setFromAxisAngle(new THREE.Vector3(0, 1, 0), cloud.rotY);
        quaternion.multiply(localRot);
        
        return (
          <mesh key={i} position={cloud.pos} quaternion={quaternion} scale={[cloud.scaleX, cloud.scaleY, cloud.scaleZ]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial
              color={cloudColor}
              transparent
              opacity={cloud.opacity}
              roughness={1}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Agua planetaria para planetas terrestres y de hielo
interface PlanetaryWaterProps {
  radius: number;
  config: SurfaceConfig;
}

function PlanetaryWater({ radius, config }: PlanetaryWaterProps) {
  const waterRef = useRef<THREE.Mesh>(null);
  
  // El nivel del agua está basado en el heightScale del terreno
  // waterLevel es un valor entre 0-1 que indica la proporción
  const waterHeight = radius + (config.waterLevel - 0.4) * config.heightScale * 2;
  
  useFrame(({ clock }) => {
    if (waterRef.current && waterRef.current.material instanceof THREE.MeshStandardMaterial) {
      // Ondulación sutil del agua
      waterRef.current.material.emissiveIntensity = 0.15 + Math.sin(clock.elapsedTime * 0.5) * 0.05;
    }
  });
  
  const waterColor = useMemo(() => new THREE.Color(config.waterColor), [config.waterColor]);
  
  return (
    <mesh ref={waterRef}>
      <sphereGeometry args={[waterHeight, 96, 96]} />
      <meshStandardMaterial
        color={waterColor}
        transparent
        opacity={0.85}
        roughness={0.1}
        metalness={0.3}
        emissive={waterColor}
        emissiveIntensity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ============================================
// PLANETAS VISIBLES EN EL CIELO
// ============================================

// Datos de planetas para el cielo (distancias orbitales relativas al sistema solar real)
interface SkyPlanetData {
  id: string;
  name: string;
  color: string;
  orbitRadius: number; // Distancia al sol en el sistema
  size: number; // Tamaño visual del planeta
  moons?: { name: string; color: string; orbitRadius: number }[];
}

interface SkyPlanetsProps {
  currentPlanetOrbitRadius: number;
  skyRadius: number;
  allPlanets: SkyPlanetData[];
  currentPlanetId: string;
}

// Componente individual para un planeta en el cielo - estilo 2D lejano
interface SkyPlanetProps {
  planet: SkyPlanetData;
  index: number;
  totalPlanets: number;
  currentPlanetOrbitRadius: number;
  skyRadius: number;
}

function SkyPlanet({ planet, index, totalPlanets, currentPlanetOrbitRadius, skyRadius }: SkyPlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const spriteRef = useRef<THREE.Sprite>(null);
  
  // Ángulo inicial determinístico basado en el id del planeta
  const initialAngle = useMemo(() => {
    return planet.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 0.1;
  }, [planet.id]);
  const timeRef = useRef(initialAngle);
  
  // Calcular distancia relativa desde el planeta actual (en unidades del sistema solar)
  const distanceFromCurrent = Math.abs(planet.orbitRadius - currentPlanetOrbitRadius);
  
  // El tamaño aparente se calcula con la ley del cuadrado inverso
  // Los planetas lejanos se ven como puntos de luz pequeños
  const minDistance = 30; // Umbral mínimo de distancia
  const distanceFactor = minDistance / Math.max(distanceFromCurrent, minDistance);
  
  // Tamaño aparente: el tamaño real del planeta afecta proporcionalmente
  // Planetas más grandes se ven proporcionalmente más grandes incluso a distancia
  const baseSize = planet.size * 0.15; // Escala base muy reducida
  const apparentSize = Math.max(0.15, Math.min(1.5, baseSize * distanceFactor));
  
  // Brillo del planeta - más brillante si está más cerca
  const brightness = Math.min(1, 0.4 + distanceFactor * 0.6);
  
  // Posicionar muy lejos en el cielo (casi en el límite del skybox)
  const skyDistance = skyRadius * 1.95; // Casi al borde del cielo
  const isCloserToSun = planet.orbitRadius < currentPlanetOrbitRadius;
  
  useFrame((_, delta) => {
    timeRef.current += delta * 0.008; // Movimiento muy lento
    
    if (groupRef.current) {
      // Distribuir planetas en diferentes posiciones del cielo
      const horizontalAngle = (index / totalPlanets) * Math.PI * 2 + timeRef.current * 0.02;
      
      // Planetas más cercanos al sol: más bajo en el cielo (hacia el horizonte donde estaría el sol)
      // Planetas más lejanos: más alto en el cielo (opuestos al sol)
      const verticalAngle = isCloserToSun 
        ? Math.PI * 0.15 + Math.sin(timeRef.current * 0.5 + index) * 0.05
        : Math.PI * 0.4 + Math.cos(timeRef.current * 0.3 + index) * 0.08;
      
      const x = Math.cos(horizontalAngle) * Math.sin(verticalAngle) * skyDistance;
      const y = Math.cos(verticalAngle) * skyDistance;
      const z = Math.sin(horizontalAngle) * Math.sin(verticalAngle) * skyDistance;
      
      groupRef.current.position.set(x, y, z);
    }
    
    // El sprite siempre mira a la cámara automáticamente
  });
  
  // Color del planeta brillante para verse en el cielo
  const glowColor = useMemo(() => {
    const color = new THREE.Color(planet.color);
    // Aumentar la luminosidad para que se vea como un punto de luz
    color.offsetHSL(0, -0.1, brightness * 0.3);
    return color;
  }, [planet.color, brightness]);
  
  // Datos de las lunas para renderizar
  const moonData = useMemo(() => {
    if (!planet.moons) return [];
    return planet.moons.slice(0, 2).map((moon, idx) => ({
      name: moon.name,
      color: moon.color,
      offset: (idx + 1) * apparentSize * 1.5,
      size: apparentSize * 0.25,
      speedMultiplier: idx + 1
    }));
  }, [planet.moons, apparentSize]);
  
  return (
    <group ref={groupRef}>
      {/* Punto de luz principal del planeta - usando sprite para efecto 2D */}
      <sprite ref={spriteRef} scale={[apparentSize * 2, apparentSize * 2, 1]}>
        <spriteMaterial 
          color={glowColor}
          transparent
          opacity={brightness}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      
      {/* Núcleo más brillante */}
      <sprite scale={[apparentSize * 0.8, apparentSize * 0.8, 1]}>
        <spriteMaterial 
          color={planet.color}
          transparent
          opacity={Math.min(1, brightness * 1.2)}
          depthWrite={false}
        />
      </sprite>
      
      {/* Lunas como puntos diminutos cerca del planeta */}
      {moonData.map((moon, idx) => (
        <SkyMoon 
          key={moon.name}
          color={moon.color}
          offset={moon.offset}
          size={moon.size}
          index={idx}
          brightness={brightness}
        />
      ))}
    </group>
  );
}

// Componente separado para cada luna en el cielo
interface SkyMoonProps {
  color: string;
  offset: number;
  size: number;
  index: number;
  brightness: number;
}

function SkyMoon({ color, offset, size, index, brightness }: SkyMoonProps) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const timeRef = useRef(index * Math.PI);
  
  useFrame((_, delta) => {
    timeRef.current += delta * 0.5;
    
    if (spriteRef.current) {
      const moonAngle = timeRef.current * 2 + index * Math.PI;
      spriteRef.current.position.set(
        Math.cos(moonAngle) * offset,
        Math.sin(moonAngle) * offset * 0.3,
        0
      );
    }
  });
  
  return (
    <sprite ref={spriteRef} scale={[size, size, 1]}>
      <spriteMaterial 
        color={color}
        transparent
        opacity={brightness * 0.7}
        depthWrite={false}
      />
    </sprite>
  );
}

function SkyPlanets({ currentPlanetOrbitRadius, skyRadius, allPlanets, currentPlanetId }: SkyPlanetsProps) {
  // Filtrar planetas (excluir el actual)
  const visiblePlanets = useMemo(() => {
    return allPlanets.filter(p => p.id !== currentPlanetId);
  }, [allPlanets, currentPlanetId]);
  
  return (
    <group>
      {visiblePlanets.map((planet, index) => (
        <SkyPlanet
          key={planet.id}
          planet={planet}
          index={index}
          totalPlanets={visiblePlanets.length}
          currentPlanetOrbitRadius={currentPlanetOrbitRadius}
          skyRadius={skyRadius}
        />
      ))}
    </group>
  );
}

// Sol/Luz del planeta en superficie
interface PlanetarySunProps {
  config: SurfaceConfig;
  radius: number;
  orbitRadius: number; // Distancia del planeta al sol
}

function PlanetarySun({ config, radius, orbitRadius }: PlanetarySunProps) {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const sunMeshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  
  // Tamaño aparente del sol basado en la distancia real
  // El sol real tiene ~1.4 millones de km de diámetro
  // La distancia del sol a la Tierra es ~150 millones de km
  // El tamaño aparente del sol disminuye con el cuadrado de la distancia
  const sunApparentSize = useMemo(() => {
    // Distancias orbitales en el sistema: Proyectos=50, Experiencia=85, Educación=125, Habilidades=160
    const minOrbit = 50; // Planeta más cercano
    
    // El sol desde el planeta más cercano se ve grande (tamaño base 6)
    // El sol desde el planeta más lejano se ve mucho más pequeño
    const baseSunSize = 6;
    
    // Usar ley del cuadrado inverso para mayor realismo
    const distanceRatio = minOrbit / orbitRadius;
    const apparentSize = baseSunSize * Math.pow(distanceRatio, 0.8); // Exponente < 1 para no ser tan extremo
    
    // Clamp para que no sea ni demasiado grande ni demasiado pequeño
    return Math.max(1.5, Math.min(8, apparentSize));
  }, [orbitRadius]);
  
  // Intensidad de la luz también varía con la distancia
  const sunIntensity = useMemo(() => {
    const minOrbit = 50;
    const distanceRatio = minOrbit / orbitRadius;
    return Math.max(0.8, Math.min(2.5, 1.5 * Math.pow(distanceRatio, 0.6)));
  }, [orbitRadius]);
  
  useFrame((_, delta) => {
    timeRef.current += delta * 0.05;
    const sunAngle = timeRef.current;
    const sunDistance = radius * 2;
    
    const sunX = Math.cos(sunAngle) * sunDistance;
    const sunY = Math.sin(sunAngle) * radius * 0.5 + radius * 0.8;
    const sunZ = Math.sin(sunAngle) * sunDistance * 0.5;
    
    if (sunRef.current) {
      sunRef.current.position.set(sunX, sunY, sunZ);
      // Apuntar la luz hacia el centro del planeta
      sunRef.current.target.position.set(0, 0, 0);
      sunRef.current.target.updateMatrixWorld();
    }
    
    if (sunMeshRef.current) {
      sunMeshRef.current.position.set(sunX, sunY, sunZ);
    }
    
    if (coronaRef.current) {
      coronaRef.current.position.set(sunX, sunY, sunZ);
      // Animar ligeramente la corona
      const coronaScale = 1 + Math.sin(timeRef.current * 2) * 0.05;
      coronaRef.current.scale.setScalar(coronaScale);
    }
  });
  
  const sunColor = config.planetType === 'volcanic' ? '#ff4400' : '#fffaf0';
  const sunEmissive = config.planetType === 'volcanic' ? '#ff2200' : '#ffdd88';
  
  return (
    <>
      {/* Esfera visual del sol */}
      <mesh ref={sunMeshRef} position={[radius * 2, radius * 0.8, 0]}>
        <sphereGeometry args={[sunApparentSize, 24, 20]} />
        <meshBasicMaterial color={sunColor} />
      </mesh>
      
      {/* Corona/brillo del sol - más prominente para planetas cercanos */}
      <mesh ref={coronaRef} position={[radius * 2, radius * 0.8, 0]}>
        <sphereGeometry args={[sunApparentSize * 1.4, 20, 16]} />
        <meshBasicMaterial 
          color={sunEmissive} 
          transparent 
          opacity={0.25 + (sunApparentSize / 30)} // Mayor brillo para soles más grandes
        />
      </mesh>
      
      {/* Segunda corona más tenue */}
      <mesh position={[radius * 2, radius * 0.8, 0]}>
        <sphereGeometry args={[sunApparentSize * 1.8, 16, 12]} />
        <meshBasicMaterial 
          color={sunEmissive} 
          transparent 
          opacity={0.1 + (sunApparentSize / 60)}
        />
      </mesh>
      
      <directionalLight
        ref={sunRef}
        color={sunColor}
        intensity={sunIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      >
        <primitive object={new THREE.Object3D()} attach="target" />
      </directionalLight>
      <ambientLight color={config.fogColor} intensity={0.3 + (sunIntensity * 0.1)} />
      <hemisphereLight
        color={config.skyColor}
        groundColor={config.groundColor1}
        intensity={0.2 + (sunIntensity * 0.1)}
      />
    </>
  );
}

// ============================================
// ELEMENTOS DECORATIVOS DE SUPERFICIE
// ============================================

// Función para calcular la altura del terreno en un punto normalizado
function getTerrainHeight(
  nx: number, 
  ny: number, 
  nz: number, 
  radius: number, 
  seed: number, 
  config: SurfaceConfig
): number {
  let height: number;
  
  if (config.planetType === 'terrestrial') {
    const continents = fbm(nx * 2, ny * 2, nz * 2, 3, seed);
    const mountains = ridgedNoise(nx * 8, ny * 8, nz * 8, 5, seed + 50);
    const valleys = fbm(nx * 4, ny * 4, nz * 4, 4, seed + 100);
    const fineDetail = fbm(nx * 20, ny * 20, nz * 20, 2, seed + 200);
    
    const landMask = Math.max(0, (continents - 0.35) * 2.5);
    const combinedNoise = continents * 0.5 + mountains * landMask * 0.35 + valleys * 0.1 + fineDetail * 0.05;
    height = radius + (combinedNoise - 0.4) * config.heightScale * 2;
  } else if (config.planetType === 'volcanic') {
    const volcanoes = ridgedNoise(nx * 3, ny * 3, nz * 3, 4, seed);
    const craters = 1 - Math.pow(fbm(nx * 6, ny * 6, nz * 6, 3, seed + 50), 2);
    const lavaChannels = ridgedNoise(nx * 10, ny * 10, nz * 10, 2, seed + 100);
    const roughness = fbm(nx * 15, ny * 15, nz * 15, 3, seed + 200);
    
    const combinedNoise = volcanoes * 0.5 + craters * 0.25 + lavaChannels * 0.15 + roughness * 0.1;
    height = radius + (combinedNoise - 0.3) * config.heightScale * 2.5;
  } else if (config.planetType === 'ice') {
    const glaciers = fbm(nx * 2, ny * 2, nz * 2, 4, seed);
    const cracks = ridgedNoise(nx * 12, ny * 12, nz * 12, 3, seed + 50) * 0.4;
    const iceFormations = ridgedNoise(nx * 5, ny * 5, nz * 5, 4, seed + 100);
    const snowDrifts = fbm(nx * 8, ny * 8, nz * 8, 2, seed + 200);
    
    const combinedNoise = glaciers * 0.4 + iceFormations * 0.35 - cracks * 0.15 + snowDrifts * 0.1;
    height = radius + (combinedNoise - 0.4) * config.heightScale * 1.8;
  } else {
    // Gigante gaseoso
    const bands = Math.sin(ny * 20 + fbm(nx * 3, ny * 3, nz * 3, 2, seed) * 5);
    const storms = fbm(nx * 4, ny * 4, nz * 4, 3, seed + 50);
    const turbulence = fbm(nx * 10, ny * 10, nz * 10, 2, seed + 100);
    
    const combinedNoise = 0.5 + bands * 0.3 + storms * 0.15 + turbulence * 0.05;
    height = radius + (combinedNoise - 0.5) * config.heightScale * 0.8;
  }
  
  return height;
}

// Generar posiciones en la superficie de una esfera con altura de terreno real
function generateSurfacePositions(
  count: number, 
  radius: number, 
  distributionSeed: number, 
  terrainSeed: number,
  minHeight: number = 0,
  config?: SurfaceConfig,
  surfaceOffset: number = 0.1
): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];
  const random = seededRandom(distributionSeed);
  
  for (let i = 0; i < count; i++) {
    // Distribución uniforme en esfera usando muestreo de Fibonacci
    const phi = Math.acos(1 - 2 * (i + 0.5) / count);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    
    // Añadir algo de variación aleatoria
    const phiVar = phi + (random() - 0.5) * 0.3;
    const thetaVar = theta + (random() - 0.5) * 0.5;
    
    const nx = Math.sin(phiVar) * Math.cos(thetaVar);
    const ny = Math.cos(phiVar);
    const nz = Math.sin(phiVar) * Math.sin(thetaVar);
    
    // Calcular altura del terreno en este punto usando la seed del terreno
    const noiseVal = fbm(nx * 2, ny * 2, nz * 2, 3, terrainSeed);
    if (noiseVal > minHeight) {
      // Si tenemos config, calcular la altura real del terreno
      let actualRadius = radius;
      if (config) {
        // Usar terrainSeed para que coincida con el terreno generado
        actualRadius = getTerrainHeight(nx, ny, nz, radius, terrainSeed, config) + surfaceOffset;
      }
      positions.push(new THREE.Vector3(nx * actualRadius, ny * actualRadius, nz * actualRadius));
    }
  }
  return positions;
}

// Árboles para planetas terrestres organizados en bosques
function SurfaceTrees({ radius, seed, config }: { radius: number; seed: number; config: SurfaceConfig }) {
  const trees = useMemo(() => {
    // Generar muchas más posiciones candidatas
    const allPositions = generateSurfacePositions(600, radius, seed + 1000, seed, 0.4, config);
    
    // Filtrar usando ruido para crear zonas de bosques
    const forestPositions = allPositions.filter(pos => {
      const nx = pos.x / radius;
      const ny = pos.y / radius;
      const nz = pos.z / radius;
      
      // Ruido de baja frecuencia para definir zonas de bosque
      const forestNoise = fbm(nx * 3, ny * 3, nz * 3, 2, seed + 500);
      // Umbral alto = bosques más densos en algunas zonas, ausentes en otras
      return forestNoise > 0.45;
    });
    
    return forestPositions.slice(0, 150);
  }, [radius, seed, config]);
  
  return (
    <group>
      {trees.map((pos, i) => {
        const random = seededRandom(seed + i);
        const scale = 0.3 + random() * 0.5;
        const treeType = random() > 0.5;
        
        const normal = pos.clone().normalize();
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        
        return (
          <group key={i} position={pos} quaternion={quaternion}>
            <mesh position={[0, scale * 0.5, 0]}>
              <cylinderGeometry args={[scale * 0.1, scale * 0.15, scale, 6]} />
              <meshStandardMaterial color="#5d4037" roughness={0.9} />
            </mesh>
            {treeType ? (
              <mesh position={[0, scale * 1.2, 0]}>
                <coneGeometry args={[scale * 0.6, scale * 1.5, 6]} />
                <meshStandardMaterial color="#2e7d32" roughness={0.8} />
              </mesh>
            ) : (
              <mesh position={[0, scale * 1.3, 0]}>
                <dodecahedronGeometry args={[scale * 0.7, 1]} />
                <meshStandardMaterial color="#388e3c" roughness={0.7} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

// Rocas decorativas
function SurfaceRocks({ radius, seed, color = '#6b5b4f', config }: { radius: number; seed: number; color?: string; config: SurfaceConfig }) {
  const rocks = useMemo(() => {
    const positions = generateSurfacePositions(150, radius, seed + 2000, seed, 0.3, config);
    return positions.slice(0, 50);
  }, [radius, seed, config]);
  
  return (
    <group>
      {rocks.map((pos, i) => {
        const random = seededRandom(seed + i + 5000);
        const scale = 0.2 + random() * 0.4;
        
        const normal = pos.clone().normalize();
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        
        return (
          <mesh key={i} position={pos} quaternion={quaternion}>
            <dodecahedronGeometry args={[scale, 0]} />
            <meshStandardMaterial color={color} roughness={0.95} metalness={0.1} />
          </mesh>
        );
      })}
    </group>
  );
}

// Volcanes para planetas volcánicos
function SurfaceVolcanoes({ radius, seed, config }: { radius: number; seed: number; config: SurfaceConfig }) {
  const volcanoes = useMemo(() => {
    const positions = generateSurfacePositions(30, radius, seed + 3000, seed, 0.5, config);
    return positions.slice(0, 12);
  }, [radius, seed, config]);
  
  return (
    <group>
      {volcanoes.map((pos, i) => {
        const random = seededRandom(seed + i + 6000);
        const scale = 1.5 + random() * 2;
        const isActive = random() > 0.4;
        
        const normal = pos.clone().normalize();
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        
        return (
          <group key={i} position={pos} quaternion={quaternion}>
            <mesh position={[0, scale * 0.4, 0]}>
              <coneGeometry args={[scale * 1.2, scale * 1.5, 8]} />
              <meshStandardMaterial color="#2a1a0f" roughness={0.9} />
            </mesh>
            <mesh position={[0, scale * 1.1, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[scale * 0.4, scale * 0.3, 8]} />
              <meshStandardMaterial color="#1a0f08" roughness={0.8} />
            </mesh>
            {isActive && (
              <>
                <mesh position={[0, scale * 0.95, 0]}>
                  <cylinderGeometry args={[scale * 0.35, scale * 0.35, scale * 0.1, 8]} />
                  <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={0.8} roughness={0.3} />
                </mesh>
                <mesh position={[0, scale * 1.5, 0]}>
                  <sphereGeometry args={[scale * 0.5, 8, 8]} />
                  <meshStandardMaterial color="#444444" transparent opacity={0.4} roughness={1} />
                </mesh>
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}

// Ríos de lava animados
function LavaRivers({ radius, seed, config }: { radius: number; seed: number; config: SurfaceConfig }) {
  const lavaRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (lavaRef.current) {
      lavaRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissiveIntensity = 0.6 + Math.sin(clock.elapsedTime * 2 + i) * 0.3;
        }
      });
    }
  });
  
  const rivers = useMemo(() => {
    const positions = generateSurfacePositions(80, radius, seed + 4000, seed, 0, config, -0.15);
    return positions.filter((_, i) => {
      const random = seededRandom(seed + i + 7000);
      return random() > 0.7;
    }).slice(0, 25);
  }, [radius, seed, config]);
  
  return (
    <group ref={lavaRef}>
      {rivers.map((pos, i) => {
        const random = seededRandom(seed + i + 8000);
        const scale = 0.5 + random() * 1;
        
        const normal = pos.clone().normalize();
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        
        return (
          <mesh key={i} position={pos} quaternion={quaternion}>
            <boxGeometry args={[scale * 0.3, 0.05, scale * 2]} />
            <meshStandardMaterial color="#ff3300" emissive="#ff2200" emissiveIntensity={0.7} roughness={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

// Cristales de hielo
function IceCrystals({ radius, seed, config }: { radius: number; seed: number; config: SurfaceConfig }) {
  const crystals = useMemo(() => {
    const positions = generateSurfacePositions(120, radius, seed + 5000, seed, 0.35, config);
    return positions.slice(0, 40);
  }, [radius, seed, config]);
  
  return (
    <group>
      {crystals.map((pos, i) => {
        const random = seededRandom(seed + i + 9000);
        const scale = 0.4 + random() * 0.8;
        const rotY = random() * Math.PI * 2;
        
        const normal = pos.clone().normalize();
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        
        return (
          <group key={i} position={pos} quaternion={quaternion}>
            <mesh position={[0, scale * 0.5, 0]} rotation={[0, rotY, 0]}>
              <octahedronGeometry args={[scale * 0.3, 0]} />
              <meshStandardMaterial 
                color="#a8e4ef" 
                transparent 
                opacity={0.7} 
                roughness={0.1} 
                metalness={0.3}
                emissive="#88ccdd"
                emissiveIntensity={0.1}
              />
            </mesh>
            {random() > 0.5 && (
              <mesh position={[scale * 0.2, scale * 0.3, scale * 0.1]} rotation={[0.2, rotY + 0.5, 0.1]}>
                <octahedronGeometry args={[scale * 0.2, 0]} />
                <meshStandardMaterial color="#c8f4ff" transparent opacity={0.6} roughness={0.05} metalness={0.4} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

// Grietas de hielo
function IceCracks({ radius, seed, config }: { radius: number; seed: number; config: SurfaceConfig }) {
  const cracks = useMemo(() => {
    const positions = generateSurfacePositions(60, radius, seed + 6000, seed, 0.2, config, -0.1);
    return positions.slice(0, 20);
  }, [radius, seed, config]);
  
  return (
    <group>
      {cracks.map((pos, i) => {
        const random = seededRandom(seed + i + 11000);
        const scale = 0.8 + random() * 1.5;
        const rotY = random() * Math.PI;
        
        const normal = pos.clone().normalize();
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        
        return (
          <mesh key={i} position={pos} quaternion={quaternion} rotation={[0, rotY, 0]}>
            <boxGeometry args={[scale * 0.1, 0.3, scale * 3]} />
            <meshStandardMaterial color="#1a5f7a" roughness={0.2} metalness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

// Formaciones de nubes para gigantes gaseosos
function GasCloudFormations({ radius, seed }: { radius: number; seed: number }) {
  const cloudsRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = clock.elapsedTime * 0.01;
    }
  });
  
  const clouds = useMemo(() => {
    const positions: { pos: THREE.Vector3; scale: number; color: string }[] = [];
    const random = seededRandom(seed + 7000);
    const colors = ['#d4a574', '#c9986c', '#b86b4b', '#e8c896'];
    
    for (let i = 0; i < 30; i++) {
      const lat = (random() - 0.5) * Math.PI * 0.8;
      const lon = random() * Math.PI * 2;
      
      const x = Math.cos(lat) * Math.cos(lon) * radius * 1.01;
      const y = Math.sin(lat) * radius * 1.01;
      const z = Math.cos(lat) * Math.sin(lon) * radius * 1.01;
      
      positions.push({
        pos: new THREE.Vector3(x, y, z),
        scale: 2 + random() * 4,
        color: colors[Math.floor(random() * colors.length)]
      });
    }
    return positions;
  }, [radius, seed]);
  
  return (
    <group ref={cloudsRef}>
      {clouds.map((cloud, i) => {
        const normal = cloud.pos.clone().normalize();
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        
        return (
          <mesh key={i} position={cloud.pos} quaternion={quaternion}>
            <sphereGeometry args={[cloud.scale, 8, 6]} />
            <meshStandardMaterial color={cloud.color} transparent opacity={0.6} roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
}

// Gran tormenta (como la Gran Mancha Roja)
function GiantStorm({ radius, seed }: { radius: number; seed: number }) {
  const stormRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (stormRef.current) {
      stormRef.current.rotation.z = clock.elapsedTime * 0.5;
    }
  });
  
  const random = seededRandom(seed + 8000);
  const lat = (random() - 0.5) * 0.6;
  const lon = random() * Math.PI * 2;
  
  const x = Math.cos(lat) * Math.cos(lon) * radius * 1.015;
  const y = Math.sin(lat) * radius * 1.015;
  const z = Math.cos(lat) * Math.sin(lon) * radius * 1.015;
  
  const pos = new THREE.Vector3(x, y, z);
  const normal = pos.clone().normalize();
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  
  return (
    <mesh ref={stormRef} position={pos} quaternion={quaternion}>
      <torusGeometry args={[5, 2, 8, 16]} />
      <meshStandardMaterial color="#a33a1d" roughness={0.8} />
    </mesh>
  );
}

// Componente principal de la superficie del planeta
interface PlanetarySurfaceProps {
  planetData: PlanetData;
  allPlanets: PlanetData[];
  onExitSurface: () => void;
  language: Language;
}

function PlanetarySurface({ planetData, allPlanets, onExitSurface }: PlanetarySurfaceProps) {
  const config = useMemo(() => getSurfaceConfig(planetData.planetType), [planetData.planetType]);
  const planetSeed = useMemo(() => {
    return planetData.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }, [planetData.id]);
  
  // Radio de la esfera de superficie (más pequeño para ver mejor el relieve)
  const surfaceRadius = 120;
  
  // Convertir planetas a formato SkyPlanetData con lunas
  const skyPlanets = useMemo(() => {
    return allPlanets.map(p => ({
      id: p.id,
      name: p.name.es, // Usar nombre en español por defecto
      color: p.color,
      orbitRadius: p.orbitRadius,
      size: p.size,
      // Convertir los primeros items en "lunas" visuales
      moons: p.items.slice(0, 3).map((item, idx) => ({
        name: item.title,
        color: adjustColor(p.color, -20 + idx * 10), // Colores ligeramente diferentes
        orbitRadius: p.size * 0.3 * (idx + 1)
      }))
    }));
  }, [allPlanets]);
  
  // Crear geometría del terreno
  const { geometry } = useMemo(() => {
    return createDetailedSurfaceGeometry(surfaceRadius, 128, planetSeed, config);
  }, [surfaceRadius, planetSeed, config]);
  
  // Textura procedural más homogénea (sin patrones repetitivos)
  const groundTexture = useMemo(() => {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    const random = seededRandom(planetSeed + 1000);
    
    // Crear textura de ruido suave usando múltiples octavas simuladas
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        
        // Ruido suave usando interpolación
        const fx = x / size;
        const fy = y / size;
        
        // Combinar varias frecuencias de ruido para textura orgánica
        let noise = 0;
        noise += Math.sin(fx * 3.7 + random() * 0.1) * 0.1;
        noise += Math.cos(fy * 4.3 + random() * 0.1) * 0.1;
        noise += (random() * 0.5 + random() * 0.5) * 0.15; // Suavizar el ruido
        
        // Valor base más alto para que sea sutil
        const combined = 0.85 + noise * 0.15;
        
        data[i] = combined * 255;
        data[i + 1] = combined * 255;
        data[i + 2] = combined * 255;
        data[i + 3] = 255;
      }
    }
    
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8); // Menos repeticiones para evitar patrones visibles
    texture.needsUpdate = true;
    
    return texture;
  }, [planetSeed]);
  
  return (
    <group>
      {/* Cielo esférico */}
      <PlanetarySky config={config} radius={surfaceRadius} />
      
      {/* Planetas visibles en el cielo */}
      <SkyPlanets 
        currentPlanetOrbitRadius={planetData.orbitRadius}
        skyRadius={surfaceRadius}
        allPlanets={skyPlanets}
        currentPlanetId={planetData.id}
      />
      
      {/* Niebla atmosférica */}
      <AtmosphericFog config={config} />
      
      {/* Nubes atmosféricas (por encima del límite de vuelo) */}
      <AtmosphericClouds radius={surfaceRadius} seed={planetSeed} config={config} />
      
      {/* Iluminación con sol de tamaño variable */}
      <PlanetarySun config={config} radius={surfaceRadius} orbitRadius={planetData.orbitRadius} />
      
      {/* Terreno esférico con textura */}
      <mesh geometry={geometry}>
        <meshStandardMaterial
          vertexColors
          map={groundTexture}
          roughness={0.9}
          metalness={0.1}
          flatShading
        />
      </mesh>
      
      {/* Agua para planetas terrestres */}
      {config.hasWater && (
        <PlanetaryWater radius={surfaceRadius} config={config} />
      )}
      
      {/* Elementos decorativos según tipo de planeta */}
      {planetData.planetType === 'terrestrial' && (
        <>
          <SurfaceTrees radius={surfaceRadius} seed={planetSeed} config={config} />
          <SurfaceRocks radius={surfaceRadius} seed={planetSeed} color="#6b5b4f" config={config} />
        </>
      )}
      
      {planetData.planetType === 'volcanic' && (
        <>
          <SurfaceVolcanoes radius={surfaceRadius} seed={planetSeed} config={config} />
          <LavaRivers radius={surfaceRadius} seed={planetSeed} config={config} />
          <SurfaceRocks radius={surfaceRadius} seed={planetSeed} color="#2a1a0f" config={config} />
        </>
      )}
      
      {planetData.planetType === 'ice' && (
        <>
          <IceCrystals radius={surfaceRadius} seed={planetSeed} config={config} />
          <IceCracks radius={surfaceRadius} seed={planetSeed} config={config} />
          <SurfaceRocks radius={surfaceRadius} seed={planetSeed} color="#8fa8b8" config={config} />
        </>
      )}
      
      {planetData.planetType === 'gas_giant' && (
        <>
          <GasCloudFormations radius={surfaceRadius} seed={planetSeed} />
          <GiantStorm radius={surfaceRadius} seed={planetSeed} />
        </>
      )}
      
      {/* Controles de vuelo atmosférico */}
      <AtmosphericFlightControls 
        surfaceRadius={surfaceRadius}
        onExitSurface={onExitSurface}
      />
      
      {/* Nave en modo superficie */}
      <SurfaceSpaceshipModel />
      
      {/* Etiquetas flotantes para items del planeta sobre la superficie */}
      <SurfaceFloatingLabels 
        items={planetData.items}
        radius={surfaceRadius}
        seed={planetSeed}
        color={planetData.color}
        config={config}
      />
    </group>
  );
}

// Etiquetas flotantes sobre la superficie del planeta
interface SurfaceFloatingLabelsProps {
  items: PlanetItem[];
  radius: number;
  seed: number;
  color: string;
  config: SurfaceConfig;
}

function SurfaceFloatingLabels({ items, radius, seed, color, config }: SurfaceFloatingLabelsProps) {
  // Generar posiciones aleatorias sobre la superficie
  const labelPositions = useMemo(() => {
    const random = seededRandom(seed + 8888);
    const positions: THREE.Vector3[] = [];
    
    items.forEach((_, i) => {
      // Distribuir en puntos aleatorios de la esfera
      const phi = Math.acos(1 - 2 * ((i + random() * 0.5) / (items.length + 1)));
      const theta = random() * Math.PI * 2;
      
      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.cos(phi);
      const nz = Math.sin(phi) * Math.sin(theta);
      
      // Calcular altura del terreno y añadir offset para flotar
      const terrainHeight = getTerrainHeight(nx, ny, nz, radius, seed, config);
      const floatHeight = terrainHeight + 8 + random() * 5; // Flotar entre 8-13 unidades sobre el terreno
      
      positions.push(new THREE.Vector3(
        nx * floatHeight,
        ny * floatHeight,
        nz * floatHeight
      ));
    });
    
    return positions;
  }, [items, radius, seed, config]);
  
  return (
    <group>
      {items.map((item, i) => {
        const pos = labelPositions[i];
        if (!pos) return null;
        
        return (
          <Html
            key={item.id}
            center
            distanceFactor={15}
            position={[pos.x, pos.y, pos.z]}
            style={{ pointerEvents: 'none' }}
          >
            <div className="floating-item-label" style={{ borderColor: color }}>
              <span className="item-dot-small" style={{ background: color }}></span>
              <span className="item-title">{item.title}</span>
              {item.subtitle && <span className="item-subtitle">{item.subtitle}</span>}
            </div>
          </Html>
        );
      })}
    </group>
  );
}

// Controles de vuelo atmosférico (sin singularidades en los polos)
interface AtmosphericFlightControlsProps {
  surfaceRadius: number;
  onExitSurface: () => void;
}

function AtmosphericFlightControls({ surfaceRadius, onExitSurface }: AtmosphericFlightControlsProps) {
  const { camera } = useThree();
  
  // Sistema basado en vectores para evitar singularidades en los polos
  // surfaceNormal: dirección desde el centro del planeta (define "arriba")
  // forwardDir: dirección hacia donde mira la nave (tangente a la superficie)
  const surfaceNormal = useRef(new THREE.Vector3(0, 0, 1)); // Empezamos mirando desde el "ecuador"
  const forwardDir = useRef(new THREE.Vector3(0, 1, 0).normalize()); // Mirando hacia el "norte"
  const velocity = useRef(new THREE.Vector3());
  const pitch = useRef(0);
  const altitude = useRef(surfaceRadius + 10);
  const keys = useRef<Set<string>>(new Set());
  const initialized = useRef(false);
  const isMobile = useRef(isTouchDevice());
  
  const SPEED = 0.08;
  const FRICTION = 0.92;
  const LOOK_SPEED = 0.02;
  const ALTITUDE_SPEED = 0.3               ;
  const MIN_ALTITUDE = surfaceRadius + 5;
  const MAX_ALTITUDE = surfaceRadius + 80;
  
  const MOBILE_MOVE_SENSITIVITY = 0.15;
  const MOBILE_LOOK_SENSITIVITY = 0.25;
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.code.toLowerCase());
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'space', 'shiftleft', 'shiftright'].includes(e.code.toLowerCase())) {
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
    // Inicialización
    if (!initialized.current) {
      surfaceNormal.current.set(0, 0, 1).normalize();
      forwardDir.current.set(0, 1, 0).normalize();
      altitude.current = surfaceRadius + 10;
      pitch.current = 0;
      initialized.current = true;
    }
    
    // Vectores actuales
    const up = surfaceNormal.current.clone().normalize();
    const forward = forwardDir.current.clone().normalize();
    const right = new THREE.Vector3().crossVectors(forward, up).normalize();
    
    // Asegurar que forward es perpendicular a up (tangente a la superficie)
    forward.crossVectors(up, right).normalize();
    forwardDir.current.copy(forward);
    
    // Actualizar estado de propulsores
    thrusterState.forward = keys.current.has('keyw');
    thrusterState.backward = keys.current.has('keys');
    thrusterState.left = keys.current.has('keya');
    thrusterState.right = keys.current.has('keyd');
    thrusterState.up = keys.current.has('space');
    thrusterState.down = keys.current.has('shiftleft') || keys.current.has('shiftright');
    
    // Calcular movimiento tangente a la superficie
    const movement = new THREE.Vector3();
    
    if (thrusterState.forward) movement.add(forward);
    if (thrusterState.backward) movement.sub(forward);
    if (thrusterState.left) movement.sub(right);
    if (thrusterState.right) movement.add(right);
    
    // Ascender/descender
    if (thrusterState.up) altitude.current += ALTITUDE_SPEED;
    if (thrusterState.down) altitude.current -= ALTITUDE_SPEED;
    
    // Girar la vista (yaw) - rota el vector forward alrededor del vector up
    let yawDelta = 0;
    if (keys.current.has('arrowleft')) yawDelta += LOOK_SPEED;
    if (keys.current.has('arrowright')) yawDelta -= LOOK_SPEED;
    
    // Pitch para mirar arriba/abajo
    if (keys.current.has('arrowup')) {
      pitch.current += LOOK_SPEED;
      pitch.current = Math.min(pitch.current, Math.PI / 3);
    }
    if (keys.current.has('arrowdown')) {
      pitch.current -= LOOK_SPEED;
      pitch.current = Math.max(pitch.current, -Math.PI / 4);
    }
    
    // Controles móviles
    if (isMobile.current) {
      if (Math.abs(joystickState.left.x) > 0.1 || Math.abs(joystickState.left.y) > 0.1) {
        movement.addScaledVector(forward, joystickState.left.y * MOBILE_MOVE_SENSITIVITY);
        movement.addScaledVector(right, joystickState.left.x * MOBILE_MOVE_SENSITIVITY);
        thrusterState.forward = joystickState.left.y > 0.1;
        thrusterState.backward = joystickState.left.y < -0.1;
        thrusterState.left = joystickState.left.x < -0.1;
        thrusterState.right = joystickState.left.x > 0.1;
      }
      if (Math.abs(joystickState.right.x) > 0.1 || Math.abs(joystickState.right.y) > 0.1) {
        yawDelta -= joystickState.right.x * LOOK_SPEED * MOBILE_LOOK_SENSITIVITY;
        pitch.current += joystickState.right.y * LOOK_SPEED * MOBILE_LOOK_SENSITIVITY;
        pitch.current = Math.max(-Math.PI / 4, Math.min(Math.PI / 3, pitch.current));
      }
      if (joystickState.verticalMovement !== 0) {
        altitude.current += joystickState.verticalMovement * ALTITUDE_SPEED;
        thrusterState.up = joystickState.verticalMovement > 0;
        thrusterState.down = joystickState.verticalMovement < 0;
      }
    }
    
    // Aplicar rotación yaw al vector forward (girar alrededor del eje up)
    if (Math.abs(yawDelta) > 0.0001) {
      const yawQuat = new THREE.Quaternion().setFromAxisAngle(up, yawDelta);
      forwardDir.current.applyQuaternion(yawQuat).normalize();
    }
    
    // Aplicar movimiento con física
    if (movement.length() > 0) {
      movement.normalize().multiplyScalar(SPEED);
      velocity.current.add(movement);
    }
    
    velocity.current.multiplyScalar(FRICTION);
    
    // Mover la posición en la esfera rotando el vector surfaceNormal
    if (velocity.current.length() > 0.001) {
      // Calcular el eje de rotación (perpendicular a la velocidad y al up)
      const moveDir = velocity.current.clone().normalize();
      const rotationAxis = new THREE.Vector3().crossVectors(up, moveDir).normalize();
      
      // Ángulo de rotación basado en velocidad y altitud
      const angularSpeed = velocity.current.length() / altitude.current;
      
      // Crear quaternion de rotación
      const moveQuat = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angularSpeed);
      
      // Rotar la normal de la superficie (nuestra posición)
      surfaceNormal.current.applyQuaternion(moveQuat).normalize();
      
      // También rotar el vector forward para mantener la orientación relativa
      forwardDir.current.applyQuaternion(moveQuat);
      
      // Re-ortogonalizar forward para que sea tangente a la nueva superficie
      const newUp = surfaceNormal.current.clone();
      const newRight = new THREE.Vector3().crossVectors(forwardDir.current, newUp).normalize();
      forwardDir.current.crossVectors(newUp, newRight).normalize();
    }
    
    // Clamping de altitud
    altitude.current = Math.max(MIN_ALTITUDE, Math.min(MAX_ALTITUDE + 20, altitude.current));
    
    // Verificar salida al espacio
    if (altitude.current >= MAX_ALTITUDE) {
      onExitSurface();
      return;
    }
    
    // Calcular posición de la cámara
    camera.position.copy(surfaceNormal.current).multiplyScalar(altitude.current);
    
    // Calcular orientación de la cámara
    const currentUp = surfaceNormal.current.clone().normalize();
    const currentForward = forwardDir.current.clone().normalize();
    
    // Aplicar pitch a la dirección de mirada
    const pitchedForward = new THREE.Vector3()
      .addScaledVector(currentForward, Math.cos(pitch.current))
      .addScaledVector(currentUp, Math.sin(pitch.current))
      .normalize();
    
    // Orientar cámara
    const lookTarget = camera.position.clone().add(pitchedForward);
    camera.up.copy(currentUp);
    camera.lookAt(lookTarget);
    
    // Actualizar estado
    flightModeState.altitude = altitude.current - surfaceRadius;
  });
  
  return null;
}

// Modelo de nave para modo superficie (siempre nivelada)
function SurfaceSpaceshipModel() {
  const { camera } = useThree();
  const shipRef = useRef<THREE.Group>(null);
  const [thrusters, setThrusters] = useState({ ...thrusterState });
  
  useFrame(() => {
    if (!shipRef.current) return;
    
    setThrusters({ ...thrusterState });
    
    // Posicionar la nave delante de la cámara pero siempre nivelada con la superficie
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    
    const offset = new THREE.Vector3(0, -0.25, -1.5);
    offset.applyQuaternion(camera.quaternion);
    shipRef.current.position.copy(camera.position).add(offset);
    
    // La nave copia la orientación de la cámara (que ya está nivelada)
    shipRef.current.quaternion.copy(camera.quaternion);
  });
  
  return (
    <group ref={shipRef} scale={0.5}>
      {/* Cuerpo principal de la nave - Naranja vibrante */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.15, 0.6, 6]} />
        <meshStandardMaterial color="#ff6b35" metalness={0.7} roughness={0.2} />
      </mesh>
      
      {/* Franja decorativa central */}
      <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.4, 6]} />
        <meshStandardMaterial color="#00d4ff" metalness={0.9} roughness={0.1} emissive="#00d4ff" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Cabina - Cyan brillante */}
      <mesh position={[0, 0.08, -0.1]}>
        <sphereGeometry args={[0.1, 12, 8]} />
        <meshStandardMaterial color="#00ffff" metalness={0.3} roughness={0.1} transparent opacity={0.8} emissive="#00ffff" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Ala izquierda - Blanco con borde cian */}
      <mesh position={[-0.25, 0, 0.1]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.3, 0.02, 0.2]} />
        <meshStandardMaterial color="#f0f0f0" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.35, 0, 0.1]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.08, 0.025, 0.22]} />
        <meshStandardMaterial color="#00d4ff" metalness={0.9} roughness={0.1} emissive="#00d4ff" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Ala derecha - Blanco con borde cian */}
      <mesh position={[0.25, 0, 0.1]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.3, 0.02, 0.2]} />
        <meshStandardMaterial color="#f0f0f0" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.35, 0, 0.1]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.08, 0.025, 0.22]} />
        <meshStandardMaterial color="#00d4ff" metalness={0.9} roughness={0.1} emissive="#00d4ff" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Motor trasero - Dorado metálico */}
      <mesh position={[0, 0, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.1, 8]} />
        <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.15} />
      </mesh>
      
      {/* Propulsores */}
      <Thruster position={[0, 0, 0.45]} rotation={[Math.PI / 2, 0, 0]} active={thrusters.forward} color="#ff4400" />
      <Thruster position={[0, 0, -0.35]} rotation={[-Math.PI / 2, 0, 0]} active={thrusters.backward} color="#ff6600" />
      <Thruster position={[0.3, 0, 0.1]} rotation={[0, 0, -Math.PI / 2]} active={thrusters.left} color="#ff6600" />
      <Thruster position={[-0.3, 0, 0.1]} rotation={[0, 0, Math.PI / 2]} active={thrusters.right} color="#ff6600" />
      <Thruster position={[0, -0.15, 0.1]} rotation={[0, 0, Math.PI]} active={thrusters.up} color="#00aaff" />
      <Thruster position={[0, 0.15, 0.1]} rotation={[0, 0, 0]} active={thrusters.down} color="#00aaff" />
    </group>
  );
}

// ============================================
// FIN SISTEMA DE EXPLORACIÓN PLANETARIA
// ============================================

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

// Componente de propulsor individual
function Thruster({ position, rotation, active, color = '#ff6600' }: {
  position: [number, number, number];
  rotation: [number, number, number];
  active: boolean;
  color?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scale = useRef(0);
  
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    // Animación suave de encendido/apagado
    const targetScale = active ? 1 : 0;
    scale.current += (targetScale - scale.current) * Math.min(delta * 4, 1);
    
    meshRef.current.scale.setScalar(scale.current);
    
    // Efecto de parpadeo cuando está activo
    if (active && meshRef.current.material) {
      const flickerIntensity = 0.7 + Math.random() * 0.3;
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = flickerIntensity;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={0}>
      <coneGeometry args={[0.08, 0.25, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
}

// Modelo de nave espacial visible
function SpaceshipModel() {
  const { camera } = useThree();
  const shipRef = useRef<THREE.Group>(null);
  const [thrusters, setThrusters] = useState({ ...thrusterState });
  
  useFrame(() => {
    if (!shipRef.current) return;
    
    // Actualizar estado de propulsores para renderizado
    setThrusters({ ...thrusterState });
    
    // Posicionar la nave delante de la cámara
    const offset = new THREE.Vector3(0, -0.2, -1.3);
    offset.applyQuaternion(camera.quaternion);
    shipRef.current.position.copy(camera.position).add(offset);
    
    // Rotar la nave para que mire en la dirección de la cámara
    shipRef.current.quaternion.copy(camera.quaternion);
  });
  
  return (
    <group ref={shipRef} scale={0.5}>
      {/* Cuerpo principal de la nave - Naranja vibrante */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.15, 0.6, 6]} />
        <meshStandardMaterial color="#ff6b35" metalness={0.7} roughness={0.2} />
      </mesh>
      
      {/* Franja decorativa central */}
      <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.4, 6]} />
        <meshStandardMaterial color="#00d4ff" metalness={0.9} roughness={0.1} emissive="#00d4ff" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Cabina - Cyan brillante */}
      <mesh position={[0, 0.08, -0.1]}>
        <sphereGeometry args={[0.1, 12, 8]} />
        <meshStandardMaterial color="#00ffff" metalness={0.3} roughness={0.1} transparent opacity={0.8} emissive="#00ffff" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Ala izquierda - Blanca con borde cian */}
      <mesh position={[-0.25, 0, 0.1]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.3, 0.02, 0.2]} />
        <meshStandardMaterial color="#f0f0f0" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.37, 0, 0.1]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.08, 0.025, 0.22]} />
        <meshStandardMaterial color="#00d4ff" metalness={0.9} roughness={0.1} emissive="#00d4ff" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Ala derecha - Blanca con borde cian */}
      <mesh position={[0.25, 0, 0.1]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.3, 0.02, 0.2]} />
        <meshStandardMaterial color="#f0f0f0" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.37, 0, 0.1]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.08, 0.025, 0.22]} />
        <meshStandardMaterial color="#00d4ff" metalness={0.9} roughness={0.1} emissive="#00d4ff" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Motor trasero - Dorado metálico */}
      <mesh position={[0, 0, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.1, 8]} />
        <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.15} />
      </mesh>
      
      {/* === PROPULSORES === */}
      {/* Propulsor trasero (cuando avanza hacia adelante) */}
      <Thruster 
        position={[0, 0, 0.45]} 
        rotation={[Math.PI / 2, 0, 0]} 
        active={thrusters.forward}
        color="#ff4400"
      />
      
      {/* Propulsor delantero (cuando retrocede) */}
      <Thruster 
        position={[0, 0, -0.35]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        active={thrusters.backward}
        color="#ff6600"
      />
      
      {/* Propulsor derecho (cuando gira izquierda) */}
      <Thruster 
        position={[0.3, 0, 0.1]} 
        rotation={[0, 0, -Math.PI / 2]} 
        active={thrusters.left}
        color="#ff6600"
      />
      
      {/* Propulsor izquierdo (cuando gira derecha) */}
      <Thruster 
        position={[-0.3, 0, 0.1]} 
        rotation={[0, 0, Math.PI / 2]} 
        active={thrusters.right}
        color="#ff6600"
      />
      
      {/* Propulsor inferior (cuando sube) */}
      <Thruster 
        position={[0, -0.15, 0.1]} 
        rotation={[0, 0, Math.PI]} 
        active={thrusters.up}
        color="#00aaff"
      />
      
      {/* Propulsor superior (cuando baja) */}
      <Thruster 
        position={[0, 0.15, 0.1]} 
        rotation={[0, 0, 0]} 
        active={thrusters.down}
        color="#00aaff"
      />
    </group>
  );
}

// Controles de nave espacial
interface SpaceshipControlsProps {
  initialPosition?: THREE.Vector3 | null;
}

function SpaceshipControls({ initialPosition }: SpaceshipControlsProps) {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const rotation = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const keys = useRef<Set<string>>(new Set());
  const initialized = useRef(false);
  const isMobile = useRef(isTouchDevice());
  
  // Posición objetivo para el inicio
  const targetPosition = useMemo(() => {
    if (initialPosition) {
      return initialPosition.clone();
    }
    return new THREE.Vector3(0, 75, 175);
  }, [initialPosition]);
  
  const SPEED = 0.04;
  const FRICTION = 0.92;
  const LOOK_SPEED = 0.015;
  
  // Sensibilidad reducida para joysticks móviles
  const MOBILE_MOVE_SENSITIVITY = 0.15;
  const MOBILE_LOOK_SENSITIVITY = 0.25;

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
      camera.position.lerp(targetPosition, 0.05);
      camera.lookAt(0, 0, 0);
      rotation.current.setFromQuaternion(camera.quaternion);
      if (camera.position.distanceTo(targetPosition) < 1) {
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
    
    // Actualizar estado de propulsores para teclado
    thrusterState.forward = keys.current.has('keyw');
    thrusterState.backward = keys.current.has('keys');
    thrusterState.left = keys.current.has('keya');
    thrusterState.right = keys.current.has('keyd');
    thrusterState.up = keys.current.has('space');
    thrusterState.down = keys.current.has('shiftleft') || keys.current.has('shiftright');
    
    if (thrusterState.forward) movement.add(forward);
    if (thrusterState.backward) movement.sub(forward);
    if (thrusterState.left) movement.sub(right);
    if (thrusterState.right) movement.add(right);
    if (thrusterState.up) movement.add(up);
    if (thrusterState.down) movement.sub(up);

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
        // Actualizar propulsores para joystick móvil
        thrusterState.forward = joystickState.left.y > 0.1;
        thrusterState.backward = joystickState.left.y < -0.1;
        thrusterState.left = joystickState.left.x < -0.1;
        thrusterState.right = joystickState.left.x > 0.1;
      } else if (isMobile.current) {
        // Resetear propulsores horizontales si no hay input móvil
        if (!keys.current.has('keyw')) thrusterState.forward = false;
        if (!keys.current.has('keys')) thrusterState.backward = false;
        if (!keys.current.has('keya')) thrusterState.left = false;
        if (!keys.current.has('keyd')) thrusterState.right = false;
      }
      if (Math.abs(joystickState.right.x) > 0.1 || Math.abs(joystickState.right.y) > 0.1) {
        rotation.current.y -= joystickState.right.x * LOOK_SPEED * MOBILE_LOOK_SENSITIVITY;
        rotation.current.x += joystickState.right.y * LOOK_SPEED * MOBILE_LOOK_SENSITIVITY;
        rotation.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, rotation.current.x));
      }
      // Movimiento vertical con botones
      if (joystickState.verticalMovement !== 0) {
        movement.add(up.clone().multiplyScalar(joystickState.verticalMovement * MOBILE_MOVE_SENSITIVITY));
        thrusterState.up = joystickState.verticalMovement > 0;
        thrusterState.down = joystickState.verticalMovement < 0;
      } else if (isMobile.current) {
        if (!keys.current.has('space')) thrusterState.up = false;
        if (!keys.current.has('shiftleft') && !keys.current.has('shiftright')) thrusterState.down = false;
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

// Hook para detectar entrada a planeta
interface PlanetProximity {
  planet: PlanetData | null;
  distance: number;
  isEntering: boolean;
}

function usePlanetProximityDetection(
  planets: PlanetData[], 
  cameraPosition: THREE.Vector3,
  planetPositions: Map<string, THREE.Vector3>
): PlanetProximity {
  const [proximity, setProximity] = useState<PlanetProximity>({
    planet: null,
    distance: Infinity,
    isEntering: false
  });
  
  useFrame(() => {
    let closestPlanet: PlanetData | null = null;
    let closestDistance = Infinity;
    
    for (const planet of planets) {
      const planetPos = planetPositions.get(planet.id);
      if (!planetPos) continue;
      
      const dist = cameraPosition.distanceTo(planetPos);
      
      if (dist < closestDistance) {
        closestDistance = dist;
        closestPlanet = planet;
      }
    }
    
    // Distancia para entrar al planeta es 1.5x su tamaño
    const entryThreshold = closestPlanet ? closestPlanet.size * 1.5 : 0;
    const isEntering = closestPlanet !== null && closestDistance < entryThreshold;
    
    setProximity({
      planet: closestPlanet,
      distance: closestDistance,
      isEntering
    });
  });
  
  return proximity;
}

// Referencia global para posiciones de planetas
const planetPositionsRef = new Map<string, THREE.Vector3>();

// Escena del sistema solar (modo espacio)
function SolarSystemScene({ planets, language, selectedPlanet, onSelectPlanet, onEnterPlanet, initialCameraPosition }: {
  planets: PlanetData[];
  language: Language;
  selectedPlanet: PlanetData | null;
  onSelectPlanet: (planet: PlanetData | null) => void;
  onEnterPlanet: (planet: PlanetData, cameraPos: THREE.Vector3) => void;
  initialCameraPosition?: THREE.Vector3 | null;
}) {
  const cameraPosition = useCameraPosition();
  const proximity = usePlanetProximityDetection(planets, cameraPosition, planetPositionsRef);
  const enteredRef = useRef(false);
  
  // Detectar entrada al planeta
  useFrame(() => {
    if (proximity.isEntering && proximity.planet && !enteredRef.current) {
      enteredRef.current = true;
      // Guardar la posición de la cámara antes de entrar
      onEnterPlanet(proximity.planet, cameraPosition.clone());
    }
    
    if (!proximity.isEntering) {
      enteredRef.current = false;
    }
  });
  
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
            onPositionUpdate={(pos) => planetPositionsRef.set(planet.id, pos)}
          />
        </group>
      ))}
      
      <SpaceshipModel />
      <SpaceshipControls initialPosition={initialCameraPosition} />
      
      {/* Indicador de proximidad al planeta */}
      {proximity.planet && proximity.distance < proximity.planet.size * 3 && !proximity.isEntering && (
        <Html
          center
          position={[
            cameraPosition.x,
            cameraPosition.y - 2,
            cameraPosition.z
          ]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="planet-entry-indicator">
            <span>🚀 {language === 'es' ? 'Acércate más para aterrizar en' : 'Get closer to land on'} {proximity.planet.name[language]}</span>
          </div>
        </Html>
      )}
    </>
  );
}

// Escena de superficie planetaria
function PlanetSurfaceScene({ planet, allPlanets, language, onExitSurface }: {
  planet: PlanetData;
  allPlanets: PlanetData[];
  language: Language;
  onExitSurface: () => void;
}) {
  return (
    <PlanetarySurface
      planetData={planet}
      allPlanets={allPlanets}
      onExitSurface={onExitSurface}
      language={language}
    />
  );
}

// Componente principal
interface PortfolioSolarSystemProps {
  language: Language;
}

// Posición guardada de la cámara al entrar a un planeta
const savedCameraPosition = {
  position: new THREE.Vector3(0, 75, 175),
  rotation: new THREE.Euler(0, 0, 0, 'YXZ')
};

export default function PortfolioSolarSystem({ language }: PortfolioSolarSystemProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [surfaceMode, setSurfaceMode] = useState<{ active: boolean; planet: PlanetData | null; entryPosition: THREE.Vector3 | null }>({
    active: false,
    planet: null,
    entryPosition: null
  });
  const [cameraKey, setCameraKey] = useState(0); // Para forzar reset de cámara
  const [instructionsCollapsed, setInstructionsCollapsed] = useState(false);
  
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

  const handleEnterPlanet = useCallback((planet: PlanetData, cameraPos: THREE.Vector3) => {
    // Guardar la posición de la cámara antes de entrar al planeta
    savedCameraPosition.position.copy(cameraPos);
    
    // Actualizar estado del modo de vuelo
    flightModeState.mode = 'surface';
    flightModeState.planetData = planet;
    flightModeState.entryPosition.copy(cameraPos);
    notifyFlightModeChange();
    
    setSurfaceMode({ active: true, planet, entryPosition: cameraPos.clone() });
    setSelectedPlanet(null);
    setCameraKey(prev => prev + 1);
  }, []);

  const handleExitSurface = useCallback(() => {
    // Volver al modo espacio
    flightModeState.mode = 'space';
    flightModeState.planetData = null;
    notifyFlightModeChange();
    
    // Mantener la posición de entrada guardada para restaurarla
    setSurfaceMode(prev => ({ active: false, planet: null, entryPosition: prev.entryPosition }));
    setCameraKey(prev => prev + 1);
  }, []);

  // Instrucciones según el modo (colapsables)
  const instructions = (
    <div className={`space-instructions desktop-only ${surfaceMode.active ? 'surface-mode' : ''} ${instructionsCollapsed ? 'collapsed' : ''}`}>
      <button 
        className="instructions-toggle"
        onClick={() => setInstructionsCollapsed(!instructionsCollapsed)}
        title={instructionsCollapsed ? (language === 'es' ? 'Mostrar controles' : 'Show controls') : (language === 'es' ? 'Ocultar controles' : 'Hide controls')}
      >
        {instructionsCollapsed ? '◀' : '▶'}
      </button>
      {surfaceMode.active ? (
        <>
          <span>⌨️ WASD {language === 'es' ? 'mover' : 'move'}</span>
          <span>🎯 {language === 'es' ? 'Flechas mirar' : 'Arrows look'}</span>
          <span>⬆️ {language === 'es' ? 'Espacio ascender' : 'Space ascend'}</span>
          <span>⬇️ {language === 'es' ? 'Shift descender' : 'Shift descend'}</span>
        </>
      ) : (
        <>
          <span>⌨️ WASD {language === 'es' ? 'mover' : 'move'}</span>
          <span>🎯 {language === 'es' ? 'Flechas mirar' : 'Arrows look'}</span>
          <span>⬆️ {language === 'es' ? 'Espacio subir' : 'Space up'}</span>
          <span>⬇️ {language === 'es' ? 'Shift bajar' : 'Shift down'}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="solar-system-container">
      <Canvas
        key={cameraKey}
        camera={{ 
          position: surfaceMode.active 
            ? [0, 550, 0] 
            : surfaceMode.entryPosition 
              ? [surfaceMode.entryPosition.x, surfaceMode.entryPosition.y, surfaceMode.entryPosition.z]
              : [0, 75, 175], 
          fov: 60 
        }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: surfaceMode.active ? '#000' : 'transparent' }}
      >
        <Suspense fallback={null}>
          {surfaceMode.active && surfaceMode.planet ? (
            <PlanetSurfaceScene
              planet={surfaceMode.planet}
              allPlanets={planets}
              language={language}
              onExitSurface={handleExitSurface}
            />
          ) : (
            <SolarSystemScene
              planets={planets}
              language={language}
              selectedPlanet={selectedPlanet}
              onSelectPlanet={handleSelectPlanet}
              onEnterPlanet={handleEnterPlanet}
              initialCameraPosition={surfaceMode.entryPosition}
            />
          )}
        </Suspense>
      </Canvas>

      <SpaceshipHUD />
      <MobileControls />

      {/* Panel de información del planeta seleccionado (solo en modo espacio) */}
      {!surfaceMode.active && selectedPlanet && (
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
      {instructions}
    </div>
  );
}
