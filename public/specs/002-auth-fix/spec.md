# Feature Specification: Auth Fixes + Games v2

**Feature Branch**: `002-auth-fix`  
**Created**: 2026-04-03  
**Status**: Draft  
**Updated**: 2026-04-03

---

## User Scenarios & Testing

### User Story 1 - FAB Condicional (Priority: P1)

Como **usuário**, não quero ver o FAB nas páginas de autenticação e gerenciamento de mesas.

**Acceptance Scenarios**:
1. **Given** usuário em `/auth/login`, **Then** FAB não aparece
2. **Given** usuário em `/games`, **Then** FAB não aparece
3. **Given** usuário em qualquer outra página, **Then** FAB aparece normalmente

---

### User Story 2 - Loading de Autenticação (Priority: P1)

Como **usuário**, quero que o sistema decida onde me redirecionar antes de mostrar qualquer conteúdo.

**Acceptance Scenarios**:
1. **Given** usuário não logado acessando `/games`, **When** refresh, **Then** mostra loading spinner até decidir redirecionar
2. **Given** usuário logado acessando `/auth/login`, **When** refresh, **Then** mostra loading spinner e redireciona para `/games`
3. **Given** usuário em qualquer rota, **When** auth inicializando, **Then** mostra tela de loading completa

---

### User Story 3 - Header Minimalista no Login (Priority: P1)

Como **usuário**, quero ver apenas logo e toggle de tema na página de login.

**Acceptance Scenarios**:
1. **Given** usuário em `/auth/login`, **Then** vê apenas "R2PG VTT" e toggle de tema
2. **Given** usuário em `/auth/login`, **Then** não vê menu de navegação
3. **Given** botão "Entrar" no Header, **Then** removido permanentemente

---

### User Story 4 - Header de Games com UserMenu (Priority: P1)

Como **usuário logado**, quero ver meu perfil e configurações no header da página de mesas.

**Acceptance Scenarios**:
1. **Given** usuário em `/games`, **Then** vê "R2PG VTT" e UserMenu
2. **Given** usuário abre UserMenu, **Then** vê: avatar/nome, configurações, sair
3. **Given** usuário em `/games`, **Then** FAB não aparece
4. **Given** nome do menu, **Then** será "UserMenu" (placeholder para futuras adições)

---

### User Story 5 - Lista de Mesas (Priority: P1)

Como **usuário logado**, quero ver minha lista de mesas com informações completas.

**Acceptance Scenarios**:
1. **Given** usuário em `/games`, **Then** vê grid de mesas
2. **Given** mesa na lista, **Then** mostra: Nome, Sistema, Data criação, Último acesso, Jogadores
3. **Given** usuário com 3+ mesas, **Then** botão "Criar Mesa" desabilitado com tooltip "Limite atingido"
4. **Given** usuário com <3 mesas, **Then** botão "Criar Mesa" habilitado

---

### User Story 6 - Criar Mesa (Priority: P1)

Como **narrador**, quero criar uma mesa com configurações básicas.

**Acceptance Scenarios**:
1. **Given** usuário clica em "Criar Mesa", **Then** abre modal com form
2. **Given** form de criação, **Then** campos: Nome*, Campanha (opcional), Sistema (opcional), Capa (opcional)
3. **Given** usuário envia form, **Then** mesa é criada com role 'narrador'
4. **Given** imagem de capa enviada, **Then** redimensiona para 100x100 para exibição

---

### User Story 7 - Soft Delete de Mesa (Priority: P1)

Como **usuário**, quero que mesas deletadas vão para lixeira até todos saírem.

**Acceptance Scenarios**:
1. **Given** narrador clica "Deletar Mesa", **Then** mesa recebe `deleted_at = now()`
2. **Given** jogador clica "Sair da Mesa", **Then** membro removido; se for último, mesa deletada permanentemente
3. **Given** mesa com `deleted_at`, **Then** aparece com indicator de "deletada"
4. **Given** narrador volta, **Then** vê opção "Cancelar exclusão" que limpa `deleted_at`
5. **Given** Último membro sai de mesa deletada, **Then** mesa é apagada permanentemente

---

### User Story 8 - Error Handling (Priority: P1)

Como **usuário**, quero ver erros tratados de forma amigável.

**Acceptance Scenarios**:
1. **Given** tabela profiles não existe, **When** authState carrega, **Then** mostra erro e não trava
2. **Given** API retorna erro, **When** tentando carregar dados, **Then** mostra mensagem amigável com retry
3. **Given** qualquer erro, **Then** não mostra stack trace para usuário

---

### User Story 9 - Entrar em Mesa (Priority: P1)

Como **usuário**, quero acessar uma mesa específica após clicar.

**Acceptance Scenarios**:
1. **Given** usuário clica em uma mesa, **Then** navega para `/games/[id]`
2. **Given** mesa não existe ou sem acesso, **Then** mostra erro 404
3. **Given** mesa carregando, **Then** mostra loading state

---

## Requirements

### Functional Requirements

- **FR-001**: FAB não aparece em `/auth/login` e `/games`
- **FR-002**: Loading screen durante verificação de auth
- **FR-003**: Header minimalista em `/auth/login` (só logo + theme toggle)
- **FR-004**: Remover botão "Entrar" permanentemente do Header
- **FR-005**: UserMenu com: avatar, configurações, sair
- **FR-006**: Lista de mesas com: Nome, Sistema, Data criação, Último acesso, Jogadores
- **FR-007**: Limite de 3 mesas enforced no frontend
- **FR-008**: Modal de criar mesa com: Nome*, Campanha, Sistema, Capa
- **FR-009**: Redimensionar imagem de capa para 100x100
- **FR-010**: Soft delete de mesas com `deleted_at`
- **FR-011**: Narrador pode cancelar exclusão
- **FR-012**: Mesa deletada quando último membro sai
- **FR-013**: Tratamento de erro para tabela não existente
- **FR-014**: getGameById deve existir ou ser removido

### Database Requirements

- **DBR-001**: Adicionar coluna `deleted_at` em `games`
- **DBR-002**: Adicionar coluna `last_accessed_at` em `game_members`
- **DBR-003**: Criar tabela `profiles` se não existir
- **DBR-004**: Verificar/recriar trigger `handle_new_user`

### UI/UX Requirements

- **UIR-001**: Loading spinner centralizado durante auth check
- **UIR-002**: Tooltip em botão desabilitado explicando limite
- **UIR-003**: Badge/indicator visual em mesas deletadas
- **UIR-004**: Avatar placeholder se não houver imagem

---

## Success Criteria

- [ ] FAB oculta em /auth/login e /games
- [ ] Loading antes de redirecionar auth
- [ ] Header login com apenas logo + theme toggle
- [ ] UserMenu funcional em /games
- [ ] Lista de mesas com todos os campos
- [ ] Criar mesa com preview de capa
- [ ] Soft delete funcionando
- [ ] Sem erros 404 no console
- [ ] Build passa
