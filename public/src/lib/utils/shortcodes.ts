export function parseArguments(str: string): string[] {
  if (!str) return [];
  const regex = /"([^"]+)"|'([^']+)'|\S+/g;
  const args: string[] = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    args.push(match[1] !== undefined ? match[1] : match[2] !== undefined ? match[2] : match[0]);
  }
  return args;
}

export function parseKeyValueArgs(input: string | string[]): Record<string, string> {
  const params: Record<string, string> = {};
  if (!input) return params;

  let args: string[] = [];
  if (typeof input === 'string') {
    const regex = /(\w+)=(?:(["'])(.*?)\2|(\S+))/g;
    let match;
    while ((match = regex.exec(input)) !== null) {
      params[match[1].toLowerCase()] = (match[3] || match[4]).replace(/^['"]|['"]$/g, '');
    }
    return params;
  } else if (Array.isArray(input)) {
    args = input;
  }

  args.forEach((arg) => {
    if (typeof arg !== 'string') return;
    const parts = arg.split('=');
    if (parts.length === 2) {
      params[parts[0].toLowerCase()] = parts[1].replace(/^['"]|['"]$/g, '');
    }
  });

  return params;
}

export const shortcodeRegexes = {
  money: /\[money\s+([^\]]+)\]/gi,
  hp: /\[hp\s+([^\]]+)\]/gi,
  stat: /\[stat\s+([^\]]+)\]/gi,
  count: /\[(\*|count)\s+([^\]]+)\]/gi,
  xp: /\[xp\s+([^\]]+)\]/gi,
};

export function formatNumber(num: number | string): string {
  if (typeof num !== 'number' && typeof num !== 'string') return String(num);
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(num));
}

export const genericShortcodeRegex = /\[(.*?)\]/g;

export function calculateMathExpression(current: number, input: string): number {
  if (typeof input !== 'string') return current;
  const cleaned = input.trim().replace(/\s+/g, '').replace(/,/g, '.');
  if (!cleaned) return current;

  const relativeMatch = cleaned.match(/^([+\-*/])(-?\d+(?:\.\d+)?)$/);
  if (relativeMatch) {
    const op = relativeMatch[1];
    const val = parseFloat(relativeMatch[2]);
    if (isNaN(val)) return current;
    if (op === '+') return current + val;
    if (op === '-') return current - val;
    if (op === '*') return current * val;
    if (op === '/' && val !== 0) return current / val;
    return current;
  }

  const expressionMatch = cleaned.match(/^(-?\d+(?:\.\d+)?)([+\-*/])(-?\d+(?:\.\d+)?)$/);
  if (expressionMatch) {
    const v1 = parseFloat(expressionMatch[1]);
    const op = expressionMatch[2];
    const v2 = parseFloat(expressionMatch[3]);
    if (isNaN(v1) || isNaN(v2)) return current;
    if (op === '+') return v1 + v2;
    if (op === '-') return v1 - v2;
    if (op === '*') return v1 * v2;
    if (op === '/' && v2 !== 0) return v1 / v2;
  }

  const pureNum = parseFloat(cleaned);
  return !isNaN(pureNum) ? pureNum : current;
}

export interface ShortcodeData {
  command: string;
  full: string;
  args: string[];
  params: Record<string, string>;
  isHidden: boolean;
  index: number;
}

export function extractShortcodes(content: string): ShortcodeData[] {
  if (!content) return [];
  const results: ShortcodeData[] = [];
  let match;

  const regex = new RegExp(genericShortcodeRegex.source, 'g');
  while ((match = regex.exec(content)) !== null) {
    const full = match[0];
    const inner = match[1];
    const args = parseArguments(inner);
    const commandRaw = args[0] || '';
    const command = commandRaw.replace(/^[#*]+/, '').toLowerCase();

    if (!['stat', 'hp', 'count', 'money', 'xp'].includes(command)) continue;

    const isHidden = commandRaw.startsWith('#') || args.includes('#');
    const params = parseKeyValueArgs(args.slice(1));

    results.push({
      command,
      full,
      args: args.slice(1),
      params,
      isHidden,
      index: match.index,
    });
  }
  return results;
}

export interface ParsedShortcodes {
  all: any[];
  left: string;
  right: string;
  bottom: string;
  details: string;
}

// ─── Helper: compute D&D-style ability modifier ──────────────────────────────
function calcMod(value: number): number {
  return Math.floor((value - 10) / 2);
}

function modSign(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

// ─── Helper: checkbox-theme rendering for [count] ────────────────────────────
function renderCheckboxes(current: number, max: number): string {
  let html = '<span class="count-checkboxes">';
  for (let i = 0; i < max; i++) {
    html += `<span class="count-box ${i < current ? 'is-filled' : 'is-empty'}">`;
    html += i < current ? '●' : '○';
    html += '</span>';
  }
  html += '</span>';
  return html;
}

// ─────────────────────────────────────────────────────────────────────────────
export function parseAllShortcodes(
  item: { id: string; conteudo?: string },
  options: { isPlayerSheet?: boolean; defaultCurrency?: string } = {},
): ParsedShortcodes {
  if (!item || !item.conteudo) return { all: [], left: '', right: '', bottom: '', details: '' };

  const result = {
    all: [],
    left: [] as string[],
    right: [] as string[],
    bottom: [] as string[],
    details: [] as string[],
  };
  const commandOrder: Record<string, number> = {
    stat: 1,
    money: 2,
    hp: 3,
    count: 4,
    xp: 5,
    default: 99,
  };
  const content = item.conteudo;

  const foundShortcodes: { full: string; inner: string; index: number }[] = [];
  let match;
  const contentRegex = new RegExp(genericShortcodeRegex.source, 'g');
  while ((match = contentRegex.exec(content)) !== null) {
    foundShortcodes.push({ full: match[0], inner: match[1], index: match.index });
  }

  const hiddenRanges: { start: number; end: number }[] = [];
  const hideRegex = /\[(hide|#)\]([\s\S]*?)\[\/(hide|#)\]/gi;
  let hideMatch;
  while ((hideMatch = hideRegex.exec(content)) !== null) {
    const full = hideMatch[0];
    const startTag = hideMatch[1];
    const endTag = hideMatch[3];
    const innerContent = hideMatch[2];
    if (startTag.toLowerCase() === endTag.toLowerCase()) {
      const startIndex = hideMatch.index + full.indexOf(innerContent);
      hiddenRanges.push({ start: startIndex, end: startIndex + innerContent.length });
    }
  }

  const parsedShortcodes = foundShortcodes
    .map((sc) => {
      const args = parseArguments(sc.inner);
      const commandRaw = args[0] || '';
      const isOverlay = commandRaw.startsWith('*');
      const command = commandRaw.replace(/^[#*]+/, '').toLowerCase();

      if (!['stat', 'hp', 'count', 'money', 'xp'].includes(command)) return null;

      const isHashHidden = commandRaw.startsWith('#');
      const isArgHidden = args.includes('#');
      const isInsideHideBlock = hiddenRanges.some(
        (range) => sc.index >= range.start && sc.index < range.end,
      );

      let finalArgs = args.slice(1);
      if (isArgHidden) {
        finalArgs = finalArgs.filter((arg) => arg !== '#');
      }

      return {
        command,
        args: finalArgs,
        originalShortcode: sc.full,
        isHidden: isHashHidden || isArgHidden || isInsideHideBlock,
        isOverlay,
        order: commandOrder[command] || commandOrder.default,
      };
    })
    .filter(Boolean) as any[];

  parsedShortcodes.sort((a: any, b: any) => a.order - b.order);

  const wrapIfHidden = (html: string, isHidden: boolean) =>
    isHidden ? `<div class="is-hidden-from-players">${html}</div>` : html;

  const processShortcode = (sc: any, html: string, position: string | null) => {
    const wrapped = wrapIfHidden(html, sc.isHidden);
    if (position) {
      result[position].push(wrapped);
    } else {
      result.details.push(wrapped);
    }
    result.all.push({ type: sc.command, html });
  };

  parsedShortcodes.forEach((sc: any) => {
    let position: string | null = null;
    if (sc.args.includes('left')) position = 'left';
    else if (sc.args.includes('right')) position = 'right';
    else if (sc.args.includes('bottom')) position = 'bottom';

    const finalArgs = options.isPlayerSheet ? [...sc.args, 'isPlayerSheet'] : sc.args;
    const encSC = encodeURIComponent(sc.originalShortcode);

    switch (sc.command) {
      // ── [stat "Nome" "Valor"] ──────────────────────────────────────────
      case 'stat': {
        const params = parseKeyValueArgs(finalArgs);

        // Tenta extrair label e value dos args posicionais OU kv-args
        let statLabel = params.label || params.name || '';
        let statValueStr = params.value || '';

        if (!statLabel || !statValueStr) {
          // Arg posicional: [stat "Força" "18"] ou [stat "Força" "+3"]
          const positional = finalArgs.filter(
            (a: string) => !a.includes('=') && !['left', 'right', 'bottom', 'isPlayerSheet', '#'].includes(a.toLowerCase()),
          );
          if (!statLabel && positional.length >= 1) statLabel = positional[0];
          if (!statValueStr && positional.length >= 2) statValueStr = positional[1];
          else if (!statValueStr && positional.length === 1 && /^[+-]?\d+$/.test(positional[0])) {
            statValueStr = positional[0];
            statLabel = '';
          }
        }

        const statNumeric = parseFloat(statValueStr);
        let modStr = '';
        let modTitle = '';

        if (!isNaN(statNumeric)) {
          // Se o valor é um score D&D (ex: 18), calcula o modificador
          if (statNumeric >= 1 && statNumeric <= 30 && !statValueStr.startsWith('+') && !statValueStr.startsWith('-')) {
            const mod = calcMod(statNumeric);
            modStr = modSign(mod);
            modTitle = `Modificador: ${modSign(mod)}`;
          } else {
            // É um modificador direto (ex: +5)
            modStr = statValueStr.startsWith('+') || statValueStr.startsWith('-') ? statValueStr : '';
          }
        }

        const htmlStat = `<div class="shortcode-stat is-interactive" data-shortcode="${encSC}" title="${modTitle}">
          ${statLabel ? `<strong class="stat-label">${statLabel}</strong>` : ''}
          <span class="stat-value-display">${statValueStr || '—'}</span>
          ${modStr ? `<span class="stat-mod">(${modStr})</span>` : ''}
        </div>`;
        processShortcode(sc, htmlStat, position || 'left');
        break;
      }

      // ── [hp max=X current=Y] ──────────────────────────────────────────
      case 'hp': {
        const params = parseKeyValueArgs(finalArgs);
        const maxHp = parseInt(params.max, 10) || 100;
        const currentHp = params.current !== undefined ? parseInt(params.current, 10) : maxHp;
        const finalCurrentHp = Math.max(-10, Math.min(currentHp, maxHp));
        const percent = finalCurrentHp > 0 ? Math.round((finalCurrentHp / maxHp) * 100) : 0;

        let colorClass = 'is-high';
        if (finalCurrentHp <= 0) colorClass = 'is-dead';
        else if (percent < 15) colorClass = 'is-critical';
        else if (percent < 30) colorClass = 'is-low';
        else if (percent < 60) colorClass = 'is-medium';

        const unconscious = finalCurrentHp <= 0 ? 'is-unconscious' : '';

        const htmlHp = `<div class="shortcode-hp is-interactive ${unconscious}" data-shortcode="${encSC}" data-item-id="${item.id}" data-max-hp="${maxHp}">
          <div class="hp-header">
            <strong class="hp-label">❤️ PV</strong>
            <span class="hp-text">${finalCurrentHp} / ${maxHp}</span>
          </div>
          <div class="hp-bar-container">
            <div class="hp-bar-fill ${colorClass}" style="width: ${percent}%"></div>
          </div>
        </div>`;
        processShortcode(sc, htmlHp, position || 'bottom');
        break;
      }

      // ── [money current=X currency=PO] ─────────────────────────────────
      case 'money': {
        const moneyParams = parseKeyValueArgs(finalArgs);
        const currentRaw = (moneyParams.current || '').replace(/[^\d.-]/g, '');
        const currentValue = parseFloat(currentRaw) || 0;
        const currency =
          moneyParams.currency ||
          finalArgs.find((arg: string) => !arg.includes('=') && !['left', 'right', 'bottom', '#'].includes(arg.toLowerCase())) ||
          options.defaultCurrency ||
          'PO';

        const htmlMoney = `<div class="shortcode-money is-interactive" data-shortcode="${encSC}" data-item-id="${item.id}">
          <span class="money-icon">💰</span>
          <span class="money-value-display">${formatNumber(currentValue)}</span>
          <span class="money-currency">${currency}</span>
        </div>`;
        processShortcode(sc, htmlMoney, position || 'left');
        break;
      }

      // ── [count "Nome" max=X current=Y theme=number|checkbox] ──────────
      case 'count': {
        const countParams = parseKeyValueArgs(finalArgs);
        const name =
          countParams.label ||
          finalArgs.find((arg: string) => !arg.includes('=') && !['left', 'right', 'bottom', '#', 'checkbox', 'number'].includes(arg.toLowerCase())) ||
          '';
        const max = parseInt(countParams.max, 10) || 10;
        const current = Math.max(0, Math.min(parseInt(countParams.current, 10) || 0, max));
        const theme = countParams.theme || (finalArgs.includes('checkbox') ? 'checkbox' : 'number');
        const icon = countParams.icon || '';

        const isResource = sc.originalShortcode.startsWith('[*');

        const iconHtml = icon ? `<span class="count-icon">${icon}</span> ` : '';
        const valueHtml =
          theme === 'checkbox'
            ? renderCheckboxes(current, max)
            : `<span class="count-current-value">${current}</span><span class="count-sep">/</span><span class="count-max-value">${max}</span>`;

        const htmlCount = `<div class="shortcode-count is-interactive ${theme === 'checkbox' ? 'is-checkbox-theme' : ''}" data-shortcode="${encSC}" data-item-id="${item.id}">
          ${name ? `<strong class="count-name">${iconHtml}${name}</strong>` : ''}
          <div class="count-representation">${valueHtml}</div>
        </div>`;

        if (isResource) {
          processShortcode(sc, htmlCount, position || 'right');
        } else if (position) {
          result[position].push(wrapIfHidden(htmlCount, sc.isHidden));
          result.all.push({ type: sc.command, html: htmlCount });
        } else {
          result.details.push(wrapIfHidden(htmlCount, sc.isHidden));
          result.all.push({ type: sc.command, html: htmlCount });
        }
        break;
      }

      // ── [xp current=X] ────────────────────────────────────────────────
      case 'xp': {
        const xpParams = parseKeyValueArgs(finalArgs);
        const xpLabel =
          xpParams.label ||
          finalArgs.find((arg: string) => !arg.includes('=') && !['left', 'right', 'bottom', '#'].includes(arg.toLowerCase())) ||
          'XP';
        const xpValue = parseInt((xpParams.current || '0').replace(/[^\d.-]/g, ''), 10) || 0;

        const htmlXp = `<div class="shortcode-xp is-interactive" data-shortcode="${encSC}" data-item-id="${item.id}">
          <span class="xp-icon">⭐</span>
          <span class="xp-value-display">${formatNumber(xpValue)}</span>
          <span class="xp-label">${xpLabel}</span>
        </div>`;
        processShortcode(sc, htmlXp, position || 'left');
        break;
      }
    }
  });

  return {
    all: result.all,
    left: result.left.join(''),
    right: result.right.join(''),
    bottom: result.bottom.join(''),
    details: result.details.join(''),
  };
}

// ─── parseMainContent ─────────────────────────────────────────────────────────
export function parseMainContent(content: string): string {
  if (!content) return '';
  let t = content;

  // [nota titulo="X"] ... [/nota]
  t = t.replace(/<p>\s*(\[nota\s+[^\]]+\])\s*<\/p>/gi, '$1');
  t = t.replace(/<p>\s*(\[\/nota\])\s*<\/p>/gi, '$1');
  t = t.replace(
    /\[nota\s+titulo="([^"]+)"\s*(#)?\]([\s\S]*?)\[\/nota\]/gi,
    (_, title, hash, inner) =>
      `<div class="shortcode-nota ${hash ? 'is-hidden-from-players' : ''}">
        <div class="nota-header"><span class="nota-title">📋 ${title}</span></div>
        <div class="nota-content">${inner.trim()}</div>
      </div>`,
  );

  // [hide] ... [/hide]  or  [#] ... [/#]
  t = t.replace(/\[(hide|#)\]([\s\S]*?)\[\/(hide|#)\]/gi, (full, open, inner, close) =>
    open.toLowerCase() !== close.toLowerCase()
      ? full
      : `<div class="is-hidden-from-players">${inner}</div>`,
  );

  // Remove inline shortcodes from prose view (they live in the sidebar)
  t = t.replace(/\[(\*?)(stat|hp|count|money|xp)\s.*?\]/gi, '');

  // Clean empty paragraphs
  t = t.replace(/<p>\s*<\/p>/gi, '');
  return t.trim();
}
