const { Menu, MenuItem, BrowserWindow, dialog } = require('electron');

const createAppMenu = () => {
  const { createWindow, getFileFromUser } = require('./main');
  const isMac = process.platform == 'darwin';
  const hasWindow = !BrowserWindow.getAllWindows().length;
  const focusedWindow = BrowserWindow.getFocusedWindow();
  const hasFilePath = !!(focusedWindow && focusedWindow.getRepresentedFilename());
  console.log('hasFilePath', hasFilePath);
  const Zoom = new MenuItem({
    label: '放大',
    accelerator: 'CmdOrCtrl++',
    role: 'zoom'
  });

  const title = 'Fire Sale';

  console.log(isMac)

  const template = [
    ...(isMac ? [
      {
        label: title,
        /*   submenu: [
            {
              label: `关于 ${title}`,
              role: 'about'
            },
            {
              type: 'separator', role: 'separator'
            },
            {
              label: '服务',
              role: 'services',
              submenu: []
            },
            { type: 'seperator' },
            {
              label: `隐藏 ${title}`,
              accelerator: 'Cmd+H',
              role: 'hide'
            },
            {
              label: '隐藏其他',
              accelerator: 'Cmd+Alt+H',
              role: 'hideothers'
            },
            {
              label: '显示',
              role: 'unhide'
            },
            {
              label: `退出 ${title}`,
              accelerator: 'CmdOrCtrl+Q',
              role: 'quit'
            }
          ] */
      }
    ] : []),
    {
      label: '文件',
      submenu: [
        {
          label: '打开新窗口',
          accelerator: 'CmdOrCtrl+N',
          click(item, focusedWindow) {
            createWindow();
          }
        },
        {
          label: '打开新文件',
          accelerator: 'CmdOrCtrl+O',
          click(item, focusWindow) {
            if (focusedWindow) {
              return getFileFromUser(focusedWindow);
            }
            const nWin = createWindow();
            nWin.on('show', () => {
              getFileFromUser(nWin);
            });
          }
        },
        {
          label: '保存文件',
          accelerator: 'CmdOrCtrl+S',
          enabled: hasWindow,
          click(item, win) {
            if (!win) {
              return dialog.showErrorBox('不能保存', '没有活跃的窗口');
            }
            win.webContents.send('save-markdown');
          }
        },
        {
          label: '导出HTML',
          accelerator: 'Shift+CmdOrCtrl+S',
          enabled: hasWindow,
          click(item, win) {
            if (!win) {
              return dialog.showErrorBox('不能保存', '没有活跃的窗口');
            }
            win.webContents.send('save-html');
          }
        },
        /* {
          type: 'seperator'
        }, */
        {
          label: '显示文件',
          accelerator: 'Shift+CmdOrCtrl+S',
          enabled: hasFilePath,
          click(item, foucusedWindow) {
            if (!foucusedWindow) {
              return dialog.showErrorBox('不能打开文件', '无窗口展示活跃的文档');
            }
            foucusedWindow.webContents.send('show-file');
          }
        },
        {
          label: '使用默认程序打开',
          accelerator: 'Shift+CmdOrCtrl+S',
          enabled: hasFilePath,
          click(item, foucusedWindow) {
            if (!foucusedWindow) {
              return dialog.showErrorBox('不能打开文件', '无窗口展示活跃的文档');
            }
            foucusedWindow.webContents.send('open-file-default');
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        {
          label: '恢复',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: '撤销',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          label: '全选',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        },
        {
          label: '剪切',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: '复制',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: '粘贴',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        }
      ]
    },
    {
      label: '窗口',
      submenu: [
        {
          label: '最小化',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: '关闭窗口',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        Zoom
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '开发者工具',
          accelerator: 'Cmd+D',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.toggleDevTools();
          }
        },
        {
          label: '更多信息',
          async click() {
            const { shell } = require('electron')
            await shell.openExternal('https://electronjs.org/zh/')
          }
        }
      ]
    }
  ];

  const windowMenu = template.find(m => m.label == '窗口');
  windowMenu.role = 'window';
  windowMenu.submenu.push({
    type: 'separator'
  }, {
    label: '全屏',
    role: 'front'
  })
  return Menu.buildFromTemplate(template);
}

module.exports = createAppMenu