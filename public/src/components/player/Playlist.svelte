<script>
import { musicState } from '$lib/state/music.svelte.js';
import { X, Play, Trash2, Music } from 'lucide-svelte';

const playlist = $derived(musicState.playlist());
const currentIndex = $derived(musicState.currentIndex());
const isPlaying = $derived(musicState.isPlaying());
const isLoading = $derived(musicState.isLoading());

async function handleRemove(trackId) {
  try {
    await musicState.removeTrack(trackId);
  } catch (e) {
    console.error('Failed to remove track:', e);
  }
}

async function handlePlayTrack(index) {
  if (index === currentIndex && isPlaying) {
    await musicState.pause();
  } else {
    await musicState.setTrack(index);
  }
}
</script>

<div class="playlist-container">
  {#if playlist.length === 0}
    <div class="empty-state">
      <Music class="w-8 h-8 text-muted-foreground mb-2" />
      <p class="text-sm text-muted-foreground">Nenhuma música na playlist</p>
      <p class="text-xs text-muted-foreground mt-1">Adicione uma URL do YouTube abaixo</p>
    </div>
  {:else}
    <ul class="track-list">
      {#each playlist as track, index}
        <li
          class="track-item"
          class:active={index === currentIndex}
          class:playing={index === currentIndex && isPlaying}
        >
          <button class="track-info" onclick={() => handlePlayTrack(index)}>
            <img
              src={`https://img.youtube.com/vi/${track.youtube_id}/mqdefault.jpg`}
              alt=""
              class="track-thumb"
            />
            <div class="track-details">
              <span class="track-title">{track.title || track.youtube_id}</span>
              <span class="track-duration">YouTube</span>
            </div>
          </button>
          <button
            class="remove-btn"
            onclick={() => handleRemove(track.id)}
            title="Remover"
          >
            <X class="w-4 h-4" />
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .playlist-container {
    max-height: 300px;
    overflow-y: auto;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    text-align: center;
  }

  .track-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .track-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 0.375rem;
    transition: background-color 0.15s;
  }

  .track-item:hover {
    background-color: hsl(var(--muted) / 0.5);
  }

  .track-item.active {
    background-color: hsl(var(--primary) / 0.1);
  }

  .track-item.playing {
    background-color: hsl(var(--primary) / 0.2);
  }

  .track-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    padding: 0;
    color: inherit;
  }

  .track-thumb {
    width: 64px;
    height: 36px;
    object-fit: cover;
    border-radius: 0.25rem;
    background-color: hsl(var(--muted));
  }

  .track-details {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }

  .track-title {
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .track-duration {
    font-size: 0.75rem;
    color: hsl(var(--muted-foreground));
  }

  .remove-btn {
    padding: 0.5rem;
    border-radius: 0.25rem;
    background: none;
    border: none;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s, color 0.15s;
  }

  .track-item:hover .remove-btn {
    opacity: 1;
  }

  .remove-btn:hover {
    color: hsl(var(--destructive));
    background-color: hsl(var(--destructive) / 0.1);
  }
</style>