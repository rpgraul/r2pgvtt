- [ ] **Task 1: Criar o Store de Interface (uiState)**
  - Implementar o arquivo `src/lib/state/ui.svelte.js` usando runes para gerenciar `isSidebarOpen`, `activeTab` e `isHelpOpen`.

- [ ] **Task 2: Reestruturar o Layout Principal**
  - No arquivo de layout principal (geralmente `src/routes/+layout.svelte`), envolver o conteúdo atual em um container flexível.
  - Adicionar a lógica de "empurrar" o conteúdo.
  ```svelte
  <div class="flex h-screen w-screen overflow-hidden bg-background">
    <main class="relative flex-1 overflow-auto transition-all duration-300">
      <slot />
      <!-- Botões de Controle Fixos no canto inferior direito do Main -->
      <ControlButtons />
    </main>

    {#if uiState.isSidebarOpen}
      <div class="h-full w-80 border-l bg-card transition-all duration-300 animate-slide-in-right">
        <Sidebar />
      </div>
    {/if}
  </div>
  ```

- [ ] **Task 3: Implementar o Componente Sidebar**
  - Criar `src/lib/components/layout/Sidebar.svelte`.
  - Usar o componente `Tabs` (já existente no projeto) para alternar entre Chat, Música e Dados.
  - Integrar o `chatState` e `musicState` dentro dessas abas.
  - Adicionar uma seção de "Dados Rápidos" com botões d4, d6, d8, d10, d12, d20, d100 que disparam o `diceStore.rollDice`.

- [ ] **Task 4: Criar os Botões de Controle (Trigger)**
  - Criar `src/lib/components/ui/ControlButtons.svelte`.
  - Botão 1 (Sidebar): Ícone de `MessageSquare` ou `Menu`. Alterna `uiState.toggleSidebar()`.
  - Botão 2 (Help): Ícone de `HelpCircle`. Abre o Modal de Ajuda.
  - Posicionar de forma fixa no canto inferior direito, mas dentro da área do `main`, para que ele se mova junto com o conteúdo quando a sidebar abrir.

- [ ] **Task 5: Implementar HelpModal**
  - Criar `src/lib/components/layout/HelpModal.svelte` usando um Dialog/Modal simples.
  - Adicionar placeholder de texto informativo sobre shortcodes.

- [ ] **Task 6: Limpeza**
  - Remover referências ao sistema antigo de FAB e popups de abas que foram substituídos.