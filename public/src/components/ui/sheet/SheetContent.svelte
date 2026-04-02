<script>
  import { cn } from '$lib/utils/cn';
  import { X } from 'lucide-svelte';
  
  let {
    side = 'right',
    class: className,
    children
  } = $props();
  
  const sideClasses = {
    top: 'inset-x-0 top-0 border-b',
    bottom: 'inset-x-0 bottom-0 border-t',
    left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
    right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm'
  };
</script>

<div class={cn(
  "fixed z-50 bg-popover p-6 shadow-lg transition ease-in-out border-border/50",
  sideClasses[side],
  className
)}>
  {@render children()}
</div>
