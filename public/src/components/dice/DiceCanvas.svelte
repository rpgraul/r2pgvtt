<script>
import { onMount, onDestroy } from 'svelte';
import { diceStore } from '$lib/state/diceStore.svelte.js';

let initialized = $state(false);
let checkInterval;

onMount(() => {
  // Usar window.document.body diretamente para o DiceBox
  if (!initialized) {
    console.log('[DiceCanvas] Initializing DiceBox on mount');

    // Inicializar sem container - DiceBox cria o canvas no body
    diceStore
      .initDiceBox()
      .then(() => {
        initialized = true;
        console.log('[DiceCanvas] DiceBox initialized successfully');
      })
      .catch((err) => {
        console.error('[DiceCanvas] DiceBox init failed:', err);
      });
  }

  checkInterval = setInterval(() => {
    if (!initialized) {
      diceStore
        .initDiceBox()
        .then(() => {
          initialized = true;
        })
        .catch((err) => {
          console.error('[DiceCanvas] Retry failed:', err);
        });
    }
  }, 1000);

  return () => {
    if (checkInterval) clearInterval(checkInterval);
  };
});
</script>

{#if diceStore.activeDice.length > 0}
  <button
    class="fixed inset-0 z-[9999] bg-transparent cursor-pointer"
    onclick={() => diceStore.canDismiss && diceStore.clearDice()}
    aria-label="Fechar dados"
  ></button>
{/if}
