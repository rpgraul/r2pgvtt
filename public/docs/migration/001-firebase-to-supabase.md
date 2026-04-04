# Migration: Firebase → Supabase

**Status**: Completed  
**Started**: 2026-04-02  
**Completed**: 2026-04-03

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
| `src/lib/supabase/tables.ts` | New - Database operations |
| `src/lib/state/auth.svelte.ts` | Refactored to use Supabase |
| `src/lib/state/game.svelte.ts` | New - Games state with Supabase |
| `src/routes/auth/login/+page.svelte` | New - Login page |
| `src/routes/auth/callback/+server.ts` | New - OAuth callback |
| `src/routes/auth/callback/+page.svelte` | New - OAuth callback page |
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
| `biome.json` | New - Biome linting configuration |

### 2. Database Schema (Supabase SQL Editor)

All tables and functions were created:
- `profiles` - User profiles
- `games` - Game tables
- `game_members` - Game membership with roles
- `generate_invite_code()` - Generate unique invite codes
- `create_game_with_owner()` - Create game with owner
- `can_join_game()` - Check game limit
- RLS policies for security
- Triggers for automatic profile creation

### 3. Google OAuth

- Configured in Supabase Dashboard > Authentication > Providers > Google
- Redirect URL configured

---

## Testing Checklist

- [x] Google OAuth login works
- [x] Email/password login works
- [x] Create account with display name works
- [x] Games dashboard shows user's games
- [x] Create game generates unique invite code
- [x] Join game via invite link works
- [x] 3-game limit is enforced
- [x] Settings page accessible by narrator/assistant only
- [x] Member removal works
- [x] Leave game works for players

---

## Linting

The project now uses Biome for code quality:

```bash
# Format code
npx biome format --write src/

# Lint code
npx biome lint src/
```

---

## Rollback Plan (Archived)

This section is kept for reference only. Rollback to Firebase is no longer needed.

- Firebase was not actually being used in the frontend
- All authentication flows have been migrated to Supabase
- Database operations use Supabase exclusively

---

## Next Steps

- Consider adding more features to the games system
- Implement additional RLS policies as needed
- Add more comprehensive testing
