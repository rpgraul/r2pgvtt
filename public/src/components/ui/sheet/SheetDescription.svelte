<script>
import { cn } from '$lib/utils/cn';

let { class: className, children } = $props();
</script>

<p class={cn("text-sm text-muted-foreground", className)}>
  {@render children()}
</p>
