- [ ] **Task 1: Criar utilitário de aleatoriedade Web Crypto**
  - Criar função que evita o bias do operador módulo.
  ```javascript
  // src/lib/utils/crypto.js
  export function getSecureRoll(sides) {
    const array = new Uint32Array(1);
    const maxUint32 = 0xFFFFFFFF;
    const range = sides;
    const remainder = maxUint32 % range;
    const threshold = maxUint32 - remainder;
    let val;
    do {
      window.crypto.getRandomValues(array);
      val = array[0];
    } while (val >= threshold);
    return (val % range) + 1;
  }
  ```

- [ ] **Task 2: Criar o Dice Store (Svelte 5)**
  - Gerenciar a instância do Dice-Box e o canal do Supabase.
  ```javascript
  // src/lib/stores/diceStore.svelte.js
  import { getSecureRoll } from '$lib/utils/crypto';

  export const diceStore = $state({
    instance: null,
    isReady: false,
    
    async triggerRoll(sides, channel, user) {
      const value = getSecureRoll(sides);
      const payload = {
        user_id: user.id,
        username: user.name,
        dice: [{ sides, value }],
        themeColor: '#ff4500'
      };
      // Broadcast para todos (incluindo eu)
      channel.send({
        type: 'broadcast',
        event: 'dice_roll',
        payload
      });
    }
  });
  ```

- [ ] **Task 3: Implementar o Componente DiceScene**
  - Inicializar o Dice-Box e escutar o Broadcast.
  ```svelte
  <!-- src/components/Dice/DiceScene.svelte -->
  <script>
    import DiceBox from '@3d-dice/dice-box';
    import { onMount } from 'svelte';
    import { diceStore } from '$lib/stores/diceStore.svelte';

    let { channel } = $props();
    let container = $state();

    onMount(async () => {
      diceStore.instance = new DiceBox(container, {
        assetPath: '/dice-assets/', // Caminho dos assets no public
        origin: window.location.origin,
        offscreen: true
      });
      
      await diceStore.instance.init();
      diceStore.isReady = true;

      // Escuta ordens de rolagem do servidor
      channel.on('broadcast', { event: 'dice_roll' }, ({ payload }) => {
        diceStore.instance.roll(payload.dice);
      });

      diceStore.instance.onRollComplete = (results) => {
        // Disparar alerta ou log no chat
        const total = results.reduce((acc, d) => acc + d.value, 0);
        window.dispatchEvent(new CustomEvent('dice:finished', { detail: { total } }));
      };
    });
  </script>

  <div bind:this={container} class="fixed inset-0 pointer-events-none"></div>
  ```

- [ ] **Task 4: Criar o Disparador e Alerta**
  - Interface simples para testar a rolagem.
  ```svelte
  <!-- src/components/Dice/RollTrigger.svelte -->
  <script>
    import { diceStore } from '$lib/stores/diceStore.svelte';
    let { channel, user } = $props();

    window.addEventListener('dice:finished', (e) => {
      alert(`Resultado do Dado: ${e.detail.total}`);
    });
  </script>

  <button 
    onclick={() => diceStore.triggerRoll(20, channel, user)}
    disabled={!diceStore.isReady}
    class="bg-indigo-600 p-2 text-white"
  >
    Rolar D20
  </button>
  ```