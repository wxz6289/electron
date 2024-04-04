# Electron

Chromium Content Module + Node.js

Content Module提供了浏览器必备的核心功能，如渲染页面、GPU加速以及JS执行引擎,不包含浏览器插件、书签和浏览历史记录、自动填充、语言翻译等附加功能。

优势

- 无需考虑浏览器兼容性问题
- 重用现有技能,轻松实现跨平台开发
- 访问原生系统API,开发不受限于浏览器的功能
- 更高的运行权限，更少的限制
- 离线优先

1. 自动软件更新
2. 软件安装器
3. 应用分发
4. 错误上报

command + option + I 打开Dev调试

## 工作原理

- 主进程(1个) 管理应用状态(生命周期)、创建和管理渲染进程、与操作系统交互、协调应用中其他进程的运行 不能访问Web API(如DOM)
- 渲染进程(多个) 加载并渲染页面，响应用户操作 可以访问Node提供的绝大多数API，但不允许直接访问操作系统级别的API 渲染进程之间相互隔离

Electron相对于NW.js的区别
Electron采用多进程模型,内置错误报告和自动更新模块，默认支持FFmpeg库;而NW.js中所有页面窗口共享Node进程，没有内置错误报告和自动更新模块。
Electron Forge 构建发布Electron应用工具
项目创建

```bash
npx  create-electron-app electron-app
```

Electron目前对ESM支持还不完备

## 主进程

Electron的主进程是一个拥有着完全的操作系统访问权限的 Node.js 环境。

## 渲染进程

渲染进程默认跑在网页页面上，而并非 Node.js里。

Electron 的主进程和渲染进程有着清楚的分工并且不可互换。可以使用 Electron 的 ipcMain 模块和 ipcRenderer 模块来进行进程间通信。

## 预加载脚本

预加载脚本:默认沙盒化。将 Electron 的不同类型的进程桥接在一起,增强渲染器。运行在具有 HTML DOM 和 Node.js、Electron API 的有限子集访问权限的环境中。

通过预加载脚本从渲染器访问Node.js, 预加载脚本在渲染器进程加载之前加载，并有权访问两个 渲染器全局 (例如 window 和 document) 和 Node.js 环境。

在BrowserWindow 构造器中将路径中的预加载脚本传入 webPreferences.preload 选项

## app

管理应用生命周期和配置

- 应用退出、隐藏和显示
- 读取和设置应用配置
- 支持事件: before-quit、window-all-closed、browser-window-blur、browser-window-focus等

## BrowserWindow

创建渲染进程

- webContents 管理Web页面的生命周期,还代理一些window对象的方法
  - 支持事件 did-start-loading/did-stop-loading/dom-ready/blur/focus/resize/enter-full-screen/leave-full-screen
- loadFile() 加载文件到渲染进程
- `send()` 从主进程向渲染进程发送消息
- openDevTools() 打开开发者工具

## @electron/remote

主进程与渲染进程通信
remote对象是仅用于渲染进程的主进程代理对象，调用remote对象的方法或访问remote对象的属性，会向主进程发送同步消息，在主进程中执行相应的方法或取属性值，然后将结果发回渲染进程。
内置require()并不支持从一个进程向另外一个进程导入功能。remote.require()实现了在渲染进程中注入主进程提供的功能。

```js
// 主进程
require('@electron/remote/main').initialize()
require("@electron/remote/main").enable(win.webContents);
 win.webContents.send('channel',content);

// 渲染进程
const remote = require('@electron/remote');
const {getFileFromUser} = remote.require('./main');
const { ipcRenderer } = require('electron');
ipcRenderer.on('channel', (event, content) => {
})
```

## dialog

```js
dialog.showOpenDialog(options)
- properties 'openFile'|
- filters 过滤规则
  - name windows系统文件类型名
  - extensions 文件后缀类型
```

## ipcRenderer

在渲染进程中监听主进程广播的事件
