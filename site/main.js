async function fetchDemos() {
  const response = await fetch('demos.json');
  if (!response.ok) {
    throw new Error('Failed to load demos.json');
  }
  return response.json();
}

function createTagList(tags) {
  const container = document.createElement('div');
  container.className = 'tags';
  tags.forEach((tag) => {
    const chip = document.createElement('span');
    chip.className = 'tag';
    chip.textContent = tag;
    container.appendChild(chip);
  });
  return container;
}

function createCard(demo) {
  const article = document.createElement('article');
  article.className = 'card';

  const title = document.createElement('h2');
  title.textContent = demo.title;

  const status = document.createElement('span');
  status.className = 'status';
  status.textContent = demo.status;

  const desc = document.createElement('p');
  desc.textContent = demo.description;

  const link = document.createElement('a');
  const isAbsolute = /^https?:/i.test(demo.path);
  const normalizedPath = demo.path.replace(/^\/+/, '');
  link.href = isAbsolute ? demo.path : `../${normalizedPath}`;
  link.target = '_blank';
  link.rel = 'noreferrer noopener';
  link.textContent = 'Open demo →';

  article.append(title, status, desc, createTagList(demo.tags), link);
  return article;
}

function mountGrid(grid, demos, term = '') {
  const normalized = term.trim().toLowerCase();
  const fragment = document.createDocumentFragment();

  demos
    .filter((demo) => {
      if (!normalized) return true;
      return (
        demo.title.toLowerCase().includes(normalized) ||
        demo.description.toLowerCase().includes(normalized) ||
        demo.tags.some((tag) => tag.toLowerCase().includes(normalized))
      );
    })
    .forEach((demo) => fragment.appendChild(createCard(demo)));

  grid.replaceChildren(fragment);

  if (!fragment.childNodes.length) {
    const empty = document.createElement('p');
    empty.textContent = 'No demos match that filter. Try another keyword.';
    grid.appendChild(empty);
  }
}

async function init() {
  try {
    const demos = await fetchDemos();
    const grid = document.getElementById('demoGrid');
    const search = document.getElementById('search');
    mountGrid(grid, demos);
    search.addEventListener('input', (event) => {
      mountGrid(grid, demos, event.target.value);
    });
  } catch (error) {
    console.error(error);
    const grid = document.getElementById('demoGrid');
    grid.textContent = 'Unable to load demo list. Please refresh.';
  }
}

init();
