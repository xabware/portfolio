import { useRef, useState, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Stars, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { ResolvedSkillCategory, Skill } from '../../data/skills';

// Generador pseudoaleatorio con seed para resultados determinísticos
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

interface SkillNodeProps {
  skill: Skill;
  position: [number, number, number];
  color: string;
  categoryTitle: string;
  onHover: (skill: Skill | null, category: string) => void;
  onClick: (skill: Skill, category: string) => void;
}

// Nodo individual de skill (esfera brillante)
function SkillNode({ skill, position, color, categoryTitle, onHover, onClick }: SkillNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Tamaño basado en el nivel de habilidad
  const size = 0.15 + (skill.level / 100) * 0.25;
  
  useFrame((state) => {
    if (meshRef.current) {
      // Animación de flotación suave
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1;
      
      // Escala al hacer hover
      const targetScale = hovered ? 1.5 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const handlePointerOver = useCallback(() => {
    setHovered(true);
    onHover(skill, categoryTitle);
    document.body.style.cursor = 'pointer';
  }, [skill, categoryTitle, onHover]);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    onHover(null, '');
    document.body.style.cursor = 'auto';
  }, [onHover]);

  const handleClick = useCallback(() => {
    onClick(skill, categoryTitle);
  }, [skill, categoryTitle, onClick]);

  return (
    <group position={position}>
      {/* Esfera principal */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* Anillo orbital */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 1.3, size * 1.4, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={hovered ? 0.6 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glow effect */}
      <pointLight color={color} intensity={hovered ? 2 : 0.5} distance={3} />
      
      {/* Label cuando hover */}
      {hovered && (
        <Html center distanceFactor={10}>
          <div className="skill-label">
            <span className="skill-label-name">{skill.name}</span>
            <span className="skill-label-level">{skill.level}%</span>
          </div>
        </Html>
      )}
    </group>
  );
}

interface CategoryClusterProps {
  category: ResolvedSkillCategory;
  centerPosition: [number, number, number];
  color: string;
  onHover: (skill: Skill | null, category: string) => void;
  onClick: (skill: Skill, category: string) => void;
  seed: number;
}

// Cluster de categoría (grupo de skills)
function CategoryCluster({ category, centerPosition, color, onHover, onClick, seed }: CategoryClusterProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Distribuir skills en espiral con posiciones determinísticas
  const skillPositions = useMemo(() => {
    const random = seededRandom(seed);
    return category.skills.map((_, index) => {
      const angle = (index / category.skills.length) * Math.PI * 2;
      const radius = 1.5 + (index % 2) * 0.5;
      const height = (random() - 0.5) * 1.5;
      return [
        centerPosition[0] + Math.cos(angle) * radius,
        centerPosition[1] + height,
        centerPosition[2] + Math.sin(angle) * radius,
      ] as [number, number, number];
    });
  }, [category.skills, centerPosition, seed]);

  // Crear las líneas conectoras como objetos THREE.Line
  const lines = useMemo(() => {
    const lineMaterial = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.2 });
    return skillPositions.map((pos) => {
      const points = [
        new THREE.Vector3(centerPosition[0], centerPosition[1], centerPosition[2]),
        new THREE.Vector3(pos[0], pos[1], pos[2])
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geometry, lineMaterial);
    });
  }, [skillPositions, centerPosition, color]);

  useFrame((state) => {
    if (groupRef.current) {
      // Rotación lenta del cluster
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Núcleo central de la categoría */}
      <mesh position={centerPosition}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Label de categoría */}
      <Text
        position={[centerPosition[0], centerPosition[1] + 2.5, centerPosition[2]]}
        fontSize={0.4}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {category.title}
      </Text>

      {/* Líneas conectoras */}
      {lines.map((line, index) => (
        <primitive key={`line-${index}`} object={line} />
      ))}

      {/* Nodos de skills */}
      {category.skills.map((skill, index) => (
        <SkillNode
          key={skill.name}
          skill={skill}
          position={skillPositions[index]}
          color={color}
          categoryTitle={category.title}
          onHover={onHover}
          onClick={onClick}
        />
      ))}
    </group>
  );
}

// Componente de cámara con animación inicial
function CameraController() {
  const { camera } = useThree();
  const initialized = useRef(false);
  
  useFrame(() => {
    if (!initialized.current) {
      // Animación de entrada
      camera.position.lerp(new THREE.Vector3(0, 5, 15), 0.02);
      if (camera.position.distanceTo(new THREE.Vector3(0, 5, 15)) < 0.1) {
        initialized.current = true;
      }
    }
  });

  return null;
}

// Partículas de fondo flotantes con posiciones determinísticas
function FloatingParticles({ count = 200, seed = 12345 }: { count?: number; seed?: number }) {
  const geometry = useMemo(() => {
    const random = seededRandom(seed);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (random() - 0.5) * 50;
      positions[i * 3 + 1] = (random() - 0.5) * 50;
      positions[i * 3 + 2] = (random() - 0.5) * 50;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count, seed]);

  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

interface SkillsGalaxyProps {
  categories: ResolvedSkillCategory[];
  onSkillSelect: (skill: Skill | null, category: string) => void;
}

// Colores para cada categoría
const CATEGORY_COLORS = [
  '#60a5fa', // Azul
  '#34d399', // Verde
  '#f472b6', // Rosa
  '#fbbf24', // Amarillo
  '#a78bfa', // Púrpura
  '#fb923c', // Naranja
];

export default function SkillsGalaxy({ categories, onSkillSelect }: SkillsGalaxyProps) {
  const [selectedSkill, setSelectedSkill] = useState<{ skill: Skill; category: string } | null>(null);

  // Posiciones de los clusters en el espacio con posiciones determinísticas
  const clusterPositions = useMemo(() => {
    const random = seededRandom(42); // seed fija
    const positions: [number, number, number][] = [];
    const totalCategories = categories.length;
    const radius = 6;
    
    categories.forEach((_, index) => {
      const angle = (index / totalCategories) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (random() - 0.5) * 2;
      positions.push([x, y, z]);
    });
    
    return positions;
  }, [categories]);

  const handleHover = useCallback((skill: Skill | null, category: string) => {
    if (skill) {
      onSkillSelect(skill, category);
    }
  }, [onSkillSelect]);

  const handleClick = useCallback((skill: Skill, category: string) => {
    setSelectedSkill({ skill, category });
  }, []);

  return (
    <div className="skills-galaxy-container">
      <Canvas
        camera={{ position: [0, 20, 30], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Iluminación */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#60a5fa" />
          
          {/* Fondo de estrellas */}
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={0.5}
          />
          
          {/* Partículas flotantes */}
          <FloatingParticles count={300} seed={54321} />
          
          {/* Clusters de categorías */}
          {categories.map((category, index) => (
            <CategoryCluster
              key={category.title}
              category={category}
              centerPosition={clusterPositions[index]}
              color={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
              onHover={handleHover}
              onClick={handleClick}
              seed={index * 1000 + 123}
            />
          ))}
          
          {/* Controles de órbita */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={8}
            maxDistance={30}
            autoRotate
            autoRotateSpeed={0.3}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 4}
          />
          
          {/* Controlador de cámara */}
          <CameraController />
        </Suspense>
      </Canvas>

      {/* Panel de información del skill seleccionado */}
      {selectedSkill && (
        <div className="skill-info-panel">
          <button 
            className="skill-info-close"
            onClick={() => setSelectedSkill(null)}
          >
            ×
          </button>
          <h3>{selectedSkill.skill.name}</h3>
          <p className="skill-info-category">{selectedSkill.category}</p>
          <div className="skill-info-level">
            <div className="skill-info-bar">
              <div 
                className="skill-info-progress"
                style={{ width: `${selectedSkill.skill.level}%` }}
              />
            </div>
            <span>{selectedSkill.skill.level}%</span>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="galaxy-instructions">
        <span>🖱️ Arrastra para rotar</span>
        <span>🔍 Scroll para zoom</span>
        <span>👆 Click en una skill para más info</span>
      </div>
    </div>
  );
}
