import { Node, mergeAttributes } from '@tiptap/core';

export default Node.create({
  name: 'xpNode',
  group: 'inline',
  inline: true,
  atom: true,
  
  addAttributes() {
    return {
      current: {
        default: 0,
        parseHTML: element => parseInt(element.dataset.current, 10) || 0,
        renderHTML: attributes => attributes.current
      },
      total: {
        default: 1000,
        parseHTML: element => parseInt(element.dataset.total, 10) || 1000,
        renderHTML: attributes => attributes.total
      }
    };
  },
  
  parseHTML() {
    return [
      { tag: 'span[data-type="xp"]' },
      { tag: '[xp' }
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    const current = HTMLAttributes.current || 0;
    const total = HTMLAttributes.total || 1000;
    const percent = Math.min(100, (current / total) * 100);
    
    return ['span', {
      'data-type': 'xp',
      'data-current': current,
      'data-total': total,
      class: 'inline-flex items-center gap-2 px-2 py-1 rounded bg-purple-900/50 text-purple-200 text-sm'
    }, [
      ['span', { class: 'text-purple-400' }, '★'],
      ['span', { class: 'font-bold' }, current.toLocaleString('pt-BR')],
      ['span', { class: 'text-purple-300' }, `/ ${total.toLocaleString('pt-BR')} XP`],
      ['span', { class: 'text-xs text-purple-400' }, `(${Math.round(percent)}%)`]
    ]];
  },
  
  addCommands() {
    return {
      insertXp: (options = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            current: options.current || 0,
            total: options.total || 1000
          }
        });
      }
    };
  }
});
