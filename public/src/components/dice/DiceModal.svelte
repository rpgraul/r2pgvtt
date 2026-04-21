<script>
import { cn } from '$lib/utils/cn.js';
import { X, Dices } from 'lucide-svelte';
import { diceStore } from '$lib/state/diceStore.svelte.js';

let { open = $bindable(false), onRollComplete = () => {} } = $props();

let formula = $state('');
let result = $state(null);
let isRolling = $state(false);

const diceTypes = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

async function roll(dice) {
  isRolling = true;
  formula = `1${dice}`;
  try {
    result = await diceStore.rollDice(formula);
    onRollComplete(result);
  } catch (err) {
    console.error(err);
  } finally {
    setTimeout(() => {
      isRolling = false;
      open = false;
    }, 1500);
  }
}

async function rollCustom() {
  if (!formula.trim()) return;
  isRolling = true;
  try {
    result = await diceStore.rollDice(formula);
    onRollComplete(result);
  } catch (err) {
    console.error(err);
  } finally {
    setTimeout(() => {
      isRolling = false;
      open = false;
    }, 1500);
  }
}
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-popover border rounded-lg shadow-xl p-6 w-80">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-foreground">Rolar Dados</h3>
        <button onclick={() => open = false} class="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      {#if !isRolling && !result}
        <div class="grid grid-cols-3 gap-2 mb-4">
          {#each diceTypes as dice}
            <button
              onclick={() => roll(dice)}
              class="py-3 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors font-medium"
            >
              {dice}
            </button>
          {/each}
        </div>
        
        <div class="flex gap-2">
          <input
            type="text"
            bind:value={formula}
            placeholder="2d6+3"
            class="flex-1 h-10 px-3 rounded-md border bg-popover text-foreground text-sm border-input"
          />
          <button
            onclick={rollCustom}
            disabled={!formula.trim()}
            class="px-4 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 font-medium"
          >
            Rolar
          </button>
        </div>
      {:else if isRolling}
        <div class="py-12 text-center">
          <Dices class="w-16 h-16 mx-auto animate-spin text-primary" />
          <p class="mt-4 text-muted-foreground">Rolando...</p>
        </div>
      {:else if result}
        <div class="text-center py-6">
          <p class="text-sm text-muted-foreground mb-2">{result.formula}</p>
          <p class="text-6xl font-bold text-foreground">{result.total}</p>
          {#if result.rolls.length > 1}
            <p class="text-sm text-muted-foreground mt-2">
              {result.rolls.join(' + ')} = {result.total}
            </p>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
