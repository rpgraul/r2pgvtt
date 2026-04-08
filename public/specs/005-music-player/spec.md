# Feature Specification: Music Player

**Feature Branch**: `002-music-player`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "Player de música via YouTube links, playlist persistente, controle compartilhado entre todos os usuários (play/pause/skip sincronizado), volume individual por player, mínima interação com banco de dados para sincronização"

---

## User Scenarios & Testing

### User Story 1 - Adicionar Música à Playlist (Priority: P1)

Como **jogador ou narrador**, quero adicionar músicas via link do YouTube para criar uma playlist colaborativa.

**Why this priority**: Sem músicas na playlist, o player não funciona. Funcionalidade base.

**Independent Test**: Pode ser testado colando um link do YouTube e verificando que a música aparece na lista.

**Acceptance Scenarios**:

1. **Given** usuário na interface do player, **When** cola URL do YouTube e clica em "Adicionar", **Then** música é extraída (ID, título) e adicionada ao final da playlist
2. **Given** música na playlist, **When** usuário clica em remover, **Then** música é removida da playlist
3. **Given** link inválido do YouTube, **When** tenta adicionar, **Then** erro informativo é exibido

---

### User Story 2 - Reprodução Controlada (Priority: P1)

Como **qualquer usuário da mesa**, quero controlar a reprodução para que todos ouçam a mesma música.

**Why this priority**: Core da experiência - todos ouvem juntos, um controla para todos.

**Independent Test**: Pode ser testado dando play e verificando que todos os outros clientes同步 recebem o comando.

**Acceptance Scenarios**:

1. **Given** música na playlist, **When** usuário clica em Play, **Then** música começa a tocar para todos os usuários da mesa
2. **Given** música tocando, **When** usuário clica em Pause, **Then** música pausa para todos
3. **Given** música tocando ou pausada, **When** usuário clica em Skip, **Then** próxima música começa (ou nada se for última)
4. **Given** playlist vazia, **When** qualquer usuário clica em Play, **Then** nada acontece

---

### User Story 3 - Volume Individual (Priority: P2)

Como **usuário**, quero ajustar meu próprio volume sem afetar o dos outros.

**Why this priority**: Conforto pessoal - cada jogador pode ter preferência diferente de volume.

**Independent Test**: Pode ser testado ajustando o slider e verificando que apenas o próprio áudio muda.

**Acceptance Scenarios**:

1. **Given** música tocando, **When** usuário ajusta slider de volume, **Then** volume local muda, volume dos outros não é afetado
2. **Given** volume no mínimo, **When** música toca, **Then** áudio está muted para esse usuário
3. **Given** usuário sai e volta, **When** retorna à mesa, **Then** volume volta ao último valor ajustado (persistido via localStorage, sem banco)

---

### User Story 4 - Sincronização de Estado (Priority: P1)

Como **usuário**, quero que o estado do player (música atual, play/pause) seja consistente entre todos os clientes.

**Why this priority**: Garantir que todos ouvam a mesma coisa no mesmo tempo.

**Independent Test**: Pode ser testado com dois navegadores - um dá play, o outro deve ver play também.

**Acceptance Scenarios**:

1. **Given** usuário entra na mesa, **When** acessa a página do jogo, **Then** estado atual do player é carregado (playlist, música atual, play/pause)
2. **Given** música tocando, **When** usuário recarrega a página, **Then** música continua do ponto onde estava: cliente calcula `elapsed = Date.now() - started_at` e faz `seekTo(elapsed)` no YouTube player
3. **Given** dois usuários simultâneos, **When** um dá skip enquanto outro dá pause, **Then** último comando wins (não há conflito resolution complexo)

---

### User Story 5 - Exibir Informações da Música (Priority: P3)

Como **usuário**, quero ver qual música está tocando agora.

**Why this priority**: Contexto - usuário precisa saber o que está tocando.

**Independent Test**: Pode ser testado durante reprodução.

**Acceptance Scenarios**:

1. **Given** música tocando, **When** usuário olha para o player, **Then** vê título da música atual
2. **Given** próxima música na fila, **When** música atual termina, **Then** título atualiza para próxima música

---

## Requirements

### Functional Requirements

- **FR-001**: Sistema DEVE extrair ID do YouTube de URLs válidas (youtube.com/watch?v=..., youtu.be/..., etc)
- **FR-002**: Sistema DEVE persistir playlist no banco de dados (tabela music_playlist)
- **FR-003**: Qualquer usuário DEVE poder adicionar música à playlist
- **FR-004**: Qualquer usuário DEVE poder remover música da playlist
- **FR-005**: Comando Play DEVE ser propagado para todos os usuários da mesa
- **FR-006**: Comando Pause DEVE ser propagado para todos os usuários da mesa
- **FR-007**: Comando Skip DEVE avançar para próxima música na playlist
- **FR-008**: Volume DEVE ser individual por cliente (não propagado), persistido em localStorage
- **FR-009**: Controles de playback (play/pause/skip) DEVEM usar Supabase Realtime Broadcast (sem write no banco). Mudanças na playlist DEVEM usar Postgres Changes (persistência necessária)
- **FR-010**: Quando música atual termina, DEVE automaticamente tocar próxima música
- **FR-011**: Ao entrar na mesa, cliente DEVE buscar snapshot mais recente do estado do player para se sincronizar (playlist via Postgres, estado via Broadcast)

### Non-Functional Requirements

- **NFR-001**: Sincronização deve ter latência < 500ms
- **NFR-002**: Interação com banco de dados deve ser mínima (apenas para persistência playlist e estado)
- **NFR-003**: Playback via YouTube IFrame API (sem download de áudio)
- **NFR-004**: Estado deve ser resiliente a reconexões (reconnect automático)

---

## Key Entities

- **MusicTrack**: Música na playlist (youtube_id, titulo, added_by, added_at, ordem)
- **PlayerState**: Estado atual do player (is_playing, current_track_index, started_at, updated_at)
- **UserVolume**: Volume individual do usuário (localStorage, sem banco)

---

## Success Criteria

- **SC-001**: Usuário consegue adicionar música via link YouTube em < 2 segundos
- **SC-002**: Play/Pause de um usuário é refletido em todos os outros em < 500ms
- **SC-003**: Volume individual não afeta outros usuários
- **SC-004**: Playlist persiste entre sessões e recarregamentos de página

---

## Assumptions

- Mesa (game) já existe quando o player é usado
- Supabase Realtime está configurado para a tabela de estado
- YouTube IFrame API permite reprodução sem restrições (sem DRM)
- Todos os usuários na mesa podem ver/ouvir a mesma música
- Não há necessidade de suportar playlists de outros serviços além do YouTube