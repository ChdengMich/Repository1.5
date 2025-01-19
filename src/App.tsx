import React from 'react'
import { ErrorBoundary } from '../src/traditional/components/ErrorBoundary'
import { IslandBuilder } from '../src/traditional/components/IslandBuilder'

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <IslandBuilder />
    </ErrorBoundary>
  )
} 