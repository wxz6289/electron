const { shell } = require('electron');

const links = document.querySelector('.links');
const errorMsg = document.querySelector('.error-message');
const newLinkForm = document.querySelector('.new-link-form');
const newLinkUrl = document.querySelector('.new-link-url');
const newLinkSubmitBtn = document.querySelector('.new-link-submit');
const clearBtn = document.querySelector('.clear-storage');

const parser = new DOMParser();

newLinkUrl.addEventListener('keyup', () => {
  newLinkSubmitBtn.disabled = !newLinkUrl.validity.valid;
});

newLinkForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const url = newLinkUrl.value;
  fetch(url)
    .then(validateResponse)
    .then(res => res.text())
    .then(parserResponse)
    .then(findTitle)
    .then((title) => storeLink(title, url))
    .then(clearForm)
    .then(renderLinks)
    .catch(error => handleResponseError(error, url))
})

links.addEventListener('click', (e) => {
  console.log(e.target, 'links click')
  if (e.target.href) {
    e.preventDefault();
    shell.openExternal(e.target.href);
  }
})

const clearForm = () => {
  newLinkUrl.value = '';
}

const parserResponse = (text) => {
  return parser.parseFromString(text, 'text/html');
}

const findTitle = (nodes) => nodes.querySelector('title').innerText;

const storeLink = (title, url) => {
  localStorage.setItem(url, JSON.stringify({ url, title }));
}

const getLinks = () => {
  return Object.keys(localStorage).map((key) => JSON.parse(localStorage.getItem(key)));
}

const convertToElement = ({ title, url}) => {
  return `
  <div class="link">
  <h3>
    <a href="${url}" title="${title}">
      ${title}
    </a>
    </h3>
  </div>
  `
}

const validateResponse = (response) => {
  if (response.ok) return response;
  throw new Error(`Status code of ${response.status} ${response.statusText}`)
}

const handleResponseError = (error, url) => {
  console.log(error, 'e')
  errorMsg.textContent = `
    The ${url}: ${error.message}
  `.trim();
  setTimeout(() => errorMsg.textContent = '', 5000);
}

const renderLinks = () => {
  const linkNodes = getLinks().map(convertToElement).join('');
  links.innerHTML = linkNodes;
}

renderLinks()


clearBtn.addEventListener('click', () => {
  localStorage.clear();
  links.innerHTML = '';
});