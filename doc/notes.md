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

- 窗口管理
- 应用程序生命周期管理
- 与渲染进程通信

Electron的主进程是一个拥有着完全的操作系统访问权限的 Node.js 环境。

主进程的首要目的是使用 BrowserWindow 模块创建和管理应用程序窗口。BrowserWindow 类的每个实例创建一个应用程序窗口，且在单独的渲染器进程中加载一个网页。在主进程中用 window 的 webContents 对象与网页内容进行交互。

## 渲染进程

负责 渲染 网页内容。
每个 Electron 应用都会为每个打开的 BrowserWindow ( 与每个网页嵌入 ) 生成一个单独的渲染器进程。
渲染进程默认跑在网页页面上，而并非 Node.js里。

Electron 的主进程和渲染进程有着清楚的分工并且不可互换。可以使用 Electron 的 ipcMain 模块和 ipcRenderer 模块来进行进程间通信。

## 预加载脚本

预加载（preload）脚本包含了那些执行于渲染器进程中，且先于网页内容开始加载的代码 。
预加载脚本与浏览器共享同一个全局 Window 接口，并且可以访问 Node.js API。
默认沙盒化。将 Electron 的不同类型的进程桥接在一起,增强渲染器。运行在具有 HTML DOM 和 Node.js、Electron API 的有限子集访问权限的环境中。

通过预加载脚本从渲染器访问Node.js, 预加载脚本在渲染器进程加载之前加载，并有权访问两个 渲染器全局 (例如 window 和 document) 和 Node.js 环境。

在BrowserWindow 构造器中将路径中的预加载脚本传入 webPreferences.preload 选项

预加载脚本可访问的API：

- 部分 Node.js API（如 `fs`, `path`，但受限于 `contextIsolation` 和 `sandbox` 配置）
- Electron 渲染进程 API（如 `ipcRenderer`、`contextBridge`）
- HTML DOM API（如 `window`、`document`）
- 通过 `contextBridge` 暴露的自定义安全 API
- 受限的全局对象（如 `process`，但部分属性可能不可用）

> 预加载脚本运行环境受 `webPreferences` 配置影响，推荐使用 `contextBridge` 安全地暴露功能给页面脚本。

## 主线程调用渲染线程函数

主线程无法直接调用渲染线程中的函数，但可以通过进程间通信（IPC）实现。主线程使用 `webContents.send` 发送消息，渲染线程监听并执行对应函数。

**主进程示例：**

```js
// main.js
win.webContents.send('invoke-renderer-func', arg);
```

**渲染进程示例：**

```js
// renderer.js
const { ipcRenderer } = require('electron');
ipcRenderer.on('invoke-renderer-func', (event, arg) => {
  myRendererFunction(arg);
});

function myRendererFunction(data) {
  // 处理主线程请求
}
```

如需获取返回值，可使用 `ipcRenderer.invoke` 和 `ipcMain.handle` 实现异步调用（推荐用于主线程调用渲染线程函数时返回结果）。

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

## 数据持久化

- indexedDB/localStorage
- SQLite

## 版本同步

```bash
npm install --save-dev @electron/rebuild
pnpm add sqlite3 knex
```

## 打包应用

[@electron/packager](https://www.npmjs.com/package/@electron/packager)
@electron/rebuild
@electron/packager

[electron builder](https://www.electron.build/)

- 代码签名
- 多平台分发
- 自动更新

## electron forge

```bash
npm init electron-app@latest my-app -- --template=webpack|webpack-typescript|vite|vite-typescript
```

导入已有项目

```bash
pnpm add -D @electron-forge/cli
pnpm  exec electron-forge import
```

手动配置

```bash
cd my-app
npm install --save-dev @electron-forge/cli @electron-forge/maker-squirrel @electron-forge/maker-deb @electron-forge/maker-zip
```

## asar

```bash
# 查看asar文件
pnpm add -D  @electron/asar
pnpm exec  asar e release/0.0.0/mac-arm64/YourAppName.app/Contents/Resources/app.asar  achive-test
```

档案文件格式 将多个文件打包在一起，文件头部是一个JSON对象，其中包含每个被打包文件的位置和长度。应用启动时会将整个文件加载入内存，Node引入档案文件中的文件速度会有很大的提高，还能解决文件路径太长的问题。

## 测试

[selenium-webdriver](https://github.com/SeleniumHQ/selenium)
[WebdriverIO](https://webdriver.io/)
[ChromeDriver](https://sites.google.com/chromium.org/driver)
Spectron 已废弃

## 工具函数

```bash
npm i electron-util
```
