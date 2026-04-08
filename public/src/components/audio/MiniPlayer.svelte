<script>
import { onMount } from 'svelte';
import { audioStore } from '$lib/state/audio.svelte.ts';
import { authState } from '$lib/state/auth.svelte.ts';
import { Play, Pause, Volume2, VolumeX, Settings, RefreshCw, Music } from 'lucide-svelte';
import { cn } from '$lib/utils/cn.js';
import Button from '$components/ui/Button.svelte';
import Input from '$components/ui/Input.svelte';

let showSettings = $state(false);
let videoUrl = $state('');

const isNarrator = $derived(authState.role === 'narrador');
const currentVideoId = $derived(audioStore.currentVideoId);
const status = $derived(audioStore.status);
const volume = $derived(audioStore.volume);
const isPlaying = $derived(status === 'playing');
const hasVideo = $derived(!!currentVideoId);

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function handleSetVideo() {
  const videoId = extractVideoId(videoUrl);
  if (videoId) {
    audioStore.play(videoId);
    videoUrl = '';
    showSettings = false;
  }
}

function handlePlayPause() {
  if (status === 'playing') {
    audioStore.pause();
  } else {
    audioStore.resume();
  }
}

function handleVolumeChange(e) {
  const newVolume = parseFloat(e.target.value) * 100;
  audioStore.setVolume(newVolume);
}

function handleToggleMute() {
  audioStore.setVolume(volume > 0 ? 0 : 80);
}
</script>

<div class="space-y-4">
  <!-- Video Info -->
  {#if hasVideo}
    <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
      <div class="w-16 h-12 bg-black rounded flex items-center justify-center">
        <img 
          src={`https://img.youtube.com/vi/${currentVideoId}/mqdefault.jpg`} 
          alt="Video thumbnail"
          class="w-full h-full object-cover rounded"
        />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">Reproduzindo</p>
        <p class="text-xs text-muted-foreground truncate">YouTube</p>
      </div>
    </div>
  {:else}
    <div class="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
      <div class="text-center">
        <Music class="w-12 h-12 mx-auto text-muted-foreground mb-2" />
        <p class="text-sm text-muted-foreground">
          {#if isNarrator}
            Configure um vídeo para começar
          {:else}
            Aguardando música...
          {/if}
        </p>
      </div>
    </div>
  {/if}
  
  <!-- Controls -->
  <div class="flex items-center gap-2">
    {#if isNarrator && hasVideo}
      <Button
        size="sm"
        variant={isPlaying ? "secondary" : "default"}
        onclick={handlePlayPause}
      >
        {#if isPlaying}
          <Pause class="w-4 h-4" />
        {:else}
          <Play class="w-4 h-4" />
        {/if}
      </Button>
    {:else if hasVideo}
      <div class={cn(
        "p-2 rounded-full",
        isPlaying ? "bg-primary/50 text-primary-foreground" : "bg-muted text-muted-foreground"
      )}>
        {#if isPlaying}
          <Play class="w-4 h-4" />
        {:else}
          <Pause class="w-4 h-4" />
        {/if}
      </div>
    {/if}
    
    <!-- Volume -->
    <div class="flex items-center gap-1 flex-1">
      <button onclick={handleToggleMute}>
        {#if volume === 0}
          <VolumeX class="w-4 h-4 text-muted-foreground" />
        {:else}
          <Volume2 class="w-4 h-4" />
        {/if}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume / 100}
        oninput={handleVolumeChange}
        class="flex-1 h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
      />
      <span class="text-xs text-muted-foreground w-8">{Math.round(volume)}%</span>
    </div>
    
    <!-- Settings -->
    <button
      onclick={() => showSettings = !showSettings}
      class="p-2 rounded-md hover:bg-muted transition-colors"
      title="Configurações"
    >
      <Settings class="w-4 h-4" />
    </button>
  </div>
  
  <!-- Settings Panel -->
  {#if showSettings}
    <div class="space-y-3 pt-3 border-t">
      {#if isNarrator}
        <div class="flex gap-2">
          <Input
            type="text"
            bind:value={videoUrl}
            placeholder="URL do YouTube"
            class="flex-1"
          />
          <Button size="sm" onclick={handleSetVideo}>
            Tocar
          </Button>
        </div>
        <div class="flex gap-2">
          <Button size="sm" variant="outline" onclick={() => audioStore.stop()}>
            Parar
          </Button>
        </div>
      {/if}
      
      <button
        onclick={() => audioStore.seekTo(0)}
        class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <RefreshCw class="w-3 h-3" />
        Reiniciar
      </button>
    </div>
  {/if}
</div>
