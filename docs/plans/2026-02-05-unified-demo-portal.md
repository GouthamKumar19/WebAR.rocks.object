# Unified Demo Portal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build and deploy a single landing page that lists every WebAR.rocks.object example and links to the working demos on a public host.

**Architecture:** Serve the existing static demos directly from the repository tree, add a new `/site/index.html` portal with structured metadata, and surface the React/Vite demo via its production build. Deploy the whole tree to GitHub Pages using a workflow so updates auto-publish.

**Tech Stack:** Plain HTML/CSS/JS, existing vanilla demos, Vite/React build output, GitHub Actions for deployment.

---

### Task 1: Inventory all demo entry points

**Files:**
- Modify: `README.md:93-124` (reference only)

**Step 1: List static demo folders**

Run: `ls demos`
Expected: directories like `appearance`, `cat`, `debugDetection`, `threejs`, `webxr`, `webxrCoffee`.

**Step 2: List sub-demos needing deep links**

Run: `find demos -name index.html`
Expected: relative paths to each playable example (e.g., `demos/threejs/ARCoffee/index.html`). Save this list for the portal JSON.

**Step 3: List modern stack demos**

Run: `ls reactViteThreeFilberDemos/webar-object-demos`
Expected: standard Vite project files (`package.json`, `src`, etc.). Note that this one needs a build step before deployment.

**Step 4: Capture helper/demo descriptions**

Skim each demo README (e.g., `demos/cat/README.md` if present) or infer from folder names to craft user-friendly labels/descriptions for the portal cards.

### Task 2: Create the landing portal with metadata-driven cards

**Files:**
- Create: `site/index.html`
- Create: `site/styles.css`
- Create: `site/demos.json`
- Create: `site/main.js`

**Step 1: Scaffold `site/` folder**

Run: `mkdir -p site`
Expected: `site` directory exists alongside `demos/`.

**Step 2: Author `site/demos.json` metadata**

Add JSON entries per demo, e.g.:
```json
[
  {
    "id": "debug-detection",
    "title": "Debug Detection",
    "description": "Minimal camera feed detector for CUP/CHAIR/BICYCLE/LAPTOP",
    "path": "demos/debugDetection/index.html",
    "tags": ["vanilla", "camera"],
    "status": "stable"
  }
]
```
Include every static demo and the React build (pointing to `reactViteThreeFilberDemos/webar-object-demos/dist/index.html`).

**Step 3: Build `site/index.html` shell**

Create semantic layout with hero, filter controls, and a container for cards rendered by JS. Example skeleton:
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>WebAR.rocks.object Demos</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header>
    <h1>WebAR.rocks.object Demo Hub</h1>
    <p>Select any card to launch the live example.</p>
    <input id="search" placeholder="Filter demos..." />
  </header>
  <main id="demoGrid" class="grid"></main>
  <script src="main.js" type="module"></script>
</body>
</html>
```

**Step 4: Style cards in `site/styles.css`**

Implement responsive grid + basic dark theme:
```css
body { font-family: system-ui; background:#050505; color:#f8f8f2; margin:0; }
.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:1.5rem; padding:2rem; }
.card { background:#111; border:1px solid #2c2c2c; border-radius:16px; padding:1.5rem; box-shadow:0 10px 30px rgba(0,0,0,.35); }
.card a { display:inline-flex; margin-top:1rem; color:#7ee787; text-decoration:none; }
```

**Step 5: Implement `site/main.js`**

Fetch JSON, render cards, wire search/filter:
```js
async function init(){
  const demos = await fetch('demos.json').then(r=>r.json());
  const grid = document.getElementById('demoGrid');
  const search = document.getElementById('search');
  const render = (term='')=>{
    const frag = document.createDocumentFragment();
    demos
      .filter(d=>d.title.toLowerCase().includes(term) || d.tags.some(t=>t.includes(term)))
      .forEach(d=>{
        const card = document.createElement('article');
        card.className='card';
        card.innerHTML = `<h2>${d.title}</h2><p>${d.description}</p>`+
          `<a href="/${d.path}" target="_blank" rel="noopener">Open Demo →</a>`;
        frag.appendChild(card);
      });
    grid.replaceChildren(frag);
  };
  render();
  search.addEventListener('input', e=>render(e.target.value.toLowerCase()));
}
init();
```
Confirm paths are relative so hosting at repo root works.

### Task 3: Produce production assets for the React/Vite demo

**Files:**
- Modify: `reactViteThreeFilberDemos/webar-object-demos/package-lock.json`
- Modify: `reactViteThreeFilberDemos/webar-object-demos/dist/**`

**Step 1: Install dependencies**

Run: `cd reactViteThreeFilberDemos/webar-object-demos && npm install`
Expected: `node_modules/` populated; no audit errors blocking install.

**Step 2: Build production bundle**

Run: `npm run build`
Expected: Vite outputs `dist/` with static assets (HTML/CSS/JS). Inspect `dist/index.html` to ensure asset paths are relative.

**Step 3: Ensure build is committed**

Since GitHub Pages will serve static assets, track `dist/` (if ignored remove from `.gitignore` or relocate to `site/react`). Update `site/demos.json` entry to point at `reactViteThreeFilberDemos/webar-object-demos/dist/index.html`.

### Task 4: Configure GitHub Pages deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Create workflow file**

Contents:
```yaml
name: Deploy demos
on:
  push:
    branches: [ main ]
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: 'pages'
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install React demo deps
        working-directory: reactViteThreeFilberDemos/webar-object-demos
        run: npm ci && npm run build
      - name: Upload static site
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```
This publishes the repo root (including `site/`).

**Step 2: Enable Pages**

In GitHub UI (Settings → Pages), set source to "GitHub Actions" (one-time manual step). Document this requirement in PR description.

### Task 5: Verify everything end-to-end

**Files:**
- Test: `site/index.html`

**Step 1: Serve locally**

Run: `npx http-server -c-1 .`
Expected: `http://127.0.0.1:8080/site/index.html` loads the card grid and all links open demos in new tabs.

**Step 2: Smoke test each demo**

Click every card and confirm assets load (camera prompts will appear where applicable). For the React build, ensure Vite assets load correctly without dev server warnings.

**Step 3: Validate Pages deployment**

After pushing to `main`, open the GitHub Pages URL from the workflow summary. Confirm `/site/index.html` renders, search filters work, and each link hits the hosted demos (camera access requires HTTPS, which Pages provides).

**Step 4: Commit and push**

Run:
```bash
git add site reactViteThreeFilberDemos/webar-object-demos/dist .github/workflows/deploy.yml docs/plans/2026-02-05-unified-demo-portal.md
git commit -m "feat: add unified demo portal and deploy via Pages"
git push origin main
```
Expected: CI workflow triggers and publishes the site.

---
Plan complete and saved to `docs/plans/2026-02-05-unified-demo-portal.md`. Two execution options:

1. Subagent-Driven (this session) – I’ll dispatch a fresh subagent per task, reviewing between tasks for fast iteration.
2. Parallel Session – Open a new session with executing-plans for batch execution and checkpoints.

Which approach?
