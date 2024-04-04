const { app, BrowserWindow, ipcMain } = require('electron');
const { join } = require('path');


const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // preload: join(__dirname, 'ipcRender.js')
            // preload: join(__dirname, 'preload.js'),
            // 在渲染进程中使用nodejs模块
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    win.webContents.loadFile('index.html')
    win.openDevTools();
    // console.log(win.webContents.isDevToolsOpened())
    // console.log(Object.getPrototypeOf(win.webContents), 'webContents', Object.getPrototypeOf(win))
    // require('../menu.js');
    // require('../ipcMain.js');

    // win.loadURL('http://localhost:8080/')
}

// 使用wenReady() 代替 on('ready')
app.whenReady().then(() => {
    createWindow();

    ipcMain.handle('ping', () => {
        return 'pong'
    })

    app.on('activate', () => {
        if (!BrowserWindow.getAllWindows().length) {
            createWindow()
        }
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
    })
    .on('browser-window-focus', (e) => {
        console.log('focus > ', e);
    })
    .on('browser-window-blur', (e) => {
        console.log('blur: ', e);
    })
    .on('before-quit', e => {
        console.log('before quit >', e)
    })
    .on('error', (e) => {
    console.error(e);
});
