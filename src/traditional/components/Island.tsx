import React from 'react'
import * as THREE from 'three'
import { WORLD } from '../../types/spatial'

export const Island: React.FC = () => {
  return (
    <mesh 
      position={[0, -1.25, 0]}
      receiveShadow
      castShadow
    >
      <cylinderGeometry 
        args={[
          WORLD.ZONES.CLOUDS.OUTER_RADIUS - 2,
          WORLD.ZONES.CLOUDS.OUTER_RADIUS - 2,
          2.5,
          128
        ]} 
      />
      <meshStandardMaterial 
        color="#7BC043"  // Bright green
        side={2}
        roughness={0}
        metalness={0}
      />
    </mesh>
  )
} 