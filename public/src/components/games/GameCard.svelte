<script lang="ts">
import type { Game, GameMemberWithProfile } from '$lib/supabase/types';
import { Gamepad2, Calendar, Clock, Users, Trash2, LogOut, AlertTriangle } from 'lucide-svelte';
import Button from '$components/ui/Button.svelte';
import { goto } from '$app/navigation';
import { db } from '$lib/supabase/tables';

interface Props {
  game: Game;
  userRole?: string;
  onDelete?: (gameId: string) => void;
  onLeave?: (gameId: string) => void;
}

let { game, userRole, onDelete, onLeave }: Props = $props();

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatLastAccess(dateStr: string | null): string {
  if (!dateStr) return 'Nunca';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 7) return `${days} dias atrás`;
  return formatDate(dateStr);
}

async function handleDelete(e: Event) {
  e.preventDefault();
  e.stopPropagation();
  if (!confirm('Tem certeza que deseja excluir esta mesa?')) return;
  if (onDelete) {
    onDelete(game.id);
  }
}

async function handleLeave(e: Event) {
  e.preventDefault();
  e.stopPropagation();
  if (!confirm('Tem certeza que deseja sair desta mesa?')) return;
  if (onLeave) {
    onLeave(game.id);
  }
}

const isDeleted = $derived(!!game.deleted_at);
</script>

<a
  href="/games/{game.id}"
  class="group block p-6 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200 {isDeleted ? 'opacity-60 border-red-500/50' : ''}"
>
  <div class="flex items-start gap-4">
    {#if game.capa_url}
      <img 
        src={game.capa_url} 
        alt={game.nome}
        class="w-16 h-16 rounded-lg object-cover"
      />
    {:else}
      <div class="p-3 bg-primary/10 rounded-lg">
        <Gamepad2 class="w-6 h-6 text-primary" />
      </div>
    {/if}
    
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {game.nome}
        </h3>
        {#if isDeleted}
          <span class="flex items-center gap-1 px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
            <AlertTriangle class="w-3 h-3" />
            Excluída
          </span>
        {/if}
      </div>
      
      <div class="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
        {#if game.sistema}
          <span class="px-2 py-0.5 bg-secondary rounded text-xs">
            {game.sistema}
          </span>
        {/if}
        {#if game.campanha}
          <span class="text-xs">
            {game.campanha}
          </span>
        {/if}
      </div>
      
      <div class="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span class="flex items-center gap-1">
          <Calendar class="w-3 h-3" />
          Criada: {formatDate(game.created_at)}
        </span>
        {#if game.last_accessed_at}
          <span class="flex items-center gap-1">
            <Clock class="w-3 h-3" />
            {formatLastAccess(game.last_accessed_at)}
          </span>
        {/if}
      </div>
    </div>

    <div class="flex flex-col items-end gap-2">
      {#if userRole}
        <span class="px-2 py-1 text-xs font-medium rounded-full
          {userRole === 'narrador' ? 'bg-purple-500/20 text-purple-400' :
           userRole === 'assistente' ? 'bg-blue-500/20 text-blue-400' :
           'bg-green-500/20 text-green-400'}">
          {userRole === 'narrador' ? 'Mestre' : userRole === 'assistente' ? 'Assistente' : 'Jogador'}
        </span>
      {/if}
      
      {#if userRole === 'narrador' && !isDeleted}
        <Button variant="ghost" size="sm" onclick={handleDelete} class="text-red-500 hover:text-red-400">
          <Trash2 class="w-4 h-4" />
        </Button>
      {:else if userRole && userRole !== 'narrador'}
        <Button variant="ghost" size="sm" onclick={handleLeave} class="text-muted-foreground hover:text-foreground">
          <LogOut class="w-4 h-4" />
        </Button>
      {/if}
    </div>
  </div>
</a>
