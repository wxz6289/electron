const { app, ipcMain, shell, BrowserWindow, Menu, dialog } = require('electron');
const { readFile, writeFile, watch: watchFile } = require('node:fs/promises');
const createAppMenu = require('./app-menu');

require('@electron/remote/main').initialize()

const windowSet = new Set();
const openFiles = new Map();

const createWindow = () => {
  let x, y;
  const currentWindow = BrowserWindow.getFocusedWindow();
  if (currentWindow) {
    const [px, py] = currentWindow.getPosition();
    x = px + 20;
    y = py + 20;
  }
  let win = new BrowserWindow({
    x,
    y,
    width: 1000,
    height: 600,
    show: false,
    webPreferences: {
      contextIsolation: false, // 渲染进程中使用node api
      nodeIntegration: true,
  }
  });
  require("@electron/remote/main").enable(win.webContents);
  win.webContents.loadFile('./firesale/app/index.html');

  win.on('focus', createAppMenu);

  win.once('ready-to-show', () => {
    win.show();
    // getFileFromUser();
    // win.webContents.openDevTools();
  }).on('close', (async (e) => {
    if (win.isDocumentEdited) {
      e.preventDefault();
      const result = await dialog.showMessageBox(win, {
        type: 'warning',
        title: '有文件未保存，确定退出吗？',
        message: '你未保存的内容将会丢失！',
        buttons: [
          '确定',
          '取消'
        ],
        defaultId: 0,
        cancelId: 1
      });
      if (result.response === 0) win.destroy();
    }
  }))
    .on('closed', () => {
      windowSet.delete(win);
      stopWatchingFile(win);
      createAppMenu();
      win = null;
  });
  windowSet.add(win);
  return win;
}

const startWatchingFile =  async (tragetWindow, file) => {
  stopWatchingFile(tragetWindow);
  const ac = new AbortController();
  const { signal } = ac;
  const watcher = await watchFile(file, { signal });
  if (watcher.eventType == 'change') {
    const content = await readFile(file, 'utf-8');
    tragetWindow.webContents.send('file-changed', file, content);
  }
  openFiles.set(tragetWindow, ac);
}

const stopWatchingFile = (tragetWindow) => {
  if (openFiles.has(tragetWindow)) {
    openFiles.get(tragetWindow)?.abort();
    openFiles.delete(tragetWindow);
  }
};

const getFileFromUser = async (tragetWindow) => {
  const files =  await dialog.showOpenDialog(tragetWindow, {
    properties: ["openFile"],
    filters: [
      {
        name: "Text Files", extensions: ['txt'],
        name: "Markdown Files", extensions: ['md', "markdown"]
      }
    ]
  });
  if (!files) return;
  const filePath = files.filePaths[0];
  openFile(tragetWindow, filePath)
}

const openFile = async (tragetWindow, filePath) => {
  const content = await readFile(filePath, 'utf-8');
  app.addRecentDocument(filePath); // 向系统添加最近打开文档
  tragetWindow.setRepresentedFilename(filePath);
  tragetWindow.webContents.send('file-opened', filePath, content);
  createAppMenu();
  startWatchingFile(tragetWindow, filePath)
}

const saveHtml =  async (tragetWindow, content) => {
  const file = await dialog.showSaveDialog(tragetWindow, {
    title: '保存HTML文件',
    defaultPath: app.getPath('documents'),
    filters: [
      { name: 'HTML Files', extensions: ['html', 'htm'] }
    ]
  });
  if (!file) return;
  console.log(file, content, 'savehtml')
  // try {
  await writeFile(file.filePath, content);
  await openFile(tragetWindow, file);
  // } catch (e) {
  //   console.error(e, 'e');
  // }
}

const saveMarkdown = async (targetWindow, filePath, content) => {
  if (!filePath) {
    const result = await dialog.showSaveDialog(targetWindow, {
      title: '保存文件',
      message: '保存新建文件',
      defaultPath: app.getPath('documents'),
      filters: [
        { name: "Markdown Files", extensions: ['md', 'markdown'] }
      ]
    });
    if (result.canceled) return;
    filePath = result.filePath;
  }
  console.log(content, filePath, 'save')
  await writeFile(filePath, content);
  targetWindow.webContents.send('save-markdown-success', true);
}



app.whenReady().then(() => {
  Menu.setApplicationMenu(createAppMenu());
  createWindow();
  // 窗口无法在 ready 事件前创建
  app.on('activate', (event, hasVisibleWindows) => { // 仅MacOS触发activate事件
    // hasVisibeWindows => BrowserWindow.getAllWindows()
    if (!hasVisibleWindows) {
      createWindow()
    }
  });
});

app.on('will-finish-launching', () => {
  app.on('open-file', (event, file) => {
    const window = createWindow();
    window.once('ready-to-show', () => {
      openFile(window, file);
    });
  });
})
  .on('window-all-closed', () => {
  // macOS 无窗口继续运行
  /* if (process.platform !== 'darwin') { // 所有窗口关闭，让应用驻留在Dock区域
    app.quit()
  } */
}).on('closed', () => {
  console.log('app closed');
})
  .on('error', (e) => {
  console.error(e);
  });

ipcMain.on('showItemInFolder', (e, filePath) => {
  console.log('showItemInFolder click');
  shell.showItemInFolder(filePath);
})

module.exports = {
  Menu,
  createWindow,
  getFileFromUser,
  openFile,
  saveHtml,
  saveMarkdown
}