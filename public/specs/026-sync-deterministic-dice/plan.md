## 1. Objetivo
Sincronizar rolagens de dados para que todos os jogadores vejam exatamente a mesma animação 3D, o mesmo resultado final, a mesma cor e a mesma mensagem no chat/alerta.

## 2. Estratégia de Arquitetura
1. **Dono da Rolagem**: O jogador que clica no botão gera o resultado final imediatamente usando `Web Crypto API` (antes da animação).
2. **Broadcast Imediato**: Antes de iniciar o 3D, ele envia um evento de broadcast via Supabase com os valores exatos (ex: `[{sides: 20, value: 18}]`).
3. **Execução Síncrona**: Todos os clientes (incluindo o remetente) recebem esse broadcast e injetam os valores no Dice-Box. O Dice-Box é configurado para "forçar" o dado a cair naquele valor.
4. **Fim da Animação**: O Alerta e a mensagem no Chat só aparecem quando a animação 3D termina (callback `onRollComplete`), garantindo o suspense RPG.
5. **Persistência**: O remetente salva no banco de dados apenas para histórico, mas a UI depende do Broadcast para velocidade.