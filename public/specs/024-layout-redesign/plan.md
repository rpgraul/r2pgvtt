# Plan: Layout Redesign - Sidebar & FAB

## 1. Objetivo
Simplificar a interface do usuário (UI) substituindo o sistema complexo de FABs e abas flutuantes por uma barra lateral persistente (Push Sidebar) e um botão de ajuda centralizado. O objetivo é reduzir a carga cognitiva e o número de cliques necessários para acessar funções essenciais (Chat, Música, Dados).

## 2. Estratégia de Arquitetura

### Layout "Push"
Utilizaremos uma estrutura de container flexível no nível mais alto da aplicação. A barra lateral não será um `overlay` (modal), mas um elemento irmão do conteúdo principal.
- **Container Pai**: `flex w-screen h-screen overflow-hidden`.
- **Conteúdo Principal**: `flex-1 h-full` (encolhe automaticamente quando a sidebar expande).
- **Sidebar**: Largura fixa (ex: `w-80` ou `w-96`), animada com transições de CSS para o efeito de "expansão/compressão".

### Gerenciamento de Estado (SSOT)
O estado de visibilidade da sidebar será controlado globalmente no `gameState.svelte.js` usando Svelte Runes (`$state`). Isso permitirá que qualquer componente (incluindo o novo FAB) dispare a abertura/fechamento.

### Componentização
1.  **Sidebar.svelte**: Container que agrupa Chat, Music Player e Atalhos de Dados em abas internas ou seções verticais.
2.  **FAB.svelte**: Um grupo fixo de apenas 2 botões no canto inferior direito que se movem junto com o layout.
3.  **HelpModal.svelte**: Um modal simples (usando a lógica de `bits-ui` ou similar) para documentação.

## 3. Fluxo de Dados
1. Usuário clica no botão "Sidebar" no FAB.
2. `gameState.isSidebarOpen` é invertido.
3. O container principal reage à mudança de estado, ajustando as classes de largura via Tailwind.
4. O navegador executa a transição suave de layout.