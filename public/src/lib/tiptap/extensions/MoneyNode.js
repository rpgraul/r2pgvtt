import { Node, mergeAttributes } from '@tiptap/core';

export default Node.create({
  name: 'moneyNode',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      current: {
        default: 0,
        parseHTML: (element) => parseInt(element.dataset.current, 10) || 0,
        renderHTML: (attributes) => attributes.current,
      },
      currency: {
        default: 'po',
        parseHTML: (element) => element.dataset.currency || 'po',
        renderHTML: (attributes) => attributes.currency,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="money"]' }, { tag: '[money' }];
  },

  renderHTML({ HTMLAttributes }) {
    const current = HTMLAttributes.current || 0;
    const currency = HTMLAttributes.currency || 'po';

    const currencySymbols = {
      po: 'PO',
      pp: 'PP',
      pc: 'PC',
      pe: 'PE',
    };

    return [
      'span',
      {
        'data-type': 'money',
        'data-current': current,
        'data-currency': currency,
        class:
          'inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-900/50 text-amber-200 text-sm font-medium',
      },
      [
        ['span', { class: 'text-amber-400' }, '⬡'],
        ['span', { class: 'font-bold' }, current.toLocaleString('pt-BR')],
        ['span', { class: 'text-amber-300' }, currencySymbols[currency] || currency],
      ],
    ];
  },

  addCommands() {
    return {
      insertMoney:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              current: options.current || 0,
              currency: options.currency || 'po',
            },
          });
        },
    };
  },
});
