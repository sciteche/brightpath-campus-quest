import { Html } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MapPin, MoveUpRight } from "lucide-react";
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";
import * as THREE from "three";

import { CAMPUS_BUILDINGS, getDoorTarget, type CampusBuilding } from "./content";
import {
  INTERACTION_RADIUS,
  moveCampusPlayer,
  type MoveDestination,
  type Point2D,
} from "./sim/campus";

interface PlayerInput {
  keys: Set<string>;
  joystick: { x: number; z: number };
}

type ScenePalette = Record<keyof typeof CAMPUS_COLORS, string>;

const CAMPUS_COLORS = {
  sky: "--campus-sky",
  grass: "--campus-grass",
  grassShade: "--campus-grass-shade",
  earth: "--campus-earth",
  path: "--campus-path",
  pathEdge: "--campus-path-edge",
  terracotta: "--campus-building-terracotta",
  sunshine: "--campus-building-sunshine",
  teal: "--accent",
  berry: "--campus-building-berry",
  orange: "--brand-orange",
  navy: "--primary",
  cream: "--background",
  window: "--campus-window",
  skin: "--campus-skin",
  hair: "--foreground",
  wood: "--campus-wood",
  leaf: "--campus-leaf",
  yellow: "--sunny-yellow",
} as const;

const PLAYER_KEYS = new Set([
  "KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
]);

function resolveThemeColor(value: string, context: CanvasRenderingContext2D) {
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const [red = 0, green = 0, blue = 0] = context.getImageData(0, 0, 1, 1).data;
  return `rgb(${red}, ${green}, ${blue})`;
}

function useScenePalette() {
  const [palette, setPalette] = useState<ScenePalette | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;

    const styles = getComputedStyle(document.documentElement);
    const nextPalette = {} as ScenePalette;
    const colorNames = Object.keys(CAMPUS_COLORS) as Array<keyof typeof CAMPUS_COLORS>;
    for (const name of colorNames) {
      const token = CAMPUS_COLORS[name];
      const value = styles.getPropertyValue(token).trim();
      nextPalette[name] = resolveThemeColor(value || styles.getPropertyValue("--background").trim(), context);
    }
    setPalette(nextPalette);
  }, []);

  return palette;
}

function SceneContents({
  inputRef,
  positionRef,
  destinationRef,
  started,
  isClassic,
  activeSection,
  reduceMotion,
  onReady,
  onOpenSection,
  onSelectBuilding,
}: {
  inputRef: MutableRefObject<PlayerInput>;
  positionRef: MutableRefObject<Point2D>;
  destinationRef: MutableRefObject<MoveDestination | null>;
  started: boolean;
  isClassic: boolean;
  activeSection: string | null;
  reduceMotion: boolean;
  onReady: () => void;
  onOpenSection: (id: string) => void;
  onSelectBuilding: (building: CampusBuilding) => void;
}) {
  const palette = useScenePalette();
  const readySent = useRef(false);
  const paletteReady = Boolean(palette);
  const inputEnabled = started && !isClassic && !activeSection;

  useFrame(() => {
    if (paletteReady && !readySent.current) {
      readySent.current = true;
      onReady();
    }
  });

  if (!palette) return null;

  return (
    <>
      <color attach="background" args={[palette.sky]} />
      <ambientLight intensity={1.05} />
      <hemisphereLight color={palette.cream} groundColor={palette.grassShade} intensity={0.45} />
      <directionalLight
        position={[-5, 13, 8]}
        intensity={2.15}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={13}
        shadow-camera-bottom={-13}
        shadow-bias={-0.00015}
        shadow-radius={4}
      />
      <FollowCamera positionRef={positionRef} reduceMotion={reduceMotion} />
      <Island palette={palette} />
      <CampusPaths palette={palette} />
      <CampusGarden palette={palette} />
      <EntranceArch palette={palette} />
      {CAMPUS_BUILDINGS.map((building) => (
        <CampusBuildingModel
          key={building.id}
          building={building}
          palette={palette}
          interactive={!isClassic}
          onSelect={onSelectBuilding}
        />
      ))}
      <StudentCharacter
        inputRef={inputRef}
        positionRef={positionRef}
        destinationRef={destinationRef}
        palette={palette}
        enabled={inputEnabled}
        reduceMotion={reduceMotion}
        onOpenSection={onOpenSection}
      />
    </>
  );
}

