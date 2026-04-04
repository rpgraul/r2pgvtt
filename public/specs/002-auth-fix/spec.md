# Feature Specification: Auth Fixes + Games Loading

**Feature Branch**: `002-auth-fix`  
**Created**: 2026-04-03  
**Status**: Draft  
**Input**: Console errors na página /games

---

## User Scenarios & Testing

### User Story 1 - Carregamento de Perfil (Priority: P1)

Como **usuário logado**, quero que meu perfil seja carregado automaticamente para que eu possa usar o sistema.

**Acceptance Scenarios**:

1. **Given** usuário logado, **When** acessa `/games`, **Then** perfil é carregado corretamente
2. **Given** usuário logado sem perfil, **When** faz login, **Then** perfil é criado automaticamente
3. **Given** usuário não logado, **When** acessa `/games`, **Then** redirecionado para `/auth/login`

---

### User Story 2 - Loading na Página de Games (Priority: P1)

Como **usuário logado**, quero que a página de games carregue corretamente sem erros.

**Acceptance Scenarios**:

1. **Given** usuário autenticado, **When** acessa `/games`, **Then** jogos são carregados
2. **Given** authState ainda carregando, **When** acessa `/games`, **Then** mostra loading spinner
3. **Given** erro ao carregar jogos, **Then** mostra mensagem de erro amigável

---

## Requirements

### Functional Requirements

- **FR-001**: Sistema DEVE criar perfil automaticamente se não existir (on first login)
- **FR-002**: Sistema DEVE aguardar autenticação antes de carregar dados
- **FR-003**: Sistema DEVE mostrar estado de loading corretamente
- **FR-004**: Sistema DEVE tratar erros 404 de perfil gracefulmente
- **FR-005**: Sistema DEVE redirecionar para login se não autenticado

### Error Handling Requirements

- **EHR-001**: Tratar erro 404 (perfil não existe) criando automaticamente
- **EHR-002**: Tratar erro de rede com retry ou mensagem
- **EHR-003**: Log de erros para debugging

---

## Success Criteria

- [ ] Usuário consegue acessar `/games` após login
- [ ] Perfil é criado automaticamente se não existir
- [ ] Loading state é shown durante carregamento
- [ ] Sem erros de 404 no console
- [ ] Build passa sem erros
