<script lang="ts">
import type { GameMemberWithProfile } from '$lib/supabase/types';
import { gameState } from '$lib/state/game.svelte';
import { Trash2 } from 'lucide-svelte';

interface Props {
  members: GameMemberWithProfile[];
  currentUserId: string;
  userRole: string | null;
  gameId: string;
  onMemberRemoved?: () => void;
}

let { members, currentUserId, userRole, gameId, onMemberRemoved }: Props = $props();

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case 'narrador':
      return 'bg-purple-500/20 text-purple-400';
    case 'assistente':
      return 'bg-blue-500/20 text-blue-400';
    default:
      return 'bg-green-500/20 text-green-400';
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'narrador':
      return 'Mestre';
    case 'assistente':
      return 'Assistente';
    default:
      return 'Jogador';
  }
}

function canRemove(targetRole: string, targetUserId: string): boolean {
  if (targetUserId === currentUserId) return false;

  if (userRole === 'narrador') return true;

  if (userRole === 'assistente' && targetRole === 'jogador') return true;

  return false;
}

async function handleRemove(userId: string, displayName: string) {
  if (!confirm(`Remover ${displayName} da mesa?`)) return;

  const success = await gameState.removeMember(gameId, userId);
  if (success) {
    onMemberRemoved?.();
  }
}
</script>

<div class="space-y-3">
  {#each members as member (member.id)}
    <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
          <span class="text-sm font-medium text-primary">
            {member.profile?.display_name?.charAt(0).toUpperCase() ?? '?'}
          </span>
        </div>
        <div>
          <p class="font-medium text-foreground">
            {member.profile?.display_name ?? 'Usuário'}
            {#if member.user_id === currentUserId}
              <span class="text-xs text-muted-foreground">(você)</span>
            {/if}
          </p>
          <span class="inline-block px-2 py-0.5 text-xs font-medium rounded-full {getRoleBadgeClass(member.role)}">
            {getRoleLabel(member.role)}
          </span>
        </div>
      </div>

      {#if canRemove(member.role, member.user_id)}
        <button
          class="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          onclick={() => handleRemove(member.user_id, member.profile?.display_name ?? 'Usuário')}
          title="Remover membro"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      {/if}
    </div>
  {/each}
</div>
