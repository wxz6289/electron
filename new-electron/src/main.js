import { app, BrowserWindow, ipcMain } from 'electron';
import { join, dirname } from 'path';
import {fileURLToPath} from 'node:url';

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(dirname(fileURLToPath(import.meta.url)), 'preload.mjs'),
      sandbox: false,
      contextIsolation: true,
    }
  });
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong');
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});