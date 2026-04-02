<script>
  import { diceStore } from '$lib/state/diceStore.svelte.js';
  import { Dices } from 'lucide-svelte';
  import { fly } from 'svelte/transition';

  let alerts = $derived(diceStore.displayedAlerts);
</script>

<div class="fixed top-20 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-2 pointer-events-none">
  {#each alerts as alert (alert.id)}
    <div 
      class="dice-alert bg-card border rounded-lg shadow-xl px-6 py-4 min-w-[200px] pointer-events-auto" 
      data-id={alert.id}
      in:fly={{ y: -10, duration: 300 }}
      out:fly={{ y: -20, duration: 400 }}
    >
      <div class="flex items-center gap-3">
        <div class="p-2 bg-primary/20 rounded-full">
          <Dices class="w-5 h-5 text-primary" />
        </div>
        <div>
          <p class="text-sm text-muted-foreground">{alert.userName} rolou</p>
          <p class="text-xs text-muted-foreground">{alert.formula}</p>
        </div>
      </div>
      <div class="mt-2 text-center">
        <span class="text-4xl font-bold text-primary">
          {#if alert.successes !== null && alert.successes !== undefined}
            {alert.successes} <span class="text-xl">Sucesso{alert.successes !== 1 ? 's' : ''}</span>
          {:else}
            {alert.result}
          {/if}
        </span>
      </div>
    </div>
  {/each}
</div>
