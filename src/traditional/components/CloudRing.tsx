import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cloud } from '@react-three/drei'
import * as THREE from 'three'
import { WORLD, isInCloudZone } from '../../types/spatial'

const StableCloudGroup = React.memo(({ 
  position, 
  rotation, 
  cloudProps 
}: { 
  position: [number, number, number],
  rotation: number,
  cloudProps: Array<{
    position: [number, number, number],
    opacity: number,
    scale: number
  }>
}) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {cloudProps.map((props, index) => (
        <Cloud 
          key={index}
          position={props.position}
          opacity={props.opacity}
          scale={props.scale}
          speed={0}
          segments={40}
          seed={index}
        />
      ))}
    </group>
  )
}, (prev, next) => {
  // Only re-render if position or rotation changes significantly
  return prev.position[0] === next.position[0] &&
         prev.position[1] === next.position[1] &&
         prev.position[2] === next.position[2] &&
         Math.abs(prev.rotation - next.rotation) < 0.001
})

const CloudGroup: React.FC<{ 
  position: [number, number, number], 
  rotation: number,
  isPlacingBuilding: boolean,
  cloudProps: Array<{
    position: [number, number, number],
    opacity: number,
    scale: number
  }>
}> = ({ position, rotation, isPlacingBuilding, cloudProps }) => {
  const group = useRef<THREE.Group>(null)
  const rotationState = useRef(rotation)

  useFrame((state) => {
    if (group.current) {
      // Slow down rotation by reducing multiplier from 0.03 to 0.002
      rotationState.current = rotation + state.clock.getElapsedTime() * 0.002
      group.current.rotation.y = rotationState.current
    }
  })

  return (
    <group ref={group}>
      <StableCloudGroup 
        position={position}
        rotation={rotation}
        cloudProps={cloudProps}
      />
    </group>
  )
}

export const CloudRing: React.FC<{ isPlacingBuilding: boolean }> = ({ isPlacingBuilding }) => {
  const generateCloudPositions = () => {
    const positions: Array<[number, number, number]> = []
    
    const ringsSpacing = (WORLD.ZONES.CLOUDS.OUTER_RADIUS - WORLD.ZONES.CLOUDS.INNER_RADIUS) / WORLD.ZONES.CLOUDS.RINGS

    for (let ring = 0; ring < WORLD.ZONES.CLOUDS.RINGS; ring++) {
      const radius = WORLD.ZONES.CLOUDS.INNER_RADIUS + (ring * ringsSpacing)
      const numCloudsInRing = Math.floor(24 + (ring * 8))
      
      for (let i = 0; i < numCloudsInRing; i++) {
        const angle = (i / numCloudsInRing) * Math.PI * 2
        
        const radiusRandomFactor = ring < 2 ? 0.2 : 0.5
        const angleRandomFactor = ring < 2 ? 0.2 : 0.5
        
        const radiusNoise = (Math.random() - 0.5) * ringsSpacing * radiusRandomFactor
        const angleNoise = (Math.random() - 0.5) * (Math.PI / numCloudsInRing) * angleRandomFactor
        
        const finalRadius = radius + radiusNoise
        const finalAngle = angle + angleNoise
        
        const x = Math.cos(finalAngle) * finalRadius
        const z = Math.sin(finalAngle) * finalRadius
        const y = WORLD.LAYERS.CLOUDS + (Math.random() - 0.5)
        
        if (Math.abs(x) < 7.5 && Math.abs(z) < 7.5) continue
        
        positions.push([x, y, z])
      }
    }

    return positions
  }

  // Cache cloud positions and ALL cloud properties at once
  const { cloudPositions, allCloudProps } = useMemo(() => {
    const positions = generateCloudPositions()
    
    // Generate all cloud properties for all positions at once
    const props = positions.map(() => 
      Array.from({ length: 5 }).map(() => ({
        position: [
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 5
        ] as [number, number, number],
        opacity: 0.5 + Math.random() * 0.3,
        scale: 0.6 + Math.random() * 0.4
      }))
    )

    return { cloudPositions: positions, allCloudProps: props }
  }, []) // Empty dependency array means this only runs once

  return (
    <>
      {cloudPositions.map((position, index) => (
        <CloudGroup
          key={index}
          position={position}
          rotation={(index / cloudPositions.length) * Math.PI * 2}
          isPlacingBuilding={isPlacingBuilding}
          cloudProps={allCloudProps[index]} // Pass the pre-generated props for this group
        />
      ))}
    </>
  )
}

