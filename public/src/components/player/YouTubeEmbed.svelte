<script>
import { onMount, onDestroy } from 'svelte';
import { musicState } from '$lib/state/music.svelte.js';

let { videoId } = $props();

let player = $state(null);
let playerReady = $state(false);
let container = $state(null);
let apiLoaded = $state(false);
let lastSeekTarget = null;

onMount(() => {
  if (window.YT && window.YT.Player) {
    apiLoaded = true;
    createPlayer();
  } else {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      apiLoaded = true;
      createPlayer();
    };
  }
});

function createPlayer() {
  if (!container || !window.YT) return;

  player = new window.YT.Player(container, {
    videoId,
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      enablejsapi: 1,
      origin: typeof window !== 'undefined' ? window.location.origin : '*',
    },
    events: {
      onReady: () => {
        playerReady = true;
        applyVolume();
        syncState();
      },
      onStateChange: onStateChange,
    },
  });
}

function onStateChange(event) {
  if (event.data === window.YT.PlayerState.ENDED) {
    musicState.autoSkip();
  }
}

function applyVolume() {
  if (player && player.setVolume) {
    player.setVolume(musicState.volume());
  }
}

function syncState() {
  if (!player || !playerReady) return;

  const isPlaying = musicState.isPlaying();
  const startedAt = musicState.startedAt();

  if (isPlaying && startedAt) {
    const elapsed = (Date.now() - startedAt) / 1000;

    if (lastSeekTarget === null || Math.abs(elapsed - lastSeekTarget) > 1) {
      lastSeekTarget = elapsed;
      player.seekTo(elapsed, true);
    }

    if (player.getPlayerState() !== window.YT.PlayerState.PLAYING) {
      player.playVideo();
    }
  } else {
    if (player.getPlayerState() === window.YT.PlayerState.PLAYING) {
      player.pauseVideo();
    }
  }
}

$effect(() => {
  if (playerReady && player) {
    syncState();
  }
});

$effect(() => {
  if (playerReady && player) {
    applyVolume();
  }
});

$effect(() => {
  if (playerReady && player && videoId) {
    const currentVideo = player.getVideoData?.();
    if (currentVideo && currentVideo.video_id !== videoId) {
      player.loadVideoById(videoId);
      lastSeekTarget = null;
    }
  }
});

onDestroy(() => {
  if (player) {
    player.destroy();
    player = null;
  }
  playerReady = false;
});

export function seekTo(seconds) {
  if (player && playerReady) {
    lastSeekTarget = seconds;
    player.seekTo(seconds, true);
  }
}

export function setPlayerVolume(level) {
  if (player && playerReady && player.setVolume) {
    player.setVolume(level);
  }
}
</script>

<div bind:this={container} class="youtube-player"></div>

<style>
  .youtube-player {
    width: 100%;
    aspect-ratio: 16 / 9;
    background-color: #000;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  :global(.youtube-player iframe) {
    width: 100%;
    height: 100%;
  }
</style>