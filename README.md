# Seed4J Sample Application

## Prerequisites

### Node.js and NPM

Before you can build this project, you must install and configure the following dependencies on your machine:

[Node.js](https://nodejs.org/): We use Node to run a development web server and build the project.
Depending on your system, you can install Node either from source or as a pre-packaged bundle.

After installing Node, you should be able to run the following command to install development tools.
You will only need to run this command when dependencies change in [package.json](package.json).

```bash
npm install
```

## Local environment

<!-- seed4j-needle-localEnvironment -->

## Start up

```bash
docker compose up
```

The Jekyll site is available at `http://localhost:4000`.
Tailwind watch runs in the `tailwind` service started by Docker Compose.

<!-- seed4j-needle-startupCommand -->

## Corporate network / proxy

When you are in a corporate network that requires HTTP/HTTPS proxy:

If proxy variables are already exported in your OS/shell environment, Docker Compose will use them automatically and you do not need a `.env` file.

Check current proxy variables:

```bash
env | grep -i proxy
```

Use `.env` only if you want project-local values instead of global OS/shell values:

```bash
cp .env.example .env
```

Then fill proxy values in `.env`:

- `HTTP_PROXY`
- `HTTPS_PROXY`
- `NO_PROXY`
- `http_proxy`
- `https_proxy`
- `no_proxy`

Start containers:

```bash
docker compose up --force-recreate
```

When not on corporate network, you can remove `.env`:

```bash
rm -f .env
```

## Jekyll network parameters

These variables are supported by `docker-compose.yml`:

- `JEKYLL_BIND_HOST` (default: `0.0.0.0`) - bind address inside the container.
- `JEKYLL_PUBLISH_IP` (default: `127.0.0.1`) - host interface where ports are exposed.
- `JEKYLL_PORT` (default: `4000`) - published host port for Jekyll.
- `LIVERELOAD_PORT` (default: `35729`) - published host port for LiveReload.
- `JEKYLL_BROWSER_HOST` - informational value for your preferred browser URL host.

Recommended local defaults:

- Keep `JEKYLL_BIND_HOST=0.0.0.0`
- Keep `JEKYLL_PUBLISH_IP=127.0.0.1`
- Access via `http://localhost:4000`

## Troubleshooting

- If startup appears stuck, check logs:
  - `docker compose logs -f jekyll`
- If logs stop at `Fetching source index from https://rubygems.org/`, proxy/network is blocking gem download.
- Validate local service response:
  - `curl -I http://localhost:4000`
- If browser shows `Forbidden` but `curl` returns `200`, the block is likely from corporate proxy/browser policy, not Jekyll.

## Documentation

<!-- seed4j-needle-documentation -->
