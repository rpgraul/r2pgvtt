<script>
  import { cn } from '$lib/utils/cn';
  
  let {
    value = $bindable(''),
    class: className,
    children
  } = $props();
</script>

<div class={cn("w-full", className)}>
  {@render children()}
</div>
