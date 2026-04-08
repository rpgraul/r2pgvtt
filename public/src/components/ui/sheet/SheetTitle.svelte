<script>
import { cn } from '$lib/utils/cn';

let { class: className, children } = $props();
</script>

<h2 class={cn("text-lg font-semibold text-foreground", className)}>
  {@render children()}
</h2>
