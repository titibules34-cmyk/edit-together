# ChainTrace Recovery Compass

https://github.com/titibules34-cmyk/chaintrace-recovery-compass-b1969844 lets edit it

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5cb14fbb-adf3-4fd8-8f85-3629bf3cf640).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Deploy to Cloudflare Workers

This project uses the existing TanStack Start + Nitro Cloudflare Workers build. Keep the Lovable Vite preset in `vite.config.ts`; it supplies the project's TanStack, React, Tailwind, and Nitro plugins.

### Local preview

```sh
bun install
bun run preview:workers
```

### Deploy from your machine

Authenticate with Cloudflare once, then build and deploy:

```sh
bunx wrangler login
bun run deploy:workers
```

### Automatic GitHub deployment

The `.github/workflows/deploy-cloudflare-workers.yml` workflow runs tests and builds on pull requests and pushes to `main`. To enable automatic deployment, add these repository Actions secrets:

- `CLOUDFLARE_API_TOKEN`: an API token with permission to deploy Workers Scripts for the target account.
- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID.

The Nitro build generates the Worker entry point and static-assets configuration. Wrangler deploys that generated configuration; do not point the Worker directly at the source SSR entry file.

The compatibility date is pinned to `2026-08-03` because this repository's current Nitro Cloudflare preset emits the legacy Node.js compatibility flags. Keep that date until the Nitro preset is updated to emit flags compatible with newer Workers dates.

