import React, { Suspense, useState, useRef, useEffect } from 'react'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber'
import { PerspectiveCamera, Sky, Sparkles, shaderMaterial, OrbitControls, Line } from '@react-three/drei'
import * as THREE from 'three'
import { Island } from './Island'
import { MountainRange } from './MountainRange'
import { CloudRing } from './CloudRing'
import { ShopPanel } from './ShopPanel'
import { Building, RoadType, DecorationType, PlaceableItem } from '../../types'
import { buildings, roads, decorations } from '../../types'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { WORLD, worldToGrid, gridToWorld, isInBuildableZone } from '../../types/spatial'

// Declare the water material for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      waterMaterial: any;
    }
  }
}

const WaterMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0.0, 0.1, 0.2),
  },
  // vertex shader
  `
    varying vec2 vUv;
    void main() {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectionPosition = projectionMatrix * viewPosition;
      gl_Position = projectionPosition;
      vUv = uv;
    }
  `,
  // fragment shader
  `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      vec3 waterColor = vec3(0.0, 0.1, 0.2);
      vec3 finalColor = mix(waterColor, color, 0.5);
      float wave = sin(uv.x * 10.0 + time) * 0.1 + sin(uv.y * 8.0 - time) * 0.1;
      finalColor += wave * 0.1;
      gl_FragColor = vec4(finalColor, 0.9);
    }
  `
)

extend({ WaterMaterial })

const Water: React.FC = () => {
  const ref = useRef<any>()
  useFrame((state) => {
    if (ref.current) {
      ref.current.time = state.clock.getElapsedTime()
    }
  })
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[1000, 1000]} />
      <waterMaterial ref={ref} />
    </mesh>
  )
}

// Add this new interface
interface Tile {
  x: number;
  z: number;
  isOccupied: boolean;
  hasCloud: boolean;
}

const BuildGrid: React.FC<{
  isVisible: boolean
}> = ({ isVisible }) => {
  const [gridOpacity, setGridOpacity] = useState(0.5)
  const gridSize = 10

  useFrame(() => {
    setGridOpacity(prev => 0.5 + Math.sin(Date.now() * 0.003) * 0.3)
  })

  if (!isVisible) return null

  return (
    <group position={[WORLD.GRID.START[0] - 0.5, 0.52, WORLD.GRID.START[2] - 0.5]}>
      {/* Horizontal lines */}
      {Array.from({ length: gridSize + 1 }).map((_, i) => (
        <Line
          key={`h${i}`}
          points={[[0, 0, i], [gridSize, 0, i]]}
          color="#ffffff"
          opacity={gridOpacity}
          transparent
          lineWidth={3}
          renderOrder={1}
        />
      ))}
      {/* Vertical lines */}
      {Array.from({ length: gridSize + 1 }).map((_, i) => (
        <Line
          key={`v${i}`}
          points={[[i, 0, 0], [i, 0, gridSize]]}
          color="#ffffff"
          opacity={gridOpacity}
          transparent
          lineWidth={3}
          renderOrder={1}
        />
      ))}
    </group>
  )
}

const BuildingPreview: React.FC<{
  building: PlaceableItem,
  position: THREE.Vector3,
  canPlace: boolean
}> = ({ building, position, canPlace }) => {
  const height = building.size[1]
  const offset = building.size[0] > 1 ? 0.5 : 0
  const snappedPosition = new THREE.Vector3(
    Math.round(position.x) + offset,
    height / 2,
    Math.round(position.z) + offset
  )

  return (
    <group>
      <mesh position={snappedPosition}>
        <boxGeometry args={[
          building.size[0],
          building.size[1] * 2,
          building.size[2]
        ]} />
        <meshStandardMaterial 
          color={canPlace ? '#00ff00' : '#ff0000'} 
          opacity={0.6} 
          transparent
          emissive={canPlace ? '#003300' : '#330000'} 
          emissiveIntensity={0.2}
        />
      </mesh>

      <mesh 
        position={[snappedPosition.x, 0.02, snappedPosition.z]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[building.size[0], building.size[2]]} />
        <meshBasicMaterial 
          color={canPlace ? '#00ff00' : '#ff0000'} 
          opacity={0.4} 
          transparent 
        />
      </mesh>
    </group>
  )
}

