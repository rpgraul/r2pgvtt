<script>
import { cn } from '$lib/utils/cn.js';
import { Dices } from 'lucide-svelte';

let { visible = false, userName = '', formula = '', result = 0 } = $props();

let timeoutId = null;

$effect(() => {
  if (visible) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      visible = false;
    }, 4000);
  }

  return () => {
    if (timeoutId) clearTimeout(timeoutId);
  };
});
</script>

{#if visible}
  <div class="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2">
    <div class="bg-card border rounded-lg shadow-xl px-6 py-4 min-w-[200px]">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-primary/20 rounded-full">
          <Dices class="w-5 h-5 text-primary" />
        </div>
        <div>
          <p class="text-sm text-muted-foreground">{userName} rolou</p>
          <p class="text-xs text-muted-foreground">{formula}</p>
        </div>
      </div>
      <div class="mt-2 text-center">
        <span class="text-4xl font-bold text-primary">{result}</span>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-in {
    animation: fade-in 0.2s ease-out;
  }
</style>
