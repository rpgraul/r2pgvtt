# Implementation Plan: Music Player

**Branch**: `002-music-player` | **Date**: 2026-04-08 | **Spec**: `specs/002-music-player/spec.md`
**Input**: Feature specification from `/specs/002-music-player/spec.md`

## Summary

Player de música colaborativo via YouTube com sincronização em tempo real usando Supabase Realtime. Mínima interação com banco de dados - estado sincronizado via websocket, apenas playlist persistida no Postgres.

## Technical Context

**Language/Version**: TypeScript + Svelte 5 (SvelteKit)  
**Primary Dependencies**: Supabase (Realtime + Postgres), YouTube IFrame API, Svelte 5 Runes  
**Storage**: PostgreSQL (Supabase) + Realtime subscriptions  
**Testing**: Manual testing (playwright se disponível)  
**Target Platform**: Web browser (modern JS)  
**Project Type**: Web application (SvelteKit)  
**Performance Goals**: Sincronização <500ms, UI responsiva  
**Constraints**: Sem download de áudio (YouTube embed), volume individual não sincronizado  
**Scale/Scope**: Same-game users (até ~10 por mesa), múltiplas mesas

## Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| Runes for state | ✅ PASS | Usar `$state`, `$derived`, `$effect` |
| No DOM manipulation | ✅ PASS | YouTube API via component wrapper |
| Props typed | ✅ PASS | Interface Props explícita |
| Tailwind CSS v4 | ✅ PASS | Tema Zinc-950 |
| Supabase Realtime | ✅ PASS | Sincronização de estado |
| Factory pattern | ✅ PASS | `init()`/`destroy()` para state modules |

**Verdict**: ✅ PASS — Feature segue Constitution

## Project Structure

### Documentation (this feature)

```text
specs/002-music-player/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Research results
├── data-model.md        # Phase 1: Database schema
├── quickstart.md        # Phase 1: Implementation guide
├── contracts/           # Phase 1: Interface contracts
└── tasks.md             # Phase 2: Task breakdown
```

### Source Code (repository root)

```text
public/
├── src/
│   ├── lib/
│   │   ├── supabase/        # Supabase client
│   │   └── state/
│   │       └── music.svelte.js  # Music player state module
│   ├── components/
│   │   ├── ui/              # Base UI components
│   │   └── player/          # Music player components
│   │       ├── MusicPlayer.svelte
│   │       ├── Playlist.svelte
│   │       ├── Controls.svelte
│   │       └── YouTubeEmbed.svelte
│   └── routes/
│       └── games/[id]/      # Game page with player
├── supabase/
│   └── migrations/          # Database migrations
└── package.json
```

**Structure Decision**: Player é feature integrada à página do jogo (`/games/[id]`). Componentes em `src/components/player/`, estado em `src/lib/state/music.svelte.js`.

## Research Required

### Phase 0: Research

| Topic | Questions to Answer |
|-------|---------------------|
| YouTube IFrame API | Como usar `seekTo()` para sincronizar posição? Como detectar `onStateChange` (quando música termina)? Como lidar com vídeos bloqueados por região/DRM? |
| Supabase Realtime Broadcast | Qual o nome do canal (game:${gameId})? Quem pode enviar (qualquer usuário autenticado na mesa)? Como reconectar automaticamente sem perder estado? |
| Player snapshots | Quantos snapshots guardar? Recomendação: upsert em {game_id} — um único registro por mesa, atualizado apenas quando playlist muda ou ao dar play/pause (com debounce ~2s). |

### Phase 1: Design

- [x] data-model.md: Schema para music_tracks, player_state
- [x] contracts/: Interface do state module
- [x] quickstart.md: Setup guide

---

## Architecture Decisions

### Broadcast vs DB Writes

| Ação | Mecanismo | Por quê |
|------|-----------|---------|
| Play/Pause/Skip | Broadcast apenas | Latência mínima, não precisa persistir |
| Add/Remove Track | Broadcast + Postgres | Playlist precisa persistir |
| Seek Position | Calculada via `started_at` | Sem write no banco |

### Fonte da Verdade

- **Último evento Broadcast é lei** (last-write-wins)
- **Banco é só para bootstrapping** de novos clientes
- Cliente que entra na mesa: busca playlist via Postgres, estado atual via Broadcast

### Auto-Advance

- Quando `onStateChange` detecta que vídeo terminou (state = 0), cliente que estava tocando broadcast um SKIP automático
- Deduplicação via timestamp para evitar múltiplos SKIP

### Estado Sincronizado (Broadcast)

```typescript
interface PlayerBroadcast {
  action: 'play' | 'pause' | 'skip';
  trackIndex: number;
  startedAt: number;  // Date.now() do momento que deu play
  timestamp: number; // para deduplicação
}
```

### Estado Persistido (Postgres)

```sql
-- music_tracks: playlist completa
-- player_state: {game_id, is_playing, current_index, updated_at}
  -- Atualizado APENAS quando playlist muda ou com debounce ~2s em play/pause
```