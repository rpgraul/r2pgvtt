<script>
import { cn } from '$lib/utils/cn';
import { ChevronDown } from 'lucide-svelte';

let {
  value = $bindable(''),
  id,
  placeholder = 'Select option',
  items = [],
  onValueChange,
  class: className,
} = $props();

let open = $state(false);

function selectItem(item) {
  value = item.value;
  open = false;
  onValueChange?.(item.value);
}

function toggleOpen() {
  open = !open;
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    open = false;
  }
}
</script>

<div class={cn("relative", className)}>
  <button
    type="button"
    {id}
    onclick={toggleOpen}
    onkeydown={handleKeydown}
    aria-haspopup="listbox"
    aria-expanded={open}
    class={cn(
      "flex h-10 w-full items-center justify-between rounded-md border bg-popover px-3 py-2 text-sm ring-offset-background",
      "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
    )}
  >
    <span>{value ? items.find(i => i.value === value)?.label || placeholder : placeholder}</span>
    <ChevronDown class={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} />
  </button>
  
  {#if open}
    <div class="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
      {#each items as item}
        <button
          type="button"
          onclick={() => selectItem(item)}
          class={cn(
            "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none",
            "hover:bg-accent hover:text-accent-foreground",
            value === item.value && "bg-accent text-accent-foreground"
          )}
        >
          {item.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
