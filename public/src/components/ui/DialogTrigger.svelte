<script>
  import { Dialog } from 'bits-ui';
  
  let {
    children,
    ...restProps
  } = $props();
</script>

<Dialog.Trigger {...restProps}>
  {@render children?.()}
</Dialog.Trigger>
