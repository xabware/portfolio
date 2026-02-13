import { useRef, useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Stars, Html, Line } from '@react-three/drei';
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
interface PlanetData {
  id: string;
  name: { es: string; en: string };
  description: { es: string; en: string };
  color: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
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
function Sun({ language }: { language: Language }) {
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
        <sphereGeometry args={[2, 64, 64]} />
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
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Luz del sol */}
      <pointLight color="#fff5e0" intensity={3} distance={100} />
      
      {/* Texto del portafolio */}
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.6}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {language === 'es' ? 'Mi Portfolio' : 'My Portfolio'}
      </Text>
    </group>
  );
}

// Calcular ángulo inicial determinista basado en el id
function getInitialAngle(id: string): number {
  return id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 0.1 % (Math.PI * 2);
}

// Componente del Planeta
function Planet({ data, language, cameraPosition, onSelect, selectedPlanet }: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  // Usar función en useState para calcular ángulo inicial una sola vez
  const [angle, setAngle] = useState(() => getInitialAngle(data.id));
  const [showDetails, setShowDetails] = useState(false);
  
  useFrame(() => {
    // Órbita
    setAngle(prev => prev + data.orbitSpeed * 0.01);
    
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle) * data.orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * data.orbitRadius;
      
      // Calcular distancia a la cámara y mostrar detalles si estamos cerca
      const dist = cameraPosition.distanceTo(groupRef.current.position);
      setShowDetails(dist < 8);
    }
    
    if (meshRef.current) {
      // Rotación propia del planeta
      meshRef.current.rotation.y += 0.01;
      
      // Escala al hover
      const targetScale = hovered ? 1.3 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const handleClick = useCallback(() => {
    onSelect(selectedPlanet?.id === data.id ? null : data);
  }, [data, onSelect, selectedPlanet]);

  return (
    <group ref={groupRef}>
      {/* Planeta */}
      <mesh
        ref={meshRef}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        onClick={handleClick}
      >
        <sphereGeometry args={[data.size, 32, 32]} />
        <meshStandardMaterial
          color={data.color}
          emissive={data.color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>
      
      {/* Anillos decorativos para algunos planetas */}
      {data.id === 'projects' && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[data.size * 1.5, data.size * 2, 64]} />
          <meshBasicMaterial color={data.color} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {/* Nombre del planeta */}
      <Text
        position={[0, data.size + 0.8, 0]}
        fontSize={0.35}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {data.name[language]}
      </Text>
      
      {/* Luz del planeta */}
      <pointLight color={data.color} intensity={hovered ? 1 : 0.3} distance={5} />
      
      {/* Información detallada al acercarse */}
      {showDetails && (
        <Html
          center
          distanceFactor={15}
          position={[data.size + 2, 0, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="planet-details-popup">
            <h3>{data.name[language]}</h3>
            <p className="planet-description">{data.description[language]}</p>
            <div className="planet-items-preview">
              {data.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="planet-item-mini">
                  <span className="item-dot" style={{ background: data.color }}></span>
                  <span>{item.title}</span>
                </div>
              ))}
              {data.items.length > 3 && (
                <p className="more-items">+{data.items.length - 3} {language === 'es' ? 'más' : 'more'}</p>
              )}
            </div>
          </div>
        </Html>
      )}
      
      {/* Lunas (items) orbitando cuando estás cerca */}
      {showDetails && data.items.slice(0, 5).map((item, idx) => (
        <Moon 
          key={item.id} 
          item={item} 
          index={idx} 
          total={Math.min(data.items.length, 5)}
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
  const moonOrbitRadius = parentSize * 2 + 0.5;
  
  useFrame(() => {
    angle.current += 0.02;
    if (meshRef.current) {
      meshRef.current.position.x = Math.cos(angle.current) * moonOrbitRadius;
      meshRef.current.position.z = Math.sin(angle.current) * moonOrbitRadius;
      meshRef.current.position.y = Math.sin(angle.current * 2) * 0.3;
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <sphereGeometry args={[0.2, 16, 16]} />
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
  
  const SPEED = 0.03;
  const FRICTION = 0.92;
  const LOOK_SPEED = 0.025;

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
      camera.position.lerp(new THREE.Vector3(0, 15, 35), 0.02);
      camera.lookAt(0, 0, 0);
      rotation.current.setFromQuaternion(camera.quaternion);
      if (camera.position.distanceTo(new THREE.Vector3(0, 15, 35)) < 0.5) {
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
        movement.add(forward.clone().multiplyScalar(joystickState.left.y));
        movement.add(right.clone().multiplyScalar(joystickState.left.x));
      }
      if (Math.abs(joystickState.right.x) > 0.1 || Math.abs(joystickState.right.y) > 0.1) {
        rotation.current.y -= joystickState.right.x * LOOK_SPEED;
        rotation.current.x += joystickState.right.y * LOOK_SPEED;
        rotation.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, rotation.current.x));
      }
      // Movimiento vertical con botones
      if (joystickState.verticalMovement !== 0) {
        movement.add(up.clone().multiplyScalar(joystickState.verticalMovement));
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
      Math.max(-80, Math.min(80, camera.position.x)),
      Math.max(-40, Math.min(60, camera.position.y)),
      Math.max(-80, Math.min(80, camera.position.z))
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
      positions[i * 3] = (random() - 0.5) * 100;
      positions[i * 3 + 1] = (random() - 0.5) * 100;
      positions[i * 3 + 2] = (random() - 0.5) * 100;
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
      <pointsMaterial size={0.08} color="#ffffff" transparent opacity={0.5} sizeAttenuation />
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
      
      <Stars radius={150} depth={80} count={8000} factor={5} saturation={0} fade speed={0.3} />
      <FloatingParticles count={400} />
      
      <Sun language={language} />
      
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
      size: 1.2,
      orbitRadius: 10,
      orbitSpeed: 0.03,
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
      color: '#34d399',
      size: 1.0,
      orbitRadius: 16,
      orbitSpeed: 0.02,
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
      color: '#f472b6',
      size: 0.8,
      orbitRadius: 22,
      orbitSpeed: 0.015,
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
      color: '#a78bfa',
      size: 0.9,
      orbitRadius: 28,
      orbitSpeed: 0.01,
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
        camera={{ position: [0, 30, 50], fov: 60 }}
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
