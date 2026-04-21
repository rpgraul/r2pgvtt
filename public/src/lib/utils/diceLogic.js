/**
 * Parses a dice formula string into a structured AST.
 * Supports:
 * - NdX (e.g. 2d6)
 * - ! or e (Exploding) (e.g. 2d6!)
 * - khN / klN (Keep Highest / Lowest) (e.g. 2d20kh1)
 * - >, <, =, >=, <= (Target / Success counting) (e.g. 5d10>7)
 * - +, -, *, / (Arithmetic) (e.g. 2d6+5)
 */
export function parseFormula(formula) {
  if (!formula || typeof formula !== 'string') {
    return null;
  }

  // Normalize string
  const cleanFormula = formula.toLowerCase().replace(/\s+/g, '');

  const result = {
    original: formula,
    baseFormula: '1d20', // O que vai pro 3D dice
    count: 1,
    sides: 20,
    explode: false,
    keep: null, // { type: 'highest' | 'lowest', count: Number }
    target: null, // { operator: string, value: Number }
    math: null, // { operator: string, value: Number }
  };

  // Matcher base: [count]d[sides]
  // Permite modificadores na sequência.
  const regex =
    /^(\d*)d(\d+)(!|e)?(?:(kh|kl|v|d)(\d*))?(?:(>=|<=|>|<|=)(\d+))?(?:([+\-*/])(\d+))?$/;

  const match = cleanFormula.match(regex);
  if (!match) {
    // Pode ser só um modificador puro ou algo inválido, mas tentamos um fallback
    const fallbackMatch = cleanFormula.match(/(\d*)d(\d+)/);
    if (fallbackMatch) {
      result.count = parseInt(fallbackMatch[1]) || 1;
      result.sides = parseInt(fallbackMatch[2]);
      result.baseFormula = `${result.count}d${result.sides}`;
    }
    return result;
  }

  // 1: count, 2: sides, 3: explode, 4: k-type, 5: k-val, 6: t-op, 7: t-val, 8: m-op, 9: m-val
  result.count = parseInt(match[1]) || 1;
  result.sides = parseInt(match[2]);
  result.baseFormula = `${result.count}d${result.sides}`;

  if (match[3]) {
    result.explode = true;
  }

  if (match[4]) {
    const type = match[4] === 'kh' || match[4] === 'v' ? 'highest' : 'lowest';
    const count = parseInt(match[5]) || 1;
    result.keep = { type, count };
  }

  if (match[6]) {
    result.target = {
      operator: match[6],
      value: parseInt(match[7]),
    };
  }

  if (match[8]) {
    result.math = {
      operator: match[8],
      value: parseInt(match[9]),
    };
  }

  return result;
}

/**
 * Avalia os rolagens base aplicando todas as regras.
 * Lógica de explosão é calculada em memória adicionando ao total os rolamentos virtuais extras.
 */
export function evaluateRolls(parsedData, rawRolls) {
  if (!parsedData || !rawRolls || !Array.isArray(rawRolls)) {
    return {
      total: 0,
      successes: null,
      details: [],
      textual: 'Erro no cálculo',
      rawSum: 0,
    };
  }

  const finalRolls = [...rawRolls];
  let details = [];

  // 1. Explode (Gera dados lógicos)
  const explodedIndices = [];
  if (parsedData.explode) {
    let toCheck = [...rawRolls];
    while (toCheck.length > 0) {
      const nextCheck = [];
      for (const val of toCheck) {
        if (val === parsedData.sides) {
          const newRoll = getSecureRandomInt(parsedData.sides);
          finalRolls.push(newRoll);
          nextCheck.push(newRoll);
          explodedIndices.push(finalRolls.length - 1);
        }
      }
      toCheck = nextCheck;
    }
  }

  let keptRolls = [...finalRolls];

  // 2. Keep Highest / Lowest
  if (parsedData.keep) {
    const sorted = [...finalRolls].map((v, i) => ({ v, i }));
    if (parsedData.keep.type === 'highest') {
      sorted.sort((a, b) => b.v - a.v);
    } else {
      sorted.sort((a, b) => a.v - b.v);
    }
    const keptIndices = sorted.slice(0, parsedData.keep.count).map((o) => o.i);
    keptRolls = finalRolls.filter((_, i) => keptIndices.includes(i));

    details = finalRolls.map((v, i) => ({
      value: v,
      isKept: keptIndices.includes(i),
      isExploded: explodedIndices.includes(i),
    }));
  } else {
    details = finalRolls.map((v, i) => ({
      value: v,
      isKept: true,
      isExploded: explodedIndices.includes(i),
    }));
  }

  // 3. Pool Successes
  let total = keptRolls.reduce((a, b) => a + b, 0);
  const rawSum = total;
  let successes = null;

  if (parsedData.target) {
    successes = 0;
    for (const roll of keptRolls) {
      let isSuccess = false;
      const tVal = parsedData.target.value;
      switch (parsedData.target.operator) {
        case '>':
          isSuccess = roll > tVal;
          break;
        case '<':
          isSuccess = roll < tVal;
          break;
        case '>=':
          isSuccess = roll >= tVal;
          break;
        case '<=':
          isSuccess = roll <= tVal;
          break;
        case '=':
          isSuccess = roll === tVal;
          break;
      }

      if (isSuccess) {
        successes++;
      } else if (roll === 1) {
        successes--;
      }
    }
  }

  // 4. Lógica Matemática
  if (parsedData.math) {
    switch (parsedData.math.operator) {
      case '+':
        total += parsedData.math.value;
        break;
      case '-':
        total -= parsedData.math.value;
        break;
      case '*':
        total *= parsedData.math.value;
        break;
      case '/':
        total = Math.floor(total / parsedData.math.value);
        break;
    }
  }

  // Format textual representation
  let rollStr = `[${details.map((d) => (d.isKept ? d.value : '~~' + d.value + '~~')).join(', ')}]`;

  if (parsedData.math) {
    rollStr += ` ${parsedData.math.operator} ${parsedData.math.value}`;
  }

  if (successes !== null) {
    const p = successes !== 1 ? 's' : '';
    rollStr += ` ➞ !!!${successes} Sucesso${p}!!!`;
  } else {
    rollStr += ` = !!!${total}!!!`;
  }

  return {
    rawSum,
    total,
    successes,
    details,
    textual: rollStr,
    parsedData,
  };
}

export function getSecureRandomInt(sides) {
  const array = new Uint32Array(1);
  const maxUint32 = 0xffffffff;
  const threshold = maxUint32 - (maxUint32 % sides);
  let val;
  do {
    window.crypto.getRandomValues(array);
    val = array[0];
  } while (val >= threshold);
  return (val % sides) + 1;
}
