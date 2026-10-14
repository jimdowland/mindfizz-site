# Mindfizz website

The new site is built with [Eleventy](https://www.11ty.dev/) and generates a fast, static multipage site in `_site/`.

## Run locally

```sh
npm install
npm start
```

Create a production build with:

```sh
npm run build
```

Deploy the contents of `_site/`, not the repository root.

Preview unpublished Insights drafts with:

```sh
npm run preview
```

This serves the site at `http://localhost:8125/` and builds into `_preview/`.
Draft posts have `draft: true` in their front matter and appear in preview
builds. Normal production builds exclude them. Preview pages
are marked `noindex`, and draft articles are excluded from the sitemap and
publication schema. `npm run build:preview` makes the same preview without
starting the server.

When a post is ready to publish, remove `draft: true` and set its publication
`date` before running a normal build.

Pushes to `main` also run `.github/workflows/deploy-pages.yml`, which builds
the draft preview with the `/mindfizz-site/` path prefix and deploys `_preview/`
to GitHub Pages. This review site includes the draft Insights posts so they can
be shared with colleagues. All preview pages carry `noindex` metadata; the
normal `npm run build` output remains suitable for a production launch.

## Editing content

- Top-level pages live in `src/`.
- Case studies live in `src/work/`.
- Journal posts live in `src/insights/` as Markdown files. Copy an existing post and update its front matter to publish another.
- Shared navigation and business details live in `src/_data/site.json`.
- The shared page frame is `src/_includes/layouts/base.njk`.
- Design styles and behaviour live in `src/assets/`.
- Existing image and PDF assets remain in `img/`.

## Previous site

The previous single-page site is preserved unchanged as `legacy.html` but is not published. The original root `index.html` is also retained in the repository as historical source; Eleventy uses `src/index.njk` for the new homepage.

## Contact form

The build copies `mindfizz_contact.php` to the site root. Production hosting must continue to support PHP `mail()` for the form to send successfully.
