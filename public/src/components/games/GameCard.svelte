<script lang="ts">
import type { Game } from '$lib/supabase/types';
import {
  Gamepad2,
  Calendar,
  Clock,
  Trash2,
  LogOut,
  AlertTriangle,
  RotateCcw,
  Share2,
  Copy,
  Check,
} from 'lucide-svelte';
import Button from '$components/ui/Button.svelte';

interface Props {
  game: Game;
  userRole?: string;
  onDelete?: (gameId: string) => void;
  onLeave?: (gameId: string, userRole?: string) => void;
  onRestore?: (gameId: string) => void;
}

let { game, userRole, onDelete, onLeave, onRestore }: Props = $props();

let copied = $state(false);

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
    onLeave(game.id, userRole);
  }
}

async function handleRestore(e: Event) {
  e.preventDefault();
  e.stopPropagation();
  if (onRestore) {
    onRestore(game.id);
  }
}

async function handleCopyLink(e: Event) {
  e.preventDefault();
  e.stopPropagation();
  const inviteLink = `${window.location.origin}/join/${game.invite_code}`;
  await navigator.clipboard.writeText(inviteLink);
  copied = true;
  setTimeout(() => {
    copied = false;
  }, 2000);
}

const isDeleted = $derived(!!game.deleted_at);
const isNarrator = userRole === 'narrador';
const showCopyLink = $derived(!!game.invite_code && !isDeleted);
</script>

{#if isDeleted}
  <!-- Mesa deletada - não navegável -->
  <div class="group block p-6 bg-card border border-red-500/50 rounded-xl opacity-60">
    <div class="flex items-start gap-4">
      {#if game.capa_url}
        <img 
          src={game.capa_url} 
          alt={game.nome}
          class="w-16 h-16 rounded-lg object-cover grayscale"
        />
      {:else}
        <div class="p-3 bg-red-500/10 rounded-lg">
          <Gamepad2 class="w-6 h-6 text-red-400" />
        </div>
      {/if}
      
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="text-lg font-semibold text-foreground truncate">
            {game.nome}
          </h3>
          <span class="flex items-center gap-1 px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
            <AlertTriangle class="w-3 h-3" />
            Excluída
          </span>
        </div>
        
        <div class="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
          {#if game.sistema}
            <span class="px-2 py-0.5 bg-secondary rounded text-xs">
              {game.sistema}
            </span>
          {/if}
        </div>
        
        <div class="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span class="flex items-center gap-1">
            <Calendar class="w-3 h-3" />
            Criada: {formatDate(game.created_at)}
          </span>
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
        
        {#if isNarrator}
          <Button variant="ghost" size="sm" onclick={handleRestore} class="text-green-500 hover:text-green-400">
            <RotateCcw class="w-4 h-4 mr-1" />
            Restaurar
          </Button>
        {/if}
        
        {#if !isNarrator}
          <Button variant="ghost" size="sm" onclick={handleLeave} class="text-muted-foreground hover:text-foreground">
            <LogOut class="w-4 h-4" />
          </Button>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <!-- Mesa normal - navegável -->
  <a
    href="/games/{game.id}"
    class="group block p-6 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200"
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
        <h3 class="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {game.nome}
        </h3>
        
        <div class="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
          {#if game.sistema}
            <span class="px-2 py-0.5 bg-secondary rounded text-xs">
              {game.sistema}
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
        
        {#if showCopyLink}
          <Button variant="ghost" size="sm" onclick={handleCopyLink} title="Copiar link de convite">
            {#if copied}
              <Check class="w-4 h-4 text-green-500" />
            {:else}
              <Share2 class="w-4 h-4" />
            {/if}
          </Button>
        {/if}
        
        {#if isNarrator}
          <Button variant="ghost" size="sm" onclick={handleDelete} class="text-red-500 hover:text-red-400" title="Excluir mesa">
            <Trash2 class="w-4 h-4" />
          </Button>
        {:else if userRole}
          <Button variant="ghost" size="sm" onclick={handleLeave} class="text-muted-foreground hover:text-foreground" title="Sair da mesa">
            <LogOut class="w-4 h-4" />
          </Button>
        {/if}
      </div>
    </div>
  </a>
{/if}
