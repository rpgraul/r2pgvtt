<script>
  import { tick } from 'svelte';
  import { gameState } from '$lib/state/game.svelte.ts';
  import { diceStore } from '$lib/state/diceStore.svelte.js';
  import { X, Send } from 'lucide-svelte';
  
  let { open = $bindable(false) } = $props();
  
  let messagesContainer;
  let inputValue = $state('');
  let inputElement;
  
  // Chat History
  let history = $state([]);
  let historyIndex = $state(-1);
  let tempValue = '';
  
  const messages = $derived(gameState.chatMessages);
  
  function formatTime(date) {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function getContrastColor(hex) {
    if (!hex) return '#f4f4f5'; // default zinc-100
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substr(0, 2), 16) || 0;
    const g = parseInt(hex.substr(2, 2), 16) || 0;
    const b = parseInt(hex.substr(4, 2), 16) || 0;
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#09090b' : '#f4f4f5'; // zinc-950 for light bg, zinc-100 for dark bg
  }

  function parseMessage(msg) {
    if (!msg || !msg.text) return '';
    const text = msg.text;
    // Escapar tags HTML para segurança
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
      
    const bgColor = msg.color || 'rgba(63, 63, 70, 0.4)';
    const textColor = msg.color ? getContrastColor(msg.color) : 'inherit';
    const borderColor = msg.color ? 'transparent' : 'rgba(161, 161, 170, 0.2)';
    const styleAttr = `style="background-color: ${bgColor}; color: ${textColor}; border-color: ${borderColor};"`;
    
    // Substituir !!!valor!!! pelo badge de TOTAL (mais destacado)
    const withTotal = escaped.replace(/!!!(.*?)!!!/g, `<span class="dice-total-badge" ${styleAttr}>$1</span>`);
      
    // Tratar ~~valor~~ para strikes (dados dropados)
    const withStrike = withTotal.replace(/~~(.*?)~~/g, `<span class="opacity-50 line-through text-xs">$1</span>`);
    
    // Opcional: tratar ** ** num formato moderno se precisar (fallback)
    return withStrike.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
      return p1.split(',').map(v => `<span class="dice-result-badge" ${styleAttr}>${v.trim()}</span>`).join(', ');
    });
  }
  
  async function handleSubmit(e) {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    
    if (text.startsWith('/r ') || text.startsWith('/roll ')) {
      const formula = text.replace(/^\/(r|roll)\s*/, '');
      const match = formula.match(/(\d+)d(\d+)/i) || formula.match(/^d(\d+)/i);
      
      if (match) {
        diceStore.rollDice(formula).then(result => {
          gameState.sendMessage(`🎲 Rolou ${result.formula || formula}: ${result.textual}`);
          gameState.sendRoll(result.formula || formula, result.total, { rolls: result.rolls, diceType: result.diceType });
        }).catch(err => console.error('[Chat] Dice error:', err));
      } else {
        await gameState.sendSystemMessage(`Fórmula inválida: ${formula}. Use ex: 2d6 ou d20`);
      }
    } else {
      await gameState.sendMessage(text);
    }
    
    if (text) {
      // Adicionar ao histórico, removendo duplicatas existentes para mover para o topo
      const filtered = history.filter(h => h !== text);
      history = [text, ...filtered].slice(0, 10);
      historyIndex = -1;
      tempValue = '';
    }

    inputValue = '';
    await tick();
    scrollToBottom();
  }

  function handleKeydown(e) {
    if (e.key === 'ArrowUp') {
      if (history.length > 0 && historyIndex < history.length - 1) {
        if (historyIndex === -1) tempValue = inputValue;
        historyIndex++;
        inputValue = history[historyIndex];
        // Colocar o cursor no final (opcional, mas bom)
        setTimeout(() => {
          if (inputElement) {
            inputElement.selectionStart = inputElement.selectionEnd = inputValue.length;
          }
        }, 0);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (historyIndex > -1) {
        historyIndex--;
        if (historyIndex === -1) {
          inputValue = tempValue;
        } else {
          inputValue = history[historyIndex];
        }
      }
      e.preventDefault();
    }
  }
  
  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
  
  $effect(() => {
    if (open && messages.length > 0) {
      tick().then(scrollToBottom);
    }
  });
</script>

<!-- Messages -->
<div 
  bind:this={messagesContainer}
  class="h-[calc(100vh-200px)] overflow-y-auto p-3 space-y-2 scrollbar-thin"
>
  {#each messages as msg (msg.id)}
    <div class={`message ${msg.type === 'system' ? 'bg-muted/50 rounded-lg p-2' : ''}`}>
      <div class="flex items-baseline gap-2">
        <span class="font-medium text-sm">
          {msg.sender || 'Anônimo'}
        </span>
        {#if msg.createdAt}
          <span class="text-xs text-muted-foreground">
            {formatTime(msg.createdAt)}
          </span>
        {/if}
      </div>
      <p class="text-sm mt-1">{@html parseMessage(msg)}</p>
    </div>
  {/each}
  
  {#if messages.length === 0}
    <p class="text-center text-muted-foreground text-sm py-8">
      Nenhuma mensagem ainda
    </p>
  {/if}
</div>

<!-- Input -->
<form onsubmit={handleSubmit} class="p-3 border-t">
  <div class="flex gap-2">
    <input
      bind:this={inputElement}
      bind:value={inputValue}
      onkeydown={handleKeydown}
      type="text"
      placeholder="Digite uma mensagem..."
      class="flex-1 h-9 px-3 rounded-md border bg-background text-sm"
    />
    <button
      type="submit"
      disabled={!inputValue.trim()}
      class="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
    >
      <Send class="w-4 h-4" />
    </button>
  </div>
  <p class="text-xs text-muted-foreground mt-2">
    Use /r ou /roll para rolar dados (ex: /r 1d20)
  </p>
</form>
