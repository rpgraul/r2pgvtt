# Tasks: Music Player

**Input**: Design documents from `/specs/002-music-player/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks grouped by user story for independent implementation

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1-US5)
- Exact file paths included

---

## Phase 1: Database Setup

**Purpose**: Create tables and RLS policies for music player

- [ ] T001 [P] [Setup] Create migration SQL for `music_tracks` table in `supabase/migrations/002_music_player.sql`
- [ ] T002 [P] [Setup] Create migration SQL for `player_state` table with `started_at` field
- [ ] T003 [P] [Setup] Add RLS policies for `music_tracks` (any member can manage)
- [ ] T004 [P] [Setup] Add RLS policies for `player_state` (any member can read/update)
- [ ] T005 [Setup] Execute migration in Supabase and verify tables created

---

## Phase 2: State Module (Core Infrastructure)

**Purpose**: Create `music.svelte.js` - the core state module that handles all logic

- [ ] T006 [P] [Core] Create `src/lib/state/music.svelte.js` with factory pattern
- [ ] T007 [Core] Implement `init(gameId)` - loads playlist from DB, subscribes to Broadcast
- [ ] T008 [Core] Implement `destroy()` - cleans up channel and timers
- [ ] T009 [P] [Core] Implement `extractVideoId(url)` - regex for YouTube URLs
- [ ] T010 [Core] Implement `addTrack(url)` - inserts to DB, updates local state
- [ ] T011 [Core] Implement `removeTrack(trackId)` - deletes from DB, updates local state
- [ ] T012 [Core] Implement `play()` - Broadcast + debounced DB write
- [ ] T013 [Core] Implement `pause()` - Broadcast + debounced DB write
- [ ] T014 [Core] Implement `skip()` - Broadcast + debounced DB write
- [ ] T015 [Core] Implement `autoSkip()` - called when video ends
- [ ] T016 [Core] Implement volume via localStorage (`setVolume`, `getVolume`)
- [ ] T017 [Core] Handle incoming Broadcast messages in `handleBroadcast(payload)`

**Checkpoint**: State module complete - all business logic implemented

---

## Phase 3: User Story 1 - Adicionar Música (P1) 🎯 MVP

**Goal**: Usuário consegue adicionar músicas via YouTube URL

**Independent Test**: Colar URL → música aparece na lista

- [ ] T018 [P] [US1] Create `src/components/player/MusicPlayer.svelte` basic structure
- [ ] T019 [P] [US1] Create `src/components/player/Playlist.svelte` component
- [ ] T020 [US1] Add URL input field with validation
- [ ] T021 [US1] Connect add button to `musicState.addTrack()`
- [ ] T022 [US1] Display error for invalid YouTube URLs
- [ ] T023 [US1] Add remove button per track connected to `musicState.removeTrack()`

**Checkpoint**: User can add/remove tracks from playlist

---

## Phase 4: User Story 2 - Reprodução Controlada (P1)

**Goal**: Play/Pause/Skip sincronizado para todos os usuários

**Independent Test**: Abrir dois navegadores → play em um → outro sincroniza

- [ ] T024 [P] [US2] Create `src/components/player/Controls.svelte` component
- [ ] T025 [US2] Add Play button connected to `musicState.play()`
- [ ] T026 [US2] Add Pause button connected to `musicState.pause()`
- [ ] T027 [US2] Add Skip button connected to `musicState.skip()`
- [ ] T028 [US2] Disable Play when playlist empty
- [ ] T029 [US2] Disable Skip when at last track

**Checkpoint**: Controls work and Broadcast propagates to other clients

---

## Phase 5: User Story 3 - Volume Individual (P2)

**Goal**: Cada usuário tem seu próprio volume

**Independent Test**: Ajustar slider → apenas áudio local muda

- [ ] T030 [P] [US3] Add volume slider to Controls component
- [ ] T031 [US3] Connect slider to `musicState.setVolume()` / `getVolume()`
- [ ] T032 [US3] Load volume from localStorage on init
- [ ] T033 [US3] Apply volume to YouTube player

**Checkpoint**: Volume is individual and persists per client

---

## Phase 6: User Story 4 - Sincronização de Estado (P1)

**Goal**: Estado consistente entre todos os clientes

**Independent Test**: Recarregar página → música continua do ponto

- [ ] T034 [P] [US4] Create `src/components/player/YouTubeEmbed.svelte`
- [ ] T035 [US4] Load YouTube IFrame API dynamically
- [ ] T036 [US4] Implement `onStateChange` handler - detect video ended → call `autoSkip()`
- [ ] T037 [US4] Use `$effect` to sync play/pause/seek with state
- [ ] T038 [US4] Calculate `elapsed` from `startedAt` for seek on page load

**Checkpoint**: New clients sync to current position, video auto-advances

---

## Phase 7: User Story 5 - Exibir Informações (P3)

**Goal**: Usuário vê qual música está tocando

**Independent Test**: Durante reprodução, título visível

- [ ] T039 [P] [US5] Highlight current track in playlist (different style)
- [ ] T040 [US5] Show "Now playing" indicator
- [ ] T041 [US5] Update indicator on track change

**Checkpoint**: Current track is clearly visible

---

## Phase 8: Polish & Integration

**Purpose**: Final touches and integration with game page

- [ ] T042 [P] [Polish] Style player with Tailwind CSS (Zinc-950 theme)
- [ ] T043 [Polish] Add loading states (playlist loading, track adding)
- [ ] T044 [Polish] Handle empty playlist state
- [ ] T045 [Integration] Integrate MusicPlayer into `src/routes/games/[id]/+page.svelte`
- [ ] T046 [Integration] Pass `gameId` from route params to player
- [ ] T047 [Polish] Run Biome format and lint
- [ ] T048 [Polish] Test end-to-end: two browsers, play/pause/skip sync

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Database)**: No dependencies - run first
- **Phase 2 (State Module)**: Depends on Phase 1 - core infrastructure
- **Phase 3-7 (User Stories)**: All depend on Phase 2
  - Can proceed in parallel after Phase 2

### Within Each Phase

- Phase 1: All tasks can run in parallel (T001-T004)
- Phase 2: Core functions in order (T006-T017), parallel where marked [P]
- Phase 3-7: Components built after state module ready

### Parallel Opportunities

- T001-T004: Database setup (parallel)
- T006, T009: State module setup (parallel)
- T018-T019: Component files (parallel)
- T024-T025: Controls setup (parallel)
- T030-T031: Volume setup (parallel)
- T034-T035: YouTube embed setup (parallel)
- T039-T040: Info display (parallel)
- T042-T043: Polish tasks (parallel)

---

## Notes

- [P] tasks = different files, no dependencies
- State module (Phase 2) MUST be complete before UI work
- All user stories depend on working Broadcast + DB setup
- Verify Broadcast works between two browsers before considering done