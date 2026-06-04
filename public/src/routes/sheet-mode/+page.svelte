<script>
import { Edit, HelpCircle, RefreshCw, Save, Shield, User } from 'lucide-svelte';
import RichTextEditor from '$components/editor/RichTextEditor.svelte';
import Badge from '$components/ui/Badge.svelte';
import Button from '$components/ui/Button.svelte';
import { ScrollArea } from '$components/ui/scroll-area/index.js';
import { authState } from '$lib/state/auth.svelte.ts';
import { diceStore } from '$lib/state/diceStore.svelte.js';
import { gameState } from '$lib/state/gameState.svelte.ts';
import {
  calculateMathExpression,
  parseAllShortcodes,
  parseArguments,
  parseKeyValueArgs,
} from '$lib/utils/shortcodes.ts';

let selectedCardId = $state(
  typeof window !== 'undefined' ? localStorage.getItem('rpgboard_selected_character_id') || '' : '',
);
let editedContent = $state('');
let isEditing = $state(false);
let privateNotes = $state('');

const characters = $derived(gameState.items.filter((i) => i.category === 'pj'));
const selectedCard = $derived(characters.find((c) => c.id === selectedCardId));

// Carregar conteúdo ao selecionar
$effect(() => {
  if (selectedCard) {
    editedContent = selectedCard.conteudo || '';
    privateNotes = localStorage.getItem(`r2pg_notes_${selectedCard.id}`) || '';
  } else {
    editedContent = '';
    privateNotes = '';
  }
});

function selectCharacter(id) {
  selectedCardId = id;
  if (typeof window !== 'undefined') {
    localStorage.setItem('rpgboard_selected_character_id', id);
  }
}

function changeCharacter() {
  selectedCardId = '';
  if (typeof window !== 'undefined') {
    localStorage.removeItem('rpgboard_selected_character_id');
  }
  isEditing = false;
}

function handlePrivateNotesInput() {
  if (selectedCardId) {
    localStorage.setItem(`r2pg_notes_${selectedCardId}`, privateNotes);
  }
}

async function handleSaveContent() {
  if (!selectedCard) return;

  try {
    await gameState.editCard(selectedCard.id, {
      conteudo: editedContent,
    });
    isEditing = false;
  } catch (error) {
    console.error('Error saving:', error);
  }
}

function toggleEdit() {
  if (isEditing) {
    handleSaveContent();
  } else {
    isEditing = true;
  }
}

const parsedContent = $derived(
  selectedCard ? parseAllShortcodes(selectedCard, { isPlayerSheet: true }) : null,
);

