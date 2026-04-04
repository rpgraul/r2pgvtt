<script>
import { cn } from '$lib/utils/cn';

let { class: className, children } = $props();
</script>

<div class={cn("flex flex-col space-y-2 text-center sm:text-left", className)}>
  {@render children()}
</div>