const PlacedBuilding: React.FC<{
  building: PlaceableItem,
  position: THREE.Vector3
}> = ({ building, position }) => {
  const height = building.size[1]
  const offset = building.size[0] > 1 ? 0.5 : 0
  return (
    <mesh position={[position.x + offset, height / 2, position.z + offset]}>
      <boxGeometry args={[
        building.size[0],
        building.size[1] * 2,
        building.size[2]
      ]} />
      <meshStandardMaterial color={building.color} />
    </mesh>
  )
}

// Add proper type for buildMode
interface BuildMode {
  active: boolean;
  selectedBuilding: PlaceableItem | null;
  cursorPosition: THREE.Vector3;
  canPlace: boolean;
}

const BuildModeManager: React.FC<{
  buildMode: BuildMode;
  setBuildMode: React.Dispatch<React.SetStateAction<BuildMode>>;
  placedBuildings: Array<{id: string; position: THREE.Vector3; building: PlaceableItem}>;
}> = ({ buildMode, setBuildMode, placedBuildings }) => {
  const { camera } = useThree()

  // Move checkCanPlaceBuilding inside useEffect to include in dependencies
  useEffect(() => {
    const checkCanPlaceBuilding = (position: THREE.Vector3): boolean => {
      if (!buildMode.selectedBuilding) return false

      // Check if within 10x10 grid bounds (-5 to 4 on both x and z)
      if (position.x < -5 || position.x > 4 || 
          position.z < -5 || position.z > 4) {
        return false
      }

      // Check for collisions with existing buildings
      const hasCollision = placedBuildings.some(({ position: existingPos, building }) => {
        const dx = Math.abs(position.x - existingPos.x)
        const dz = Math.abs(position.z - existingPos.z)
        return dx < (buildMode.selectedBuilding!.size[0] + building.size[0]) / 2 &&
               dz < (buildMode.selectedBuilding!.size[2] + building.size[2]) / 2
      })

      return !hasCollision
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!buildMode.active || !buildMode.selectedBuilding) return

      const canvas = event.target
      if (!(canvas instanceof HTMLCanvasElement)) return

      const rect = canvas.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2(x, y)
      
      raycaster.setFromCamera(mouse, camera)
      
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0))
      const intersectPoint = new THREE.Vector3()
      
      if (raycaster.ray.intersectPlane(groundPlane, intersectPoint)) {
        const snappedPos = new THREE.Vector3(
          Math.round(intersectPoint.x),
          0,
          Math.round(intersectPoint.z)
        )

        setBuildMode(prev => ({
          ...prev,
          cursorPosition: snappedPos,
          canPlace: checkCanPlaceBuilding(snappedPos)
        }))
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [buildMode.active, buildMode.selectedBuilding, camera, setBuildMode, placedBuildings])

  return null
}

const CameraController: React.FC<{ isPlacingBuilding: boolean }> = ({ isPlacingBuilding }) => {
  const { camera, gl } = useThree()
  const [isDragging, setIsDragging] = useState(false)
  const lastPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const cameraOffset = useRef<THREE.Vector3>(new THREE.Vector3())
  const zoomLevel = useRef<number>(15)

  const minZoom = 50
  const maxZoom = 8

  useEffect(() => {
    const canvas = gl.domElement

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 || e.button === 1) {  // Left or middle click
        setIsDragging(true)
        lastPosition.current = { x: e.clientX, y: e.clientY }
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const deltaX = e.clientX - lastPosition.current.x
      const deltaY = e.clientY - lastPosition.current.y

      cameraOffset.current.x -= deltaX * 0.02
      cameraOffset.current.z -= deltaY * 0.02

      lastPosition.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoomLevel.current = Math.max(maxZoom, Math.min(minZoom, zoomLevel.current + e.deltaY * 0.02))
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)
    canvas.addEventListener('wheel', handleWheel)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [gl, isDragging])

  useFrame(() => {
    const targetPosition = new THREE.Vector3(0, 0, 0).add(cameraOffset.current)
    const angle = Math.PI * 0.3
    const height = Math.sin(angle) * zoomLevel.current
    const distance = Math.cos(angle) * zoomLevel.current

    camera.position.set(
      targetPosition.x,
      height,
      targetPosition.z + distance
    )
    camera.lookAt(targetPosition)
  })

  return null
}

