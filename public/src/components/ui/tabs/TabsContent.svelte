<script>
import { cn } from '$lib/utils/cn';

let { value, activeValue = $bindable(''), class: className, children } = $props();

let isActive = $derived(activeValue === value);
</script>

{#if isActive}
  <div class={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>
    {@render children()}
  </div>
{/if}
