const { Menu } = require('electron');

const meunTemplate = [
  {
    label: '打开'
  },
  {
    label: '保存'
  },
  {
    label: '退出'
  }
];

const menu = Menu.buildFromTemplate(meunTemplate);
Menu.setApplicationMenu(menu);