import { d as derived, a as attr, h as head, b as attr_class, c as bind_props, s as sanitize_props, e as spread_props, f as slot, g as ensure_array_like, i as escape_html, j as clsx, k as attr_style, l as stringify, m as store_get, u as unsubscribe_stores } from "../../chunks/index2.js";
import "clsx";
import { c as createSubscriber, b as box, M as MediaQuery, X, P as Plus, D as Dialog_1, a as DialogContent, d as DialogTitle, C as Chevron_down } from "../../chunks/DialogTitle.js";
import "style-to-object";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/root.js";
import "../../chunks/state.svelte.js";
import { p as page } from "../../chunks/stores.js";
import { o as onDestroy, t as toast } from "../../chunks/toast.js";
import { s as supabase } from "../../chunks/client.js";
import { diceStore } from "../../chunks/diceStore.svelte.js";
import { I as Icon } from "../../chunks/Icon.js";
import { c as cn } from "../../chunks/cn.js";
import { a as authState } from "../../chunks/auth.svelte.js";
import { gameState } from "../../chunks/gameState.svelte.js";
import { B as Button } from "../../chunks/Button.js";
import { U as User } from "../../chunks/user.js";
function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
const defaultWindow = void 0;
function getActiveElement(document2) {
  let activeElement = document2.activeElement;
  while (activeElement?.shadowRoot) {
    const node = activeElement.shadowRoot.activeElement;
    if (node === activeElement)
      break;
    else
      activeElement = node;
  }
  return activeElement;
}
class ActiveElement {
  #document;
  #subscribe;
  constructor(options = {}) {
    const { window: window2 = defaultWindow, document: document2 = window2?.document } = options;
    if (window2 === void 0) return;
    this.#document = document2;
    this.#subscribe = createSubscriber();
  }
  get current() {
    this.#subscribe?.();
    if (!this.#document) return null;
    return getActiveElement(this.#document);
  }
}
new ActiveElement();
function getStorage(storageType, window2) {
  switch (storageType) {
    case "local":
      return window2.localStorage;
    case "session":
      return window2.sessionStorage;
  }
}
class PersistedState {
  #current;
  #key;
  #serializer;
  #storage;
  #subscribe;
  #version = 0;
  constructor(key, initialValue, options = {}) {
    const {
      storage: storageType = "local",
      serializer = { serialize: JSON.stringify, deserialize: JSON.parse },
      syncTabs = true,
      window: window2 = defaultWindow
    } = options;
    this.#current = initialValue;
    this.#key = key;
    this.#serializer = serializer;
    if (window2 === void 0) return;
    const storage = getStorage(storageType, window2);
    this.#storage = storage;
    const existingValue = storage.getItem(key);
    if (existingValue !== null) {
      this.#current = this.#deserialize(existingValue);
    } else {
      this.#serialize(initialValue);
    }
    if (syncTabs && storageType === "local") {
      this.#subscribe = createSubscriber();
    }
  }
  get current() {
    this.#subscribe?.();
    this.#version;
    const root = this.#deserialize(this.#storage?.getItem(this.#key)) ?? this.#current;
    const proxies = /* @__PURE__ */ new WeakMap();
    const proxy = (value) => {
      if (value === null || value?.constructor.name === "Date" || typeof value !== "object") {
        return value;
      }
      let p = proxies.get(value);
      if (!p) {
        p = new Proxy(value, {
          get: (target, property) => {
            this.#version;
            return proxy(Reflect.get(target, property));
          },
          set: (target, property, value2) => {
            this.#version += 1;
            Reflect.set(target, property, value2);
            this.#serialize(root);
            return true;
          }
        });
        proxies.set(value, p);
      }
      return p;
    };
    return proxy(root);
  }
  set current(newValue) {
    this.#serialize(newValue);
    this.#version += 1;
  }
  #handleStorageEvent = (event) => {
    if (event.key !== this.#key || event.newValue === null) return;
    this.#current = this.#deserialize(event.newValue);
    this.#version += 1;
  };
  #deserialize(value) {
    try {
      return this.#serializer.deserialize(value);
    } catch (error) {
      console.error(`Error when parsing "${value}" from persisted store "${this.#key}"`, error);
      return;
    }
  }
  #serialize(value) {
    try {
      if (value != void 0) {
        this.#storage?.setItem(this.#key, this.#serializer.serialize(value));
      }
    } catch (error) {
      console.error(`Error when writing value from persisted store "${this.#key}" to ${this.#storage}`, error);
    }
  }
}
function sanitizeClassNames(classNames) {
  return classNames.filter((className) => className.length > 0);
}
const noopStorage = {
  getItem: (_key) => null,
  setItem: (_key, _value) => {
  }
};
const isBrowser = typeof document !== "undefined";
const modeStorageKey = box("mode-watcher-mode");
const themeStorageKey = box("mode-watcher-theme");
const modes = ["dark", "light", "system"];
function isValidMode(value) {
  if (typeof value !== "string")
    return false;
  return modes.includes(value);
}
class UserPrefersMode {
  #defaultValue = "system";
  #storage = isBrowser ? localStorage : noopStorage;
  #initialValue = this.#storage.getItem(modeStorageKey.current);
  #value = isValidMode(this.#initialValue) ? this.#initialValue : this.#defaultValue;
  #persisted = this.#makePersisted();
  #makePersisted(value = this.#value) {
    return new PersistedState(modeStorageKey.current, value, {
      serializer: {
        serialize: (v) => v,
        deserialize: (v) => {
          if (isValidMode(v)) return v;
          return this.#defaultValue;
        }
      }
    });
  }
  constructor() {
  }
  get current() {
    return this.#persisted.current;
  }
  set current(newValue) {
    this.#persisted.current = newValue;
  }
}
class SystemPrefersMode {
  #defaultValue = void 0;
  #track = true;
  #current = this.#defaultValue;
  #mediaQueryState = typeof window !== "undefined" && typeof window.matchMedia === "function" ? new MediaQuery("prefers-color-scheme: light") : { current: false };
  query() {
    if (!isBrowser) return;
    this.#current = this.#mediaQueryState.current ? "light" : "dark";
  }
  tracking(active) {
    this.#track = active;
  }
  constructor() {
    this.query = this.query.bind(this);
    this.tracking = this.tracking.bind(this);
  }
  get current() {
    return this.#current;
  }
}
const userPrefersMode = new UserPrefersMode();
const systemPrefersMode = new SystemPrefersMode();
let timeoutAction;
let timeoutEnable;
let hasLoaded = false;
let styleElement = null;
function getStyleElement() {
  if (styleElement)
    return styleElement;
  styleElement = document.createElement("style");
  styleElement.appendChild(document.createTextNode(`* {
		-webkit-transition: none !important;
		-moz-transition: none !important;
		-o-transition: none !important;
		-ms-transition: none !important;
		transition: none !important;
	}`));
  return styleElement;
}
function withoutTransition(action, synchronous = false) {
  if (typeof document === "undefined")
    return;
  if (!hasLoaded) {
    hasLoaded = true;
    action();
    return;
  }
  const isTest = typeof process !== "undefined" && process.env?.NODE_ENV === "test" || typeof window !== "undefined" && window.__vitest_worker__;
  if (isTest) {
    action();
    return;
  }
  clearTimeout(timeoutAction);
  clearTimeout(timeoutEnable);
  const style = getStyleElement();
  const disable = () => document.head.appendChild(style);
  const enable = () => {
    if (style.parentNode) {
      document.head.removeChild(style);
    }
  };
  function executeAction() {
    action();
    window.requestAnimationFrame(enable);
  }
  if (typeof window.requestAnimationFrame !== "undefined") {
    disable();
    if (synchronous) {
      executeAction();
    } else {
      window.requestAnimationFrame(() => {
        executeAction();
      });
    }
    return;
  }
  disable();
  timeoutAction = window.setTimeout(() => {
    action();
    timeoutEnable = window.setTimeout(enable, 16);
  }, 16);
}
const themeColors = box(void 0);
const disableTransitions = box(true);
const synchronousModeChanges = box(false);
const darkClassNames = box([]);
const lightClassNames = box([]);
function createDerivedMode() {
  const current = derived(() => {
    if (!isBrowser) return void 0;
    const derivedMode2 = userPrefersMode.current === "system" ? systemPrefersMode.current : userPrefersMode.current;
    const sanitizedDarkClassNames = sanitizeClassNames(darkClassNames.current);
    const sanitizedLightClassNames = sanitizeClassNames(lightClassNames.current);
    function update() {
      const htmlEl = document.documentElement;
      const themeColorEl = document.querySelector('meta[name="theme-color"]');
      if (derivedMode2 === "light") {
        if (sanitizedDarkClassNames.length) htmlEl.classList.remove(...sanitizedDarkClassNames);
        if (sanitizedLightClassNames.length) htmlEl.classList.add(...sanitizedLightClassNames);
        htmlEl.style.colorScheme = "light";
        if (themeColorEl && themeColors.current) {
          themeColorEl.setAttribute("content", themeColors.current.light);
        }
      } else {
        if (sanitizedLightClassNames.length) htmlEl.classList.remove(...sanitizedLightClassNames);
        if (sanitizedDarkClassNames.length) htmlEl.classList.add(...sanitizedDarkClassNames);
        htmlEl.style.colorScheme = "dark";
        if (themeColorEl && themeColors.current) {
          themeColorEl.setAttribute("content", themeColors.current.dark);
        }
      }
    }
    if (disableTransitions.current) {
      withoutTransition(update, synchronousModeChanges.current);
    } else {
      update();
    }
    return derivedMode2;
  });
  return {
    get current() {
      return current();
    }
  };
}
const derivedMode = createDerivedMode();
function toggleMode() {
  userPrefersMode.current = derivedMode.current === "dark" ? "light" : "dark";
}
function defineConfig(config) {
  return config;
}
function setInitialMode({ defaultMode = "system", themeColors: themeColors2, darkClassNames: darkClassNames2 = ["dark"], lightClassNames: lightClassNames2 = [], defaultTheme = "", modeStorageKey: modeStorageKey2 = "mode-watcher-mode", themeStorageKey: themeStorageKey2 = "mode-watcher-theme" }) {
  const rootEl = document.documentElement;
  const mode = localStorage.getItem(modeStorageKey2) ?? defaultMode;
  const theme = localStorage.getItem(themeStorageKey2) ?? defaultTheme;
  const light = mode === "light" || mode === "system" && window.matchMedia("(prefers-color-scheme: light)").matches;
  if (light) {
    if (darkClassNames2.length)
      rootEl.classList.remove(...darkClassNames2.filter(Boolean));
    if (lightClassNames2.length)
      rootEl.classList.add(...lightClassNames2.filter(Boolean));
  } else {
    if (lightClassNames2.length)
      rootEl.classList.remove(...lightClassNames2.filter(Boolean));
    if (darkClassNames2.length)
      rootEl.classList.add(...darkClassNames2.filter(Boolean));
  }
  rootEl.style.colorScheme = light ? "light" : "dark";
  if (themeColors2) {
    const themeMetaEl = document.querySelector('meta[name="theme-color"]');
    if (themeMetaEl) {
      themeMetaEl.setAttribute("content", mode === "light" ? themeColors2.light : themeColors2.dark);
    }
  }
  if (theme) {
    rootEl.setAttribute("data-theme", theme);
    localStorage.setItem(themeStorageKey2, theme);
  }
  localStorage.setItem(modeStorageKey2, mode);
}
function Mode_watcher_lite($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { themeColors: themeColors2 } = $$props;
    if (themeColors2) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<meta name="theme-color"${attr("content", themeColors2.dark)}/>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function Mode_watcher_full($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { trueNonce = "", initConfig, themeColors: themeColors2 } = $$props;
    head("1funsus", $$renderer2, ($$renderer3) => {
      if (themeColors2) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<meta name="theme-color"${attr("content", themeColors2.dark)}/>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> ${html(`<script${trueNonce ? ` nonce=${trueNonce}` : ""}>(` + setInitialMode.toString() + `)(` + JSON.stringify(initConfig) + `);<\/script>`)}`);
    });
  });
}
function Mode_watcher($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      defaultMode = "system",
      themeColors: themeColorsProp,
      disableTransitions: disableTransitionsProp = true,
      darkClassNames: darkClassNamesProp = ["dark"],
      lightClassNames: lightClassNamesProp = [],
      defaultTheme = "",
      nonce = "",
      themeStorageKey: themeStorageKeyProp = "mode-watcher-theme",
      modeStorageKey: modeStorageKeyProp = "mode-watcher-mode",
      disableHeadScriptInjection = false,
      synchronousModeChanges: synchronousModeChangesProp = false
    } = $$props;
    modeStorageKey.current = modeStorageKeyProp;
    themeStorageKey.current = themeStorageKeyProp;
    darkClassNames.current = darkClassNamesProp;
    lightClassNames.current = lightClassNamesProp;
    disableTransitions.current = disableTransitionsProp;
    themeColors.current = themeColorsProp;
    synchronousModeChanges.current = synchronousModeChangesProp;
    const initConfig = defineConfig({
      defaultMode,
      themeColors: themeColorsProp,
      darkClassNames: darkClassNamesProp,
      lightClassNames: lightClassNamesProp,
      defaultTheme,
      modeStorageKey: modeStorageKeyProp,
      themeStorageKey: themeStorageKeyProp
    });
    const trueNonce = derived(() => typeof window === "undefined" ? nonce : "");
    if (disableHeadScriptInjection) {
      $$renderer2.push("<!--[0-->");
      Mode_watcher_lite($$renderer2, { themeColors: themeColors.current });
    } else {
      $$renderer2.push("<!--[-1-->");
      Mode_watcher_full($$renderer2, {
        trueNonce: trueNonce(),
        initConfig,
        themeColors: themeColors.current
      });
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function YouTubeAudioPlayer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    onDestroy(() => {
    });
    $$renderer2.push(`<div id="youtube-audio-player-iframe" class="hidden svelte-1ohum6x"></div>`);
  });
}
function createMusicState() {
  let playlist = [];
  let isPlaying = false;
  let currentIndex = 0;
  let currentTrackId = null;
  let startedAt = null;
  let isLoaded = false;
  let currentGameId = "";
  let volume = 70;
  let isLoading = false;
  let error = null;
  let repeatMode = "off";
  let duration = 0;
  let playerRef = null;
  let channel = null;
  let updateTimeout = null;
  let lastBroadcastTimestamp = 0;
  function getPlaylist() {
    return playlist;
  }
  function getIsPlaying() {
    return isPlaying;
  }
  function getCurrentTrack() {
    if (currentTrackId) {
      return playlist.find((t) => t.id === currentTrackId) ?? null;
    }
    return playlist[currentIndex] ?? null;
  }
  function getCurrentIndex() {
    return currentIndex;
  }
  function getStartedAt() {
    return startedAt;
  }
  function getIsLoaded() {
    return isLoaded;
  }
  function getVolume() {
    return volume;
  }
  function getIsLoading() {
    return isLoading;
  }
  function getError() {
    return error;
  }
  function getRepeatMode() {
    return repeatMode;
  }
  function getDuration() {
    return duration;
  }
  function setPlayer(ref) {
    playerRef = ref;
  }
  function getPlayer() {
    return playerRef;
  }
  function extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }
  async function fetchVideoTitle(videoId) {
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (response.ok) {
        const data = await response.json();
        return data.title;
      }
    } catch (e) {
      console.warn("[Music] Failed to fetch title:", e);
    }
    return null;
  }
  async function loadPlaylist(gameId) {
    const { data: tracks, error: fetchError } = await supabase.from("music_tracks").select("*").eq("game_id", gameId).order("order_index", { ascending: true });
    if (fetchError) {
      console.error("[Music] Error loading playlist:", fetchError);
      error = "Erro ao carregar playlist";
      return;
    }
    playlist = tracks || [];
  }
  async function loadPlayerState(gameId) {
    const { data: state, error: fetchError } = await supabase.from("player_state").select("*").eq("game_id", gameId).single();
    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("[Music] Error loading player state:", fetchError);
      return;
    }
    if (state) {
      isPlaying = state.is_playing ?? false;
      currentTrackId = state.current_track_id;
      startedAt = state.started_at ? new Date(state.started_at).getTime() : null;
    }
  }
  function handleBroadcast(payload) {
    if (payload.timestamp <= lastBroadcastTimestamp) {
      return;
    }
    lastBroadcastTimestamp = payload.timestamp;
    if (payload.action === "play") {
      isPlaying = true;
      currentTrackId = payload.trackId;
      startedAt = payload.startedAt;
    } else if (payload.action === "pause") {
      isPlaying = false;
    } else if (payload.action === "skip" || payload.action === "auto-skip") {
      currentTrackId = payload.toTrackId;
      if (payload.action === "auto-skip") {
        isPlaying = true;
        startedAt = Date.now();
      }
    }
  }
  async function init(gameId) {
    if (!gameId) return;
    isLoading = true;
    error = null;
    currentGameId = gameId;
    if (typeof window !== "undefined" && window.localStorage) {
      volume = parseInt(localStorage.getItem("music-volume") || "70", 10);
      repeatMode = localStorage.getItem("music-repeat") || "off";
    }
    await loadPlaylist(gameId);
    await loadPlayerState(gameId);
    channel = supabase.channel(`player:${gameId}`);
    channel.on("broadcast", { event: "player" }, ({ payload }) => {
      handleBroadcast(payload);
    });
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("[Music] Broadcast channel subscribed");
      }
    });
    isLoaded = true;
    isLoading = false;
  }
  function destroy() {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
    if (updateTimeout) {
      clearTimeout(updateTimeout);
      updateTimeout = null;
    }
    isLoaded = false;
    playlist = [];
    isPlaying = false;
    currentIndex = 0;
    startedAt = null;
  }
  async function addTrack(url) {
    const videoId = extractVideoId(url);
    if (!videoId) {
      error = "URL do YouTube inválida";
      throw new Error("URL inválida");
    }
    isLoading = true;
    error = null;
    const title = await fetchVideoTitle(videoId);
    const { data: track, error: insertError } = await supabase.from("music_tracks").insert({
      game_id: currentGameId,
      youtube_id: videoId,
      title: title || videoId,
      order_index: playlist.length,
      added_by: authState.user?.id
    }).select().single();
    if (insertError) {
      console.error("[Music] Error adding track:", insertError);
      error = "Erro ao adicionar música";
      isLoading = false;
      throw insertError;
    }
    playlist = [...playlist, track];
    isLoading = false;
  }
  async function removeTrack(trackId) {
    const { error: deleteError } = await supabase.from("music_tracks").delete().eq("id", trackId);
    if (deleteError) {
      console.error("[Music] Error removing track:", deleteError);
      error = "Erro ao remover música";
      throw deleteError;
    }
    playlist = playlist.filter((t) => t.id !== trackId);
    if (currentTrackId && !playlist.find((t) => t.id === currentTrackId)) {
      currentTrackId = playlist.length > 0 ? playlist[0].id : null;
    }
  }
  async function play() {
    if (playlist.length === 0) return;
    const track = getCurrentTrack();
    if (!track) return;
    const now = Date.now();
    isPlaying = true;
    currentTrackId = track.id;
    startedAt = now;
    channel?.send({
      type: "broadcast",
      event: "player",
      payload: {
        action: "play",
        trackId: track.id,
        startedAt: now,
        timestamp: now
      }
    });
    scheduleStateUpdate();
  }
  async function pause() {
    isPlaying = false;
    channel?.send({
      type: "broadcast",
      event: "player",
      payload: {
        action: "pause",
        trackId: currentTrackId,
        timestamp: Date.now()
      }
    });
    scheduleStateUpdate();
  }
  async function skip() {
    const currentTrack = getCurrentTrack();
    if (!currentTrack) return;
    const currentPos = playlist.findIndex((t) => t.id === currentTrack.id);
    if (currentPos >= playlist.length - 1) return;
    const nextTrack = playlist[currentPos + 1];
    const now = Date.now();
    currentTrackId = nextTrack.id;
    startedAt = now;
    isPlaying = true;
    channel?.send({
      type: "broadcast",
      event: "player",
      payload: { action: "skip", toTrackId: nextTrack.id, timestamp: now }
    });
    scheduleStateUpdate();
  }
  async function setTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    const track = playlist[index];
    const now = Date.now();
    currentTrackId = track.id;
    startedAt = now;
    isPlaying = true;
    channel?.send({
      type: "broadcast",
      event: "player",
      payload: {
        action: "play",
        trackId: track.id,
        startedAt: now,
        timestamp: now
      }
    });
    scheduleStateUpdate();
  }
  async function autoSkip() {
    const currentTrack = getCurrentTrack();
    if (!currentTrack) return;
    const now = Date.now();
    if (repeatMode === "track") {
      startedAt = now;
      isPlaying = true;
      channel?.send({
        type: "broadcast",
        event: "player",
        payload: {
          action: "play",
          trackId: currentTrack.id,
          startedAt: now,
          timestamp: now
        }
      });
    } else {
      const currentPos = playlist.findIndex((t) => t.id === currentTrack.id);
      if (currentPos < playlist.length - 1) {
        const nextTrack = playlist[currentPos + 1];
        currentTrackId = nextTrack.id;
        startedAt = now;
        isPlaying = true;
        channel?.send({
          type: "broadcast",
          event: "player",
          payload: { action: "auto-skip", toTrackId: nextTrack.id, timestamp: now }
        });
      } else if (repeatMode === "all") {
        const firstTrack = playlist[0];
        currentTrackId = firstTrack.id;
        startedAt = now;
        isPlaying = true;
        channel?.send({
          type: "broadcast",
          event: "player",
          payload: {
            action: "auto-skip",
            toTrackId: firstTrack.id,
            timestamp: now
          }
        });
      } else {
        isPlaying = false;
        startedAt = null;
        currentTrackId = null;
        channel?.send({
          type: "broadcast",
          event: "player",
          payload: { action: "pause", trackId: currentTrack.id, timestamp: now }
        });
      }
    }
    scheduleStateUpdate();
  }
  function scheduleStateUpdate() {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    updateTimeout = setTimeout(
      async () => {
        await supabase.from("player_state").upsert({
          game_id: currentGameId,
          is_playing: isPlaying,
          current_track_id: currentTrackId,
          started_at: startedAt ? new Date(startedAt).toISOString() : null,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      },
      2e3
    );
  }
  function setVolume(level) {
    volume = level;
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("music-volume", level.toString());
    }
  }
  function setRepeatMode(mode) {
    repeatMode = mode;
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("music-repeat", mode);
    }
  }
  function cycleRepeatMode() {
    const modes2 = ["off", "track", "all"];
    const currentIdx = modes2.indexOf(repeatMode);
    const nextIdx = (currentIdx + 1) % modes2.length;
    setRepeatMode(modes2[nextIdx]);
  }
  function setDuration(d) {
    duration = d;
  }
  function setStartedAt(time) {
    startedAt = time;
  }
  function clearError() {
    error = null;
  }
  return {
    get playlist() {
      return getPlaylist;
    },
    get isPlaying() {
      return getIsPlaying;
    },
    get currentTrack() {
      return getCurrentTrack;
    },
    get currentIndex() {
      return getCurrentIndex;
    },
    get startedAt() {
      return getStartedAt;
    },
    get isLoaded() {
      return getIsLoaded;
    },
    get volume() {
      return getVolume;
    },
    get isLoading() {
      return getIsLoading;
    },
    get error() {
      return getError;
    },
    get repeatMode() {
      return getRepeatMode;
    },
    get duration() {
      return getDuration;
    },
    get gameId() {
      return currentGameId;
    },
    init,
    destroy,
    addTrack,
    removeTrack,
    play,
    pause,
    skip,
    setTrack,
    autoSkip,
    setVolume,
    setRepeatMode,
    cycleRepeatMode,
    setDuration,
    setStartedAt,
    setPlayer,
    getPlayer,
    clearError
  };
}
const musicState = createMusicState();
function YouTubeEmbed($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { videoId, visible = false } = $$props;
    function seekTo(seconds) {
    }
    $$renderer2.push(`<div${attr_class("youtube-player svelte-1xfpc58", void 0, { "hidden": !visible })}></div>`);
    bind_props($$props, { seekTo });
  });
}
function Dices($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    [
      "rect",
      {
        "width": "12",
        "height": "12",
        "x": "2",
        "y": "10",
        "rx": "2",
        "ry": "2"
      }
    ],
    [
      "path",
      {
        "d": "m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"
      }
    ],
    ["path", { "d": "M6 18h.01" }],
    ["path", { "d": "M10 14h.01" }],
    ["path", { "d": "M15 6h.01" }],
    ["path", { "d": "M18 9h.01" }]
  ];
  Icon($$renderer, spread_props([
    { name: "dices" },
    $$sanitized_props,
    {
      /**
       * @component @name Dices
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHg9IjIiIHk9IjEwIiByeD0iMiIgcnk9IjIiIC8+CiAgPHBhdGggZD0ibTE3LjkyIDE0IDMuNS0zLjVhMi4yNCAyLjI0IDAgMCAwIDAtM2wtNS00LjkyYTIuMjQgMi4yNCAwIDAgMC0zIDBMMTAgNiIgLz4KICA8cGF0aCBkPSJNNiAxOGguMDEiIC8+CiAgPHBhdGggZD0iTTEwIDE0aC4wMSIgLz4KICA8cGF0aCBkPSJNMTUgNmguMDEiIC8+CiAgPHBhdGggZD0iTTE4IDloLjAxIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/dices
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Moon($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [["path", { "d": "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" }]];
  Icon($$renderer, spread_props([
    { name: "moon" },
    $$sanitized_props,
    {
      /**
       * @component @name Moon
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgM2E2IDYgMCAwIDAgOSA5IDkgOSAwIDEgMS05LTlaIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/moon
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Music($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["path", { "d": "M9 18V5l12-2v13" }],
    ["circle", { "cx": "6", "cy": "18", "r": "3" }],
    ["circle", { "cx": "18", "cy": "16", "r": "3" }]
  ];
  Icon($$renderer, spread_props([
    { name: "music" },
    $$sanitized_props,
    {
      /**
       * @component @name Music
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOSAxOFY1bDEyLTJ2MTMiIC8+CiAgPGNpcmNsZSBjeD0iNiIgY3k9IjE4IiByPSIzIiAvPgogIDxjaXJjbGUgY3g9IjE4IiBjeT0iMTYiIHI9IjMiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/music
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Pause($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    [
      "rect",
      { "x": "14", "y": "4", "width": "4", "height": "16", "rx": "1" }
    ],
    [
      "rect",
      { "x": "6", "y": "4", "width": "4", "height": "16", "rx": "1" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "pause" },
    $$sanitized_props,
    {
      /**
       * @component @name Pause
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB4PSIxNCIgeT0iNCIgd2lkdGg9IjQiIGhlaWdodD0iMTYiIHJ4PSIxIiAvPgogIDxyZWN0IHg9IjYiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjE2IiByeD0iMSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/pause
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Play($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [["polygon", { "points": "6 3 20 12 6 21 6 3" }]];
  Icon($$renderer, spread_props([
    { name: "play" },
    $$sanitized_props,
    {
      /**
       * @component @name Play
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cG9seWdvbiBwb2ludHM9IjYgMyAyMCAxMiA2IDIxIDYgMyIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/play
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Repeat_1($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["path", { "d": "m17 2 4 4-4 4" }],
    ["path", { "d": "M3 11v-1a4 4 0 0 1 4-4h14" }],
    ["path", { "d": "m7 22-4-4 4-4" }],
    ["path", { "d": "M21 13v1a4 4 0 0 1-4 4H3" }],
    ["path", { "d": "M11 10h1v4" }]
  ];
  Icon($$renderer, spread_props([
    { name: "repeat-1" },
    $$sanitized_props,
    {
      /**
       * @component @name Repeat1
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTcgMiA0IDQtNCA0IiAvPgogIDxwYXRoIGQ9Ik0zIDExdi0xYTQgNCAwIDAgMSA0LTRoMTQiIC8+CiAgPHBhdGggZD0ibTcgMjItNC00IDQtNCIgLz4KICA8cGF0aCBkPSJNMjEgMTN2MWE0IDQgMCAwIDEtNCA0SDMiIC8+CiAgPHBhdGggZD0iTTExIDEwaDF2NCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/repeat-1
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Repeat($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["path", { "d": "m17 2 4 4-4 4" }],
    ["path", { "d": "M3 11v-1a4 4 0 0 1 4-4h14" }],
    ["path", { "d": "m7 22-4-4 4-4" }],
    ["path", { "d": "M21 13v1a4 4 0 0 1-4 4H3" }]
  ];
  Icon($$renderer, spread_props([
    { name: "repeat" },
    $$sanitized_props,
    {
      /**
       * @component @name Repeat
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTcgMiA0IDQtNCA0IiAvPgogIDxwYXRoIGQ9Ik0zIDExdi0xYTQgNCAwIDAgMSA0LTRoMTQiIC8+CiAgPHBhdGggZD0ibTcgMjItNC00IDQtNCIgLz4KICA8cGF0aCBkPSJNMjEgMTN2MWE0IDQgMCAwIDEtNCA0SDMiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/repeat
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Send($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"
      }
    ],
    ["path", { "d": "m21.854 2.147-10.94 10.939" }]
  ];
  Icon($$renderer, spread_props([
    { name: "send" },
    $$sanitized_props,
    {
      /**
       * @component @name Send
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTQuNTM2IDIxLjY4NmEuNS41IDAgMCAwIC45MzctLjAyNGw2LjUtMTlhLjQ5Ni40OTYgMCAwIDAtLjYzNS0uNjM1bC0xOSA2LjVhLjUuNSAwIDAgMC0uMDI0LjkzN2w3LjkzIDMuMThhMiAyIDAgMCAxIDEuMTEyIDEuMTF6IiAvPgogIDxwYXRoIGQ9Im0yMS44NTQgMi4xNDctMTAuOTQgMTAuOTM5IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/send
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Skip_forward($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["polygon", { "points": "5 4 15 12 5 20 5 4" }],
    ["line", { "x1": "19", "x2": "19", "y1": "5", "y2": "19" }]
  ];
  Icon($$renderer, spread_props([
    { name: "skip-forward" },
    $$sanitized_props,
    {
      /**
       * @component @name SkipForward
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cG9seWdvbiBwb2ludHM9IjUgNCAxNSAxMiA1IDIwIDUgNCIgLz4KICA8bGluZSB4MT0iMTkiIHgyPSIxOSIgeTE9IjUiIHkyPSIxOSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/skip-forward
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Sun($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["circle", { "cx": "12", "cy": "12", "r": "4" }],
    ["path", { "d": "M12 2v2" }],
    ["path", { "d": "M12 20v2" }],
    ["path", { "d": "m4.93 4.93 1.41 1.41" }],
    ["path", { "d": "m17.66 17.66 1.41 1.41" }],
    ["path", { "d": "M2 12h2" }],
    ["path", { "d": "M20 12h2" }],
    ["path", { "d": "m6.34 17.66-1.41 1.41" }],
    ["path", { "d": "m19.07 4.93-1.41 1.41" }]
  ];
  Icon($$renderer, spread_props([
    { name: "sun" },
    $$sanitized_props,
    {
      /**
       * @component @name Sun
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI0IiAvPgogIDxwYXRoIGQ9Ik0xMiAydjIiIC8+CiAgPHBhdGggZD0iTTEyIDIwdjIiIC8+CiAgPHBhdGggZD0ibTQuOTMgNC45MyAxLjQxIDEuNDEiIC8+CiAgPHBhdGggZD0ibTE3LjY2IDE3LjY2IDEuNDEgMS40MSIgLz4KICA8cGF0aCBkPSJNMiAxMmgyIiAvPgogIDxwYXRoIGQ9Ik0yMCAxMmgyIiAvPgogIDxwYXRoIGQ9Im02LjM0IDE3LjY2LTEuNDEgMS40MSIgLz4KICA8cGF0aCBkPSJtMTkuMDcgNC45My0xLjQxIDEuNDEiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/sun
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Volume_2($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"
      }
    ],
    ["path", { "d": "M16 9a5 5 0 0 1 0 6" }],
    ["path", { "d": "M19.364 18.364a9 9 0 0 0 0-12.728" }]
  ];
  Icon($$renderer, spread_props([
    { name: "volume-2" },
    $$sanitized_props,
    {
      /**
       * @component @name Volume2
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTEgNC43MDJhLjcwNS43MDUgMCAwIDAtMS4yMDMtLjQ5OEw2LjQxMyA3LjU4N0ExLjQgMS40IDAgMCAxIDUuNDE2IDhIM2ExIDEgMCAwIDAtMSAxdjZhMSAxIDAgMCAwIDEgMWgyLjQxNmExLjQgMS40IDAgMCAxIC45OTcuNDEzbDMuMzgzIDMuMzg0QS43MDUuNzA1IDAgMCAwIDExIDE5LjI5OHoiIC8+CiAgPHBhdGggZD0iTTE2IDlhNSA1IDAgMCAxIDAgNiIgLz4KICA8cGF0aCBkPSJNMTkuMzY0IDE4LjM2NGE5IDkgMCAwIDAgMC0xMi43MjgiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/volume-2
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function DiceAlertList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let alerts = derived(() => diceStore.displayedAlerts);
    $$renderer2.push(`<!---->`);
    {
      $$renderer2.push(`<div class="fixed top-20 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-2 pointer-events-none"><!--[-->`);
      const each_array = ensure_array_like(alerts());
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let alert = each_array[$$index];
        $$renderer2.push(`<div class="dice-alert bg-card border rounded-lg shadow-xl px-6 py-4 min-w-[200px] pointer-events-auto"${attr("data-id", alert.id)}><div class="flex items-center gap-3"><div class="p-2 bg-primary/20 rounded-full">`);
        Dices($$renderer2, { class: "w-5 h-5 text-primary" });
        $$renderer2.push(`<!----></div> <div><p class="text-sm text-muted-foreground">${escape_html(alert.userName)} rolou</p> <p class="text-xs text-muted-foreground">${escape_html(alert.formula)}</p></div></div> <div class="mt-2 text-center"><span class="text-4xl font-bold text-primary">`);
        if (alert.successes !== null && alert.successes !== void 0) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`${escape_html(alert.successes)} <span class="text-xl">Sucesso${escape_html(alert.successes !== 1 ? "s" : "")}</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`${escape_html(alert.result)}`);
        }
        $$renderer2.push(`<!--]--></span></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!---->`);
  });
}
function DiceLayer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    DiceAlertList($$renderer2);
  });
}
function Sheet($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { open = false, onOpenChange, children, class: className } = $$props;
    if (open) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="fixed inset-0 z-50"><div class="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true"></div> <div${attr_class(clsx(cn("fixed z-50 gap-4 bg-popover p-6 shadow-lg border-border/50 transition ease-in-out", className)))}>`);
      children($$renderer2, {
        open,
        setOpen: (v) => {
          open = v;
          onOpenChange?.(v);
        }
      });
      $$renderer2.push(`<!----></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { open });
  });
}
function SheetContent($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { side = "right", class: className, children } = $$props;
    const sideClasses = {
      top: "inset-x-0 top-0 border-b",
      bottom: "inset-x-0 bottom-0 border-t",
      left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
      right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm"
    };
    $$renderer2.push(`<div${attr_class(clsx(cn("fixed z-50 bg-popover p-6 shadow-lg transition ease-in-out border-border/50", sideClasses[side], className)))}>`);
    children($$renderer2);
    $$renderer2.push(`<!----></div>`);
  });
}
function SheetHeader($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { class: className, children } = $$props;
    $$renderer2.push(`<div${attr_class(clsx(cn("flex flex-col space-y-2 text-center sm:text-left", className)))}>`);
    children($$renderer2);
    $$renderer2.push(`<!----></div>`);
  });
}
function SheetTitle($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { class: className, children } = $$props;
    $$renderer2.push(`<h2${attr_class(clsx(cn("text-lg font-semibold text-foreground", className)))}>`);
    children($$renderer2);
    $$renderer2.push(`<!----></h2>`);
  });
}
function Playlist($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const playlist = derived(() => musicState.playlist());
    const currentTrack = derived(() => musicState.currentTrack());
    const isPlaying = derived(() => musicState.isPlaying());
    function isCurrentTrack(trackId) {
      return currentTrack()?.id === trackId;
    }
    $$renderer2.push(`<div class="playlist-container svelte-mpkpls">`);
    if (playlist().length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="empty-state svelte-mpkpls">`);
      Music($$renderer2, { class: "w-8 h-8 text-muted-foreground mb-2" });
      $$renderer2.push(`<!----> <p class="text-sm text-muted-foreground">Nenhuma música na playlist</p> <p class="text-xs text-muted-foreground mt-1">Adicione uma URL do YouTube abaixo</p></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<ul class="track-list svelte-mpkpls"><!--[-->`);
      const each_array = ensure_array_like(playlist());
      for (let index = 0, $$length = each_array.length; index < $$length; index++) {
        let track = each_array[index];
        $$renderer2.push(`<li${attr_class("track-item svelte-mpkpls", void 0, {
          "active": isCurrentTrack(track.id),
          "playing": isCurrentTrack(track.id) && isPlaying()
        })}><button class="track-info svelte-mpkpls"><div class="thumb-wrapper svelte-mpkpls"><img${attr("src", `https://img.youtube.com/vi/${track.youtube_id}/mqdefault.jpg`)} alt="" class="track-thumb svelte-mpkpls"/> `);
        if (isCurrentTrack(track.id)) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="play-overlay svelte-mpkpls">`);
          if (isPlaying()) {
            $$renderer2.push("<!--[0-->");
            Pause($$renderer2, { class: "w-5 h-5 text-white" });
          } else {
            $$renderer2.push("<!--[-1-->");
            Play($$renderer2, { class: "w-5 h-5 text-white" });
          }
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div> <div class="track-details svelte-mpkpls"><span class="track-title svelte-mpkpls">${escape_html(track.title || track.youtube_id)}</span> <span class="track-duration svelte-mpkpls">YouTube</span></div></button> <button class="remove-btn svelte-mpkpls" title="Remover">`);
        X($$renderer2, { class: "w-4 h-4" });
        $$renderer2.push(`<!----></button></li>`);
      }
      $$renderer2.push(`<!--]--></ul>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function Controls($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const isPlaying = derived(() => musicState.isPlaying());
    const currentTrack = derived(() => musicState.currentTrack());
    const playlist = derived(() => musicState.playlist());
    const isLoading = derived(() => musicState.isLoading());
    const repeatMode = derived(() => musicState.repeatMode());
    let currentTime = 0;
    let duration = 0;
    let localVolume = 70;
    const canPlay = derived(() => playlist().length > 0);
    const currentTrackIndex = derived(() => currentTrack() ? playlist().findIndex((t) => t.id === currentTrack().id) : -1);
    const canSkip = derived(() => currentTrackIndex() >= 0 && currentTrackIndex() < playlist().length - 1);
    onDestroy(() => {
    });
    function formatTime(seconds) {
      return "0:00";
    }
    const progress = derived(() => 0);
    $$renderer2.push(`<div class="controls-container svelte-73fjis"><div class="now-playing svelte-73fjis">`);
    if (currentTrack()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<img${attr("src", `https://img.youtube.com/vi/${currentTrack().youtube_id}/mqdefault.jpg`)} alt="" class="now-playing-thumb svelte-73fjis"/> <div class="now-playing-info svelte-73fjis"><span class="now-playing-label svelte-73fjis">Tocando agora</span> <span class="now-playing-title svelte-73fjis">${escape_html(currentTrack().title || currentTrack().youtube_id)}</span></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="now-playing-empty svelte-73fjis"><span class="text-sm text-muted-foreground">Nenhuma música selecionada</span></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="progress-section svelte-73fjis"><span class="time-label svelte-73fjis">${escape_html(formatTime())}</span> <div class="progress-bar svelte-73fjis" role="slider"${attr("aria-valuenow", currentTime)} aria-valuemin="0"${attr("aria-valuemax", duration)} tabindex="0"><div class="progress-fill svelte-73fjis"${attr_style(`width: ${stringify(progress())}%`)}></div></div> <span class="time-label svelte-73fjis">${escape_html(formatTime())}</span></div> <div class="buttons-row svelte-73fjis"><button${attr_class("control-btn svelte-73fjis", void 0, {
      "active": repeatMode() !== "off",
      "primary": repeatMode() === "track",
      "off": repeatMode() === "off"
    })}${attr("title", `Repetir: ${stringify(repeatMode() === "off" ? "Desligado" : repeatMode() === "track" ? "Música" : "Playlist")}`)}>`);
    if (repeatMode() === "track") {
      $$renderer2.push("<!--[0-->");
      Repeat_1($$renderer2, { class: "w-5 h-5" });
    } else {
      $$renderer2.push("<!--[-1-->");
      Repeat($$renderer2, { class: "w-5 h-5" });
    }
    $$renderer2.push(`<!--]--></button> <button${attr_class("control-btn svelte-73fjis", void 0, { "primary": isPlaying() })}${attr("disabled", !canPlay() || isLoading(), true)}${attr("title", isPlaying() ? "Pausar" : "Reproduzir")}>`);
    if (isPlaying()) {
      $$renderer2.push("<!--[0-->");
      Pause($$renderer2, { class: "w-5 h-5" });
    } else {
      $$renderer2.push("<!--[-1-->");
      Play($$renderer2, { class: "w-5 h-5" });
    }
    $$renderer2.push(`<!--]--></button> <button class="control-btn svelte-73fjis"${attr("disabled", !canSkip() || isLoading(), true)} title="Próxima">`);
    Skip_forward($$renderer2, { class: "w-5 h-5" });
    $$renderer2.push(`<!----></button></div> <div class="volume-row svelte-73fjis"><button class="volume-btn svelte-73fjis"${attr("title", "Silenciar")}>`);
    {
      $$renderer2.push("<!--[-1-->");
      Volume_2($$renderer2, { class: "w-4 h-4" });
    }
    $$renderer2.push(`<!--]--></button> <input type="range" min="0" max="100"${attr("value", localVolume)} class="volume-slider svelte-73fjis"/> <span class="volume-label svelte-73fjis">${escape_html(localVolume)}%</span></div></div>`);
  });
}
function MusicPlayer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let urlInput = "";
    let isAdding = false;
    const isLoaded = derived(() => musicState.isLoaded());
    $$renderer2.push(`<div class="music-player svelte-1agzc0o">`);
    if (!isLoaded()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="loading svelte-1agzc0o"><div class="spinner svelte-1agzc0o"></div> <span class="text-sm text-muted-foreground">Carregando player...</span></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="player-content svelte-1agzc0o">`);
      Controls($$renderer2);
      $$renderer2.push(`<!----> <div class="add-track-section svelte-1agzc0o"><div class="add-track-input svelte-1agzc0o"><input type="text"${attr("value", urlInput)} placeholder="Cole a URL do YouTube..." class="url-input svelte-1agzc0o"${attr("disabled", isAdding, true)}/> <button class="add-btn svelte-1agzc0o"${attr("disabled", !urlInput.trim() || isAdding, true)}>`);
      {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`Adicionar`);
      }
      $$renderer2.push(`<!--]--></button></div> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="playlist-section svelte-1agzc0o">`);
      Playlist($$renderer2);
      $$renderer2.push(`<!----></div></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function ChatSidebar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { open = false } = $$props;
    let inputValue = "";
    const messages = derived(() => gameState.chatMessages);
    function formatTime(date) {
      if (!date) return "";
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }
    function getContrastColor(hex) {
      if (!hex) return "#f4f4f5";
      hex = hex.replace("#", "");
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      const r = parseInt(hex.substr(0, 2), 16) || 0;
      const g = parseInt(hex.substr(2, 2), 16) || 0;
      const b = parseInt(hex.substr(4, 2), 16) || 0;
      const yiq = (r * 299 + g * 587 + b * 114) / 1e3;
      return yiq >= 128 ? "#09090b" : "#f4f4f5";
    }
    function parseMessage(msg) {
      if (!msg || !msg.text) return "";
      const text = msg.text;
      const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
      const bgColor = msg.color || "rgba(63, 63, 70, 0.4)";
      const textColor = msg.color ? getContrastColor(msg.color) : "inherit";
      const borderColor = msg.color ? "transparent" : "rgba(161, 161, 170, 0.2)";
      const styleAttr = `style="background-color: ${bgColor}; color: ${textColor}; border-color: ${borderColor};"`;
      const withTotal = escaped.replace(/!!!(.*?)!!!/g, `<span class="dice-total-badge" ${styleAttr}>$1</span>`);
      const withStrike = withTotal.replace(/~~(.*?)~~/g, `<span class="opacity-50 line-through text-xs">$1</span>`);
      return withStrike.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
        return p1.split(",").map((v) => `<span class="dice-result-badge" ${styleAttr}>${v.trim()}</span>`).join(", ");
      });
    }
    $$renderer2.push(`<div class="h-[calc(100vh-200px)] overflow-y-auto p-3 space-y-2 scrollbar-thin"><!--[-->`);
    const each_array = ensure_array_like(messages());
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let msg = each_array[$$index];
      $$renderer2.push(`<div${attr_class(`message ${msg.type === "system" ? "bg-muted/50 rounded-lg p-2" : ""}`)}><div class="flex items-baseline gap-2"><span class="font-medium text-sm">${escape_html(msg.sender || "Anônimo")}</span> `);
      if (msg.createdAt) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="text-xs text-muted-foreground">${escape_html(formatTime(msg.createdAt))}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> <p class="text-sm mt-1">${html(parseMessage(msg))}</p></div>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (messages().length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="text-center text-muted-foreground text-sm py-8">Nenhuma mensagem ainda</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <form class="p-3 border-t"><div class="flex gap-2"><input${attr("value", inputValue)} type="text" placeholder="Digite uma mensagem..." class="flex-1 h-9 px-3 rounded-md border bg-background text-sm"/> <button type="submit"${attr("disabled", !inputValue.trim(), true)} class="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">`);
    Send($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----></button></div> <p class="text-xs text-muted-foreground mt-2">Use /r ou /roll para rolar dados (ex: /r 1d20)</p></form>`);
    bind_props($$props, { open });
  });
}
function FAB($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let showChat = false;
    let showAudio = false;
    let showAddCard = false;
    let showSettings = false;
    let showHelp = false;
    let showBulkEdit = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3" role="region" aria-label="Menu de ações">`);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> <button class="fab-main flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95"${attr("aria-label", "Abrir menu")}>`);
      {
        $$renderer3.push("<!--[-1-->");
        Plus($$renderer3, { class: "h-6 w-6 transition-transform -rotate-90" });
      }
      $$renderer3.push(`<!--]--></button></div> `);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      Sheet($$renderer3, {
        onOpenChange: (v) => showChat = v,
        get open() {
          return showChat;
        },
        set open($$value) {
          showChat = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          SheetContent($$renderer4, {
            side: "right",
            class: "w-[400px]",
            children: ($$renderer5) => {
              SheetHeader($$renderer5, {
                children: ($$renderer6) => {
                  SheetTitle($$renderer6, {
                    children: ($$renderer7) => {
                      $$renderer7.push(`<!---->Chat`);
                    }
                  });
                }
              });
              $$renderer5.push(`<!----> <div class="mt-4">`);
              ChatSidebar($$renderer5, {
                get open() {
                  return showChat;
                },
                set open($$value) {
                  showChat = $$value;
                  $$settled = false;
                }
              });
              $$renderer5.push(`<!----></div>`);
            }
          });
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Sheet($$renderer3, {
        onOpenChange: (v) => showAudio = v,
        get open() {
          return showAudio;
        },
        set open($$value) {
          showAudio = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          SheetContent($$renderer4, {
            side: "right",
            class: "w-[400px]",
            children: ($$renderer5) => {
              SheetHeader($$renderer5, {
                children: ($$renderer6) => {
                  SheetTitle($$renderer6, {
                    children: ($$renderer7) => {
                      $$renderer7.push(`<!---->Player de Música`);
                    }
                  });
                }
              });
              $$renderer5.push(`<!----> <div class="mt-4">`);
              MusicPlayer($$renderer5);
              $$renderer5.push(`<!----></div>`);
            }
          });
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Dialog_1($$renderer3, {
        get open() {
          return showAddCard;
        },
        set open($$value) {
          showAddCard = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          DialogContent($$renderer4, {
            children: ($$renderer5) => {
              DialogTitle($$renderer5, {
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->Adicionar Card`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> <p class="text-sm text-muted-foreground">Em breve: formulário para criar novo card</p>`);
            },
            $$slots: { default: true }
          });
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Dialog_1($$renderer3, {
        get open() {
          return showSettings;
        },
        set open($$value) {
          showSettings = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          DialogContent($$renderer4, {
            children: ($$renderer5) => {
              DialogTitle($$renderer5, {
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->Configurações`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> <p class="text-sm text-muted-foreground">Em breve: configurações do site</p>`);
            },
            $$slots: { default: true }
          });
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Dialog_1($$renderer3, {
        get open() {
          return showHelp;
        },
        set open($$value) {
          showHelp = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          DialogContent($$renderer4, {
            class: "max-w-lg",
            children: ($$renderer5) => {
              DialogTitle($$renderer5, {
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->Ajuda - Shortcodes`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> <div class="space-y-4 text-sm"><div><h4 class="font-medium">Atributos</h4> <code class="text-xs bg-muted p-1">[stat "Nome" valor]</code></div> <div><h4 class="font-medium">Pontos de Vida</h4> <code class="text-xs bg-muted p-1">[hp max=100 current=75]</code></div> <div><h4 class="font-medium">Dinheiro</h4> <code class="text-xs bg-muted p-1">[money current=500 GP]</code></div> <div><h4 class="font-medium">Contador</h4> <code class="text-xs bg-muted p-1">[count "Nome" max=10]</code></div> <div><h4 class="font-medium">Experiência</h4> <code class="text-xs bg-muted p-1">[xp current=1000/5000]</code></div> <div><h4 class="font-medium">Ocultar dos jogadores</h4> <code class="text-xs bg-muted p-1">[hide]...[/hide]</code></div></div>`);
            },
            $$slots: { default: true }
          });
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Dialog_1($$renderer3, {
        get open() {
          return showBulkEdit;
        },
        set open($$value) {
          showBulkEdit = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          DialogContent($$renderer4, {
            children: ($$renderer5) => {
              DialogTitle($$renderer5, {
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->Edição em Massa`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> <p class="text-sm text-muted-foreground">Em breve: editar vários cards de uma vez</p>`);
            },
            $$slots: { default: true }
          });
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function ThemeToggle($$renderer) {
  Button($$renderer, {
    variant: "ghost",
    size: "icon",
    onclick: toggleMode,
    children: ($$renderer2) => {
      Sun($$renderer2, {
        class: "h-[1.2rem] w-[1.2rem] rotate-0 scale-100 dark:scale-0 dark:-rotate-90 transition-all"
      });
      $$renderer2.push(`<!----> `);
      Moon($$renderer2, {
        class: "absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 dark:scale-100 dark:rotate-0 transition-all"
      });
      $$renderer2.push(`<!----> <span class="sr-only">Alternar tema</span>`);
    },
    $$slots: { default: true }
  });
}
function UserMenu($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="user-menu relative"><button class="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors">`);
    User($$renderer2, { class: "w-4 h-4 text-muted-foreground" });
    $$renderer2.push(`<!----> <span class="text-sm text-foreground hidden sm:inline">${escape_html(authState.displayName)}</span> `);
    if (authState.role !== "jogador") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">${escape_html(authState.role === "narrador" ? "Mestre" : "Assistente")}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    Chevron_down($$renderer2, { class: "w-4 h-4 text-muted-foreground" });
    $$renderer2.push(`<!----></button> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function Header($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { minimal = false } = $$props;
    const isGamesPage = derived(() => store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith("/games"));
    const isRootPage = derived(() => store_get($$store_subs ??= {}, "$page", page).url.pathname === "/");
    const showUserMenu = derived(() => minimal || isGamesPage() || isRootPage());
    const gameName = derived(() => gameState.gameName);
    const inGame = derived(() => !!gameState.gameId);
    $$renderer2.push(`<header class="sticky top-0 z-40 w-full border-b border-border bg-popover"><div class="container flex h-16 items-center justify-between px-4"><div class="flex items-center gap-6">`);
    if (inGame() && gameName()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="text-xl font-bold text-foreground">${escape_html(gameName())}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<a href="/" class="flex items-center space-x-2"><span class="text-xl font-bold text-foreground">R2PG VTT</span></a>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (!minimal && inGame()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<nav class="hidden md:flex items-center gap-1"><a href="/"${attr_class(`px-3 py-2 text-sm font-medium rounded-md ${stringify(store_get($$store_subs ??= {}, "$page", page).url.pathname === "/" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")} transition-colors`)}>Grid</a> <a href="/text-mode"${attr_class(`px-3 py-2 text-sm font-medium rounded-md ${stringify(store_get($$store_subs ??= {}, "$page", page).url.pathname === "/text-mode" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")} transition-colors`)}>Notas</a> <a href="/sheet-mode"${attr_class(`px-3 py-2 text-sm font-medium rounded-md ${stringify(store_get($$store_subs ??= {}, "$page", page).url.pathname === "/sheet-mode" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")} transition-colors`)}>Ficha</a> <a href="/drawing-mode"${attr_class(`px-3 py-2 text-sm font-medium rounded-md ${stringify(store_get($$store_subs ??= {}, "$page", page).url.pathname === "/drawing-mode" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")} transition-colors`)}>Quadro</a></nav>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="flex items-center gap-3">`);
    ThemeToggle($$renderer2);
    $$renderer2.push(`<!----> `);
    if (showUserMenu() && authState.isAuthenticated) {
      $$renderer2.push("<!--[0-->");
      if (!minimal) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<input type="color"${attr("value", diceStore.currentDiceColor)} class="w-6 h-6 p-0 border-0 rounded cursor-pointer shrink-0 bg-transparent" title="Sua cor de Dado" aria-label="Selecionar cor do dado"/>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      UserMenu($$renderer2);
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div></header>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Toaster($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let toasts = [];
    toast.subscribe((value) => {
      toasts = value;
    });
    function getTypeStyles(type) {
      switch (type) {
        case "success":
          return "border-l-4 border-success bg-success/10 text-foreground";
        case "error":
          return "border-l-4 border-destructive bg-destructive/10 text-foreground";
        case "warning":
          return "border-l-4 border-warning bg-warning/10 text-foreground";
        case "info":
          return "border-l-4 border-info bg-info/10 text-foreground";
        default:
          return "border-l-4 border-muted bg-muted/10 text-foreground";
      }
    }
    function getIcon(type) {
      switch (type) {
        case "success":
          return "✓";
        case "error":
          return "✕";
        case "warning":
          return "⚠";
        case "info":
          return "ℹ";
        default:
          return "";
      }
    }
    $$renderer2.push(`<div class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm"><!--[-->`);
    const each_array = ensure_array_like(toasts);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let t = each_array[$$index];
      $$renderer2.push(`<div${attr_class(`toast-item ${stringify(getTypeStyles(t.type))} rounded-md p-4 shadow-lg animate-in slide-in-from-right`, "svelte-lod52t")} role="alert"><div class="flex items-start gap-3">`);
      if (getIcon(t.type)) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="text-lg">${escape_html(getIcon(t.type))}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <p class="flex-1 text-sm">${escape_html(t.message)}</p> <button class="text-muted-foreground hover:text-foreground transition-colors" aria-label="Fechar">✕</button></div></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { children } = $$props;
    let currentPath = derived(() => store_get($$store_subs ??= {}, "$page", page).url.pathname);
    const isGamesPage = derived(() => currentPath().startsWith("/games"));
    const hideFabRoutes = ["/auth/login", "/games", "/join"];
    const showFab = derived(() => !hideFabRoutes.some((route) => currentPath().startsWith(route)));
    const showAuthLoading = derived(() => authState.isLoading);
    const musicCurrentTrack = derived(() => musicState.currentTrack());
    const musicVideoId = derived(() => musicCurrentTrack()?.youtube_id || "");
    head("12qhfyh", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>R2PG VTT</title>`);
      });
    });
    Mode_watcher($$renderer2, {});
    $$renderer2.push(`<!----> `);
    YouTubeAudioPlayer($$renderer2);
    $$renderer2.push(`<!----> `);
    if (musicVideoId()) {
      $$renderer2.push("<!--[0-->");
      YouTubeEmbed($$renderer2, { videoId: musicVideoId(), visible: false });
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    DiceLayer($$renderer2);
    $$renderer2.push(`<!----> `);
    Toaster($$renderer2);
    $$renderer2.push(`<!----> `);
    if (showAuthLoading()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex items-center justify-center min-h-screen bg-background"><div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      if (currentPath() === "/" || currentPath() === "" || currentPath() === "/converter" || currentPath() === "/auth/login" || currentPath().startsWith("/games") || currentPath().startsWith("/text-mode") || currentPath().startsWith("/sheet-mode") || currentPath().startsWith("/drawing-mode")) {
        $$renderer2.push("<!--[0-->");
        Header($$renderer2, { minimal: currentPath() === "/auth/login" || isGamesPage() });
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <main>`);
      children($$renderer2);
      $$renderer2.push(`<!----></main> `);
      if (showFab()) {
        $$renderer2.push("<!--[0-->");
        FAB($$renderer2, { currentPath: currentPath() });
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
