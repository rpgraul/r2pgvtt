<script>
import { Dialog } from 'bits-ui';

let { open = $bindable(false), onOpenChange, children, ...restProps } = $props();
</script>

<Dialog.Root bind:open {onOpenChange} {...restProps}>
  {@render children?.()}
</Dialog.Root>
