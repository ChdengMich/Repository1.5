import { contextBridge } from 'electron'

// Export any APIs you want to expose to the renderer process
contextBridge.exposeInMainWorld('electron', {
  // Add any methods you need
}) 