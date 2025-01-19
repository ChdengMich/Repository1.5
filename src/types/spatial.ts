// Define world dimensions and zones
export const WORLD = {
  RADIUS: 50,          // Total world radius
  CENTER: [0, 0, 0],   // World center point
  GRID: {
    SIZE: 10,          // 10x10 buildable grid
    CELL_SIZE: 1,      // 1 unit per cell
    START: [-5, 0, -5] // Grid starting corner
  },
  ZONES: {
    BUILDABLE: {
      RADIUS: 5,       // Central buildable zone radius
      HEIGHT: 0        // Base height for buildings
    },
    MOUNTAINS: {
      INNER_RADIUS: 15,
      OUTER_RADIUS: 25,
      MIN_HEIGHT: 2,
      MAX_HEIGHT: 5
    },
    CLOUDS: {
      INNER_RADIUS: 14,
      OUTER_RADIUS: 48,
      MIN_HEIGHT: 5.5,
      MAX_HEIGHT: 6.5,
      RINGS: 10
    }
  },
  LAYERS: {
    WATER: -0.5,
    GROUND: 0,
    GRID: 0.02,
    BUILDINGS: 0,
    CLOUDS: 6,
    MOUNTAINS: 0
  }
}

// Helper types for positions
export type WorldPosition = {
  x: number;
  y: number;
  z: number;
}

export type GridPosition = {
  x: number;
  z: number;
}

// Helper functions
export const worldToGrid = (pos: WorldPosition): GridPosition => ({
  x: Math.round(pos.x - WORLD.GRID.START[0]),
  z: Math.round(pos.z - WORLD.GRID.START[2])
})

export const gridToWorld = (pos: GridPosition): WorldPosition => ({
  x: pos.x + WORLD.GRID.START[0],
  y: WORLD.LAYERS.BUILDINGS,
  z: pos.z + WORLD.GRID.START[2]
})

export const isInBuildableZone = (pos: WorldPosition): boolean => {
  const distanceFromCenter = Math.sqrt(pos.x * pos.x + pos.z * pos.z)
  return distanceFromCenter <= WORLD.ZONES.BUILDABLE.RADIUS
}

export const isInMountainZone = (pos: WorldPosition): boolean => {
  const distanceFromCenter = Math.sqrt(pos.x * pos.x + pos.z * pos.z)
  return distanceFromCenter >= WORLD.ZONES.MOUNTAINS.INNER_RADIUS && 
         distanceFromCenter <= WORLD.ZONES.MOUNTAINS.OUTER_RADIUS
}

export const isInCloudZone = (pos: WorldPosition): boolean => {
  const distanceFromCenter = Math.sqrt(pos.x * pos.x + pos.z * pos.z)
  return distanceFromCenter >= WORLD.ZONES.CLOUDS.INNER_RADIUS && 
         distanceFromCenter <= WORLD.ZONES.CLOUDS.OUTER_RADIUS
} 