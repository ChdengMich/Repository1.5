import React, { useMemo } from 'react'
import * as THREE from 'three'

const Mountain: React.FC<{ position: [number, number, number], scale: [number, number, number], texture: THREE.Texture }> = ({ position, scale, texture }) => {
  return (
    <mesh position={position} scale={scale}>
      <coneGeometry args={[1, 2, 4]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

export const MountainRange: React.FC = () => {
  const mountainPositions = [
    [-24, 0, -14],
    [-22, 0, -16],
    [-20, 0, -18],
    [-18, 0, -20],
    [-16, 0, -22],
    [-14, 0, -24],
    [-12, 0, -22],
    [-10, 0, -20],
    [-8, 0, -18],
    [-6, 0, -16],
    [-4, 0, -14],
    [-2, 0, -12],
    [-20, 0, -10],
    [-18, 0, -12],
    [-16, 0, -11],
    [-14, 0, -13],
    [-12, 0, -10],
    [-10, 0, -12],
    [-8, 0, -11],
    [-6, 0, -13],
    [-4, 0, -10],
    [-2, 0, -12],
    // Additional positions for a more complete mountain range
    [-26, 0, -12],
    [-28, 0, -14],
    [-30, 0, -16],
    [-32, 0, -18],
    [-34, 0, -20],
    [-36, 0, -22],
    [-38, 0, -24],
    // Add mountains to the other side
    [24, 0, -14],
    [22, 0, -16],
    [20, 0, -18],
    [18, 0, -20],
    [16, 0, -22],
    [14, 0, -24],
    [12, 0, -22],
    [10, 0, -20],
    [8, 0, -18],
    [6, 0, -16],
    [4, 0, -14],
    [2, 0, -12]
  ]

  // Cache mountain scales
  const mountainScales = useMemo(() => 
    mountainPositions.map(() => {
      const baseSize = 2 + Math.random() * 2
      return [baseSize, baseSize * 1.5, baseSize] as [number, number, number]
    }), []
  )

  // Cache rock texture
  const rockTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const context = canvas.getContext('2d')
    if (context) {
      context.fillStyle = '#808080'
      context.fillRect(0, 0, 256, 256)
      for (let i = 0; i < 5000; i++) {
        const color = Math.random() * 60 + 100
        context.fillStyle = `rgb(${color}, ${color}, ${color})`
        context.fillRect(Math.random() * 256, Math.random() * 256, 2, 2)
      }
    }
    return new THREE.CanvasTexture(canvas)
  }, [])

  return (
    <group>
      {mountainPositions.map((position, index) => (
        <Mountain 
          key={index} 
          position={position as [number, number, number]} 
          scale={mountainScales[index]}
          texture={rockTexture}
        />
      ))}
    </group>
  )
}