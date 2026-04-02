<script>
  import DiceAlertList from './DiceAlertList.svelte';
  import { diceStore } from '$lib/state/diceStore.svelte.js';

  function handleWindowClick() {
    if (diceStore.isDiceVisible && !diceStore.hasActiveRolls()) {
      diceStore.clear3DDice();
    }
  }
</script>

<svelte:window on:click={handleWindowClick} />
<DiceAlertList />
