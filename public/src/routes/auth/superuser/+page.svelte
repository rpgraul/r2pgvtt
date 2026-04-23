<script lang="ts">
import { onMount } from 'svelte';
import { authState } from '$lib/state/auth.svelte';
import { goto } from '$app/navigation';

onMount(() => {
  // Enable superuser mode
  authState.loginAsSuperUser();
  // The loginAsSuperUser method calls window.location.reload()
  // but in case it doesn't, we redirect here too.
  goto('/games');
});
</script>

<div class="min-h-screen flex items-center justify-center bg-background">
  <div class="text-center space-y-4">
    <div class="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
    <h1 class="text-2xl font-bold">Iniciando Super User Mode...</h1>
    <p class="text-muted-foreground">Ignorando login padrão para testes.</p>
  </div>
</div>
