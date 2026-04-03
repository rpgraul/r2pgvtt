<script>
  import { page } from '$app/stores';
  import { authState } from '$lib/state/auth.svelte';
  import { diceStore } from '$lib/state/diceStore.svelte.js';
  import { toast } from '$lib/stores/toast.js';
  import { goto } from '$app/navigation';
  import Button from './ui/Button.svelte';
  import ThemeToggle from './ui/ThemeToggle.svelte';
  import { User, LogOut, Gamepad2 } from 'lucide-svelte';
  
  const navItems = [
    { href: '/', label: 'Grid' },
    { href: '/text-mode', label: 'Notas' },
    { href: '/sheet-mode', label: 'Ficha' },
    { href: '/drawing-mode', label: 'Quadro' }
  ];
  
  async function handleLogout() {
    await authState.signOut();
    toast.success('Você saiu do sistema.');
    await goto('/');
  }
</script>

<header class="sticky top-0 z-40 w-full border-b border-border bg-popover">
  <div class="container flex h-16 items-center justify-between px-4">
    <div class="flex items-center gap-6">
      <a href="/" class="flex items-center space-x-2">
        <span class="text-xl font-bold text-foreground">R2PG VTT</span>
      </a>
      
      <nav class="hidden md:flex items-center gap-1">
        {#each navItems as item}
          <a
            href={item.href}
            class="px-3 py-2 text-sm font-medium rounded-md {$page.url.pathname === item.href ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'} transition-colors"
          >
            {item.label}
          </a>
        {/each}
      </nav>
    </div>
    
    <div class="flex items-center gap-3">
      <ThemeToggle />
      
      {#if authState.isAuthenticated}
        <a 
          href="/games"
          class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Gamepad2 class="w-4 h-4" />
          <span class="hidden sm:inline">Mesas</span>
        </a>
        
        <div class="flex items-center gap-2">
          <input 
            type="color" 
            value={diceStore.currentDiceColor} 
            onchange={(e) => diceStore.setDiceColor(e.target.value)}
            class="w-6 h-6 p-0 border-0 rounded cursor-pointer shrink-0 bg-transparent"
            title="Sua cor de Dado"
            aria-label="Selecionar cor do dado"
          />
          <div class="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md bg-muted">
            <User class="w-4 h-4 text-muted-foreground" />
            <span class="text-sm text-foreground">
              {authState.displayName}
            </span>
            {#if authState.role !== 'jogador'}
              <span class="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                {authState.role === 'narrador' ? 'Mestre' : 'Assistente'}
              </span>
            {/if}
          </div>
        </div>
        
        <Button variant="ghost" size="sm" onclick={handleLogout}>
          <LogOut class="w-4 h-4 mr-1" />
          <span class="hidden sm:inline">Sair</span>
        </Button>
      {:else}
        <a href="/auth/login">
          <Button variant="default" size="sm">
            Entrar
          </Button>
        </a>
      {/if}
    </div>
  </div>
</header>
