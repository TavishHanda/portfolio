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

## Deploy

Pushing to `main` builds and deploys automatically (see `.github/workflows/deploy.yml`).
