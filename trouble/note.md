# 遇到问题解决问题

+ 快捷键保存页面上新建的文件没有文件路径
+ 快捷键保存文件报错
  TypeError: certificate must be an object
    at Object.showCertificateTrustDialog
+ 渲染进程中用到如Menu这类的模块，需要从主进程模块暴露出来
+ 调shell.showItemInFolder(filePath)会卡住
  在渲染进程发送事件，在主进程中监听事件再调showItemInFolder()

2. Checking your system

  ```txt
  ✖ When using pnpm, `node-linker` must be set to "hoisted" (or a custom
    `hoist-pattern` or `public-hoist-pattern` must be defined). Run `pnpm config
    set node-linker hoisted` to set this config value, or add it to your
    project's `.npmrc` file.
```

3. electron@npm:37.4.0 isn't supported by any available linker
yarn v2/v3 的 Plug'n'Play 模式）暂时不支持 Electron 37.4.0 这个版本的安装方式
切换到 yarn classic（v1）

```sh
yarn set version classic
yarn -v
```

## Electron Forge 不支持 PnP 和符号链接依赖项

打包 Electron 应用时，Forge 会抓取项目node_modules文件夹以收集要打包的依赖项。其模块解析算法比较简单，没有考虑符号链接依赖项，也没有考虑 Yarn 的即插即用 (PnP) 格式。
对于Yarn >=2，请使用nodeLinker: node-modules安装模式。
对于pnpm，需要在.npmrc设置node-linker=hoisted。

```sh
npx create-electron-app my-app --template=webpack
// template webpack/webpack-typescript/vite/vite-typescript
cd my-app
npm run start
npm run make
npm install --save-dev @electron-forge/publisher-github
npm run publish
```

自动导入现有项目

```sh
npm install --save-dev @electron-forge/cli
npx exec --package=@electron-forge/cli -c "electron-forge import"
```

手动设置

```sh
npm install --save-dev @electron-forge/cli @electron-forge/maker-zip @electron-forge/maker-deb @electron-forge/maker-rpm @electron-forge/maker-squirrel
```

package.json

```json
{
  "scripts": {
    "start": "electron-forge start",
    "package": "electron-forge package",
    "make": "electron-forge make",
    "publish": "electron-forge publish"
  },
  "config":{
    "forge": {
      "packagerConfig": {
        "icon": "src/assets/icon"
      },
      "makers": [
        {
          "name": "@electron-forge/maker-squirrel",
          "config": {
            "name": "my-app"
          }
        },
        {
          "name": "@electron-forge/maker-zip",
          "platform": ["darwin", "linux"],
        },
        {
          "name": "@electron-forge/maker-deb",
          "platform": ["linux"],
          "config": {
            "name": "my-app"
          }
        },
        {
          "name": "@electron-forge/maker-rpm",
          "platform": ["linux"],
          "config": {
            "name": "my-app"
          }
        }
      ]
    }
  },
  "devDependencies": {
    "@electron-forge/cli": "^6.0.0",
    "@electron-forge/maker-zip": "^6.0.0",
    "@electron-forge/maker-deb": "^6.0.0",
    "@electron-forge/maker-rpm": "^6.0.0",
    "@electron-forge/maker-squirrel": "^6.0.0"
  }
}
```

```sh
npx electron-forge init --template=webpack
npx electron-forge import
npx run package -- --arch="i32" // or
npx run electron-forge package --arch="i32"
npm run make -- --arch="i32,x64" // or
npx run electron-forge make --arch="i32"
npx run electron-forge publish -- --from-dry-run
npx run electron-forge start --enable-logging
```

@electron/packager  打包
@electron/osx-sign  签名
@electron/rebuild  重新构建node模块
@electron/universal  通用Mac版本

Forge与Builder的关系

+ 一旦 Electron 支持应用程序构建的新功能，Forge 将会利用这些功能。
+ 多包架构使其更易于理解和扩展。

[Electron-builder](https://www.electron.build/)
