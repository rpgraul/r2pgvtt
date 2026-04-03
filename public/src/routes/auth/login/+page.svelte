<script lang="ts">
  import { authState } from '$lib/state/auth.svelte';
  import Button from '$components/ui/Button.svelte';
  import Input from '$components/ui/Input.svelte';
  import OAuthButton from '$components/auth/OAuthButton.svelte';
  import { goto } from '$app/navigation';

  let isLogin = $state(true);
  let email = $state('');
  let password = $state('');
  let displayName = $state('');
  let error = $state('');
  let loading = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';
    loading = true;

    try {
      if (isLogin) {
        await authState.signInWithEmail(email, password);
      } else {
        await authState.signUp(email, password, displayName);
      }
      await goto('/games');
    } catch (err: any) {
      error = err.message || 'Erro ao processar solicitação';
    } finally {
      loading = false;
    }
  }

  function toggleMode() {
    isLogin = !isLogin;
    error = '';
  }
</script>

<svelte:head>
  <title>{isLogin ? 'Entrar' : 'Criar Conta'} - R2PG VTT</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-background px-4">
  <div class="w-full max-w-md space-y-6">
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-bold text-foreground">
        {isLogin ? 'Bem-vindo de volta!' : 'Criar Conta'}
      </h1>
      <p class="text-muted-foreground">
        {isLogin ? 'Entre na sua conta para continuar' : 'Preencha os dados para criar sua conta'}
      </p>
    </div>

    <div class="space-y-4">
      <OAuthButton />

      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <span class="w-full border-t border-border"></span>
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-background px-2 text-muted-foreground">ou</span>
        </div>
      </div>

      <form onsubmit={handleSubmit} class="space-y-4">
        {#if !isLogin}
          <div class="space-y-2">
            <label for="displayName" class="text-sm font-medium">Nome</label>
            <Input
              id="displayName"
              type="text"
              bind:value={displayName}
              placeholder="Seu nome"
              required
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
            minlength={6}
          />
        </div>

        {#if error}
          <p class="text-sm text-destructive">{error}</p>
        {/if}

        <Button type="submit" disabled={loading} class="w-full">
          {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar Conta'}
        </Button>

        <button
          type="button"
          class="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          onclick={toggleMode}
        >
          {isLogin ? 'Não tem conta? Criar' : 'Já tem conta? Entrar'}
        </button>
      </form>
    </div>
  </div>
</div>
