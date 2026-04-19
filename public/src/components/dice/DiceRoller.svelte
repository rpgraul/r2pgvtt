<script>
import { gameState } from '$lib/state/gameState.svelte.ts';
import { diceStore } from '$lib/state/diceStore.svelte.js';
import Button from '../ui/Button.svelte';

const diceTypes = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];
let customFormula = $state('');
let lastResult = $state(null);
let isLoading = $state(false);

async function rollDice(dice) {
  isLoading = true;
  try {
    lastResult = await diceStore.rollDice(`1${dice}`);
  } catch (error) {
    console.error('Dice roll error:', error);
  } finally {
    isLoading = false;
  }
}

async function rollCustom() {
  if (!customFormula.trim()) return;

  isLoading = true;
  try {
    lastResult = await diceStore.rollDice(customFormula);
  } catch (error) {
    console.error('Dice roll error:', error);
  } finally {
    isLoading = false;
  }
}
</script>

<div class="space-y-4">
  <div class="flex flex-wrap gap-2">
    {#each diceTypes as dice}
      <Button
        variant="outline"
        onclick={() => rollDice(dice)}
        disabled={isLoading}
        class="text-lg"
      >
        {dice}
      </Button>
    {/each}
  </div>
  
  <div class="flex gap-2">
    <input
      type="text"
      bind:value={customFormula}
      placeholder="2d6+3"
      disabled={isLoading}
      class="flex h-10 flex-1 rounded-md border bg-popover px-3 py-2 text-sm text-foreground border-input"
    />
    <Button onclick={rollCustom} disabled={isLoading}>
      {isLoading ? 'Rolando...' : 'Rolar'}
    </Button>
  </div>
  
  {#if lastResult}
    <div class="rounded-lg bg-card p-4 text-center">
      <p class="text-sm text-muted-foreground">{lastResult.formula}</p>
      <p class="text-4xl font-bold text-foreground">{lastResult.total}</p>
      {#if lastResult.rolls && lastResult.rolls.length > 0}
        <p class="text-xs text-muted-foreground mt-2">
          Detalhes: {lastResult.rolls.join(', ')}
        </p>
      {/if}
    </div>
  {/if}
  
  {#if gameState.rolls.length > 0}
    <div class="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
      <h4 class="text-sm font-medium text-foreground">Histórico</h4>
      {#each gameState.rolls.slice(0, 5) as roll}
        <div class="flex justify-between text-sm p-2 rounded bg-muted/50 text-foreground">
          <span>{roll.user_name}: {roll.formula}</span>
          <span class="font-bold text-foreground">{roll.result}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>