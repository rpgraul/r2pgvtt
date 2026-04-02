<script>
  import { onMount, onDestroy } from 'svelte';
  import { gameState } from '$lib/state/game.svelte.js';
  import { useDiceBox } from '$lib/actions/useDiceBox.js';
  import Button from '../ui/Button.svelte';
  
  const diceTypes = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];
  let customFormula = $state('');
  let lastResult = $state(null);
  let diceContainer;
  let diceBox = $state(null);
  let isLoading = $state(false);
  
  onMount(() => {
    if (diceContainer) {
      diceBox = useDiceBox(diceContainer, {
        onRollComplete: (result) => {
          lastResult = result;
          
          if (gameState.user) {
            if (result.shouldSum || result.rolls.length <= 1) {
              if (result.rolls.length > 1) {
                gameState.sendMessage(`🎲 Rolou ${result.formula}: **${result.rolls.join(', ')}** = !!!${result.total}!!!`);
              } else {
                gameState.sendMessage(`🎲 Rolou ${result.formula}: !!!${result.total}!!!`);
              }
            } else {
              gameState.sendMessage(`🎲 Rolou ${result.formula}: **${result.rolls.join(', ')}**`);
            }
            gameState.sendRoll(result.formula, result.total, { 
              rolls: result.rolls,
              diceType: result.diceType 
            });
          }
        }
      });
    }
    
    return () => {
      if (diceBox) {
        diceBox.destroy();
      }
    };
  });
  
  async function rollDice(dice) {
    if (!diceBox || !diceBox.isInitialized()) {
      await fallbackRoll(dice);
      return;
    }
    
    isLoading = true;
    try {
      await diceBox.roll(`1${dice}`);
    } catch (error) {
      console.error('Dice roll error:', error);
      await fallbackRoll(dice);
    } finally {
      isLoading = false;
    }
  }
  
  async function rollCustom() {
    if (!customFormula.trim()) return;
    
    if (!diceBox || !diceBox.isInitialized()) {
      await fallbackCustomRoll();
      return;
    }
    
    isLoading = true;
    try {
      await diceBox.roll(customFormula);
    } catch (error) {
      console.error('Dice roll error:', error);
      await fallbackCustomRoll();
    } finally {
      isLoading = false;
    }
  }
  
  function fallbackRoll(dice) {
    const result = Math.floor(Math.random() * parseInt(dice.slice(1))) + 1;
    lastResult = { dice, result, total: result, rolls: [result] };
    
    if (gameState.user) {
      gameState.sendRoll(dice, result, { dice, rolls: [result] });
    }
  }
  
  function fallbackCustomRoll() {
    const match = customFormula.match(/(\d+)d(\d+)/i);
    if (!match) return;
    
    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    let total = 0;
    const details = [];
    
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      details.push(roll);
      total += roll;
    }
    
    lastResult = { dice: customFormula, result: total, details };
    
    if (gameState.user) {
      gameState.sendRoll(customFormula, total, { details, count, sides });
    }
  }
</script>

<div class="space-y-4">
  <div 
    bind:this={diceContainer}
    class="w-full h-48 bg-muted/30 rounded-lg overflow-hidden"
  ></div>
  
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
      <p class="text-sm text-muted-foreground">{lastResult.formula || lastResult.dice}</p>
      <p class="text-4xl font-bold text-foreground">{lastResult.total || lastResult.result}</p>
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
          <span>{roll.autor}: {roll.expressao}</span>
          <span class="font-bold text-foreground">{roll.resultado}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>