export const IslandBuilder: React.FC = () => {
  const [buildMode, setBuildMode] = useState<BuildMode>({
    active: false,
    selectedBuilding: null,
    cursorPosition: new THREE.Vector3(),
    canPlace: false
  })
  const [placedBuildings, setPlacedBuildings] = useState<Array<{
    id: string;
    position: THREE.Vector3;
    building: PlaceableItem;
  }>>([])
  const [isShopOpen, setIsShopOpen] = useState(false)
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)

  const handleSelectBuilding = (buildingId: string) => {
    const building = buildings.find((b: Building) => b.id === buildingId) ||
                    roads.find((r: RoadType) => r.id === buildingId) ||
                    decorations.find((d: DecorationType) => d.id === buildingId)
    
    if (building) {
      setBuildMode({
        active: true,
        selectedBuilding: building,
        cursorPosition: new THREE.Vector3(),
        canPlace: false
      })
      setIsShopOpen(false)
    }
  }

  const handleClick = (event: React.MouseEvent) => {
    if (buildMode.active && buildMode.selectedBuilding && buildMode.canPlace) {
      const newBuilding = {
        id: `${buildMode.selectedBuilding.id}-${Date.now()}`,
        position: buildMode.cursorPosition.clone(),
        building: buildMode.selectedBuilding
      }

      setPlacedBuildings(prev => [...prev, newBuilding])
      
      setBuildMode({
        active: false,
        selectedBuilding: null,
        cursorPosition: new THREE.Vector3(),
        canPlace: false
      })
    }
  }

  return (
    <div className="fixed inset-0 w-screen h-screen" onClick={handleClick}>
      <Canvas style={{ background: '#000000' }}>
        <Suspense fallback={null}>
          <CameraController isPlacingBuilding={buildMode.active} />
          
          <ambientLight intensity={0.4} />
          <directionalLight
            castShadow
            position={[2.5, 8, 5]}
            intensity={1.8}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <hemisphereLight 
            intensity={0.4}
            color="#ffffff"
            groundColor="#000000"
          />

          <Island />
          <MountainRange />
          <CloudRing isPlacingBuilding={buildMode.active} />
          <Water />
          
          {placedBuildings.map((placedBuilding) => (
            <PlacedBuilding
              key={placedBuilding.id}
              building={placedBuilding.building}
              position={placedBuilding.position}
            />
          ))}

          <Sparkles 
            count={400}
            scale={[60, 60, 60]} 
            size={1}
            speed={0.3}
            color="#ffffff"
            opacity={0.6}
          />
          
          <BuildGrid isVisible={buildMode.active} />
          
          {buildMode.active && buildMode.selectedBuilding && (
            <BuildingPreview 
              building={buildMode.selectedBuilding}
              position={buildMode.cursorPosition}
              canPlace={buildMode.canPlace}
            />
          )}

          <EffectComposer>
            <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} />
          </EffectComposer>

          <BuildModeManager 
            buildMode={buildMode} 
            setBuildMode={setBuildMode}
            placedBuildings={placedBuildings}
          />
        </Suspense>
      </Canvas>

      <ShopPanel 
        onSelectBuilding={handleSelectBuilding} 
        onClose={() => setIsShopOpen(false)}
        isOpen={isShopOpen}
        setIsOpen={setIsShopOpen}
      />

      {buildMode.active && buildMode.selectedBuilding && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
          Click on any green tile to place {buildMode.selectedBuilding.name}
        </div>
      )}
    </div>
  )
}