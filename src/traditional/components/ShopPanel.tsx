import React, { useState } from 'react'
import { Store } from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Building, buildings, roads, decorations } from '../../types'

const BuildingPreview: React.FC<{ building: Building }> = ({ building }) => {
  return (
    <Canvas style={{ width: '100px', height: '100px' }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh position={[0, building.size[1] / 2, 0]}>
        <boxGeometry args={building.size} />
        <meshStandardMaterial color={building.color} />
      </mesh>
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  )
}

interface ShopPanelProps {
  onSelectBuilding: (buildingId: string) => void
  onClose: () => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export const ShopPanel: React.FC<ShopPanelProps> = ({ onSelectBuilding, onClose, isOpen, setIsOpen }) => {
  const [activeTab, setActiveTab] = useState('residential')

  const handleBuildingSelect = (buildingId: string) => {
    onSelectBuilding(buildingId)
    onClose()
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg bg-white hover:bg-gray-100 flex items-center justify-center"
      >
        <Store className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-lg p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Buildings & Structures</h2>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="flex space-x-2 mb-4 overflow-x-auto">
        {['residential', 'commercial', 'industrial', 'special', 'roads', 'decorations'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg ${
              activeTab === tab 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {activeTab !== 'roads' && activeTab !== 'decorations' && 
          buildings
            .filter(building => building.type === activeTab)
            .map(building => (
              <button
                key={building.id}
                className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center"
                onClick={() => handleBuildingSelect(building.id)}
              >
                <BuildingPreview building={building} />
                <div className="font-semibold mt-2">{building.name}</div>
                <div className="text-sm text-gray-600">
                  Cost: {building.cost} coins
                </div>
                <div className="text-xs text-gray-500">
                  Build time: {building.buildTime}
                </div>
              </button>
            ))}

        {activeTab === 'roads' && 
          roads.map(road => (
            <button
              key={road.id}
              className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center"
              onClick={() => handleBuildingSelect(road.id)}
            >
              <Canvas style={{ width: '100px', height: '100px' }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <mesh>
                  <boxGeometry args={[1, 0.1, 1]} />
                  <meshStandardMaterial color={road.color} />
                </mesh>
                <OrbitControls enableZoom={false} enablePan={false} />
              </Canvas>
              <div className="font-semibold mt-2">{road.name}</div>
              <div className="text-sm text-gray-600">
                Cost: {road.cost} coins
              </div>
            </button>
          ))}

        {activeTab === 'decorations' && 
          decorations.map(decoration => (
            <button
              key={decoration.id}
              className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center"
              onClick={() => handleBuildingSelect(decoration.id)}
            >
              <Canvas style={{ width: '100px', height: '100px' }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <mesh>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial color={decoration.color} />
                </mesh>
                <OrbitControls enableZoom={false} enablePan={false} />
              </Canvas>
              <div className="font-semibold mt-2">{decoration.name}</div>
              <div className="text-sm text-gray-600">
                Cost: {decoration.cost} coins
              </div>
            </button>
          ))}
      </div>
    </div>
  )
}