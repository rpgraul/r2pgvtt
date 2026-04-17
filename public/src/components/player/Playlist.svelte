<script>
  import { musicState } from '$lib/state/music.svelte.js';
  import { X, Music, Play, Pause } from 'lucide-svelte';

  const playlist = $derived(musicState.playlist());
  const currentTrack = $derived(musicState.currentTrack());
  const isPlaying = $derived(musicState.isPlaying());
  const isLoading = $derived(musicState.isLoading());

  function isCurrentTrack(trackId) {
    return currentTrack?.id === trackId;
  }

  async function handleRemove(trackId) {
    try {
      await musicState.removeTrack(trackId);
    } catch (e) {
      console.error('Failed to remove track:', e);
    }
  }

  async function handlePlayTrack(track, index) {
    if (currentTrack?.id === track.id && isPlaying) {
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
      {#each playlist as track, index (track.id)}
        <li
          class="track-item"
          class:active={isCurrentTrack(track.id)}
          class:playing={isCurrentTrack(track.id) && isPlaying}
        >
          <button class="track-info" onclick={() => handlePlayTrack(track, index)}>
            <div class="thumb-wrapper">
              <img
                src={`https://img.youtube.com/vi/${track.youtube_id}/mqdefault.jpg`}
                alt=""
                class="track-thumb"
              />
              {#if isCurrentTrack(track.id)}
                <div class="play-overlay">
                  {#if isPlaying}
                    <Pause class="w-5 h-5 text-white" />
                  {:else}
                    <Play class="w-5 h-5 text-white" />
                  {/if}
                </div>
              {/if}
            </div>
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
    max-height: 250px;
    overflow-y: auto;
    overflow-x: hidden;
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
    gap: 0.25rem;
    padding: 0.375rem;
    border-radius: 0.375rem;
    transition: background-color 0.15s;
  }

  .track-item:hover {
    background-color: hsl(var(--muted) / 0.5);
  }

  .track-item.active {
    background-color: hsl(var(--primary) / 0.15);
  }

  .track-item.playing {
    background-color: hsl(var(--primary) / 0.25);
  }

  .track-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    padding: 0.25rem;
    color: inherit;
  }

  .thumb-wrapper {
    position: relative;
    flex-shrink: 0;
  }

  .track-thumb {
    width: 56px;
    height: 32px;
    object-fit: cover;
    border-radius: 0.25rem;
    background-color: hsl(var(--muted));
  }

  .play-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 0.25rem;
  }

  .track-details {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }

  .track-title {
    font-size: 0.8125rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .track-duration {
    font-size: 0.6875rem;
    color: hsl(var(--muted-foreground));
  }

  .remove-btn {
    padding: 0.375rem;
    border-radius: 0.25rem;
    background: none;
    border: none;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s, color 0.15s;
    flex-shrink: 0;
  }

  .track-item:hover .remove-btn {
    opacity: 1;
  }

  .remove-btn:hover {
    color: hsl(var(--destructive));
    background-color: hsl(var(--destructive) / 0.1);
  }
</style>