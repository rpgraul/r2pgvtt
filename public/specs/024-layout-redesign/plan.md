## 1. Objetivo
Substituir o sistema de FABs flutuantes por um Layout de Painel Lateral (Sidebar) persistente e um Modal de Ajuda simplificado. O painel lateral ocupará parte da tela e "empurrará" o conteúdo principal (grid de cards) em vez de sobrepô-lo.

## 2. Estratégia de Arquitetura
- **Estado Global de UI:** Criar um `uiState` usando Svelte 5 Runes para controlar a visibilidade da Sidebar e o estado do Modal de Ajuda.
- **Layout Flexível:** O `app.html` ou o componente principal de layout usará um container `flex` ou `grid`. Quando a Sidebar estiver ativa, o conteúdo principal redimensionará automaticamente.
- **Componentização:**
    - `Sidebar.svelte`: Conterá abas internas para Chat, Música e Atalhos de Dados.
    - `HelpModal.svelte`: Modal padrão para documentação.
    - `ControlButtons.svelte`: Conjunto fixo de 2 botões (Abrir Sidebar / Ajuda).