<script>
import { goto } from '$app/navigation';
import { gameState } from '$lib/state/gameState.svelte.ts';
import { diceStore } from '$lib/state/diceStore.svelte.js';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet/index.js';
import Dialog from './ui/Dialog.svelte';
import DialogContent from './ui/DialogContent.svelte';
import DialogTitle from './ui/DialogTitle.svelte';
import MiniPlayer from './audio/MiniPlayer.svelte';
import MusicPlayer from './player/MusicPlayer.svelte';
import ChatSidebar from './chat/ChatSidebar.svelte';

import {
  Plus,
  Dices,
  Music,
  MessageCircle,
  X,
  Settings,
  ListChecks,
  Layers,
  HelpCircle,
  Users,
  Palette,
  IdCard,
} from 'lucide-svelte';

let { currentPath = '/' } = $props();

let showChat = $state(false);
let showAudio = $state(false);
let showAddCard = $state(false);
let showSettings = $state(false);
let showHelp = $state(false);
let showBulkEdit = $state(false);
let isExpanded = $state(false);
let diceHovered = $state(false);
let diceHoverTimeout = null;

const mode = $derived(() => {
  const p = currentPath;
  if (p.includes('sheet-mode')) return 'sheet';
  if (p.includes('text-mode')) return 'notas';
  if (p.includes('drawing-mode')) return 'whiteboard';
  return 'grid';
});

const buttons = $derived(() => {
  const m = mode();
  const isNarrator = gameState.isNarrator;
  const btns = [];

  if (m === 'sheet') {
    btns.push('audio', 'dice', 'chat', 'help');
  } else if (m === 'grid') {
    btns.push('audio', 'dice', 'chat', 'converter');
    if (isNarrator) btns.push('bulk-edit', 'settings');
    btns.push('help');
  } else if (m === 'notas' || m === 'whiteboard') {
    btns.push('audio', 'dice', 'chat');
    if (isNarrator) btns.push('settings');
    btns.push('help');
  }

  return btns;
});

function toggle() {
  isExpanded = !isExpanded;
}

function handleAction(action) {
  isExpanded = false;

  switch (action) {
    case 'chat':
      showChat = true;
      break;
    case 'audio':
      showAudio = true;
      break;
    case 'dice':
      break;
    case 'd4':
    case 'd6':
    case 'd8':
    case 'd10':
    case 'd12':
    case 'd20':
    case 'd100':
      isExpanded = false;
      diceStore
        .rollDice(`1${action}`)
        .then((result) => {
          gameState.sendMessage(`🎲 Rolou ${result.formula || `1${action}`}: ${result.textual}`);
          gameState.sendRoll(
            result.formula || `1${action}`,
            result.total,
            {
              rolls: result.rolls,
              diceType: action,
            },
            diceStore.currentDiceColor,
          );
        })
        .catch((err) => console.error('[FAB] Dice error:', err));
      break;
    case 'add-card':
      showAddCard = true;
      break;
    case 'settings':
      showSettings = true;
      break;
    case 'help':
      showHelp = true;
      break;
    case 'bulk-edit':
      showBulkEdit = true;
      break;
    case 'converter':
      goto('/converter');
      break;
    case 'sheet-mode':
      goto('/sheet-mode');
      break;
    case 'drawing-mode':
      goto('/drawing-mode');
      break;
  }
}

const diceTypes = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

function getButtonColor(key) {
  const colors = {
    settings: 'bg-secondary text-secondary-foreground',
    'bulk-edit': 'bg-accent text-accent-foreground',
    converter: 'bg-warning text-warning-foreground',
    help: 'bg-muted text-muted-foreground',
    chat: 'bg-info text-info-foreground',
    audio: 'bg-warning text-warning-foreground',
    dice: 'bg-primary text-primary-foreground',
    'add-card': 'bg-secondary text-secondary-foreground',
  };
  return colors[key] || 'bg-muted text-muted-foreground';
}

function getButtonIcon(key) {
  const icons = {
    settings: Settings,
    'bulk-edit': ListChecks,
    converter: Layers,
    help: HelpCircle,
    chat: MessageCircle,
    audio: Music,
    dice: Dices,
    'add-card': Plus,
    'sheet-mode': IdCard,
    'drawing-mode': Palette,
  };
  return icons[key];
}
</script>

<div 
  class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
  onclick={(e) => e.stopPropagation()}
  onkeydown={(e) => e.stopPropagation()}
  role="region"
  aria-label="Menu de ações"
