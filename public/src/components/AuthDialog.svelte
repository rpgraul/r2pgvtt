<script>
import { gameState } from '$lib/state/game.svelte.ts';
import Button from './ui/Button.svelte';
import Input from './ui/Input.svelte';

let { onSuccess } = $props();

let isLogin = $state(true);
let email = $state('');
let password = $state('');
let displayName = $state('');
let error = $state('');
let loading = $state(false);

async function handleSubmit(e) {
  e.preventDefault();
  error = '';
  loading = true;

  try {
    if (isLogin) {
      await gameState.login(email, password);
    } else {
      await gameState.register(email, password, displayName);
    }
    onSuccess?.();
  } catch (err) {
    error = err.message || 'Erro ao processar solicitação';
  } finally {
    loading = false;
  }
}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
  {#if !isLogin}
    <div class="space-y-2">
      <label for="displayName" class="text-sm font-medium">Nome</label>
      <Input
        id="displayName"
        bind:value={displayName}
        placeholder="Seu nome"
        required={!isLogin}
      />
    </div>
  {/if}
  
  <div class="space-y-2">
    <label for="email" class="text-sm font-medium">Email</label>
    <Input
      id="email"
      type="email"
      bind:value={email}
      placeholder="seu@email.com"
      required
    />
  </div>
  
  <div class="space-y-2">
    <label for="password" class="text-sm font-medium">Senha</label>
    <Input
      id="password"
      type="password"
      bind:value={password}
      placeholder="••••••••"
      required
    />
  </div>
  
  {#if error}
    <p class="text-sm text-destructive">{error}</p>
  {/if}
  
  <div class="flex flex-col gap-2">
    <Button type="submit" disabled={loading} class="w-full">
      {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar Conta'}
    </Button>
    
    <button
      type="button"
      class="text-sm text-muted-foreground hover:text-foreground"
      onclick={() => {
        isLogin = !isLogin;
        error = '';
      }}
    >
      {isLogin ? 'Não tem conta? Criar' : 'Já tem conta? Entrar'}
    </button>
  </div>
</form>
