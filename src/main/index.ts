import { app, BrowserWindow, Tray, Menu } from 'electron'
import * as path from 'path'

let mainWindow: BrowserWindow | null;
let tray: Tray | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open BuildBlocks', click: () => mainWindow?.show() },
    { label: 'Quit', click: () => app.quit() },
  ]);
  
  if (tray) {
    tray.setToolTip('BuildBlocks');
    tray.setContextMenu(contextMenu);

    const menuBarWindow = new BrowserWindow({
      width: 300,
      height: 400,
      show: false,
      frame: false,
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/index.js'),
      },
    });

    menuBarWindow.loadFile(path.join(__dirname, '../menubar/menubar.html'));

    tray.on('click', () => {
      if (menuBarWindow.isVisible()) {
        menuBarWindow.hide();
      } else {
        const { x, y } = tray!.getBounds();
        menuBarWindow.setPosition(x - 150, y);
        menuBarWindow.show();
      }
    });
  }
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
}); 