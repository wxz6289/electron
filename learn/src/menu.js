const { Menu, BrowserWindow } = require('electron');

const menusTemplate = [
  {
    label: '打开',
    click(e) {
      BrowserWindow.getFocusedWindow().webContents.send('open', 'open menu');
      console.log(e, '打开')
    }
  }
];

const menus = Menu.buildFromTemplate(menusTemplate)
Menu.setApplicationMenu(menus);