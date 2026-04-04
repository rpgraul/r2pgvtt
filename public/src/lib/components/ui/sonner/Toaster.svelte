<script>
import { toast } from '$lib/stores/toast.js';

let toasts = $state([]);

toast.subscribe((value) => {
  toasts = value;
});

function getTypeStyles(type) {
  switch (type) {
    case 'success':
      return 'border-l-4 border-success bg-success/10 text-foreground';
    case 'error':
      return 'border-l-4 border-destructive bg-destructive/10 text-foreground';
    case 'warning':
      return 'border-l-4 border-warning bg-warning/10 text-foreground';
    case 'info':
      return 'border-l-4 border-info bg-info/10 text-foreground';
    default:
      return 'border-l-4 border-muted bg-muted/10 text-foreground';
  }
}

function getIcon(type) {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'warning':
      return '⚠';
    case 'info':
      return 'ℹ';
    default:
      return '';
  }
}
</script>

<div class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
  {#each toasts as t (t.id)}
    <div 
      class="toast-item {getTypeStyles(t.type)} rounded-md p-4 shadow-lg animate-in slide-in-from-right"
      role="alert"
    >
      <div class="flex items-start gap-3">
        {#if getIcon(t.type)}
          <span class="text-lg">{getIcon(t.type)}</span>
        {/if}
        <p class="flex-1 text-sm">{t.message}</p>
        <button 
          onclick={() => toast.dismiss(t.id)}
          class="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>
    </div>
  {/each}
</div>

<style>
  @keyframes slide-in-from-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .animate-in {
    animation: slide-in-from-right 0.3s ease-out;
  }
</style>
