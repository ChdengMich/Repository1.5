import React from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { ThreeEvent } from '@react-three/fiber'

interface GridProps {
  onPlaceBlock: (x: number, z: number) => void
  isVisible: boolean
}

export const Grid: React.FC<GridProps> = ({ onPlaceBlock, isVisible }) => {
  const radius = 50
  const divisions = 50

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    const x = Math.round(event.point.x)
    const z = Math.round(event.point.z)
    onPlaceBlock(x, z)
  }

  if (!isVisible) return null

  return (
    <group position={[0, 0.01, 0]}>
      {[...Array(divisions + 1)].map((_, i) => (
        <React.Fragment key={i}>
          <Line
            points={[[-radius, 0, i - divisions / 2], [radius, 0, i - divisions / 2]]}
            color="rgba(0, 0, 0, 0.3)"
            lineWidth={1}
          />
          <Line
            points={[[i - divisions / 2, 0, -radius], [i - divisions / 2, 0, radius]]}
            color="rgba(0, 0, 0, 0.3)"
            lineWidth={1}
          />
        </React.Fragment>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={handleClick}>
        <cylinderGeometry args={[radius, radius, 0.1, 64]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  )
}

