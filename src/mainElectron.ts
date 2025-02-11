import { app, BrowserWindow } from 'electron';
import * as path from 'path';

// Variables
let mainWindow: BrowserWindow | null;
const isDev = process.env['NODE_ENV'] === 'development';

// Configuración de hot reload solo en desarrollo
if (isDev) {
  const electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');
  require('electron-reload')(__dirname, {
    electron: electronPath,
    awaitWriteFinish: true, // Espera hasta que los cambios sean estables
    forceHardReset: true, // Reinicia completamente el proceso
  });
}

// Función para crear la ventana principal
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:4200'); // Angular dev server
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html')); // Angular build
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// Eventos del ciclo de vida de Electron
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (!mainWindow) createWindow();
});
