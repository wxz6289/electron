const { marked } = require('marked');
const remote = require('@electron/remote');
const { ipcRenderer, shell } = require('electron');
const { basename } = require('path');
const { getFileFromUser, openFile, saveHtml, saveMarkdown, createWindow, Menu } = remote.require('./main');
// window.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
const currentWindow = remote.getCurrentWindow();
const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newBtn = document.querySelector('#new');
const openBtn = document.querySelector('#open');
const saveMarkdownbtn = document.querySelector('#save-markdown');
const showBtn = document.querySelector('#show');
const defaultBtn = document.querySelector('#default');
const saveHtmlBtn = document.querySelector('#saveHtml');
const revertBtn = document.querySelector('#revert');

let filePath = null, originalContent = '';

['dragstart', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
  document.addEventListener(eventName, (e) => {
    e.preventDefault();
  });
});

const isChanged = (content) => content != originalContent;


const updateUserInterface = (isEdited) => {
  let title = 'Fire Sale';
  if (filePath) {
    title += ' - ' + basename(filePath);
  }
  if (isEdited) {
    title += '(Edited)'
  }
  currentWindow.setTitle(title);
  currentWindow.setDocumentEdited(isEdited);

  saveHtmlBtn.disabled = !isEdited;
  saveMarkdownbtn.disabled = !isEdited;
  revertBtn.disabled = !isEdited;
}

const renderMarkdownToHtml = (markdown) => {
  htmlView.innerHTML = marked(markdown, { sanitize: true });
}

const getDraggedFile = (e) => e.dataTransfer.items[0];
const getDroppedFile = (e) => e.dataTransfer.files[0];
const fileTypeIsSupported = (file) => ['','text/plain', 'text/markdown'].includes(file.type);

const renderFile = (file, content) => {
  filePath = file;
  originalContent = content;
  markdownView.value = content;
  renderMarkdownToHtml(content);

  showBtn.disabled = false;
  defaultBtn.disabled = false;
  updateUserInterface(false);
};

const showFile = () => {
  if (!filePath) {
    return alert('文件还未保存!');
  }
  ipcRenderer.send('showItemInFolder', filePath);
  // shell.showItemInFolder(filePath);
}

const openFileDefaultApp = () => {
  if (!filePath) {
    return alert('文件还未保存!');
  }
  shell.openPath(filePath);
}

showBtn.addEventListener('click', showFile);
defaultBtn.addEventListener('click', openFileDefaultApp);

markdownView.addEventListener('keyup', (e) => {
  const currentContent = e.target.value;
  renderMarkdownToHtml(currentContent);
  updateUserInterface(isChanged(currentContent));
});

markdownView.addEventListener('dragover', (e) => {
  const file = getDraggedFile(e);
  console.log('draggerover', file.type, fileTypeIsSupported(file))
  if (fileTypeIsSupported(file)) {
    markdownView.classList.add('drag-over');
  } else {
    markdownView.classList.add('drag-error');
  }
});

markdownView.addEventListener('dragleave', (e) => {
  markdownView.classList.remove('drag-over', 'drag-errror');
});

markdownView.addEventListener('drop', (e) => {
  const file = getDroppedFile(e);
  console.log(file, 'drag')
  if (fileTypeIsSupported(file)) {
      console.log(file.path, 'ddd')
      openFile(currentWindow, file.path);
    } else {
      alert('this file type is not supported!')
    }
    markdownView.classList.remove('drag-over', 'drag-error');
});

openBtn.addEventListener('click', () => {
  getFileFromUser(currentWindow);
});

newBtn.addEventListener('click', () => {
  createWindow();
});

saveHtmlBtn.addEventListener('click', () => {
  saveHtml(currentWindow, htmlView.innerHTML);
});

saveMarkdownbtn.addEventListener('click', () => {
  saveMarkdown(currentWindow, filePath, markdownView.value)
});

revertBtn.addEventListener('click', () => {
  markdownView.value = originalContent;
  saveMarkdown(currentWindow, filePath, originalContent);
  updateUserInterface();
})

ipcRenderer.on('file-opened', async(event, file, content) => {
  if (currentWindow.isDocumentEdited && isChanged(content)) {
    const result = await remote.dialog.showMessageBox(currentWindow, {
      type: 'warning',
      title: '覆盖未保存文件?',
      message: '在当前窗口打开的文件将覆盖你未保存的文件',
      buttons: ['是', '否'],
      defaultId: 0,
      cancelId: 1
    });

    if (result.response == 1) return;
  }
  renderFile(file, content);
  /* filePath = path;
  originalContent = content;
  markdownView.value = content;
  renderMarkdownToHtml(content);
  updateUserInterface();
  console.log("content:",path, content) */
})
  .on('file-changed', (e, file, content) => {
    const result = remote.dialog.showMessageBox(currentWindow, {
      type: 'warning',
      title: '覆盖当前未保存的文件？',
      message: '其他应用将改变当前文件',
      buttons: ['是', '否'],
      defaultId: 0,
      cancelId: 1
    });
    renderFile(file, content);
  })
  .on('save-markdown', (event) => {
    saveMarkdown(currentWindow, filePath, markdownView.value);
    console.log('save-markdown', event);
  })
  .on('save-markdown-success', (e, isSuccess) => {
    if (isSuccess) {
      saveMarkdownbtn.disabled = true;
    }
  })
  .on('save-html', () => {
    saveHtml(currentWindow, filePath, htmlView.innerHTML);
  })
  .on('show-file', showFile)
  .on('open-file-default', openFileDefaultApp)

const createMarkdownContentMenu = () => Menu.buildFromTemplate([
  {
    label: '打开文件',
    click(item, focusedWindow) {
      getFileFromUser(focusedWindow);
    }
  },
  {
    type: 'separator'
  },
  {
    label: '显示文件',
    click: showFile,
    enabled: !!filePath
  },
  {
    label: '使用默认程序打开',
    click: openFileDefaultApp,
    enabled: !!filePath
  },
  {
    label: '全选',
    role: 'selectall'
  },
  {
    label: '剪切',
    role: 'cut'
  },
  {
    label: '复制',
    role: 'copy'
  },
  {
    label: '粘贴',
    role: 'paste'
  }
]);

markdownView.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  createMarkdownContentMenu().popup();
});
