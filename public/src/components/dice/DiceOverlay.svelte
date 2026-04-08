<script>
import { onMount } from 'svelte';

let { open = $bindable(false), onRollComplete = () => {} } = $props();

let diceContainer;
let diceBox = null;
let isRolling = false;

async function initDice() {
  if (diceBox) return diceBox;

  const { default: DiceBox } = await import('@3d-dice/dice-box');

  diceBox = new DiceBox(diceContainer, {
    assetPath: '/assets/dice-box',
    scale: 6,
    gravity: 1,
    friction: 0.8,
    restitution: 0,
    settleTimeout: 3000,
    theme: 'default',
    onBeforeRoll: () => {
      isRolling = true;
    },
    onRollComplete: (result) => {
      isRolling = false;

      if (result && result[0]) {
        const rollResult = result[0];
        const rolls = (rollResult.rolls || []).map((r) => r.value || r.result || 0);
        const total = rollResult.value || 0;

        onRollComplete({
          formula: rollResult.label || '1d20',
          total,
          rolls,
          diceType: rollResult.diceType || 'd20',
        });
      }

      open = false;
    },
  });

  await diceBox.init();
  return diceBox;
}

export async function roll(formula) {
  await initDice();
  if (diceBox) {
    diceBox.roll(formula);
  }
}

function handleOverlayClick(e) {
  if (e.target === e.currentTarget && !isRolling) {
    open = false;
  }
}
</script>

{#if open}
  <div 
    class="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center cursor-pointer"
    onclick={handleOverlayClick}
    role="button"
    tabindex="-1"
    aria-label="Fechar"
  >
    <div 
      bind:this={diceContainer} 
      class="w-full h-full pointer-events-auto"
    ></div>
    
    {#if isRolling}
      <div class="absolute top-4 left-1/2 -translate-x-1/2 bg-card border rounded-lg px-4 py-2 shadow-lg">
        <p class="text-sm text-muted-foreground">Rolando...</p>
      </div>
    {/if}
  </div>
{/if}
