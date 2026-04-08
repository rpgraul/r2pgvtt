# Feature Specification: Auth + Games Flow

**Feature Branch**: `001-auth-and-games`  
**Created**: 2026-04-02  
**Status**: Draft  
**Input**: User description: "Sistema de autenticação, criação de mesas de RPG, convite via link, e gerenciamento básico de jogos"

---

## User Scenarios & Testing

### User Story 1 - Registro e Login (Priority: P1)

Como **novo usuário**, quero me registrar e fazer login para acessar o sistema.

**Why this priority**: Sem autenticação, nada funciona. É o fundamento de todo o sistema.

**Independent Test**: Pode ser testado completamente criando uma conta, fazendo logout, e fazendo login novamente.

**Acceptance Scenarios**:

1. **Given** usuário na página de login, **When** clica em "Entrar com Google", **Then** é redirecionado para autenticação Google e, ao retornar, está logado
2. **Given** usuário na página de login, **When** preenche email e senha válidos e clica em "Criar Conta", **Then** conta é criada e usuário é redirecionado para dashboard
3. **Given** usuário com conta, **When** preenche credenciais e clica em "Entrar", **Then** é redirecionado para dashboard
4. **Given** usuário com conta, **When** insere credenciais inválidas, **Then** mensagem de erro é exibida

---

### User Story 2 - Dashboard de Mesas (Priority: P1)

Como **usuário logado**, quero ver minhas mesas e criar novas para organizar minhas sessões de RPG.

**Why this priority**: Core do sistema - o usuário precisa ver suas mesas para interagir.

**Independent Test**: Pode ser testado criando conta, criando 3 mesas, e visualizando-as no dashboard.

**Acceptance Scenarios**:

1. **Given** usuário logado, **When** acessa `/games`, **Then** vê lista de suas mesas (máx 3)
2. **Given** usuário com menos de 3 mesas, **When** clica em "Criar Mesa", **Then** modal abre com campo para nome
3. **Given** usuário no modal de criação, **When** preenche nome e clica "Criar", **Then** mesa é criada e aparece na lista
4. **Given** usuário logado, **When** já tem 3 mesas, **Then** botão "Criar Mesa" está desabilitado com tooltip "Limite de 3 mesas"

---

### User Story 3 - Entrar em Mesa via Link (Priority: P1)

Como **usuário logado**, quero entrar em uma mesa via link de convite para jogar com meus amigos.

**Why this priority**: Sem isso, não há multiplayer. Essencial para o conceito de mesa compartilhada.

**Independent Test**: Pode ser testado criando mesa, copiando link, abrindo em outro navegador/logout, e entrando na mesa.

**Acceptance Scenarios**:

1. **Given** narrador logado, **When** acessa `/games/[id]`, **Then** vê botão "Compartilhar" com link da mesa
2. **Given** usuário com menos de 3 mesas, **When** acessa `/join/[invite_code]`, **Then** entra na mesa automaticamente e é redirecionado para `/games/[id]`
3. **Given** usuário logado com 3 mesas, **When** tenta acessar `/join/[invite_code]`, **Then** vê erro "Limite de 3 mesas atingido"
4. **Given** usuário não logado, **When** acessa `/join/[invite_code]`, **Then** é redirecionado para login e, após login, entra na mesa

---

### User Story 4 - Configurações do Jogo (Priority: P2)

Como **narrador ou assistente**, quero configurar minha mesa para definir nome, sistema de RPG e moeda padrão.

**Why this priority**: Importante para organização, mas não bloqueia uso básico.

**Independent Test**: Pode ser testado acessando configurações e salvando valores diferentes.

**Acceptance Scenarios**:

1. **Given** narrador ou assistente, **When** acessa `/games/[id]/settings`, **Then** vê campos: Nome da Campanha, Sistema, Moeda Padrão
2. **Given** usuário com role jogador, **When** tenta acessar `/games/[id]/settings`, **Then** acesso negado

---

### User Story 5 - Gerenciar Membros (Priority: P2)

Como **narrador ou assistente**, quero ver a lista de membros e remover jogadores da mesa.

**Why this priority**: Controle da mesa é importante para narradores e assistentes.

**Independent Test**: Pode ser testado adicionando membros via link e removendo-os.

**Acceptance Scenarios**:

1. **Given** narrador ou assistente, **When** acessa configurações da mesa, **Then** vê lista de membros com seus roles
2. **Given** narrador, **When** clica em "Remover" ao lado de um membro, **Then** membro é removido e perde acesso à mesa
3. **Given** assistente, **When** tenta remover outro assistente ou narrador, **Then** ação bloqueada

---

### User Story 6 - Sair da Mesa (Priority: P3)

Como **jogador**, quero sair de uma mesa quando não quiser mais participar.

**Why this priority**: Flexibilidade para o jogador, mas menos crítico que entrar.

**Independent Test**: Pode ser testado entrando e saindo de uma mesa.

**Acceptance Scenarios**:

1. **Given** jogador na lista de membros, **When** clica em "Sair da Mesa", **Then** é removido da mesa e redirecionado para `/games`
2. **Given** narrador, **When** tenta sair da mesa, **Then** opção não aparece ou mostra warning sobre transferir ownership

---

## Requirements

### Functional Requirements

- **FR-001**: Sistema DEVE autenticar usuários via Google OAuth
- **FR-002**: Sistema DEVE autenticar usuários via email/senha
- **FR-003**: Sistema DEVE criar perfil de usuário após primeiro login
- **FR-004**: Sistema DEVE limitar cada usuário a no máximo 3 mesas (criadas ou participadas)
- **FR-005**: Sistema DEVE gerar código de convite único (8 caracteres) para cada mesa
- **FR-006**: Sistema DEVE permitir entrada em mesa via URL `/join/[invite_code]`
- **FR-007**: Sistema DEVE bloquear entrada em mesa se usuário já tem 3 mesas
- **FR-008**: Sistema DEVE permitir que narrador configure: nome da campanha, sistema de RPG, moeda padrão
- **FR-009**: Sistema DEVE listar membros da mesa com seus roles
- **FR-010**: Sistema DEVE permitir remoção de membros (narradorRemoveAny, assistenteRemoveJogador)
- **FR-011**: Sistema DEVE permitir que jogador saia da mesa

### Non-Functional Requirements

- **NFR-001**: Login deve completar em menos de 3 segundos
- **NFR-002**: Redirecionamento pós-login deve ser automático

---

## Key Entities

- **User**: Usuário autenticado (via Supabase Auth)
- **Profile**: Perfil estendido do usuário (display_name)
- **Game**: Mesa de RPG (nome, owner, invite_code, settings)
- **GameMember**: Relação usuário ↔ mesa (role)
- **Roles**: Enum com 'narrador', 'assistente', 'jogador'

---

## Success Criteria

- **SC-001**: Usuário consegue criar conta e fazer login em menos de 2 minutos
- **SC-002**: Usuário consegue criar uma mesa e visualizar link de convite
- **SC-003**: Outro usuário consegue entrar na mesa via link de convite
- **SC-004**: Sistema impede usuário de entrar em mais de 3 mesas
- **SC-005**: Narrador e assistente conseguem acessar configurações da mesa
- **SC-006**: Jogador é impedido de acessar configurações da mesa

---

## Assumptions

- Usuários têm conexão com internet estável
- Browser suporta JavaScript moderno
- Supabase está configurado e acessível
- Credenciais OAuth do Google estão configuradas
- Limite de 3 mesas é verificado tanto no frontend quanto no backend (RLS)
