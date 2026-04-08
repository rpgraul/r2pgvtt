<script lang="ts">
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { authState } from '$lib/state/auth.svelte';

let status = $state<'processing' | 'success' | 'error'>('processing');
let message = $state('Processando login...');

onMount(async () => {
  // O Supabase client automaticamente processa o hash token
  // Apenas precisamos esperar o auth state ser atualizado

  await authState.init();

  // Aguardar um momento para o auth state ser processado
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (authState.isAuthenticated) {
    status = 'success';
    message = 'Login realizado com sucesso!';
    setTimeout(() => {
      goto('/games');
    }, 1000);
  } else {
    status = 'error';
    message = 'Erro ao processar login. Tente novamente.';
  }
});
</script>

<svelte:head>
  <title>Processando Login - R2PG VTT</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-background px-4">
  <div class="w-full max-w-md text-center space-y-6">
    {#if status === 'processing'}
      <div class="space-y-4">
        <div class="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
          <svg class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/>
            <path d="M12 6V12L16 14"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-foreground">
          Processando Login
        </h1>
        <p class="text-muted-foreground">
          {message}
        </p>
      </div>
    {:else if status === 'success'}
      <div class="space-y-4">
        <div class="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <path d="M22 4L12 14.01l-3-3"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-foreground">
          Bem-vindo!
        </h1>
        <p class="text-muted-foreground">
          {message}
        </p>
        <p class="text-sm text-muted-foreground">
          Redirecionando para suas mesas...
        </p>
      </div>
    {:else}
      <div class="space-y-4">
        <div class="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M15 9l-6 6M9 9l6 6"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-foreground">
          Erro
        </h1>
        <p class="text-muted-foreground">
          {message}
        </p>
        <a href="/auth/login" class="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
          Tentar novamente
        </a>
      </div>
    {/if}
  </div>
</div>