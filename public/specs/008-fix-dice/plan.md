# Plan: Perfect Sync 3D Dice & Chat Fix

## 1. Objetivo
Garantir que a animação dos dados 3D exiba exatamente os mesmos números e a mesma cor para todos os jogadores simultaneamente, e corrigir o carregamento inicial do histórico do chat que estava exibindo "Nenhuma mensagem ainda".

## 2. Estratégia de Arquitetura (Dice Sync)
Em vez de deixar a engine de física 3D calcular resultados aleatórios em cada navegador:
1. O jogador que iniciar a rolagem calcula o resultado final matematicamente de forma instantânea (usando a função local `fallbackRoll`).
2. O resultado (incluindo os valores individuais de cada dado), a cor escolhida pelo jogador e a fórmula são enviados imediatamente via Broadcast (`roomChannel`) para todos os clientes.
3. Todos os navegadores (incluindo o do próprio jogador) recebem esse pacote e instruem a biblioteca `@3d-dice/dice-box` a renderizar os dados 3D com **valores e cores forçados**.
4. Quando a animação 3D forçada termina, o alerta de tela (DiceAlert) é exibido para todos.

## 3. Correção do Chat
O chat pode estar falhando em carregar os dados iniciais por problemas de reatividade ou atraso na Promise do Supabase. Adicionaremos logs de depuração e garantiremos que o array `chatMessages` seja reatribuído corretamente quando a busca inicial for concluída no banco de dados.