function FollowCamera({
  positionRef,
  reduceMotion,
}: {
  positionRef: MutableRefObject<Point2D>;
  reduceMotion: boolean;
}) {
  const { camera, size } = useThree();
  const desired = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const position = positionRef.current;
    desired.current.set(position.x + 10, 12.5, position.z + 14);
    const speed = reduceMotion ? 18 : 4.7;
    camera.position.lerp(desired.current, 1 - Math.exp(-speed * Math.min(delta, 0.05)));
    lookAt.current.set(position.x, 0.65, position.z);
    camera.lookAt(lookAt.current);
    if (camera instanceof THREE.OrthographicCamera) {
      const zoom = Math.min(size.width, size.height) / 22;
      if (Math.abs(camera.zoom - zoom) > 0.01) {
        camera.zoom = zoom;
        camera.updateProjectionMatrix();
      }
    }
  }, -1);

  return null;
}

function Island({ palette }: { palette: ScenePalette }) {
  const patches = [
    [-3.9, 1.1, 1.45],
    [3.5, 4.7, 1.15],
    [2.2, -0.5, 1.25],
    [-1.8, -2.7, 1.15],
  ] as const;

  return (
    <group>
      <mesh position={[0, -0.54, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[9.55, 8.8, 0.86, 48]} />
        <meshStandardMaterial color={palette.earth} roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.98, 0]} castShadow>
        <cylinderGeometry args={[8.75, 7.5, 0.38, 40]} />
        <meshStandardMaterial color={palette.wood} roughness={0.94} />
      </mesh>
      {patches.map(([x, z, size]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.009, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[size, 18]} />
          <meshBasicMaterial color={palette.grassShade} transparent opacity={0.16} />
        </mesh>
      ))}
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        const radius = 8.8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <mesh key={index} position={[x, 0.16, z]} rotation={[0, angle, 0]}>
            <coneGeometry args={[0.2, 0.38, 5]} />
            <meshStandardMaterial color={palette.leaf} roughness={0.95} />
          </mesh>
        );
      })}
    </group>
  );
}

function PathSegment({
  start,
  end,
  width,
  palette,
}: {
  start: Point2D;
  end: Point2D;
  width: number;
  palette: ScenePalette;
}) {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const length = Math.hypot(dx, dz);
  const angle = Math.atan2(-dz, dx);
  const middleX = (start.x + end.x) / 2;
  const middleZ = (start.z + end.z) / 2;

  return (
    <group position={[middleX, 0.035, middleZ]} rotation={[0, angle, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[length, 0.08, width + 0.16]} />
        <meshStandardMaterial color={palette.pathEdge} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.048, 0]} receiveShadow>
        <boxGeometry args={[length - 0.08, 0.025, width]} />
        <meshStandardMaterial color={palette.path} roughness={0.9} />
      </mesh>
    </group>
  );
}

function CampusPaths({ palette }: { palette: ScenePalette }) {
  const routes = [
    { start: { x: 0, z: 7.8 }, end: { x: 0, z: -0.4 }, width: 1.12 },
    { start: { x: -0.2, z: 0.2 }, end: { x: -5.8, z: 0.9 }, width: 0.78 },
    { start: { x: -0.1, z: 0.1 }, end: { x: -2.3, z: -4.6 }, width: 0.76 },
    { start: { x: 0.2, z: 0.1 }, end: { x: 2.7, z: -4.6 }, width: 0.76 },
    { start: { x: 0.2, z: 0.1 }, end: { x: 5.6, z: 0.4 }, width: 0.78 },
    { start: { x: 0.2, z: 0.3 }, end: { x: 4.8, z: 3.5 }, width: 0.85 },
  ];

  return (
    <group>
      {routes.map((route, index) => <PathSegment key={index} {...route} palette={palette} />)}
      <mesh position={[0, 0.04, -0.05]} receiveShadow>
        <cylinderGeometry args={[1.1, 1.1, 0.08, 32]} />
        <meshStandardMaterial color={palette.path} roughness={0.85} />
      </mesh>
    </group>
  );
}

function Tree({ x, z, scale, palette }: { x: number; z: number; scale: number; palette: ScenePalette }) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.2, 0.96, 6]} />
        <meshStandardMaterial color={palette.wood} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.78, 0]} />
        <meshStandardMaterial color={palette.leaf} roughness={0.94} flatShading />
      </mesh>
    </group>
  );
}

