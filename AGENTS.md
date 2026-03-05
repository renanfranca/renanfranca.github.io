# Repository Guidelines

## Project Structure

This repository is a Jekyll site with Tailwind/PostCSS-generated CSS.

- `_posts/`: Blog posts (name as `YYYY-MM-DD-title.md`).
- `_includes/`, `_layouts/`, `_data/`: Jekyll templates and data.
- `assets/`: Site assets.
  - `assets/css/tailwind.css`: Tailwind entrypoint.
  - `assets/css/style.css`: Built output (updated by PostCSS).
  - `assets/fonts/`, `assets/icons/`, `assets/images/`: Static assets.
- `css/`, `js/`, `img/`: Additional static files served as-is.
- `_config.yml`: Jekyll configuration.
- `portfolio/`, `redirect/`: Extra pages/content.

## Build, Test, And Development Commands

- Prereqs: Node `>=22` (see `package.json`). For local serving, prefer Docker; Ruby/Bundler is only needed if you run Jekyll outside Docker.
- `npm install`: Install Node dependencies (required for CSS builds).
- `docker compose up`: Start Jekyll dev server (http://localhost:4000) with live reload and run the Tailwind watch service (requires `node_modules` present).
- `npm run build:css`: Build CSS for development.
- `npm run build:css:prod`: Build minified/production CSS.
- `npm run build:css:watch` / `npm run build:css:prod:watch`: Rebuild CSS on change.
- `npm run prettier:check`: Verify formatting.
- `npm run prettier:format`: Auto-format the repo.

There is no dedicated automated test suite in this repo today; validate changes by running the site locally and checking affected pages.

## Coding Style & Naming Conventions

- Indentation: 2 spaces (`.editorconfig`).
- Formatting: Prettier (`printWidth: 140`, `singleQuote: true`). Pre-commit runs `lint-staged` to format changed files.
- Keep generated CSS in sync: if you edit Tailwind config or `assets/css/tailwind.css`, rebuild so `assets/css/style.css` matches.

## Commit & Pull Request Guidelines

Commit messages follow a Conventional Commits-style prefix based on `git log` history:

- Examples: `feat: add rss feed subscription button`, `style: update list styling`, `docs: update blog post description`, `refactor: ...`, `chore: ...`

For pull requests:

- Describe what changed and why (link issues if applicable).
- Include screenshots for visual/layout changes.
- Keep PRs focused; avoid mixing content edits (posts) with layout/tooling changes unless necessary.
