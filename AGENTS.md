# RPG VTT Project

## Estrutura

- `/public/` — Projeto SvelteKit completo (src, specs, supabase)
- Root contém apenas config de build (vite, netlify)

## Desenvolvimento

```bash
cd public
npm run dev     # localhost:5173
npm run build   # produção
biome format --write && biome lint  # lint
```

## Spec-Driven Development

Specs em `public/specs/`. Cada feature segue:
1. `specs/XXX-feature-name/spec.md`
2. `specs/XXX-feature-name/plan.md`
3. `public/src/` implementação

## Stack

- Svelte 5 (Runes)
- Supabase (Auth + Realtime)
- Tailwind v4
- Biome (lint/format)

## Deploy

Netlify: build command pointed to `public/`, publish `public/dist`