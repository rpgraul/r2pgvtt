<script>
  import { Dialog } from 'bits-ui';
  
  let {
    children,
    ...restProps
  } = $props();
</script>

<Dialog.Description {...restProps}>
  {@render children?.()}
</Dialog.Description>
