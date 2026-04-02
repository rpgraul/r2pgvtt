<script>
  import { cn } from '$lib/utils/cn';
  
  let {
    content,
    class: className,
    children
  } = $props();
  
  let show = $state(false);
</script>

<div class={cn("relative inline-block", className)}>
  <div
    onmouseenter={() => show = true}
    onmouseleave={() => show = false}
  >
    {@render children()}
  </div>
  
  {#if show && content}
    <div class="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-primary-foreground bg-primary rounded whitespace-nowrap">
      {content}
      <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary"></div>
    </div>
  {/if}
</div>
