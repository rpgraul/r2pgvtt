<script>
import { cn } from '$lib/utils/cn';

let { value, activeValue = $bindable(''), class: className, children } = $props();

let isActive = $derived(activeValue === value);
</script>

<button
  type="button"
  onclick={() => activeValue = value}
  class={cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    isActive ? "bg-secondary text-secondary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent",
    className
  )}
>
  {@render children()}
</button>
