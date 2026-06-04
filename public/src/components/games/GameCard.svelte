<script lang="ts">
import {
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  Gamepad2,
  LogOut,
  RotateCcw,
  Share2,
  Trash2,
} from 'lucide-svelte';
import Button from '$components/ui/Button.svelte';
import { db } from '$lib/supabase/tables';
import type { Game } from '$lib/supabase/types';

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
const canInvite = $derived(userRole === 'narrador' || userRole === 'assistente');
const showCopyLink = $derived(!!game.invite_code && !isDeleted && canInvite);
</script>

{#if isDeleted}
  <!-- Mesa deletada - não navegável -->
  <div class="block p-4 bg-background border border-destructive/30 rounded opacity-60">
    <div class="flex items-start gap-3">
      {#if game.capa_url}
        <img 
          src={game.capa_url} 
          alt={game.nome}
          class="w-12 h-12 rounded object-cover grayscale shrink-0 border border-border"
        />
      {:else}
        <div class="p-2.5 bg-secondary rounded shrink-0">
          <Gamepad2 class="w-5 h-5 text-muted-foreground" />
        </div>
      {/if}
      
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-semibold text-foreground truncate">
            {game.nome}
          </h3>
          <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold bg-destructive/10 text-destructive rounded">
            <AlertTriangle class="w-2.5 h-2.5" />
            Excluída
          </span>
        </div>
        
        <div class="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          {#if game.sistema}
            <span class="px-1.5 py-0.5 bg-secondary rounded font-medium">
              {game.sistema}
            </span>
          {/if}
          <span class="flex items-center gap-1">
            <Calendar class="w-3 h-3" />
            Criada: {formatDate(game.created_at)}
          </span>
        </div>
      </div>

      <div class="flex flex-col items-end gap-1.5 shrink-0">
        {#if userRole}
          <span class="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-secondary text-foreground uppercase tracking-wider">
            {userRole === 'narrador' ? 'Mestre' : userRole === 'assistente' ? 'Assistente' : 'Jogador'}
          </span>
        {/if}
        
        {#if isNarrator}
          <button 
            onclick={handleRestore} 
            class="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-success hover:bg-secondary rounded transition-colors"
            title="Restaurar Mesa"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            Restaurar
          </button>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <!-- Mesa normal - navegável -->
  <a
    href="/games/{game.id}"
    class="group block p-4 bg-background border border-border rounded hover:bg-secondary/20 transition-all duration-150"
  >
    <div class="flex items-start gap-3">
      {#if game.capa_url}
        <img 
          src={game.capa_url} 
          alt={game.nome}
          class="w-12 h-12 rounded object-cover shrink-0 border border-border"
        />
      {:else}
        <div class="p-2.5 bg-secondary rounded shrink-0 group-hover:bg-background transition-colors">
          <Gamepad2 class="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
        </div>
      {/if}
      
      <div class="flex-1 min-w-0">
        <h3 class="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {game.nome}
        </h3>
        
        <div class="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          {#if game.sistema}
            <span class="px-1.5 py-0.5 bg-secondary rounded font-medium text-foreground">
              {game.sistema}
            </span>
          {/if}
        </div>
        
        <div class="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          <span class="flex items-center gap-1">
            <Calendar class="w-3 h-3" />
            {formatDate(game.created_at)}
          </span>
          {#if game.last_accessed_at}
            <span class="flex items-center gap-1">
              <Clock class="w-3 h-3" />
              {formatLastAccess(game.last_accessed_at)}
            </span>
          {/if}
        </div>
      </div>

      <div class="flex flex-col items-end gap-2 shrink-0">
        {#if userRole}
          <span class="px-1.5 py-0.5 text-[9px] font-bold rounded bg-secondary text-foreground uppercase tracking-wider">
            {userRole === 'narrador' ? 'Mestre' : userRole === 'assistente' ? 'Assistente' : 'Jogador'}
          </span>
        {/if}
        
        <div class="flex items-center gap-1">
          {#if showCopyLink}
            <button 
              onclick={handleCopyLink} 
              class="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Copiar link de convite"
            >
              {#if copied}
                <Check class="w-3.5 h-3.5 text-success" />
              {:else}
                <Share2 class="w-3.5 h-3.5" />
              {/if}
            </button>
          {/if}
          
          {#if isNarrator}
            <button 
              onclick={handleDelete} 
              class="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" 
              title="Excluir mesa"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          {:else if userRole}
            <button 
              onclick={handleLeave} 
              class="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" 
              title="Sair da mesa"
            >
              <LogOut class="w-3.5 h-3.5" />
            </button>
          {/if}
        </div>
      </div>
    </div>
  </a>
{/if}
