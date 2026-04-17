# Tasks: Chat + Dados Visíveis da Mesa

**Note**: Chat functionality and card visibility filters ALREADY EXIST in codebase. This task list focuses on verification and minor fixes.

## Format: `[ID] [Verify/Fix] Description`

---

## User Story 1 - Chat em Tempo Real (P1) 🎯

- [ ] T001 [Verify] Testar chat entre dois navegadores — abrir jogo, enviar mensagem, verificar recepção
- [ ] T002 [Verify] Testar comando dice `/r 1d20` — verificar resultado no chat
- [ ] T003 [Verify] Testar comando dice com modificador `/r 2d6+3`
- [ ] T004 [Verify] Testar history navigation (Arrow Up/Down)

---

## User Story 2 - Card Visibility (P1)

- [ ] T010 [Verify] Narrador cria card com "visível para jogadores" = true → jogador vê
- [ ] T011 [Verify] Narrador cria card com "visível para jogadores" = false → jogador NÃO vê
- [ ] T012 [Verify] Narrador vê TODOS os cards (incluindo ocultos)
- [ ] T013 [Fix] Ajustar filtro se necessário em `gameState.filteredItems`

---

## User Story 3 - Realtime Card Sync (P1)

- [ ] T020 [Verify] Narrador cria card visível → aparece para jogador sem refresh
- [ ] T021 [Verify] Narrador edita card → reflete para jogador
- [ ] T022 [Verify] Narrador deleta card →some para jogador

---

## Polish

- [ ] T030 [Verify] Test end-to-end completo (chat + cards)
- [ ] T031 [Lint] Run `biome format --write && biome lint`

---

## Notes

- Não há nova implementação necessária — código existente cobre requisitos
- Apenas verificar que tudo funciona conforme esperado
- Ajustar lógica de filtro apenas se testes falharem