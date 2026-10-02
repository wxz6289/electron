const information = document.getElementById('info')
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`

versions.ping().then((response) => {
  console.log(response, 'from main process');
}).catch((error) => {
  console.error('Error during ping:', error);
});