function LampPost({ x, z, palette }: { x: number; z: number; palette: ScenePalette }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.77, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 1.54, 7]} />
        <meshStandardMaterial color={palette.navy} roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.59, 0]} castShadow>
        <boxGeometry args={[0.33, 0.17, 0.33]} />
        <meshStandardMaterial color={palette.yellow} emissive={palette.yellow} emissiveIntensity={0.28} />
      </mesh>
    </group>
  );
}

function CampusGarden({ palette }: { palette: ScenePalette }) {
  const trees = [
    { x: -7.45, z: 0.7, scale: 0.84 },
    { x: -4.6, z: -7.65, scale: 0.82 },
    { x: 1.1, z: -8.05, scale: 0.95 },
    { x: 7.65, z: -5.65, scale: 0.82 },
    { x: 7.75, z: 2.45, scale: 0.86 },
    { x: -4.25, z: 6.05, scale: 0.82 },
  ];
  const lamps = [
    { x: -1.8, z: 4.55 },
    { x: 1.8, z: 4.55 },
    { x: -1.55, z: -0.15 },
    { x: 1.65, z: -0.15 },
    { x: 0.1, z: -3.2 },
  ];

  return (
    <group>
      {trees.map((tree) => <Tree key={`${tree.x}-${tree.z}`} {...tree} palette={palette} />)}
      {lamps.map((lamp) => <LampPost key={`${lamp.x}-${lamp.z}`} {...lamp} palette={palette} />)}
    </group>
  );
}

function EntranceArch({ palette }: { palette: ScenePalette }) {
  return (
    <group position={[0, 0, 8.05]}>
      {[-1.62, 1.62].map((x) => (
        <mesh key={x} position={[x, 1.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.32, 2.4, 0.44]} />
          <meshStandardMaterial color={palette.orange} roughness={0.72} />
        </mesh>
      ))}
      <mesh position={[0, 2.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.7, 0.38, 0.48]} />
        <meshStandardMaterial color={palette.navy} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.13, 0]} receiveShadow>
        <boxGeometry args={[3.95, 0.22, 0.72]} />
        <meshStandardMaterial color={palette.path} roughness={0.9} />
      </mesh>
      <Html position={[0, 2.48, 0.28]} center distanceFactor={10}>
        <div className="arch-name">BRIGHTPATH CLASSES</div>
      </Html>
    </group>
  );
}

function CampusBuildingModel({
  building,
  palette,
  interactive,
  onSelect,
}: {
  building: CampusBuilding;
  palette: ScenePalette;
  interactive: boolean;
  onSelect: (building: CampusBuilding) => void;
}) {
  const wall = palette[building.tint] ?? palette.orange;
  return (
    <group position={[building.x, 0, building.z]}>
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[building.width + 0.16, 0.2, building.depth + 0.16]} />
        <meshStandardMaterial color={palette.pathEdge} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.91, 0]} receiveShadow castShadow>
        <boxGeometry args={[building.width, 1.55, building.depth]} />
        <meshStandardMaterial color={wall} roughness={0.82} />
      </mesh>
      <mesh position={[0, 1.98, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <coneGeometry args={[1.88, 0.8, 4]} />
        <meshStandardMaterial color={palette.navy} roughness={0.76} flatShading />
      </mesh>
      <mesh position={[0, 0.62, building.depth / 2 + 0.045]} castShadow>
        <boxGeometry args={[0.7, 1.06, 0.1]} />
        <meshStandardMaterial
          color={palette.yellow}
          emissive={palette.orange}
          emissiveIntensity={0.72}
          roughness={0.45}
        />
      </mesh>
      {[-0.76, 0.76].map((x) => (
        <mesh key={x} position={[x, 1.03, building.depth / 2 + 0.035]}>
          <boxGeometry args={[0.36, 0.4, 0.07]} />
          <meshStandardMaterial color={palette.window} emissive={palette.window} emissiveIntensity={0.18} />
        </mesh>
      ))}
      <Html position={[0, 2.67, 0]} center distanceFactor={10}>
        {interactive ? (
          <button
            className="world-label"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSelect(building);
            }}
            aria-label={`Walk to ${building.label}`}
          >
            <span>{building.label}</span>
            <MoveUpRight size={13} aria-hidden="true" />
          </button>
        ) : (
          <span className="world-label world-label-static">{building.label}</span>
        )}
      </Html>
    </group>
  );
}

