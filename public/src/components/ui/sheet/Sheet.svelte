<script>
  import { cn } from '$lib/utils/cn';
  
  let {
    open = $bindable(false),
    onOpenChange,
    children,
    class: className
  } = $props();
  
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      open = false;
      onOpenChange?.(false);
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div class="fixed inset-0 z-50">
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm"
      onclick={() => { open = false; onOpenChange?.(false); }}
      aria-hidden="true"
    ></div>
    
    <!-- Content -->
    <div class={cn("fixed z-50 gap-4 bg-popover p-6 shadow-lg border-border/50 transition ease-in-out", className)}>
      {@render children({ open, setOpen: (v) => { open = v; onOpenChange?.(v); } })}
    </div>
  </div>
{/if}
