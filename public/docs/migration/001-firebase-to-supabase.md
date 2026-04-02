# Migration: Firebase → Supabase

**Status**: In Progress  
**Started**: 2026-04-02  
**Target**: Complete Auth + Games flow

---

## Overview

This migration moves the application from Firebase to Supabase for:
- Authentication (Google OAuth + Email/Password)
- Real-time database (Postgres)
- Row Level Security (RLS) for multi-tenant data

---

## Completed Changes

### 1. Frontend Implementation

| File | Change |
|------|--------|
| `.env` | Added `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` |
| `src/lib/supabase/client.ts` | New - Supabase client |
| `src/lib/supabase/types.ts` | New - TypeScript types |
| `src/lib/state/auth.svelte.ts` | Refactored to use Supabase |
| `src/lib/state/game.svelte.ts` | New - Games state with Supabase |
| `src/routes/auth/login/+page.svelte` | New - Login page |
| `src/routes/auth/callback/+server.ts` | New - OAuth callback |
| `src/routes/games/+page.svelte` | New - Games dashboard |
| `src/routes/games/[id]/+page.svelte` | New - Game page |
| `src/routes/games/[id]/settings/+page.svelte` | New - Settings page |
| `src/routes/join/[invite_code]/+page.svelte` | New - Join via invite |
| `src/components/auth/OAuthButton.svelte` | New - Google OAuth button |
| `src/components/games/GameCard.svelte` | New - Game card component |
| `src/components/games/GameList.svelte` | New - Games list |
| `src/components/games/CreateGameModal.svelte` | New - Create game modal |
| `src/components/games/InviteLink.svelte` | New - Copy invite link |
| `src/components/games/MemberList.svelte` | New - Members list |
| `src/components/Header.svelte` | Updated - Auth buttons |
| `src/lib/state/diceStore.svelte.js` | Updated - Use authState |
| `src/lib/state/audio.svelte.ts` | Updated - Use authState |
| `src/lib/state/game.svelte.js` | Updated - Use authState |

### 2. Database Schema

| File | Content |
|------|---------|
| `specs/001-auth-and-games/docs/schema.sql` | Complete SQL schema |

---

## Remaining Tasks

### Database Setup (Supabase Dashboard)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Run the contents of `specs/001-auth-and-games/docs/schema.sql`

### Google OAuth Configuration

1. Go to **Authentication** > **Providers** > **Google**
2. Enable Google OAuth
3. Add your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
4. Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### Environment Variables

Make sure your `.env` has:
```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Data Migration (Future)

When ready to migrate existing data:

1. Export data from Firebase Firestore
2. Transform to match Supabase schema
3. Import using Supabase Dashboard or CLI

See `docs/migration/001-firebase-to-supabase.md` for detailed steps.

---

## Rollback Plan

If issues arise:

1. Keep Firebase configuration in `.env`
2. Feature flag to switch between Firebase/Supabase
3. Revert to Firebase auth module if needed

---

## Testing Checklist

- [ ] Google OAuth login works
- [ ] Email/password login works
- [ ] Create account with display name works
- [ ] Games dashboard shows user's games
- [ ] Create game generates unique invite code
- [ ] Join game via invite link works
- [ ] 3-game limit is enforced
- [ ] Settings page accessible by narrator/assistant only
- [ ] Member removal works
- [ ] Leave game works for players
