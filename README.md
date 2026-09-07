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

Pushes to `main` also run `.github/workflows/deploy-pages.yml`, which builds the site with the `/mindfizz-site/` path prefix and deploys it to GitHub Pages.

## Editing content

- Top-level pages live in `src/`.
- Case studies live in `src/work/`.
- Journal posts live in `src/insights/` as Markdown files. Copy an existing post and update its front matter to publish another.
- Shared navigation and business details live in `src/_data/site.json`.
- The shared page frame is `src/_includes/layouts/base.njk`.
- Design styles and behaviour live in `src/assets/`.
- Existing image and PDF assets remain in `img/`.

## Previous site

The previous single-page site is preserved unchanged as `legacy.html` and is copied to `/legacy.html` in every build. The original root `index.html` is also retained in the repository as historical source; Eleventy uses `src/index.njk` for the new homepage.

## Contact form

The build copies `mindfizz_contact.php` to the site root. Production hosting must continue to support PHP `mail()` for the form to send successfully.
