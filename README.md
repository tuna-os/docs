# Website

This website uses [Docusaurus](https://docusaurus.io/), a modern generator
of static websites.

## Installation

```bash
yarn
```

All standard tasks (`install`, `build`, `test`, `lint`) are also available
via [`just`](https://github.com/casey/just) — see `just --list`.

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. The server shows most changes immediately. You do not have to start it again.

## Build

```bash
yarn build
```

This command writes the static content to the `build` directory. Any service
for static content can then serve it.

## Deployment

To deploy with SSH:

```bash
USE_SSH=true yarn deploy
```

To deploy without SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If GitHub Pages holds the site, this command builds the website and pushes it
to the `gh-pages` branch.
