import React, { useState } from 'react'
import { Settings, Clock, Lock } from 'lucide-react'

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'apps' | 'schedule' | 'settings'>('apps')

  return (
    <div className="h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">App Blocker</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('apps')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === 'apps' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <Lock className="w-5 h-5 mr-2" />
            Blocked Apps
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === 'schedule' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <Clock className="w-5 h-5 mr-2" />
            Schedule
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === 'settings' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'apps' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Blocked Applications</h2>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Add Application
                </button>
              </div>
              {/* App list will go here */}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              <h2 className="text-lg font-medium mb-4">Block Schedule</h2>
              {/* Schedule settings will go here */}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-lg font-medium mb-4">Settings</h2>
              {/* Settings will go here */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 