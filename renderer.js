window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, window.versions[dependency]())
  }
});

/* const fn = async function () {
  const response = await window.versions.ping();
  console.log(response);
}

fn(); */