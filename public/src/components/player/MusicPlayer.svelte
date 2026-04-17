<script>
import { onMount } from 'svelte';
import { musicState } from '$lib/state/music.svelte.js';
import { gameState } from '$lib/state/gameState.svelte.ts';
import Playlist from './Playlist.svelte';
import Controls from './Controls.svelte';

let urlInput = $state('');
let isAdding = $state(false);
let addError = $state(null);

const currentTrack = $derived(musicState.currentTrack());
const isLoading = $derived(musicState.isLoading());
const error = $derived(musicState.error());
const isLoaded = $derived(musicState.isLoaded());

onMount(() => {
  const gameId = gameState.gameId;
  if (gameId && !musicState.isLoaded()) {
    musicState.init(gameId);
  }
});

async function handleAddTrack() {
  if (!urlInput.trim()) return;

  isAdding = true;
  addError = null;

  try {
    await musicState.addTrack(urlInput.trim());
    urlInput = '';
  } catch (e) {
    addError = e.message || 'Erro ao adicionar música';
  } finally {
    isAdding = false;
  }
}

function handleKeyDown(e) {
  if (e.key === 'Enter') {
    handleAddTrack();
  }
}

function clearError() {
  addError = null;
  musicState.clearError();
}
</script>

<div class="music-player">
  {#if !isLoaded}
    <div class="loading">
      <div class="spinner"></div>
      <span class="text-sm text-muted-foreground">Carregando player...</span>
    </div>
  {:else}
    <div class="player-content">
      <Controls />

      <div class="add-track-section">
        <div class="add-track-input">
          <input
            type="text"
            bind:value={urlInput}
            onkeydown={handleKeyDown}
            placeholder="Cole a URL do YouTube..."
            class="url-input"
            disabled={isAdding}
          />
          <button
            class="add-btn"
            onclick={handleAddTrack}
            disabled={!urlInput.trim() || isAdding}
          >
            {#if isAdding}
              <span class="spinner-small"></span>
            {:else}
              Adicionar
            {/if}
          </button>
        </div>
        {#if addError}
          <p class="error-text">{addError}</p>
        {/if}
      </div>

      <div class="playlist-section">
        <Playlist />
      </div>
    </div>
  {/if}
</div>

<style>
  .music-player {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem 1rem;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid hsl(var(--muted));
    border-top-color: hsl(var(--primary));
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .spinner-small {
    width: 1rem;
    height: 1rem;
    border: 2px solid hsl(var(--primary-foreground));
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .player-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem;
  }

  .video-section {
    width: 100%;
  }

  .add-track-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .add-track-input {
    display: flex;
    gap: 0.5rem;
  }

  .url-input {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border: 1px solid hsl(var(--border));
    border-radius: 0.375rem;
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    font-size: 0.875rem;
  }

  .url-input:focus {
    outline: none;
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
  }

  .url-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .url-input::placeholder {
    color: hsl(var(--muted-foreground));
  }

  .add-btn {
    padding: 0.5rem 1rem;
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 80px;
  }

  .add-btn:hover:not(:disabled) {
    background-color: hsl(var(--primary) / 0.9);
  }

  .add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error-text {
    font-size: 0.75rem;
    color: hsl(var(--destructive));
    margin: 0;
  }

  .playlist-section {
    margin-top: 0.5rem;
  }
</style>