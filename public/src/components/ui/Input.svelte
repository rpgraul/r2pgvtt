<script>
import { cn } from '$lib/utils/cn.js';

let {
  class: className = '',
  type = 'text',
  value = $bindable(''),
  placeholder = '',
  ...restProps
} = $props();
</script>

<input
  {type}
  bind:value
  {placeholder}
  class={cn(
    'flex h-10 w-full rounded-md border bg-popover px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground',
    className
  )}
  {...restProps}
/>
