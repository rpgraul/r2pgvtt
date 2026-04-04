<script lang="ts">
import { db } from '$lib/supabase/tables';
import Button from '$components/ui/Button.svelte';
import Input from '$components/ui/Input.svelte';
import { X, Upload, Image } from 'lucide-svelte';
import { goto } from '$app/navigation';

interface Props {
  open: boolean;
}

let { open = $bindable() }: Props = $props();

let nome = $state('');
let campanha = $state('');
let sistema = $state('');
let capaFile = $state<File | null>(null);
let capaPreview = $state<string | null>(null);
let loading = $state(false);
let error = $state('');

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    capaFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      capaPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

function removeCapa() {
  capaFile = null;
  capaPreview = null;
}

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!nome.trim()) return;

  loading = true;
  error = '';

  try {
    let capaUrl: string | undefined;

    // Upload capa if exists
    if (capaFile) {
      capaUrl = capaPreview || undefined;
    }

    const gameId = await db.createGameExtended(
      nome.trim(),
      sistema.trim() || undefined,
      campanha.trim() || undefined,
      capaUrl,
    );

    if (gameId) {
      open = false;
      resetForm();
      await goto(`/games/${gameId}`);
    }
  } catch (err: any) {
    error = err.message || 'Erro ao criar mesa';
  } finally {
    loading = false;
  }
}

function handleClose() {
  open = false;
  resetForm();
}

function resetForm() {
  nome = '';
  campanha = '';
  sistema = '';
  capaFile = null;
  capaPreview = null;
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

    <div class="relative w-full max-w-md mx-4 bg-card border border-border rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
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
        <!-- Capa -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Capa da Mesa</label>
          <div class="flex items-center gap-4">
            {#if capaPreview}
              <div class="relative">
                <img 
                  src={capaPreview} 
                  alt="Capa" 
                  class="w-20 h-20 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onclick={removeCapa}
                  class="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/80"
                >
                  <X class="w-3 h-3" />
                </button>
              </div>
            {:else}
              <label class="flex items-center gap-2 px-4 py-3 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload class="w-5 h-5 text-muted-foreground" />
                <span class="text-sm text-muted-foreground">Enviar capa</span>
                <input 
                  type="file" 
                  accept="image/*"
                  class="hidden"
                  onchange={handleFileChange}
                />
              </label>
            {/if}
          </div>
        </div>

        <!-- Nome -->
        <div class="space-y-2">
          <label for="gameName" class="text-sm font-medium">Nome da Mesa *</label>
          <Input
            id="gameName"
            type="text"
            bind:value={nome}
            placeholder="Aventura épica"
            required
          />
        </div>

        <!-- Campanha -->
        <div class="space-y-2">
          <label for="campanha" class="text-sm font-medium">Campanha</label>
          <Input
            id="campanha"
            type="text"
            bind:value={campanha}
            placeholder="Saga do Dragão Vermelho"
          />
        </div>

        <!-- Sistema -->
        <div class="space-y-2">
          <label for="sistema" class="text-sm font-medium">Sistema</label>
          <Input
            id="sistema"
            type="text"
            bind:value={sistema}
            placeholder="D&D 5e, Pathfinder, Tormenta..."
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
