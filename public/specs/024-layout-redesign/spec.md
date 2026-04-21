## 1. Arquivos Afetados
- `src/lib/state/ui.svelte.js` (Novo: Estado de visibilidade)
- `src/routes/+layout.svelte` (Modificado: Estrutura principal de flexbox)
- `src/lib/components/layout/Sidebar.svelte` (Novo)
- `src/lib/components/layout/HelpModal.svelte` (Novo)
- `src/lib/components/ui/ControlButtons.svelte` (Novo: Substitui o FAB antigo)

## 2. Tabelas e Dados (Supabase)
*Nenhuma alteração de banco de dados necessária para esta funcionalidade de UI.*

## 3. Mudanças Estruturais

### uiState (Svelte 5 Rune)
```javascript
// src/lib/state/ui.svelte.js
export function createUIState() {
  let isSidebarOpen = $state(false);
  let activeTab = $state('chat'); // 'chat' | 'music' | 'dice'
  let isHelpOpen = $state(false);

  return {
    get isSidebarOpen() { return isSidebarOpen; },
    get activeTab() { return activeTab; },
    get isHelpOpen() { return isHelpOpen; },
    toggleSidebar: () => isSidebarOpen = !isSidebarOpen,
    setTab: (tab) => activeTab = tab,
    toggleHelp: () => isHelpOpen = !isHelpOpen
  };
}
export const uiState = createUIState();
```

### Layout Flex
O container principal terá a seguinte lógica CSS:
- `display: flex; width: 100vw; height: 100vh; overflow: hidden;`
- `MainContent`: `flex: 1; transition: all 0.3s;`
- `Sidebar`: `width: 350px; transition: margin-right 0.3s;` (Quando fechado, `margin-right: -350px`)