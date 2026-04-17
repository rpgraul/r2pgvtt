<script>
import { musicState } from '$lib/state/music.svelte.js';
import { Play, Pause, SkipForward, Volume2, VolumeX, Repeat, Repeat1 } from 'lucide-svelte';
import { onMount, onDestroy } from 'svelte';

const isPlaying = $derived(musicState.isPlaying());
const currentTrack = $derived(musicState.currentTrack());
const playlist = $derived(musicState.playlist());
const volume = $derived(musicState.volume());
const isLoading = $derived(musicState.isLoading());
const repeatMode = $derived(musicState.repeatMode());
const startedAt = $derived(musicState.startedAt());

let isMuted = $state(false);
let previousVolume = $state(70);
let currentTime = $state(0);
let duration = $state(0);
let progressInterval = null;
let localVolume = $state(70);

const canPlay = $derived(playlist.length > 0);

const currentTrackIndex = $derived(
  currentTrack ? playlist.findIndex((t) => t.id === currentTrack.id) : -1,
);

const canSkip = $derived(currentTrackIndex >= 0 && currentTrackIndex < playlist.length - 1);

$effect(() => {
  localVolume = volume;
});

onMount(() => {
  progressInterval = setInterval(updateProgress, 500);
});

onDestroy(() => {
  if (progressInterval) clearInterval(progressInterval);
});

function updateProgress() {
  const player = musicState.getPlayer();
  if (player && player.isReady && player.isReady()) {
    const d = player.getDuration();
    if (d > 0) {
      duration = d;
      musicState.setDuration(d);
    }
    const t = player.getCurrentTime();
    if (t !== undefined) {
      currentTime = t;
    }
  } else if (startedAt && isPlaying) {
    currentTime = (Date.now() - startedAt) / 1000;
    if (duration > 0 && currentTime > duration) {
      currentTime = duration;
    }
  }
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

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

function handleRepeat() {
  musicState.cycleRepeatMode();
}

function handleVolumeChange(e) {
  const newVolume = parseInt(e.target.value, 10);
  localVolume = newVolume;
  musicState.setVolume(newVolume);
  if (newVolume > 0) {
    isMuted = false;
    previousVolume = newVolume;
  }

  const player = musicState.getPlayer();
  if (player && player.setVolume) {
    player.setVolume(newVolume);
  } else {
    setTimeout(() => {
      const p = musicState.getPlayer();
      if (p && p.setVolume) {
        p.setVolume(newVolume);
      }
    }, 500);
  }
}

function handleToggleMute() {
  const player = musicState.getPlayer();
  const targetVolume = localVolume > 0 ? 0 : previousVolume || 70;

  localVolume = targetVolume;
  musicState.setVolume(targetVolume);
  isMuted = localVolume > 0 ? false : true;

  if (player && player.setVolume) {
    player.setVolume(targetVolume);
  } else {
    setTimeout(() => {
      const p = musicState.getPlayer();
      if (p && p.setVolume) {
        p.setVolume(targetVolume);
      }
    }, 500);
  }
}

function handleProgressClick(e) {
  if (!duration) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  const newTime = percent * duration;

  const player = musicState.getPlayer();
  if (player && player.seekTo) {
    player.seekTo(newTime);
  }

  musicState.setStartedAt(Date.now() - newTime * 1000);
}

const progress = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);
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

  <div class="progress-section">
    <span class="time-label">{formatTime(currentTime)}</span>
    <div
      class="progress-bar"
      onclick={handleProgressClick}
      role="slider"
      aria-valuenow={currentTime}
      aria-valuemin="0"
      aria-valuemax={duration}
      tabindex="0"
    >
      <div class="progress-fill" style="width: {progress}%"></div>
    </div>
    <span class="time-label">{formatTime(duration)}</span>
  </div>

  <div class="buttons-row">
    <button
      class="control-btn"
      class:active={repeatMode !== 'off'}
      class:primary={repeatMode === 'track'}
      class:off={repeatMode === 'off'}
      onclick={handleRepeat}
      title="Repetir: {repeatMode === 'off' ? 'Desligado' : repeatMode === 'track' ? 'Música' : 'Playlist'}"
    >
      {#if repeatMode === 'track'}
        <Repeat1 class="w-5 h-5" />
      {:else}
        <Repeat class="w-5 h-5" />
      {/if}
    </button>

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
      {#if localVolume === 0 || isMuted}
        <VolumeX class="w-4 h-4" />
      {:else}
        <Volume2 class="w-4 h-4" />
      {/if}
    </button>
    <input
      type="range"
      min="0"
      max="100"
      value={isMuted ? 0 : localVolume}
      oninput={handleVolumeChange}
      class="volume-slider"
    />
    <span class="volume-label">{isMuted ? 0 : localVolume}%</span>
  </div>
</div>

<style>
  .controls-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
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

  .progress-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .time-label {
    font-size: 0.75rem;
    color: hsl(var(--muted-foreground));
    min-width: 2.5rem;
    text-align: center;
  }

  .progress-bar {
    flex: 1;
    height: 0.5rem;
    background-color: #4a4a4a;
    border-radius: 9999px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background-color: #22c55e;
    border-radius: 9999px;
    transition: width 0.1s linear;
  }

  .buttons-row {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    align-items: center;
  }

  .control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
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

  .control-btn.active {
    color: hsl(var(--primary));
  }

  .control-btn.off {
    opacity: 0.5;
  }

  .control-btn.active.primary {
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
    height: 0.5rem;
    background-color: #4a4a4a;
    border-radius: 9999px;
    appearance: none;
    cursor: pointer;
  }

  .volume-slider::-webkit-slider-thumb {
    appearance: none;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background-color: #22c55e;
    cursor: pointer;
    transition: transform 0.15s;
    border: 2px solid white;
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