# Project Guide: notes-sreevats

## Deployment rules

- The ONLY deployment route is Cloudflare Pages via Wrangler direct upload, using `npm run deploy` from my computer.
- Do NOT suggest, set up or add config for any other route: no Vercel, Netlify, GitHub Pages, GitHub Actions deploys, or Cloudflare Git integration. Do not create vercel.json, netlify.toml or workflow files.
- Do NOT run `wrangler login` or `npm run deploy`. I run those myself.
- Do NOT commit anything under public/notes/.
- GitHub is only a code backup.
- If a task seems to need a different route, ask me first instead of doing it.

---

## How to deploy (Wrangler Direct Upload)

1. Run `npx wrangler login` once and approve in the browser.
2. Run `npm run deploy`. The first time, Wrangler asks to create the Pages project; accept.
3. Open the `.pages.dev` URL it prints and test on a phone.
4. After adding notes: update `src/data/notes.json`, then run `npm run deploy` again.
5. Keep backups of the original and watermarked PDFs outside this repo.
