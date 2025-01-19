import * as THREE from 'three'

// Interfaces
export interface Building {
    id: string
    name: string
    type: 'residential' | 'commercial' | 'industrial' | 'special'
    cost: number
    buildTime: string
    size: [number, number, number]
    color: string
}

export interface PlacedBuildingType {
    id: string
    position: THREE.Vector3
    building: Building
}

export interface RoadType {
    id: string
    name: string
    cost: number
    color: string
    size: [number, number, number]
}

export interface DecorationType {
    id: string
    name: string
    cost: number
    color: string
    size: [number, number, number]
}

// Building Data
export const buildings: Building[] = [
    {
        id: 'house',
        name: 'House',
        type: 'residential',
        cost: 100,
        buildTime: '30s',
        size: [1, 1, 1],
        color: '#8BC34A'
    },
    {
        id: 'blacksmith',
        name: 'Blacksmith',
        type: 'commercial',
        cost: 250,
        buildTime: '1m',
        size: [2, 1, 1],
        color: '#FF9800'
    },
    {
        id: 'townhall',
        name: 'Town Hall',
        type: 'special',
        cost: 1000,
        buildTime: '5m',
        size: [2, 2, 2],
        color: '#9C27B0'
    },
    {
        id: 'market',
        name: 'Market',
        type: 'commercial',
        cost: 300,
        buildTime: '1m 30s',
        size: [2, 1, 2],
        color: '#FFEB3B'
    },
    {
        id: 'library',
        name: 'Library',
        type: 'special',
        cost: 500,
        buildTime: '3m',
        size: [2, 2, 2],
        color: '#3F51B5'
    }
]

// Roads Data
export const roads: RoadType[] = [
    { 
        id: 'straight_road', 
        name: 'Straight Road', 
        cost: 50, 
        color: '#78909C',
        size: [1, 0.1, 1]
    },
    { 
        id: 'curved_road', 
        name: 'Curved Road', 
        cost: 75, 
        color: '#78909C',
        size: [1, 0.1, 1]
    },
    { 
        id: 'intersection', 
        name: 'Intersection', 
        cost: 100, 
        color: '#78909C',
        size: [1, 0.1, 1]
    },
]

// Decorations Data
export const decorations: DecorationType[] = [
    { 
        id: 'tree', 
        name: 'Tree', 
        cost: 25, 
        color: '#4CAF50',
        size: [0.5, 1.5, 0.5]
    },
    { 
        id: 'fountain', 
        name: 'Fountain', 
        cost: 150, 
        color: '#03A9F4',
        size: [1, 1, 1]
    },
    { 
        id: 'statue', 
        name: 'Statue', 
        cost: 200, 
        color: '#BDBDBD',
        size: [0.5, 2, 0.5]
    },
]

// Component Props Interfaces
export interface PlacementGridProps {
    isVisible: boolean
    selectedBuilding: Building | null
    onPlaceBuilding: (x: number, z: number) => void
}

export interface BuildingPreviewProps {
    building: Building
    position: THREE.Vector3
}

export interface PlacedBuildingProps {
    building: Building
    position: THREE.Vector3
}

export type PlaceableItem = Building | RoadType | DecorationType;
  
  