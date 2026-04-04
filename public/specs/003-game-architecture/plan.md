# Plan: Arquitetura de Mesas

**SPEC**: `003-game-architecture`  
**Status**: Implemented  
**Created**: 2026-04-04

---

## 1. Problemas Identificados

### 1.1 getUserGames sem filtro
**PROBLEMA**: Busca todas as mesas ao invés de filtrar por membership

**SOLUÇÃO IMPLEMENTADA**:
```typescript
// tables.ts - getUserGames()
async getUserGames() {
  const userId = authState.user?.id;
  if (!userId) return [];

  return supabase
    .from('games')
    .select(`
      *,
      user_role:game_members(role),
      member_count:game_members(count),
      last_access:game_members(last_accessed_at)
    `)
    .eq('game_members.user_id', userId)  // ← FILTRO ADICIONADO
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
}
```

### 1.2 getGameById não encontrado
**PROBLEMA**: Função não exportada corretamente

**SOLUÇÃO IMPLEMENTADA**: Função existe em `game.svelte.ts:178` e agora é usada corretamente via `gameState.getGameById()`

### 1.3 Header em /games mostra navegação completa
**PROBLEMA**: Deveria ser minimalista (só logo + tema + user menu)

**SOLUÇÃO IMPLEMENTADA**:
- `+layout.svelte`: `<Header minimal={currentPath === '/auth/login' || isGamesPage} />`
- `Header.svelte`: `showUserMenu` agora inclui `isGamesPage`

### 1.4 Dados não são filtrados por game_id
**PROBLEMA**: Items, chat, rolls não estão limitados à mesa atual

**SOLUÇÃO IMPLEMENTADA**:
- `+page.svelte` (root): Lê `?gameId=` da URL e chama `gameState.setGameId(gameId)`
- `tables.ts`: Todas as subscriptions já filtram por `gameId` quando passado
- `game.svelte.ts`: `setGameId()` reinicializa subscriptions com o gameId

---

## 2. Funcionalidades Implementadas

### 2.1 Limite de 3 mesas
- [x] `db.getUserGameCount()` - Conta membership do usuário
- [x] `db.joinGame()` - Verifica limite antes de criar membership
- [x] `GameList.svelte` - Botão desabilitado se `count >= 3`
- [x] Mensagem de erro em `/join/[invite_code]`

### 2.2 Verificação de Membership
- [x] `db.joinGame()` - Verifica se já é membro antes de criar
- [x] Retorna `{ alreadyMember: true, role }` se já for membro
- [x] `/join/[invite_code]` - Redireciona diretamente se já for membro

### 2.3 Redirecionamento para Grid
- [x] `/games/[id]` - Apenas redireciona para `/?gameId=[id]`
- [x] `+page.svelte` (root) - Lê `gameId` da URL e inicializa contexto

### 2.4 Header "Mesa Ativa"
- [x] Exibe header quando `gameState.gameId` está definido
- [x] Link para `/games` (lista de mesas)

---

## 3. Arquitetura de Rotas

### Rota: `/`
- Grid principal
- Se `?gameId=` presente: inicializa contexto da mesa, exibe header "Mesa Ativa"
- Se sem parâmetro: modo global (todas as suas notas)

### Rota: `/games`
- Lista de mesas do usuário (filtrado por membership)
- Header minimalista

### Rota: `/games/[id]`
- Redireciona para `/?gameId=[id]`

### Rota: `/join/[invite_code]`
- Verifica login
- Verifica se já é membro → redireciona
- Verifica limite de 3 mesas
- Cria membership ou mostra erro
- Redireciona para `/?gameId=[id]`

---

## 4. Testes Realizados

- [x] Build completa sem erros
- [x] Biome lint passa
- [x] /games mostra apenas mesas do usuário
- [x] /games/[id] redireciona corretamente
- [x] Criar 3 mesas funciona, 4ª bloqueada
- [x] Convite com membership existente redireciona
- [x] Convite com limite atingido mostra erro

---

## 5. Pendências

- [ ] RLS policies por `game_id`
- [ ] UI para configurar permissions por role
- [ ] Sistema de "lixeira" com restauração
- [ ] Backup/export de mesa

---

## 6. Correções Realizadas

### 6.1 Funções não existem no build (PROBLEMA CRÍTICO)
**Problema**: `getGameByInviteCode is not a function`, `setGameId is not a function` no build de produção  
**Causa**: Minificação do Vite otimizando demais o factory pattern  
**Solução**: Substituir factory pattern por **classe nativa Svelte 5** com `$state()`

### 6.2 URL com ?gameId= visível
**Problema**: URL ficava com `?gameId=XXX` facilitando erros e poluindo navegação  
**Causa**: Redirecionamento usava query params  
**Solução**: Usar `history.replaceState()` para remover query params após ler gameId

### 6.3 leaveGame deletava mesa incorretamente
**Problema**: Quando qualquer membro saía, a mesa era deletada  
**Causa**: `isLastMember = membersBefore.length <= 1` (incluía 2 membros)  
**Solução**: Verificar membros restantes APÓS o delete, não antes

### 6.4 Jogadores podiam convidar
**Problema**: InviteLink sempre visível para todos os membros  
**Causa**: Não havia verificação de role  
**Solução**: Adicionar prop `userRole` e verificar `narrador || assistente`

### 6.5 FAB não aparecia
**Problema**: Botões não funcionavam na página principal  
**Causa**: Auth redirect enviava para /games, não deixando usuário ver a página principal  
**Solução**: Mantido fluxo normal (sem redirecionamento automático para /games)

---

## 7. Arquivos Modificados

| Arquivo | Mudanças |
|---------|----------|
| `src/lib/supabase/tables.ts` | `getUserGames()` filtrado, `getGameByInviteCode()`, `getUserGameCount()`, `joinGame()` com verificação, `removeMember()` |
| `src/lib/state/gameState.svelte.ts` | **NOVO** - Classe nativa com `$state()` substituindo factory pattern |
| `src/routes/+page.svelte` | Lê `?gameId=`, usa `replaceState()`, exibe header "Mesa Ativa" |
| `src/routes/games/[id]/+page.svelte` | Redireciona para `/` (sem query) |
| `src/routes/join/[invite_code]/+page.svelte` | Fluxo completo com verificação + limite, redireciona para `/` |
| `src/components/games/CreateGameModal.svelte` | Redireciona para `/` (usa setGameId) |
| `src/components/games/InviteLink.svelte` | Verifica `userRole` antes de mostrar botão |
| `src/components/Header.svelte` | `showUserMenu` inclui `isGamesPage` |
| `src/routes/+layout.svelte` | `minimal` inclui `isGamesPage` |
