import { Node, mergeAttributes } from '@tiptap/core';

export default Node.create({
  name: 'statNode',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      name: {
        default: 'FOR',
        parseHTML: (element) => element.dataset.name || 'FOR',
        renderHTML: (attributes) => attributes.name,
      },
      value: {
        default: 10,
        parseHTML: (element) => parseInt(element.dataset.value, 10) || 10,
        renderHTML: (attributes) => attributes.value,
      },
      mod: {
        default: 0,
        parseHTML: (element) => parseInt(element.dataset.mod, 10) || 0,
        renderHTML: (attributes) => attributes.mod,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="stat"]' }, { tag: '[stat' }];
  },

  renderHTML({ HTMLAttributes }) {
    const name = HTMLAttributes.name || 'FOR';
    const value = HTMLAttributes.value || 10;
    const mod = HTMLAttributes.mod || 0;
    const modSign = mod >= 0 ? '+' : '';

    return [
      'span',
      {
        'data-type': 'stat',
        'data-name': name,
        'data-value': value,
        'data-mod': mod,
        class: 'inline-flex items-center gap-2 px-2 py-1 rounded bg-zinc-800 text-white text-sm',
      },
      [
        ['strong', { class: 'text-zinc-400' }, `${name}:`],
        ['span', { class: 'font-bold text-lg' }, value],
        mod !== 0 ? ['span', { class: 'text-zinc-400' }, `(${modSign}${mod})`] : '',
      ].filter(Boolean),
    ];
  },

  addCommands() {
    return {
      insertStat:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              name: options.name || 'FOR',
              value: options.value || 10,
              mod: options.mod || 0,
            },
          });
        },
    };
  },
});
