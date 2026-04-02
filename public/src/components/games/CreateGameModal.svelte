<script lang="ts">
  import { gameState } from '$lib/state/game.svelte';
  import Button from '$components/ui/Button.svelte';
  import Input from '$components/ui/Input.svelte';
  import { X } from 'lucide-svelte';
  import { goto } from '$app/navigation';

  interface Props {
    open: boolean;
  }

  let { open = $bindable() }: Props = $props();

  let nome = $state('');
  let loading = $state(false);
  let error = $state('');

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!nome.trim()) return;

    loading = true;
    error = '';

    try {
      const game = await gameState.createGame(nome.trim());
      if (game) {
        open = false;
        nome = '';
        await goto(`/games/${game.id}`);
      }
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function handleClose() {
    open = false;
    nome = '';
    error = '';
  }
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <button
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onclick={handleClose}
      aria-label="Fechar"
    ></button>

    <div class="relative w-full max-w-md mx-4 bg-card border border-border rounded-xl shadow-xl">
      <div class="flex items-center justify-between p-4 border-b border-border">
        <h2 class="text-lg font-semibold">Criar Nova Mesa</h2>
        <button
          class="p-1 hover:bg-muted rounded-lg transition-colors"
          onclick={handleClose}
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <form onsubmit={handleSubmit} class="p-4 space-y-4">
        <div class="space-y-2">
          <label for="gameName" class="text-sm font-medium">Nome da Mesa</label>
          <Input
            id="gameName"
            type="text"
            bind:value={nome}
            placeholder="Aventura épica"
            required
            autofocus
          />
        </div>

        {#if error}
          <p class="text-sm text-destructive">{error}</p>
        {/if}

        <div class="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            class="flex-1"
            onclick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || !nome.trim()}
            class="flex-1"
          >
            {loading ? 'Criando...' : 'Criar Mesa'}
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}
