<script>
import { authState } from '$lib/state/auth.svelte';
import { toast } from '$lib/stores/toast.js';
import { goto } from '$app/navigation';
import { User, Settings, LogOut, Gamepad2, ChevronDown } from 'lucide-svelte';

let isOpen = $state(false);

function toggle() {
  isOpen = !isOpen;
}

function close() {
  isOpen = false;
}

async function handleLogout() {
  await authState.signOut();
  toast.success('Você saiu do sistema.');
  await goto('/');
}

function handleClickOutside(event) {
  if (isOpen && !event.target.closest('.user-menu')) {
    close();
  }
}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="user-menu relative">
  <button
    onclick={toggle}
    class="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
  >
    <User class="w-4 h-4 text-muted-foreground" />
    <span class="text-sm text-foreground hidden sm:inline">
      {authState.displayName}
    </span>
    {#if authState.role !== 'jogador'}
      <span class="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
        {authState.role === 'narrador' ? 'Mestre' : 'Assistente'}
      </span>
    {/if}
    <ChevronDown class="w-4 h-4 text-muted-foreground" />
  </button>

  {#if isOpen}
    <div class="absolute right-0 top-full mt-1 w-48 rounded-md border bg-popover p-1 shadow-md z-50">
      <div class="px-2 py-1.5">
        <p class="text-sm font-medium leading-none">{authState.displayName}</p>
        <p class="text-xs leading-none text-muted-foreground mt-1">
          {authState.user?.email}
        </p>
      </div>

      <div class="h-px bg-muted my-1"></div>

      <button
        onclick={() => { goto('/games'); close(); }}
        class="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
      >
        <Gamepad2 class="h-4 w-4" />
        Minhas Mesas
      </button>

      <button
        onclick={() => close()}
        class="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
      >
        <Settings class="h-4 w-4" />
        Configurações
      </button>

      <div class="h-px bg-muted my-1"></div>

      <button
        onclick={handleLogout}
        class="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-red-500 cursor-pointer"
      >
        <LogOut class="h-4 w-4" />
        Sair
      </button>
    </div>
  {/if}
</div>
