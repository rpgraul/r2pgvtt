<script>
  import { Dialog } from 'bits-ui';
  
  let {
    children,
    ...restProps
  } = $props();
</script>

<Dialog.Title {...restProps}>
  {@render children?.()}
</Dialog.Title>
