<script>
import { Pause, Play, Repeat, Repeat1, SkipForward, Volume2, VolumeX } from 'lucide-svelte';
import { onDestroy, onMount } from 'svelte';
import { musicState } from '$lib/state/music.svelte.js';

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

<div class="space-y-3.5 select-none">
  <!-- Track info banner -->
  <div class="p-3 bg-secondary/30 border rounded flex items-center gap-3">
    {#if currentTrack}
      <img
        src={`https://img.youtube.com/vi/${currentTrack.youtube_id}/mqdefault.jpg`}
        alt=""
        class="w-12 h-7 object-cover rounded border border-border shrink-0"
      />
      <div class="min-w-0 flex-1">
        <span class="text-[8px] text-muted-foreground uppercase tracking-wider block font-bold">Tocando agora</span>
        <span class="text-xs text-foreground font-semibold truncate block mt-0.5">{currentTrack.title || currentTrack.youtube_id}</span>
      </div>
    {:else}
      <div class="flex items-center justify-center py-2 flex-grow text-center text-xs text-muted-foreground">
        Nenhuma faixa tocando
      </div>
    {/if}
  </div>

  <!-- Progress Bar -->
  <div class="flex items-center gap-2 text-[10px]">
    <span class="text-muted-foreground min-w-[28px] text-right font-medium">{formatTime(currentTime)}</span>
    <div
      class="flex-grow h-1.5 bg-secondary rounded-full cursor-pointer relative overflow-hidden"
      onclick={handleProgressClick}
      role="slider"
      aria-valuenow={currentTime}
      aria-valuemin="0"
      aria-valuemax={duration}
      tabindex="0"
    >
      <div class="h-full bg-primary transition-all duration-100 rounded-full" style="width: {progress}%"></div>
    </div>
    <span class="text-muted-foreground min-w-[28px] text-left font-medium">{formatTime(duration)}</span>
  </div>

  <!-- Playback buttons -->
  <div class="flex items-center justify-center gap-3.5 pt-1">
    <button
      class="p-1.5 rounded transition-colors cursor-pointer {repeatMode !== 'off' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}"
      onclick={handleRepeat}
      title="Repetir: {repeatMode === 'off' ? 'Desligado' : repeatMode === 'track' ? 'Música' : 'Playlist'}"
    >
      {#if repeatMode === 'track'}
        <Repeat1 class="w-4.5 h-4.5" />
      {:else}
        <Repeat class="w-4.5 h-4.5" />
      {/if}
    </button>

    <button
      class="p-2.5 rounded-full border bg-background hover:bg-secondary/60 text-foreground cursor-pointer transition-colors shadow-sm disabled:opacity-50"
      onclick={handlePlayPause}
      disabled={!canPlay || isLoading}
      title={isPlaying ? 'Pausar' : 'Reproduzir'}
    >
      {#if isPlaying}
        <Pause class="w-5 h-5 fill-current" />
      {:else}
        <Play class="w-5 h-5 fill-current" />
      {/if}
    </button>

    <button
      class="p-1.5 rounded transition-colors cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-50"
      onclick={handleSkip}
      disabled={!canSkip || isLoading}
      title="Próxima"
    >
      <SkipForward class="w-4.5 h-4.5 fill-current" />
    </button>
  </div>

  <!-- Volume control -->
  <div class="flex items-center gap-2 pt-1">
    <button class="text-muted-foreground hover:text-foreground p-1 cursor-pointer transition-colors" onclick={handleToggleMute} title={isMuted ? 'Ativar som' : 'Silenciar'}>
      {#if localVolume === 0 || isMuted}
        <VolumeX class="w-3.5 h-3.5" />
      {:else}
        <Volume2 class="w-3.5 h-3.5" />
      {/if}
    </button>
    <input
      type="range"
      min="0"
      max="100"
      value={isMuted ? 0 : localVolume}
      oninput={handleVolumeChange}
      class="flex-1 h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
    />
    <span class="text-[10px] text-muted-foreground min-w-[28px] text-right font-medium">{isMuted ? 0 : localVolume}%</span>
  </div>
</div>