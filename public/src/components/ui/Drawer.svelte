<script>
  import { cn } from '$lib/utils/cn.js';
  import { X } from 'lucide-svelte';
  
  let {
    open = $bindable(false),
    side = 'right',
    class: className = '',
    children,
    ...restProps
  } = $props();
  
  function handleOverlayClick() {
    open = false;
  }
  
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      open = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div class="fixed inset-0 z-50">
    <div 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
      onclick={handleOverlayClick}
      role="button"
      tabindex="-1"
      aria-label="Fechar"
    ></div>
    
    <div 
      class={cn(
        "fixed top-0 bottom-0 z-50 w-80 bg-popover border-l border-border shadow-lg animate-slide-in",
        side === 'right' ? "right-0" : "left-0",
        side === 'right' ? "animate-slide-in-right" : "animate-slide-in-left",
        className
      )}
      {...restProps}
    >
      <button
        class="absolute top-4 right-4 p-1 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        onclick={() => open = false}
        aria-label="Fechar"
      >
        <X class="h-5 w-5" />
      </button>
      
      <div class="pt-12 h-full overflow-y-auto text-foreground">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}
