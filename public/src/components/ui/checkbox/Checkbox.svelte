<script>
  import { cn } from '$lib/utils/cn';
  import { Check } from 'lucide-svelte';
  
  let {
    checked = $bindable(false),
    onCheckedChange,
    class: className
  } = $props();
  
  function toggle() {
    checked = !checked;
    onCheckedChange?.(checked);
  }
</script>

<button
  type="button"
  role="checkbox"
  aria-checked={checked}
  onclick={toggle}
  class={cn(
    "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    checked && "bg-primary text-primary-foreground",
    className
  )}
>
  {#if checked}
    <Check class="h-3 w-3" />
  {/if}
</button>
