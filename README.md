# v0-luxury-restroom-website

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Planned split architecture

Signature Luxe is being migrated incrementally into two applications:

- `apps/web`: an Astro public marketing site managed through CloudCannon;
- the current root Next.js App Router application, retained unchanged during migration and ultimately focused on protected admin and customer workflows.

Supabase remains the operational source of truth. Quotes, customers, pricing, approval tokens, agreements, deposits, internal notes, and transactional state are not managed in CloudCannon.

The Astro application is currently a non-production foundation. Existing public URLs, quote links, admin routes, APIs, and production deployment remain on Next.js.

Migration documentation:

- [Current-state audit](docs/migration/current-state-audit.md)
- [Target architecture](docs/migration/target-architecture.md)
- [Public route map](docs/migration/public-site-route-map.md)
- [Customer workflow map](docs/migration/customer-workflow-map.md)
- [CloudCannon content model](docs/migration/cloudcannon-content-model.md)
- [Admin redesign plan](docs/migration/admin-redesign-plan.md)
- [Phased implementation plan](docs/migration/phased-implementation-plan.md)
- [Risk register](docs/migration/risk-register.md)
- [Phase 5 customer-workflow boundary](docs/migration/phase-5-customer-workflow-boundary.md)

## Customer workflow boundary

Quote requests, customer quote review, approval responses, calculations, agreements, deposits, and provider webhooks remain in Next.js during the Astro migration. Configure `PUBLIC_SITE_URL`, `ADMIN_APP_URL`, and `CUSTOMER_WORKFLOW_URL` as separate server-side origins before splitting deployments. The legacy `NEXT_PUBLIC_APP_URL` remains a temporary fallback.

The customer token page and `/api/quote/**` must be routed to the same Next.js deployment. See the Phase 5 boundary document for the full proxy and rollback contract.

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_BS55avDqKfFH9LXNrZtDEG6tWk25)

## Getting Started

Install dependencies with the repository package manager:

```bash
corepack pnpm install
```

Run the existing Next.js application:

```bash
corepack pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

Run the isolated Astro foundation:

```bash
corepack pnpm dev:web
```

Astro uses its default development port and currently exposes only the noindex migration pilot. Build applications independently with `corepack pnpm build` and `corepack pnpm build:web`.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/FlintstoneSEO/v0-luxury-restroom-website" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
