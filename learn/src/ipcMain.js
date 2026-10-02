const { app, ipcMain, Menu, BrowserWindow } = require('electron');

ipcMain.on('msg', (e, msg) => {
  console.log('this is main thread >>', msg);
  e.sender.send('reply', '收到!');
});

ipcMain.on('syncMsg', (e, msg) => {
  console.log('from syncMsg:', msg);
  e.returnValue = '主进程收到！';
});

ipcMain.on('open', (e, msg) => {
  console.log('open: > ', msg);
  e.sender.send('open', 'bitch');
})

ipcMain.on('show-context-menu', (event) => {
  console.log(event, 'show-context-menu');
  const template = [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'Menu Item 1',
    click: () => { event.sender.send('context-menu-command', 'menu-item-1') }
  },
  { type: 'separator' },
  { label: 'Menu Item 2', type: 'checkbox', checked: true }
  ];

  const menu = Menu.buildFromTemplate(template);
  menu.popup({ window: BrowserWindow.getFocusedWindow()});
});
