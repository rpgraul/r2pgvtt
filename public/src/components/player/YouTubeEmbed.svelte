<script>
import { onMount } from 'svelte';
import { musicState } from '$lib/state/music.svelte.js';

let { videoId, visible = false } = $props();

let player = $state(null);
let playerReady = $state(false);
let container = $state(null);
let apiLoaded = $state(false);
let lastSeekTarget = null;
let mounted = $state(false);
let previousVideoId = $state(null);

onMount(() => {
  mounted = true;

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

  musicState.setPlayer({
    seekTo,
    setVolume: (level) => {
      if (player && playerReady && player.setVolume) {
        player.setVolume(level);
      } else {
        setTimeout(() => {
          if (player && player.setVolume) {
            player.setVolume(level);
          }
        }, 500);
      }
    },
    getDuration: () => {
      if (player && playerReady && player.getDuration) {
        return player.getDuration() || 0;
      }
      return 0;
    },
    getCurrentTime: () => {
      if (player && playerReady && player.getCurrentTime) {
        return player.getCurrentTime() || 0;
      }
      return 0;
    },
    isReady: () => playerReady,
  });
});

function createPlayer() {
  if (!container || !window.YT) return;

  player = new window.YT.Player(container, {
    videoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
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
  if (!mounted || !apiLoaded) return;
  if (!player && window.YT) {
    createPlayer();
  }
});

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
    if (previousVideoId !== videoId) {
      previousVideoId = videoId;
      const currentVideo = player.getVideoData?.();
      if (currentVideo && currentVideo.video_id !== videoId) {
        player.loadVideoById(videoId);
        lastSeekTarget = null;
      }
    }
  }
});

export function seekTo(seconds) {
  if (player && playerReady) {
    lastSeekTarget = seconds;
    player.seekTo(seconds, true);
  }
}
</script>

<div bind:this={container} class="youtube-player" class:hidden={!visible}></div>

<style>
  .youtube-player {
    position: fixed;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
    z-index: -1;
    top: 0;
    left: 0;
  }

  .youtube-player.hidden {
    display: none;
  }

  :global(.youtube-player iframe) {
    width: 1px;
    height: 1px;
    opacity: 0;
  }
</style>