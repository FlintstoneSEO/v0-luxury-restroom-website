# Standalone admin application

The repository root `AGENTS.md` applies here. This is the future authenticated, noindex, Supabase-backed operations application, not a marketing site or a customer quote-token surface. During the foundation phase it has only an informational placeholder. The root Next.js admin remains the operational implementation; do not copy privileged routes or direct production traffic here until the approved extraction gates are met.

Skill priority for work in this app:

1. `.agents/skills/admin-workflow-safety/SKILL.md` for authentication, authorization, Supabase service role, quote/pricing/status actions, customer links, agreements, deposits, and providers.
2. `.agents/skills/application-redesign/SKILL.md` and the root implementation gate for substantial redesigns.
3. `.agents/skills/admin-ui-redesign/SKILL.md` for admin interaction and presentation.

These paths are relative to the repository root. Keep server-only credentials out of client components and never use UI visibility as authorization. Preserve noindex/no-store and existing customer workflow URL semantics.
