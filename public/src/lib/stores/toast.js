import { writable } from 'svelte/store';

function createToastStore() {
  const { subscribe, update } = writable([]);
  let toastId = 0;
  
  function showToast(message, type = 'default', duration = 4000) {
    const id = ++toastId;
    update(toasts => [...toasts, { id, message, type, duration }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }
  
  function removeToast(id) {
    update(toasts => toasts.filter(t => t.id !== id));
  }
  
  return {
    subscribe,
    success: (message, options) => showToast(message, 'success', options?.duration ?? 4000),
    error: (message, options) => showToast(message, 'error', options?.duration ?? 4000),
    warning: (message, options) => showToast(message, 'warning', options?.duration ?? 4000),
    info: (message, options) => showToast(message, 'info', options?.duration ?? 4000),
    default: (message, options) => showToast(message, 'default', options?.duration ?? 4000),
    dismiss: removeToast
  };
}

export const toast = createToastStore();
