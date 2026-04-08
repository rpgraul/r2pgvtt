<script>
import { musicState } from '$lib/state/music.svelte.js';
import { Play, Pause, SkipForward, Volume2, VolumeX } from 'lucide-svelte';

const isPlaying = $derived(musicState.isPlaying());
const currentTrack = $derived(musicState.currentTrack());
const playlist = $derived(musicState.playlist());
const currentIndex = $derived(musicState.currentIndex());
const volume = $derived(musicState.volume());
const isLoading = $derived(musicState.isLoading());

let isMuted = $state(false);
let previousVolume = $state(70);

function handlePlayPause() {
  if (isPlaying) {
    musicState.pause();
  } else {
    musicState.play();
  }
}

function handleSkip() {
  musicState.skip();
}

function handleVolumeChange(e) {
  const newVolume = parseInt(e.target.value, 10);
  musicState.setVolume(newVolume);
  if (newVolume > 0) {
    isMuted = false;
    previousVolume = newVolume;
  }
}

function handleToggleMute() {
  if (volume > 0) {
    previousVolume = volume;
    musicState.setVolume(0);
    isMuted = true;
  } else {
    musicState.setVolume(previousVolume || 70);
    isMuted = false;
  }
}

const canPlay = $derived(playlist.length > 0);
const canSkip = $derived(currentIndex < playlist.length - 1);
</script>

<div class="controls-container">
  <div class="now-playing">
    {#if currentTrack}
      <img
        src={`https://img.youtube.com/vi/${currentTrack.youtube_id}/mqdefault.jpg`}
        alt=""
        class="now-playing-thumb"
      />
      <div class="now-playing-info">
        <span class="now-playing-label">Tocando agora</span>
        <span class="now-playing-title">{currentTrack.title || currentTrack.youtube_id}</span>
      </div>
    {:else}
      <div class="now-playing-empty">
        <span class="text-sm text-muted-foreground">Nenhuma música selecionada</span>
      </div>
    {/if}
  </div>

  <div class="buttons-row">
    <button
      class="control-btn"
      class:primary={isPlaying}
      onclick={handlePlayPause}
      disabled={!canPlay || isLoading}
      title={isPlaying ? 'Pausar' : 'Reproduzir'}
    >
      {#if isPlaying}
        <Pause class="w-5 h-5" />
      {:else}
        <Play class="w-5 h-5" />
      {/if}
    </button>

    <button
      class="control-btn"
      onclick={handleSkip}
      disabled={!canSkip || isLoading}
      title="Próxima"
    >
      <SkipForward class="w-5 h-5" />
    </button>
  </div>

  <div class="volume-row">
    <button class="volume-btn" onclick={handleToggleMute} title={isMuted ? 'Ativar som' : 'Silenciar'}>
      {#if volume === 0 || isMuted}
        <VolumeX class="w-4 h-4" />
      {:else}
        <Volume2 class="w-4 h-4" />
      {/if}
    </button>
    <input
      type="range"
      min="0"
      max="100"
      value={isMuted ? 0 : volume}
      oninput={handleVolumeChange}
      class="volume-slider"
    />
    <span class="volume-label">{isMuted ? 0 : volume}%</span>
  </div>
</div>

<style>
  .controls-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .now-playing {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background-color: hsl(var(--muted) / 0.5);
    border-radius: 0.5rem;
  }

  .now-playing-thumb {
    width: 56px;
    height: 32px;
    object-fit: cover;
    border-radius: 0.25rem;
  }

  .now-playing-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }

  .now-playing-label {
    font-size: 0.625rem;
    text-transform: uppercase;
    color: hsl(var(--muted-foreground));
    letter-spacing: 0.05em;
  }

  .now-playing-title {
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .now-playing-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 0.5rem;
  }

  .buttons-row {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
  }

  .control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    border: none;
    background-color: hsl(var(--muted));
    color: hsl(var(--foreground));
    cursor: pointer;
    transition: all 0.15s;
  }

  .control-btn:hover:not(:disabled) {
    background-color: hsl(var(--primary) / 0.2);
    transform: scale(1.05);
  }

  .control-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .control-btn.primary {
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
  }

  .volume-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .volume-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    border: none;
    background: none;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    border-radius: 0.25rem;
    transition: color 0.15s;
  }

  .volume-btn:hover {
    color: hsl(var(--foreground));
  }

  .volume-slider {
    flex: 1;
    height: 0.25rem;
    background-color: hsl(var(--muted));
    border-radius: 9999px;
    appearance: none;
    cursor: pointer;
  }

  .volume-slider::-webkit-slider-thumb {
    appearance: none;
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background-color: hsl(var(--primary));
    cursor: pointer;
    transition: transform 0.15s;
  }

  .volume-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .volume-label {
    font-size: 0.75rem;
    color: hsl(var(--muted-foreground));
    min-width: 2.5rem;
    text-align: right;
  }
</style>