<script>
  import { page } from '$app/stores';
  import { auth } from '$lib/state/auth.svelte.ts';
  import { diceStore } from '$lib/state/diceStore.svelte.js';
  import { toast } from '$lib/stores/toast.js';
  import Button from './ui/Button.svelte';
  import ThemeToggle from './ui/ThemeToggle.svelte';
  import Dialog from './ui/Dialog.svelte';
  import DialogTrigger from './ui/DialogTrigger.svelte';
  import DialogContent from './ui/DialogContent.svelte';
  import DialogTitle from './ui/DialogTitle.svelte';
  import Input from './ui/Input.svelte';
  
  let authDialogOpen = $state(false);
  let userName = $state('');
  let narratorPassword = $state('');
  let error = $state('');
  let mode = $state('login');
  let mobileMenuOpen = $state(false);
  
  const navItems = [
    { href: '/', label: 'Grid' },
    { href: '/text-mode', label: 'Notas' },
    { href: '/sheet-mode', label: 'Ficha' },
    { href: '/drawing-mode', label: 'Quadro' }
  ];
  
  function handleLogin() {
    if (!userName.trim()) {
      error = 'Digite seu nome';
      return;
    }
    auth.loginAsPlayer(userName.trim());
    toast.success(`Bem-vindo, ${userName}!`);
    authDialogOpen = false;
    error = '';
    userName = '';
  }
  
  function handleNarratorLogin() {
    if (!userName.trim()) {
      error = 'Digite seu nome';
      return;
    }
    if (!auth.validateNarratorPassword(narratorPassword)) {
      error = 'Senha incorreta';
      return;
    }
    auth.loginAsNarrator();
    toast.success('Login como Narrador realizado!');
    authDialogOpen = false;
    error = '';
    narratorPassword = '';
    userName = '';
  }
  
  function handleLogout() {
    auth.logout();
    toast.info('Você saiu do sistema.');
  }
</script>

<header class="sticky top-0 z-40 w-full border-b border-border bg-popover">
  <div class="container flex h-16 items-center justify-between px-4">
    <div class="flex items-center gap-6">
      <a href="/" class="flex items-center space-x-2">
        <span class="text-xl font-bold text-foreground">GameBoard</span>
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
      {#if auth.userName}
        <div class="flex items-center gap-2">
          <input 
            type="color" 
            value={diceStore.currentDiceColor} 
            onchange={(e) => diceStore.setDiceColor(e.target.value)}
            class="w-6 h-6 p-0 border-0 rounded cursor-pointer shrink-0 bg-transparent"
            title="Sua cor de Dado"
            aria-label="Selecionar cor do dado"
          />
          <span class="text-sm text-muted-foreground mr-1">
            {auth.userName}
          </span>
          {#if auth.isNarrator}
            <span class="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded">
              Narrador
            </span>
          {:else}
            <span class="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
              Jogador
            </span>
          {/if}
        </div>
        <Button variant="ghost" size="sm" onclick={handleLogout}>
          Sair
        </Button>
      {:else}
        <Dialog bind:open={authDialogOpen}>
          <DialogTrigger>
            <Button variant="default" size="sm">
              Entrar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Identificação</DialogTitle>
            
            <div class="space-y-4">
              <div class="flex gap-2">
                <button
                  onclick={() => mode = 'login'}
                  class="flex-1 py-2 text-sm rounded-md {mode === 'login' ? 'bg-secondary text-secondary-foreground' : 'bg-muted'}"
                >
                  Jogador
                </button>
                <button
                  onclick={() => mode = 'narrator'}
                  class="flex-1 py-2 text-sm rounded-md {mode === 'narrator' ? 'bg-secondary text-secondary-foreground' : 'bg-muted'}"
                >
                  Narrador
                </button>
              </div>
              
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground" for="auth-name">Nome</label>
                <Input
                  id="auth-name"
                  bind:value={userName}
                  placeholder="Seu nome"
                />
              </div>
              
              {#if mode === 'narrator'}
                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground" for="auth-password">Senha do Narrador</label>
                  <Input
                    id="auth-password"
                    type="password"
                    bind:value={narratorPassword}
                    placeholder="Senha"
                  />
                </div>
              {/if}
              
              {#if error}
                <p class="text-sm text-destructive">{error}</p>
              {/if}
              
              <Button 
                onclick={mode === 'narrator' ? handleNarratorLogin : handleLogin}
                class="w-full"
              >
                {mode === 'narrator' ? 'Entrar como Narrador' : 'Entrar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      {/if}
    </div>
  </div>
</header>
