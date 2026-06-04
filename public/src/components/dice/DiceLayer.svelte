<script>
import { diceStore } from '$lib/state/diceStore.svelte.js';
import DiceAlertList from './DiceAlertList.svelte';

/**
 * Clique na janela: só limpa os dados se o countdown de 3s já passou.
 * O próprio diceStore.tryDismissOnClick() verifica isso internamente.
 */
function handleWindowClick() {
  diceStore.tryDismissOnClick();
}

// Derived: cursor hint para o usuário saber que pode clicar para limpar
const canClickToClear = $derived(
  diceStore.isDiceVisible &&
  !diceStore.hasActiveRolls() &&
  diceStore.canClearAfterCountdown
);
</script>

<svelte:window on:click={handleWindowClick} />

<DiceAlertList />

<!-- Hint visual: aparece no canto quando o dado já parou e o countdown passou -->
{#if canClickToClear}
  <div
    class="fixed top-14 right-4 z-[9999] pointer-events-none"
    style="animation: fade-in-right 0.25s ease-out forwards;"
  >
    <span class="px-3 py-1.5 rounded-full bg-black/70 text-white/80 text-xs font-medium backdrop-blur-sm border border-white/10 select-none whitespace-nowrap">
      Clique para limpar os dados
    </span>
  </div>
{/if}

<style>
  @keyframes fade-in-right {
    from { opacity: 0; transform: translateX(8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
</style>
