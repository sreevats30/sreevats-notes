# Deployment Rules for notes-sreevats

- The ONLY deployment route is Cloudflare Pages via Wrangler direct upload, using `npm run deploy` from the user's computer.
- Do NOT suggest, set up or add config for any other route: no Vercel, Netlify, GitHub Pages, GitHub Actions deploys, or Cloudflare Git integration. Do not create vercel.json, netlify.toml or workflow files.
- Do NOT run `wrangler login` or `npm run deploy`. The user runs those themselves.
- Do NOT commit anything under public/notes/.
- GitHub is only a code backup.
- If a task seems to need a different route, ask the user first instead of doing it.