>
  {#if isExpanded}
    {#each buttons() as btn}
      {#if btn === 'dice'}
        <div 
          class="relative"
          onmouseenter={() => {
            if (diceHoverTimeout) clearTimeout(diceHoverTimeout);
            diceHovered = true;
          }}
          onmouseleave={() => {
            diceHoverTimeout = setTimeout(() => diceHovered = false, 400);
          }}
        >
          <button
            onclick={() => handleAction('dice')}
            class="dice-main flex h-12 w-12 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg hover:scale-110 transition-transform"
            title="Dados"
          >
            <Dices class="h-5 w-5" />
          </button>
          
            {#if diceHovered}
            <div 
              class="absolute right-full top-1/2 -translate-y-1/2 mr-4 p-4 flex flex-row gap-2"
              style="z-index: 100;"
              onclick={(e) => e.stopPropagation()}
              onmouseenter={() => {
                if (diceHoverTimeout) clearTimeout(diceHoverTimeout);
              }}
              onmouseleave={() => {
                diceHoverTimeout = setTimeout(() => diceHovered = false, 400);
              }}
            >
              {#each diceTypes as dice}
                <button
                  onclick={() => handleAction(dice)}
                  class="dice-btn dice-{dice} bg-success text-success-foreground shadow-lg hover:scale-110 transition-transform"
                  title="Rolar {dice}"
                >
                  {dice.replace('d', '')}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        {@const Icon = getButtonIcon(btn)}
        <button
          onclick={() => handleAction(btn)}
          class="fab-button h-12 w-12 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center animate-fab-enter {getButtonColor(btn)}"
          title={btn}
        >
          {#if Icon}
            <Icon class="h-5 w-5" />
          {/if}
        </button>
      {/if}
    {/each}
  {/if}
  
  <button
    onclick={toggle}
    class="fab-main flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95"
    aria-label={isExpanded ? 'Fechar menu' : 'Abrir menu'}
  >
    {#if isExpanded}
      <X class="h-6 w-6 transition-transform rotate-90" />
    {:else}
      <Plus class="h-6 w-6 transition-transform -rotate-90" />
    {/if}
  </button>
</div>

{#if isExpanded}
  <button
    class="fixed inset-0 z-40 bg-black/20 cursor-default"
    onclick={() => { isExpanded = false; diceHovered = false; }}
    aria-label="Fechar menu"
  ></button>
{/if}

<Sheet bind:open={showChat} onOpenChange={(v) => showChat = v}>
  <SheetContent side="right" class="w-[400px]">
    <SheetHeader>
      <SheetTitle>Chat</SheetTitle>
    </SheetHeader>
    <div class="mt-4">
      <ChatSidebar bind:open={showChat} />
    </div>
  </SheetContent>
</Sheet>

<Sheet bind:open={showAudio} onOpenChange={(v) => showAudio = v}>
  <SheetContent side="right" class="w-[400px]">
    <SheetHeader>
      <SheetTitle>Player de Música</SheetTitle>
    </SheetHeader>
    <div class="mt-4">
      <MusicPlayer />
    </div>
  </SheetContent>
</Sheet>

<Dialog bind:open={showAddCard}>
  <DialogContent>
    <DialogTitle>Adicionar Card</DialogTitle>
    <p class="text-sm text-muted-foreground">Em breve: formulário para criar novo card</p>
  </DialogContent>
</Dialog>

<Dialog bind:open={showSettings}>
  <DialogContent>
    <DialogTitle>Configurações</DialogTitle>
    <p class="text-sm text-muted-foreground">Em breve: configurações do site</p>
  </DialogContent>
</Dialog>

<Dialog bind:open={showHelp}>
  <DialogContent class="max-w-lg">
    <DialogTitle>Ajuda - Shortcodes</DialogTitle>
    <div class="space-y-4 text-sm">
      <div>
        <h4 class="font-medium">Atributos</h4>
        <code class="text-xs bg-muted p-1">[stat "Nome" valor]</code>
      </div>
      <div>
        <h4 class="font-medium">Pontos de Vida</h4>
        <code class="text-xs bg-muted p-1">[hp max=100 current=75]</code>
      </div>
      <div>
        <h4 class="font-medium">Dinheiro</h4>
        <code class="text-xs bg-muted p-1">[money current=500 GP]</code>
      </div>
      <div>
        <h4 class="font-medium">Contador</h4>
        <code class="text-xs bg-muted p-1">[count "Nome" max=10]</code>
      </div>
      <div>
        <h4 class="font-medium">Experiência</h4>
        <code class="text-xs bg-muted p-1">[xp current=1000/5000]</code>
      </div>
      <div>
        <h4 class="font-medium">Ocultar dos jogadores</h4>
        <code class="text-xs bg-muted p-1">[hide]...[/hide]</code>
      </div>
    </div>
  </DialogContent>
</Dialog>

<Dialog bind:open={showBulkEdit}>
  <DialogContent>
    <DialogTitle>Edição em Massa</DialogTitle>
    <p class="text-sm text-muted-foreground">Em breve: editar vários cards de uma vez</p>
  </DialogContent>
</Dialog>

<style>
  :global(.dice-btn) {
    animation: dice-enter 0.2s ease-out forwards;
  }
  
  @keyframes dice-enter {
    from {
      opacity: 0;
      transform: scale(0.5) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  :global(.dice-btn) {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.65rem;
  }

  :global(.dice-d4) {
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  }

  :global(.dice-d6) {
    border-radius: 0.25rem;
  }

  :global(.dice-d8) {
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  }

  :global(.dice-d10) {
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  }

  :global(.dice-d12) {
    clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
  }

  :global(.dice-d20) {
    clip-path: polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%);
  }

  :global(.dice-d100) {
    border-radius: 50%;
  }
</style>