function StudentCharacter({
  inputRef,
  positionRef,
  destinationRef,
  palette,
  enabled,
  reduceMotion,
  onOpenSection,
}: {
  inputRef: MutableRefObject<PlayerInput>;
  positionRef: MutableRefObject<Point2D>;
  destinationRef: MutableRefObject<MoveDestination | null>;
  palette: ScenePalette;
  enabled: boolean;
  reduceMotion: boolean;
  onOpenSection: (id: string) => void;
}) {
  const characterRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const elapsed = useRef(0);
  const doorLock = useRef(false);
  const { camera } = useThree();

  useEffect(() => {
    if (!enabled) destinationRef.current = null;
    if (!enabled) doorLock.current = false;
  }, [destinationRef, enabled]);

  useFrame((state, delta) => {
    const keys = inputRef.current.keys;
    const joystick = inputRef.current.joystick;
    const xAxis = (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0)
      - (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0)
      + joystick.x;
    const forwardAxis = (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0)
      - (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0)
      + joystick.z;

    direction.current.set(0, 0, 0);
    if (Math.hypot(xAxis, forwardAxis) > 0.01) {
      camera.getWorldDirection(forward.current);
      forward.current.y = 0;
      forward.current.normalize();
      right.current.set(-forward.current.z, 0, forward.current.x).normalize();
      direction.current.addScaledVector(forward.current, forwardAxis);
      direction.current.addScaledVector(right.current, xAxis);
      if (direction.current.lengthSq() > 1) direction.current.normalize();
    }

    const currentPosition = positionRef.current;
    let moving = false;
    if (enabled) {
      const result = moveCampusPlayer(
        currentPosition,
        { x: direction.current.x, z: direction.current.z },
        delta,
        destinationRef.current,
      );
      positionRef.current = result.position;
      moving = result.moving;

      let reachedId = result.reachedId;
      if (!reachedId) {
        const reachedBuilding = CAMPUS_BUILDINGS.find((building) => {
          const door = getDoorTarget(building);
          return Math.hypot(result.position.x - door.x, result.position.z - door.z) <= INTERACTION_RADIUS;
        });
        reachedId = reachedBuilding?.id ?? null;
      }
      if (reachedId && !doorLock.current) {
        doorLock.current = true;
        destinationRef.current = null;
        onOpenSection(reachedId);
      }
    }

    elapsed.current += delta;
    const character = characterRef.current;
    if (!character) return;
    const bob = reduceMotion ? 0 : Math.sin(state.clock.elapsedTime * (moving ? 11 : 3.5)) * (moving ? 0.045 : 0.03);
    character.position.set(positionRef.current.x, bob, positionRef.current.z);

    if (moving && direction.current.lengthSq() > 0.001) {
      const targetRotation = Math.atan2(direction.current.x, direction.current.z);
      let angleDifference = targetRotation - character.rotation.y;
      angleDifference = ((angleDifference + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      character.rotation.y += angleDifference * (1 - Math.exp(-12 * Math.min(delta, 0.05)));
    }

    const legSwing = moving && !reduceMotion ? Math.sin(elapsed.current * 11) * 0.48 : 0;
    if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;
  });

  return (
    <group ref={characterRef} position={[0, 0, 6.4]}>
      <group position={[0, 0, 0]}>
      <mesh position={[0, 0.57, -0.31]} castShadow>
          <boxGeometry args={[0.55, 0.66, 0.28]} />
        <meshStandardMaterial color={palette.wood} roughness={0.92} />
        </mesh>
        <mesh position={[0, 1.02, 0]} castShadow>
          <capsuleGeometry args={[0.37, 0.57, 4, 8]} />
        <meshStandardMaterial color={palette.teal} roughness={0.76} />
        </mesh>
        <mesh position={[0, 0.75, 0.06]} castShadow>
          <boxGeometry args={[0.64, 0.16, 0.46]} />
        <meshStandardMaterial color={palette.teal} roughness={0.76} />
        </mesh>
        <mesh position={[0, 1.77, 0.02]} castShadow>
          <sphereGeometry args={[0.43, 16, 12]} />
        <meshStandardMaterial color={palette.skin} roughness={0.88} />
        </mesh>
        <mesh position={[0, 2.08, -0.02]} castShadow>
          <sphereGeometry args={[0.46, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
        <meshStandardMaterial color={palette.navy} roughness={0.9} flatShading />
        </mesh>
        {[-0.14, 0.14].map((x) => (
          <mesh key={x} position={[x, 1.82, 0.39]}>
            <sphereGeometry args={[0.045, 8, 6]} />
          <meshStandardMaterial color={palette.navy} roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 1.02, 0.39]} castShadow>
          <boxGeometry args={[0.48, 0.1, 0.08]} />
        <meshStandardMaterial color={palette.yellow} roughness={0.7} />
        </mesh>
        <group ref={leftLegRef} position={[-0.16, 0.47, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.28, 3, 6]} />
            <meshStandardMaterial color={palette.navy} roughness={0.9} />
          </mesh>
        </group>
        <group ref={rightLegRef} position={[0.16, 0.47, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.28, 3, 6]} />
            <meshStandardMaterial color={palette.navy} roughness={0.9} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export function CampusExperience({
  started,
  isClassic,
  activeSection,
  onStart,
  onOpenSection,
}: {
  started: boolean;
  isClassic: boolean;
  activeSection: string | null;
  onStart: () => void;
  onOpenSection: (id: string) => void;
}) {
  const [sceneReady, setSceneReady] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const [destinationLabel, setDestinationLabel] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const inputRef = useRef<PlayerInput>({ keys: new Set(), joystick: { x: 0, z: 0 } });
  const positionRef = useRef<Point2D>({ x: 0, z: 6.4 });
  const destinationRef = useRef<MoveDestination | null>(null);
  const joystickRef = useRef<number | null>(null);
  const joystickOrigin = useRef({ x: 0, y: 0 });
  const [joystickOffset, setJoystickOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  const handleOpenSection = useCallback((id: string) => {
    destinationRef.current = null;
    setDestinationLabel(null);
    onOpenSection(id);
  }, [onOpenSection]);

  useEffect(() => {
    if (activeSection) {
      destinationRef.current = null;
      setDestinationLabel(null);
    }
  }, [activeSection]);

  useEffect(() => {
    if (!started || isClassic || activeSection) {
      inputRef.current.keys.clear();
      inputRef.current.joystick = { x: 0, z: 0 };
      setJoystickOffset({ x: 0, y: 0 });
      destinationRef.current = null;
      setDestinationLabel(null);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.code;
      if (!PLAYER_KEYS.has(key)) return;
      event.preventDefault();
      inputRef.current.keys.add(key);
      destinationRef.current = null;
      setDestinationLabel(null);
      setHintVisible(false);
    };
    const handleKeyUp = (event: KeyboardEvent) => inputRef.current.keys.delete(event.code);
    const clearKeys = () => inputRef.current.keys.clear();
    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearKeys);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearKeys);
      inputRef.current.keys.clear();
    };
  }, [activeSection, isClassic, started]);

  const walkTo = useCallback((building: CampusBuilding) => {
    if (!started) return;
    const target = getDoorTarget(building);
    destinationRef.current = { id: building.id, ...target };
    setDestinationLabel(building.label);
    setHintVisible(false);
  }, [started]);

  const updateJoystick = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    const maxDistance = 34;
    const dx = event.clientX - joystickOrigin.current.x;
    const dy = event.clientY - joystickOrigin.current.y;
    const distance = Math.hypot(dx, dy);
    const scale = distance > maxDistance ? maxDistance / distance : 1;
    const x = dx * scale;
    const y = dy * scale;
    setJoystickOffset({ x, y });
    inputRef.current.joystick = { x: x / maxDistance, z: -y / maxDistance };
    if (Math.hypot(x, y) > 4) {
      destinationRef.current = null;
      setDestinationLabel(null);
      setHintVisible(false);
    }
  }, []);

  const handleJoystickDown = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    joystickRef.current = event.pointerId;
    const bounds = event.currentTarget.getBoundingClientRect();
    joystickOrigin.current = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
    event.currentTarget.setPointerCapture(event.pointerId);
    updateJoystick(event);
  }, [updateJoystick]);

  const handleJoystickEnd = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (joystickRef.current !== event.pointerId) return;
    joystickRef.current = null;
    inputRef.current.joystick = { x: 0, z: 0 };
    setJoystickOffset({ x: 0, y: 0 });
  }, []);

  const showExploreHints = !isClassic && started && hintVisible && !activeSection;

  return (
    <section
      className={`campus-stage${isClassic ? " campus-stage-classic" : ""}`}
      aria-label="BrightPath Classes campus"
      data-scene-ready={sceneReady ? "true" : undefined}
    >
      <Canvas
        className="campus-canvas"
        shadows
        orthographic
        dpr={[1, 1.5]}
        camera={{ position: [10, 12.5, 14], zoom: 38, near: 0.1, far: 65 }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      >
        <Suspense fallback={null}>
          <SceneContents
            inputRef={inputRef}
            positionRef={positionRef}
            destinationRef={destinationRef}
            started={started}
            isClassic={isClassic}
            activeSection={activeSection}
            reduceMotion={reduceMotion}
            onReady={() => setSceneReady(true)}
            onOpenSection={handleOpenSection}
            onSelectBuilding={walkTo}
          />
        </Suspense>
      </Canvas>

      <div className={`campus-intro${isClassic ? " campus-intro-classic" : ""}`}>
        <p className="eyebrow">SECTOR 62 · NOIDA</p>
        <h1>BrightPath Classes</h1>
        <p>{isClassic ? "Small batches. Clear concepts. Brighter futures." : "A welcoming place to grow, learn and find your way."}</p>
        {isClassic ? <a className="intro-link" href="#classic-courses">Explore classes <MoveUpRight size={15} aria-hidden="true" /></a> : null}
      </div>

      {!isClassic ? (
        <>
          {started ? (
            <nav className="campus-guide" aria-label="Campus buildings">
              <p className="guide-heading">Visit a place</p>
              {CAMPUS_BUILDINGS.map((building) => (
                <button
                  className="guide-link"
                  key={building.id}
                  type="button"
                  onClick={() => walkTo(building)}
                  disabled={Boolean(activeSection)}
                >
                  <MapPin size={14} aria-hidden="true" />
                  <span>{building.label}</span>
                </button>
              ))}
            </nav>
          ) : null}

          {showExploreHints ? <p className="first-time-hint">Use arrow keys or tap a building.</p> : null}

          {destinationLabel && !activeSection ? (
            <div className="walking-status" role="status" aria-live="polite">
              <span className="walking-dot" aria-hidden="true" /> Walking to {destinationLabel}
              <button type="button" onClick={() => { destinationRef.current = null; setDestinationLabel(null); }} aria-label="Stop walking">Stop</button>
            </div>
          ) : null}

          {started ? (
            <button
              className="virtual-joystick"
              type="button"
              aria-label="Move student with the joystick"
              onPointerDown={handleJoystickDown}
              onPointerMove={(event) => { if (joystickRef.current === event.pointerId) updateJoystick(event); }}
              onPointerUp={handleJoystickEnd}
              onPointerCancel={handleJoystickEnd}
              onLostPointerCapture={handleJoystickEnd}
            >
              <span className="joystick-thumb" style={{ transform: `translate(calc(-50% + ${joystickOffset.x}px), calc(-50% + ${joystickOffset.y}px))` }} />
            </button>
          ) : null}

          {!sceneReady ? (
            <div className="campus-loading" role="status" aria-live="polite">
              <div className="loading-card">
                <p className="eyebrow">BRIGHTPATH CLASSES</p>
                <span>Preparing your campus…</span>
                <div className="loading-track" role="progressbar" aria-label="Campus loading progress" aria-valuemin={0} aria-valuemax={100}><span /></div>
              </div>
            </div>
          ) : !started ? (
            <div className="start-overlay">
              <div className="start-card" role="dialog" aria-modal="true" aria-labelledby="start-title">
                <p className="eyebrow">YOUR CAMPUS IS READY</p>
                <h2 id="start-title">Take a little look around.</h2>
                <p>Meet the team, explore the classes and see what makes BrightPath different.</p>
                <button className="button button-primary start-button" type="button" onClick={onStart}>
                  Start exploring <MoveUpRight size={16} aria-hidden="true" />
                </button>
                <p className="start-hint">Use arrow keys or tap a building.</p>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}