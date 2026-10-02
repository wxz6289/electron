const { ipcRenderer } = require('electron');

window.addEventListener('load', () => {
  console.log('loading...');
  const sendMsg = document.getElementById('sendMsg');
  const syncBtn = document.getElementById('syncBtn');

  sendMsg.addEventListener('click', () => {
    console.log('first message clicked');
    ipcRenderer.send('msg', 'this is from renderer');
  });

  ipcRenderer.on('reply', (e, msg) => {
    console.log('this is from renderer reply', msg);
  })

  syncBtn.addEventListener('click', () => {
    const respose = ipcRenderer.sendSync('syncMsg', 'this is from renderer sync');
    console.log(respose, '< this is from main thread sync');
    ipcRenderer.send('open', 'fuck');
  });

  ipcRenderer.on('open', (e, msg) => {
    console.log('on open', e, msg);
  });

  ipcRenderer.on('syncMsg', (msg) => {
    console.log('syncMsg event', msg);
  })
});


window.addEventListener('contextmenu', (e) => {
  console.log(e, 'context menu clicked');
  e.preventDefault()
  ipcRenderer.send('show-context-menu')
})
