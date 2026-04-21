# Spec: Layout Redesign

## 1. Arquivos Afetados
- `src/lib/state/game.svelte.js`: Adição de estados de UI.
- `src/routes/+layout.svelte`: (Ou o componente raiz de jogo) Reestruturação do grid/flex layout.
- `src/components/layout/Sidebar.svelte`: (Novo) Barra lateral direita.
- `src/components/ui/FAB.svelte`: (Novo/Refatorado) Botões de controle.
- `src/components/ui/HelpModal.svelte`: (Novo) Modal de ajuda.

## 2. Mudanças Estruturais

### GameState (`game.svelte.js`)
Adicionar as seguintes propriedades reativas:
- `isSidebarOpen`: boolean (default: false).
- `activeSidebarTab`: 'chat' | 'music' | 'dice' (default: 'chat').
- Função `toggleSidebar()`: Inverte o valor de `isSidebarOpen`.
- Função `openHelp()`: Controla o estado do modal de ajuda.

### Estrutura de Layout (DOM)
```html
<div class="flex h-screen w-screen overflow-hidden bg-background">
  <!-- Conteúdo Principal (Cartas/Mesa) -->
  <main class="relative flex-1 h-full transition-all duration-300 ease-in-out">
    <slot />
    <!-- FABs dentro do main para se moverem com ele -->
    <FAB />
  </main>

  <!-- Barra Lateral -->
  <aside class="h-full border-l bg-card transition-all duration-300 ease-in-out"
         class:w-0={!gameState.isSidebarOpen}
         class:w-80={gameState.isSidebarOpen}>
    {#if gameState.isSidebarOpen}
      <Sidebar />
    {/if}
  </aside>
</div>