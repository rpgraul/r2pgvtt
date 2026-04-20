# Plan: 017 - Bulletproof Instant Sync

## 1. Objetivo
Alcançar uma sincronia impecável e instantânea. Garantir que, ao rolar um dado, o Chat e o Alerta Visual apareçam em milissegundos nos outros navegadores, sem depender do sucesso ou término da animação 3D remota. A engine 3D será executada de forma assíncrona (não-bloqueante) nos clientes remotos.

## 2. Estratégia de Arquitetura
1. **Desacoplamento Visual:** No `diceStore.svelte.js`, o `playRemoteRoll` não utilizará `await` para o motor de física. Isso garante que a UI, o alerta visual e o chat apareçam imediatamente quando o evento WebSocket for recebido, mesmo que a engine demore para carregar ou falhe.
2. **Acesso Direto à Engine:** Ao invés de passar pela action customizada (`useDiceBox.js`), o `playRemoteRoll` passará a ordem de rolagem diretamente para o motor core (`diceBoxInstance.getInstance().roll(...)`), evitando erros de validação de string.
3. **Payloads Completos:** Ao receber o broadcast de `dice_roll` no `gameState`, extrairemos tanto a rolagem (`payload.roll`) quanto a mensagem de chat associada (`payload.chatMsg`), exibindo ambas na tela do espectador instantaneamente.