# Portfolio

My personal site, built with [Astro](https://astro.build) and hosted on GitHub Pages.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:4321/portfolio.

## Add a project

Make a new Markdown file in `src/content/projects/`. Copy one of the existing files for the frontmatter fields. `order` decides where it shows up.

## Link preview image

`public/og.png` is what shows when the site is shared. It's a screenshot of the page at `/og`. To remake it after changing `src/pages/og.astro`:

```bash
npm run build
npx astro preview --port 4400
```

Then, in another terminal (PowerShell):

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --virtual-time-budget=6000 "--user-data-dir=$env:TEMP\og-edge" "--screenshot=$PWD\public\og.png" http://localhost:4400/portfolio/og/
```

## Deploy

Pushing to `main` builds and deploys automatically (see `.github/workflows/deploy.yml`).
