import { audioStore } from './audio.svelte';

export const audioState = {
  get videoId() {
    return audioStore.currentVideoId;
  },
  get status() {
    return audioStore.status;
  },
  get volume() {
    return audioStore.volume / 100;
  },
  get isVisible() {
    if (typeof localStorage === 'undefined') return true;
    return localStorage.getItem('audioPlayerVisible') !== 'false';
  },
  get isPlaying() {
    return audioStore.status === 'playing';
  },
  get hasVideo() {
    return !!audioStore.currentVideoId;
  },

  init(gameId) {
    audioStore.init(gameId);
  },

  destroy() {
    audioStore.destroy();
  },

  setPlayer(player) {},

  togglePlay() {
    if (audioStore.status === 'playing') {
      audioStore.pause();
    } else {
      audioStore.resume();
    }
  },

  play(gameId) {
    audioStore.setGameId(gameId);
  },

  pause(gameId) {
    audioStore.pause();
  },

  seekTo(gameId, timestamp) {
    audioStore.seekTo(timestamp);
  },

  setVideoId(gameId, videoId) {
    audioStore.setGameId(gameId);
    audioStore.play(videoId);
  },

  setVolume(newVolume) {
    audioStore.setVolume(newVolume * 100);
  },

  toggleVisibility() {
    const current = localStorage.getItem('audioPlayerVisible');
    const newValue = current === 'false' ? 'true' : 'false';
    localStorage.setItem('audioPlayerVisible', newValue);
  },
};
