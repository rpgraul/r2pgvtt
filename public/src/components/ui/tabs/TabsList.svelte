<script>
import { cn } from '$lib/utils/cn';

let { class: className, children } = $props();
</script>

<div class={cn(
  "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
  className
)}>
  {@render children()}
</div>
