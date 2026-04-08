<script>
import { cn } from '$lib/utils/cn';

let { class: className, children } = $props();
</script>

<div class={cn("relative overflow-auto", className)}>
  {@render children()}
</div>
