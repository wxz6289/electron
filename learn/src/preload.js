const os = require('node:os');
const {readFile } = require('node:fs');
// const { contextBridge, ipcRenderer } = require('electron');
/*
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping')
}) */

readFile('./src/styles/main.css', 'utf-8', (error, content) => {
  console.log('read:', content)
})
console.log(os.arch(), os.type(), 'arch', __dirname, __filename)

window.addEventListener('DOMContentLoaded', () => {
  /*  const replaceText = (selector, text) => {
     const element = document.getElementById(selector)
     if (element) element.textContent = text
   }

   for (const dependency of ['chrome', 'node', 'electron']) {
     replaceText(`${dependency}-version`, process.versions[dependency])
   } */
  const p = document.createElement('p');
  p.textContent = __filename + ' ' + os.type();
  document.body.append(p);
});

const showBtn = document.getElementById('show');
showBtn?.addEventListener('click', () => {
  alert(os.arch());
})