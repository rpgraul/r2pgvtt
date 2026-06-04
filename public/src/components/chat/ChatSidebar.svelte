<script>
import { Send } from 'lucide-svelte';
import { tick } from 'svelte';
import { diceStore } from '$lib/state/diceStore.svelte.js';
import { gameState } from '$lib/state/gameState.svelte.ts';

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
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#09090b' : '#f4f4f5'; // zinc-950 for light bg, zinc-100 for dark bg
}

function parseMessage(msg) {
  if (!msg || !msg.text) return '';
  const text = msg.text;

  // Escapar tags HTML para segurança
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const bgColor = msg.color || 'rgba(55, 53, 47, 0.08)';
  const textColor = msg.color ? getContrastColor(msg.color) : 'inherit';
  const borderColor = msg.color ? 'transparent' : 'var(--border-main)';
  const styleAttr = `style="background-color: ${bgColor}; color: ${textColor}; border-color: ${borderColor};"`;

  // Substituir !!!valor!!! pelo badge de TOTAL (mais destacado)
  const withTotal = escaped.replace(
    /!!!(.*?)!!!/g,
    `<span class="dice-total-badge" ${styleAttr}>$1</span>`,
  );

  // Tratar ~~valor~~ para strikes (dados dropados)
  const withStrike = withTotal.replace(
    /~~(.*?)~~/g,
    `<span class="opacity-50 line-through text-xs">$1</span>`,
  );

  // Opcional: tratar ** ** num formato moderno se precisar (fallback)
  return withStrike.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
    return p1
      .split(',')
      .map((v) => `<span class="dice-result-badge" ${styleAttr}>${v.trim()}</span>`)
      .join(', ');
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
      diceStore.rollDice(formula).catch((err) => console.error('[Chat] Dice error:', err));
    } else {
      await gameState.sendSystemMessage(`Fórmula inválida: ${formula}. Use ex: 2d6 ou d20`);
    }
  } else {
    await gameState.sendMessage(text);
  }

  if (text) {
    const filtered = history.filter((h) => h !== text);
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
  if (messages.length > 0) {
    tick().then(scrollToBottom);
  }
});
</script>

<div class="flex h-full flex-col overflow-hidden bg-background">
  
  <!-- Messages -->
  <div 
    bind:this={messagesContainer}
    class="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 scrollbar-thin select-text"
  >
    {#each messages as msg (msg.id)}
      <div class={`message ${msg.type === 'system' ? 'bg-secondary/40 rounded p-2 border' : ''}`}>
        <div class="flex items-baseline gap-2 select-none">
          <span class="font-bold text-xs text-foreground">
            {msg.sender || 'Anônimo'}
          </span>
          {#if msg.created_at || msg.createdAt}
            <span class="text-[10px] text-muted-foreground">
              {formatTime(msg.created_at || msg.createdAt)}
            </span>
          {/if}
        </div>
        <p class="text-xs text-foreground/90 mt-1 select-text">{@html parseMessage(msg)}</p>
      </div>
    {/each}
    
    {#if messages.length === 0}
      <p class="text-center text-muted-foreground text-xs py-10">
        Nenhuma mensagem ainda.
      </p>
    {/if}
  </div>

  <!-- Input Form -->
  <form onsubmit={handleSubmit} class="p-3 border-t bg-muted/5 shrink-0 select-none">
    <div class="flex gap-2">
      <input
        bind:this={inputElement}
        bind:value={inputValue}
        onkeydown={handleKeydown}
        type="text"
        placeholder="Enviar mensagem ou /r 1d20..."
        class="flex-1 h-8 px-2.5 rounded border bg-background text-xs outline-none focus:border-primary/80 transition-colors text-foreground placeholder:text-muted-foreground/50"
      />
      <button
        type="submit"
        disabled={!inputValue.trim()}
        class="p-2 rounded border bg-background hover:bg-secondary/60 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors cursor-pointer"
      >
        <Send class="w-3.5 h-3.5" />
      </button>
    </div>
  </form>

  <!-- Quick Dice roll shortcuts -->
  <div class="border-t p-3 bg-sidebar shrink-0 select-none">
    <div class="grid grid-cols-7 gap-1">
      {#each ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'] as dice}
        <button
          type="button"
          onclick={() => diceStore.rollDice(`1${dice}`)}
          class="rounded border bg-background hover:bg-secondary/60 text-foreground transition-colors py-1.5 text-center text-xs font-semibold cursor-pointer"
        >
          {dice}
        </button>
      {/each}
    </div>
  </div>
</div>
