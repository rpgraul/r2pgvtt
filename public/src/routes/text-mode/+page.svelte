<script>
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileText,
  Folder,
  Plus,
  Save,
  Search,
  Swords,
  User,
  Users,
} from 'lucide-svelte';
import RichTextEditor from '$components/editor/RichTextEditor.svelte';
import CardDialog from '$components/grid/CardDialog.svelte';
import Badge from '$components/ui/Badge.svelte';
import Button from '$components/ui/Button.svelte';
import { ScrollArea } from '$components/ui/scroll-area/index.js';
import { gameState } from '$lib/state/gameState.svelte.ts';

let selectedItem = $state(null);
let editedContent = $state('');
let isEditing = $state(false);
let showNewCardDialog = $state(false);
let isSidebarOpen = $state(true);

// Filtros locais (Notion-style)
let activeFolder = $state('all'); // 'all' | 'pj' | 'monstro' | 'npc' | 'item' | 'anotacao'
let selectedTag = $state('all');
let searchQuery = $state('');

const folders = [
  { id: 'all', label: 'Todas as Notas', icon: Folder },
  { id: 'pj', label: 'Personagens', icon: User },
  { id: 'monstro', label: 'Monstros', icon: Swords },
  { id: 'npc', label: 'NPCs', icon: Users },
  { id: 'item', label: 'Itens', icon: Briefcase },
  { id: 'anotacao', label: 'Anotações', icon: FileText },
];

// Mapeamento de itens filtrados
const filteredItems = $derived(
  gameState.items.filter((item) => {
    // 1. Filtro de pasta
    if (activeFolder !== 'all' && item.category !== activeFolder) return false;

    // 2. Filtro de tags
    if (selectedTag !== 'all' && !item.tags?.includes(selectedTag)) return false;

    // 3. Filtro de busca
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.titulo?.toLowerCase().includes(q);
      const matchContent = item.conteudo?.toLowerCase().includes(q);
      return matchTitle || matchContent;
    }

    return true;
  }),
);

// Mapeamento de tags únicas disponíveis nas notas
const allTags = $derived([
  'all',
  ...Array.from(new Set(gameState.items.flatMap((item) => item.tags || []))).sort(),
]);

function selectItem(item) {
  selectedItem = item;
  editedContent = item.conteudo || '';
  isEditing = false;
}

