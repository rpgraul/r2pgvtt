# Spec: 023 - Strict Sync Implementation

## 1. Arquivos Afetados
- `src/lib/state/diceStore.svelte.js`
- `src/lib/utils/diceLogic.js`

## 2. Mudanças Estruturais

### 2.1. `src/lib/state/diceStore.svelte.js`
- **Reescrever `rollDice(formula)`:**
  - Extrair o parse da fórmula.
  - Executar a lógica de fallback matemático (com `getSecureRandomInt`).
  - Preparar o texto do chat e chamar o evento `outgoing_local_roll` para broadcast imediato.
  - Montar o `forcedArray` mapeando os detalhes da rolagem. Usar `sides: parseInt(parsedData.sides, 10)` e `value: parseInt(d.value, 10)`.
  - Definir `isDiceVisible = true`, rodar a instância e invocar `await instance.roll(forcedArray)`.
  - Somente após o `await`, disparar o pop-up de alerta visual.
  
- **Reescrever `playRemoteRoll(roll)`:**
  - Receber o objeto do broadcast. Extrair a cor e os detalhes.
  - Montar o `forcedArray` com `parseInt` rigoroso.
  - Definir `isDiceVisible = true`, rodar a instância e invocar `await instance.roll(forcedArray)`.
  - Somente após o `await`, disparar o pop-up de alerta visual remoto.

### 2.2. `src/lib/utils/diceLogic.js`
- Garantir que a função `getSecureRandomInt(sides)` está exportada e sendo utilizada para gerar entropia baseada na Crypto API.