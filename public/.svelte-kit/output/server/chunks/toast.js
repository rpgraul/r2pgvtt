import { ai as ssr_context, aj as lifecycle_function_unavailable } from "./index2.js";
import "clsx";
import { w as writable } from "./index.js";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
function mount() {
  lifecycle_function_unavailable("mount");
}
function unmount() {
  lifecycle_function_unavailable("unmount");
}
async function tick() {
}
function createToastStore() {
  const { subscribe, update } = writable([]);
  let toastId = 0;
  function showToast(message, type = "default", duration = 4e3) {
    const id = ++toastId;
    update((toasts) => [...toasts, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }
  function removeToast(id) {
    update((toasts) => toasts.filter((t) => t.id !== id));
  }
  return {
    subscribe,
    success: (message, options) => showToast(message, "success", options?.duration ?? 4e3),
    error: (message, options) => showToast(message, "error", options?.duration ?? 4e3),
    warning: (message, options) => showToast(message, "warning", options?.duration ?? 4e3),
    info: (message, options) => showToast(message, "info", options?.duration ?? 4e3),
    default: (message, options) => showToast(message, "default", options?.duration ?? 4e3),
    dismiss: removeToast
  };
}
const toast = createToastStore();
export {
  tick as a,
  mount as m,
  onDestroy as o,
  toast as t,
  unmount as u
};