async function handleSaveContent() {
  if (!selectedItem) return;

  try {
    await gameState.editCard(selectedItem.id, {
      conteudo: editedContent,
    });
    selectedItem = { ...selectedItem, conteudo: editedContent };
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

function getCategoryLabel(cat) {
  const f = folders.find((folder) => folder.id === cat);
  return f ? f.label : cat;
}
</script>

<div class="h-[calc(100vh-48px)] flex w-full overflow-hidden bg-background select-none">
  
  <!-- Left Side: Collapsible Notion Pages Sidebar -->
  {#if isSidebarOpen}
    <aside class="w-64 border-r bg-sidebar flex flex-col shrink-0 min-h-0">
      <!-- Search & Toggle Header -->
      <div class="p-3 border-b flex items-center gap-2 shrink-0">
        <div class="relative flex-1">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <input
            bind:value={searchQuery}
            type="text"
            placeholder="Buscar..."
            class="w-full pl-8 pr-7 py-1.5 text-xs rounded border bg-background text-foreground outline-none focus:border-primary/85 transition-colors placeholder:text-muted-foreground/50"
          />
        </div>
        <button
          onclick={() => isSidebarOpen = false}
          class="p-1.5 rounded hover:bg-secondary/60 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          title="Fechar Barra Lateral"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
      </div>

      <!-- Folders list -->
      <div class="p-2 border-b shrink-0">
        <span class="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2.5 py-1 block">Pastas</span>
        <nav class="space-y-0.5 mt-1">
          {#each folders as f}
            {@const count = f.id === 'all' ? gameState.items.length : gameState.items.filter(i => i.category === f.id).length}
            {@const Icon = f.icon}
            <button
              onclick={() => { activeFolder = f.id; }}
              class="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded transition-colors text-left cursor-pointer {activeFolder === f.id ? 'bg-secondary text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'}"
            >
              <span class="flex items-center gap-2">
                <Icon class="w-4 h-4" />
                {f.label}
              </span>
              <Badge variant="outline" class="text-[9px] px-1 py-0">{count}</Badge>
            </button>
          {/each}
        </nav>
      </div>

      <!-- Document Items list matching folder -->
      <div class="flex-1 flex flex-col min-h-0 border-b">
        <div class="px-4 py-2 bg-muted/5 flex items-center justify-between shrink-0 border-b">
          <span class="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FileText class="w-4 h-4" />
            Páginas
          </span>
          <Badge variant="outline" class="text-[9px] px-1 py-0">{filteredItems.length}</Badge>
        </div>

        <ScrollArea class="flex-1 min-h-0">
          <div class="p-2 space-y-0.5">
            {#if filteredItems.length === 0}
              <p class="text-xs text-muted-foreground p-3 text-center">Nenhum item nesta pasta.</p>
            {:else}
              {#each filteredItems as item}
                {@const isActive = selectedItem?.id === item.id}
                <button
                  onclick={() => selectItem(item)}
                  class="w-full text-left p-2.5 rounded transition-all cursor-pointer border {isActive ? 'border-primary bg-secondary/25' : 'border-transparent hover:bg-secondary/40'}"
                >
                  <h3 class="font-semibold text-xs text-foreground truncate">{item.titulo || 'Sem título'}</h3>
                  <p class="text-[10px] text-muted-foreground truncate mt-0.5">
                    {item.conteudo?.replace(/<[^>]*>/g, '').slice(0, 50) || 'Sem conteúdo'}
                  </p>
                </button>
              {/each}
            {/if}
          </div>
        </ScrollArea>
      </div>

      <!-- Tags Filters -->
      <div class="p-3 shrink-0 max-h-36 overflow-y-auto scrollbar-thin">
        <span class="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Tags</span>
        <div class="flex flex-wrap gap-1">
          {#each allTags as tag}
            {@const isSelected = selectedTag === tag}
            <button
              onclick={() => selectedTag = tag}
              class="text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer {isSelected ? 'bg-primary text-primary-foreground border-primary font-semibold' : 'bg-background border-border hover:bg-secondary text-muted-foreground hover:text-foreground'}"
            >
              {tag === 'all' ? 'Todas' : `#${tag}`}
            </button>
          {/each}
        </div>
      </div>

      <!-- Create Note action -->
      <div class="p-3 shrink-0 border-t bg-muted/5">
        <button 
          onclick={() => showNewCardDialog = true} 
          class="w-full inline-flex h-9 items-center justify-center rounded border bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
        >
          <Plus class="w-4 h-4 mr-1" />
          Nova Nota
        </button>
      </div>
    </aside>
  {/if}

  <!-- Collapse indicator if sidebar is closed -->
  {#if !isSidebarOpen}
    <div class="p-2 border-r bg-sidebar flex items-start justify-center w-10 shrink-0">
      <button
        onclick={() => isSidebarOpen = true}
        class="p-1.5 rounded hover:bg-secondary/60 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        title="Abrir Barra Lateral"
      >
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  {/if}

  <!-- Right Side: Notion Workspace centered document -->
  <main class="flex-1 flex flex-col min-h-0 overflow-y-auto bg-background select-text">
    {#if selectedItem}
      <!-- Editor Header -->
      <div class="p-3 border-b flex items-center justify-between bg-sidebar/20 shrink-0 select-none">
        <div class="flex items-center gap-2">
          <Badge variant="outline" class="text-[9px] uppercase font-bold px-1.5 py-0">{getCategoryLabel(selectedItem.category)}</Badge>
          {#if selectedItem.tags && selectedItem.tags.length > 0}
            <div class="flex gap-1">
              {#each selectedItem.tags as tag}
                <span class="text-[10px] text-muted-foreground font-semibold">#{tag}</span>
              {/each}
            </div>
          {/if}
        </div>
        
        <button 
          onclick={toggleEdit} 
          class="inline-flex h-8 items-center justify-center rounded border bg-background px-3 text-xs font-semibold hover:bg-secondary/60 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          {#if isEditing}
            <Save class="w-3.5 h-3.5 mr-1" />
            Salvar
          {:else}
            <Edit3 class="w-3.5 h-3.5 mr-1" />
            Editar Nota
          {/if}
        </button>
      </div>

      <!-- Editor Content -->
      <div class="flex-1 p-8 overflow-y-auto">
        <div class="max-w-3xl mx-auto w-full">
          {#if isEditing}
            <RichTextEditor bind:content={editedContent} />
          {:else}
            <article class="prose prose-invert max-w-none text-foreground/90 leading-relaxed text-sm select-text">
              <h1 class="text-3xl font-bold mb-6 text-foreground tracking-tight border-b pb-3 select-text">{selectedItem.titulo || 'Sem título'}</h1>
              {#if selectedItem.conteudo}
                {@html selectedItem.conteudo}
              {:else}
                <p class="text-muted-foreground italic select-none">Este documento está vazio. Clique em Editar para escrever.</p>
              {/if}
            </article>
          {/if}
        </div>
      </div>
    {:else}
      <!-- Empty state -->
      <div class="flex-1 flex flex-col items-center justify-center text-center p-12 select-none">
        <FileText class="w-12 h-12 text-muted-foreground opacity-30 mb-3" />
        <h3 class="text-sm font-semibold">Nenhuma nota selecionada</h3>
        <p class="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Selecione uma nota na barra lateral ou crie uma nova para começar a editar no editor Notion.
        </p>
        <button 
          onclick={() => showNewCardDialog = true} 
          class="mt-4 inline-flex h-8.5 items-center justify-center rounded border bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-secondary/80 text-foreground transition-colors cursor-pointer"
        >
          <Plus class="w-3.5 h-3.5 mr-1" />
          Criar Nota
        </button>
      </div>
    {/if}
  </main>

</div>

<CardDialog bind:open={showNewCardDialog} />
