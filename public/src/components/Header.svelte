<script>
import { ArrowLeft, ChevronRight, MessageSquare } from 'lucide-svelte';
import { page } from '$app/stores';
import { authState } from '$lib/state/auth.svelte';
import { diceStore } from '$lib/state/diceStore.svelte.js';
import { gameState } from '$lib/state/gameState.svelte.ts';
import { uiState } from '$lib/state/ui.svelte.js';
import ThemeToggle from './ui/ThemeToggle.svelte';
import UserMenu from './ui/UserMenu.svelte';

let { minimal = false } = $props();

const currentPath = $derived($page.url.pathname);
const gameName = $derived(gameState.gameName);
const inGame = $derived(!!gameState.gameId);

// Menus de navegação
const links = $derived([
  gameState.isNarrator
    ? { path: '/dm-screen', label: 'Escudo' }
    : { path: '/sheet-mode', label: 'Ficha' },
  { path: '/', label: 'Grid' },
  { path: '/text-mode', label: 'Notas' },
  { path: '/drawing-mode', label: 'Quadro' },
]);
</script>

<header class="sticky top-0 z-40 w-full h-12 border-b border-border bg-background flex items-center select-none shrink-0">
  <div class="w-full flex items-center justify-between px-4">
    
    <!-- Left: Breadcrumb (Notion style) -->
    <div class="flex items-center gap-1.5 text-sm">
      {#if inGame && gameName}
        <a 
          href="/games" 
          class="text-muted-foreground hover:bg-secondary/60 hover:text-foreground px-1.5 py-1 rounded transition-colors"
        >
          Minhas Mesas
        </a>
        <ChevronRight class="w-3.5 h-3.5 text-muted-foreground/60" />
        <span class="font-medium text-foreground truncate max-w-[160px]" title={gameName}>
          {gameName}
        </span>
      {:else}
        <a href="/" class="flex items-center gap-2 font-bold text-foreground hover:bg-secondary/60 px-1.5 py-1 rounded transition-colors">
          <span>R2PG VTT</span>
        </a>
      {/if}
    </div>

    <!-- Center: Flat Navigation Links (only inside game session) -->
    {#if !minimal && inGame}
      <nav class="flex items-center gap-1">
        {#each links as link}
          {@const isActive = currentPath === link.path}
          <a
            href={link.path}
            class="px-2.5 py-1 text-xs font-medium rounded transition-colors relative {isActive ? 'bg-secondary text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'}"
          >
            {link.label}
          </a>
        {/each}
      </nav>
    {/if}

    <!-- Right: Controls -->
    <div class="flex items-center gap-2">
      <ThemeToggle />
      
      {#if authState.isAuthenticated}
        <!-- Dice Color Circle -->
        {#if !minimal && inGame}
          <div class="relative flex items-center justify-center w-6 h-6 rounded hover:bg-secondary/60 transition-colors" title="Cor do Dado 3D">
            <input 
              type="color" 
              value={diceStore.currentDiceColor} 
              onchange={(e) => diceStore.setDiceColor(e.target.value)}
              class="w-4 h-4 p-0 border-0 rounded-full cursor-pointer shrink-0 bg-transparent overflow-hidden"
              style="border: 1px solid var(--border-main);"
              aria-label="Selecionar cor do dado"
            />
          </div>
        {/if}
        
        <!-- Toggle Sidebar Button (Chat/Music) -->
        {#if !minimal && inGame}
          <button
            onclick={() => uiState.toggleSidebar()}
            class="p-1.5 rounded transition-colors hover:bg-secondary/60 {uiState.isSidebarOpen ? 'text-primary bg-secondary/80' : 'text-muted-foreground hover:text-foreground'}"
            title={uiState.isSidebarOpen ? 'Fechar Painel Lateral' : 'Abrir Painel Lateral'}
            aria-label="Painel Lateral"
          >
            <MessageSquare class="w-4 h-4" />
          </button>
        {/if}

        <UserMenu />
      {/if}
    </div>

  </div>
</header>