// Interatividade dos shortcodes
async function handleInteraction(event) {
  const target = event.target.closest('.is-interactive');
  if (!target) return;

  const shortcodeEncoded = target.getAttribute('data-shortcode');
  if (!shortcodeEncoded) return;

  const shortcode = decodeURIComponent(shortcodeEncoded);
  const inner = shortcode.slice(1, -1).trim(); // Remove [ e ]
  const args = parseArguments(inner);
  const command = args[0].replace(/^[#*]+/, '').toLowerCase();

  if (command === 'stat') {
    const label = args.slice(1, -1).join(' ');
    const valueStr = args[args.length - 1] || '10';
    let modifier = 0;

    if (valueStr.startsWith('+') || valueStr.startsWith('-')) {
      modifier = parseInt(valueStr, 10);
    } else {
      const val = parseInt(valueStr, 10);
      if (!isNaN(val)) {
        modifier = Math.floor((val - 10) / 2);
      }
    }

    const formula = `1d20${modifier >= 0 ? '+' : ''}${modifier}`;
    gameState.addMessageToChatLocal(
      `🎲 Rolando teste de ${label} para ${selectedCard.titulo}...`,
      'system',
      'Sistema',
    );
    try {
      await diceStore.rollDice(formula);
    } catch (err) {
      console.error('[Ficha] Roll Error:', err);
    }
  } else {
    const labelMap = {
      hp: 'PV (Pontos de Vida)',
      money: 'Dinheiro',
      count: 'Contador/Recurso',
      xp: 'XP (Experiência)',
    };

    const params = parseKeyValueArgs(args.slice(1));
    const currentValue = parseFloat(params.current || params.max || '0');

    const promptText = `Atualizar ${labelMap[command] || command}:\nDigite o novo valor (ex: 15) ou alteração (ex: +5 ou -10):`;
    const input = prompt(promptText);
    if (input === null) return;

    let newValue;
    if (
      input.trim().startsWith('+') ||
      input.trim().startsWith('-') ||
      input.trim().startsWith('*') ||
      input.trim().startsWith('/')
    ) {
      newValue = calculateMathExpression(currentValue, input.trim());
    } else {
      newValue = parseFloat(input.trim());
    }

    if (isNaN(newValue)) {
      alert('Valor numérico inválido!');
      return;
    }

    let newShortcode = '';
    if (command === 'hp') {
      const max = params.max || '100';
      newShortcode = `[hp current=${newValue} max=${max}]`;
    } else if (command === 'money') {
      const currency = params.currency || args.find((a) => !a.includes('=')) || 'PO';
      newShortcode = `[money current=${newValue} currency=${currency}]`;
    } else if (command === 'count') {
      const name = args.find((a) => !a.includes('=')) || '';
      const max = params.max || '10';
      newShortcode = `[count ${name} current=${newValue} max=${max}]`;
    } else if (command === 'xp') {
      newShortcode = `[xp current=${newValue}]`;
    }

    if (newShortcode) {
      const oldContent = selectedCard.conteudo || '';
      const newContent = oldContent.replace(shortcode, newShortcode);
      try {
        await gameState.editCard(selectedCard.id, { conteudo: newContent });
        selectedCard.conteudo = newContent; // Atualiza reativamente local
      } catch (err) {
        console.error('Erro ao atualizar shortcode:', err);
      }
    }
  }
}
</script>

<div class="min-h-[calc(100vh-48px)] w-full overflow-y-auto bg-background flex flex-col">
  {#if selectedCard}
    <!-- Ficha de Personagem (Full Width Centered Workspace) -->
    <div class="max-w-4xl mx-auto w-full py-8 px-6 flex flex-col flex-1 justify-between select-text">
      <div>
        
        <!-- Header Section -->
        <div class="flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-6 select-none">
          <div class="flex items-center gap-4">
            {#if selectedCard.imagemUrl}
              <img 
                src={selectedCard.imagemUrl} 
                alt={selectedCard.titulo}
                class="w-14 h-14 object-cover rounded border shrink-0"
              />
            {:else}
              <div class="w-14 h-14 bg-secondary rounded flex items-center justify-center shrink-0 border">
                <User class="w-7 h-7 text-muted-foreground" />
              </div>
            {/if}
            <div>
              <h1 class="text-2xl font-bold text-foreground tracking-tight">{selectedCard.titulo || 'Sem título'}</h1>
              <p class="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">Personagem Principal</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <button
              onclick={changeCharacter}
              class="inline-flex h-9 items-center justify-center rounded border bg-background px-3 text-xs font-semibold hover:bg-secondary/60 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Mudar o personagem selecionado"
            >
              <RefreshCw class="w-3.5 h-3.5 mr-1.5" />
              Trocar Personagem
            </button>

            <button
              onclick={toggleEdit}
              class="inline-flex h-9 items-center justify-center rounded border bg-background px-3 text-xs font-semibold hover:bg-secondary/60 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              {#if isEditing}
                <Save class="w-3.5 h-3.5 mr-1.5" />
                Salvar Ficha
              {:else}
                <Edit class="w-3.5 h-3.5 mr-1.5" />
                Editar Ficha
              {/if}
            </button>
          </div>
        </div>

        <!-- Attributes Display Grid (Larger sizes) -->
        {#if parsedContent && !isEditing && (parsedContent.left || parsedContent.right || parsedContent.bottom || parsedContent.details)}
          <div class="p-5 rounded border bg-sidebar mb-6 select-none" onclick={handleInteraction}>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              {#if parsedContent.left}
                <div class="space-y-3">
                  <h3 class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Atributos</h3>
                  <div class="flex flex-col gap-2">
                    {@html parsedContent.left}
                  </div>
                </div>
              {/if}
              {#if parsedContent.right}
                <div class="space-y-3">
                  <h3 class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recursos</h3>
                  <div class="flex flex-col gap-2">
                    {@html parsedContent.right}
                  </div>
                </div>
              {/if}
              {#if parsedContent.bottom || parsedContent.details}
                <div class="space-y-3">
                  <h3 class="text-xs font-bold text-muted-foreground uppercase tracking-wider">PV & Info</h3>
                  <div class="flex flex-col gap-2">
                    {@html parsedContent.bottom}
                    {@html parsedContent.details}
                  </div>
                </div>
              {/if}
            </div>
            
            <div class="mt-4 flex items-center gap-2 text-xs text-muted-foreground border-t pt-3">
              <HelpCircle class="w-4 h-4 shrink-0" />
              <span>Clique nos atributos para rolar dados (d20 + mod) e nos valores de HP/XP/PO para alterá-los.</span>
            </div>
          </div>
        {/if}

        <!-- Document Prose Editor / Content (Larger font size) -->
        <div class="prose prose-invert max-w-none text-foreground/90 leading-relaxed text-sm select-text">
          {#if isEditing}
            <RichTextEditor bind:content={editedContent} />
          {:else}
            {#if selectedCard.conteudo}
              {@html selectedCard.conteudo}
            {:else}
              <p class="text-muted-foreground italic select-none">Esta ficha está vazia. Clique em Editar para adicionar detalhes, habilidades e inventário.</p>
            {/if}
          {/if}
        </div>

      </div>

      <!-- Private Notepad Section -->
      {#if !isEditing}
        <div class="mt-12 pt-6 border-t space-y-3 select-none">
          <h3 class="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            📝 Bloco de Notas Privado (Salvo localmente no seu navegador)
          </h3>
          <textarea
            bind:value={privateNotes}
            oninput={handlePrivateNotesInput}
            placeholder="Escreva anotações pessoais aqui. Ninguém mais tem acesso a este bloco..."
            class="w-full h-28 p-3.5 text-xs rounded border bg-sidebar text-foreground resize-none focus:outline-none focus:border-primary/80 transition-colors placeholder:text-muted-foreground/50 select-text"
          ></textarea>
        </div>
      {/if}

    </div>
  {:else}
    <!-- Character Selection Screen (Displays once) -->
    <div class="max-w-2xl mx-auto w-full py-12 px-6 flex flex-col justify-center items-center flex-1 text-center select-none">
      <User class="w-12 h-12 text-muted-foreground/40 mb-3" />
      <h2 class="text-xl font-bold text-foreground tracking-tight">Escolha seu Personagem</h2>
      <p class="text-xs text-muted-foreground mt-1 max-w-sm">
        Para carregar sua ficha de jogador, selecione seu personagem principal na lista abaixo. Esta escolha será lembrada.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full max-w-md">
        {#if characters.length === 0}
          <div class="sm:col-span-2 p-6 border border-dashed rounded text-xs text-muted-foreground">
            Nenhum card de personagem (PJ) encontrado nesta mesa. 
            Peça ao narrador para criar um card de personagem para você ou crie no Grid.
          </div>
        {:else}
          {#each characters as item}
            <button
              onclick={() => selectCharacter(item.id)}
              class="flex items-center gap-3 p-3.5 rounded border bg-background hover:bg-secondary/40 transition-colors text-left cursor-pointer w-full group"
            >
              {#if item.imagemUrl}
                <img 
                  src={item.imagemUrl} 
                  alt={item.titulo}
                  class="w-10 h-10 object-cover rounded border shrink-0"
                />
              {:else}
                <div class="w-10 h-10 bg-secondary rounded flex items-center justify-center shrink-0 border group-hover:bg-background transition-colors">
                  <User class="w-5 h-5 text-muted-foreground" />
                </div>
              {/if}
              <span class="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">{item.titulo || 'Sem título'}</span>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>
