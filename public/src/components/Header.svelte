<script>
import { page } from '$app/stores';
import { authState } from '$lib/state/auth.svelte';
import { diceStore } from '$lib/state/diceStore.svelte.js';
import ThemeToggle from './ui/ThemeToggle.svelte';
import UserMenu from './ui/UserMenu.svelte';

let { minimal = false } = $props();
</script>

<header class="sticky top-0 z-40 w-full border-b border-border bg-popover">
  <div class="container flex h-16 items-center justify-between px-4">
    <div class="flex items-center gap-6">
      <a href="/" class="flex items-center space-x-2">
        <span class="text-xl font-bold text-foreground">R2PG VTT</span>
      </a>
      
      {#if !minimal}
        <nav class="hidden md:flex items-center gap-1">
          <a
            href="/"
            class="px-3 py-2 text-sm font-medium rounded-md {$page.url.pathname === '/' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'} transition-colors"
          >
            Grid
          </a>
          <a
            href="/text-mode"
            class="px-3 py-2 text-sm font-medium rounded-md {$page.url.pathname === '/text-mode' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'} transition-colors"
          >
            Notas
          </a>
          <a
            href="/sheet-mode"
            class="px-3 py-2 text-sm font-medium rounded-md {$page.url.pathname === '/sheet-mode' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'} transition-colors"
          >
            Ficha
          </a>
          <a
            href="/drawing-mode"
            class="px-3 py-2 text-sm font-medium rounded-md {$page.url.pathname === '/drawing-mode' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'} transition-colors"
          >
            Quadro
          </a>
        </nav>
      {/if}
    </div>
    
    <div class="flex items-center gap-3">
      <ThemeToggle />
      
      {#if !minimal && authState.isAuthenticated}
        <input 
          type="color" 
          value={diceStore.currentDiceColor} 
          onchange={(e) => diceStore.setDiceColor(e.target.value)}
          class="w-6 h-6 p-0 border-0 rounded cursor-pointer shrink-0 bg-transparent"
          title="Sua cor de Dado"
          aria-label="Selecionar cor do dado"
        />
        
        <UserMenu />
      {/if}
    </div>
  </div>
</header>
