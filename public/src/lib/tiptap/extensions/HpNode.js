import { Node, mergeAttributes } from '@tiptap/core';

export default Node.create({
  name: 'hpNode',
  group: 'inline',
  inline: true,
  atom: true,
  
  addAttributes() {
    return {
      current: {
        default: 100,
        parseHTML: element => parseInt(element.dataset.current, 10) || 100,
        renderHTML: attributes => attributes.current
      },
      max: {
        default: 100,
        parseHTML: element => parseInt(element.dataset.max, 10) || 100,
        renderHTML: attributes => attributes.max
      }
    };
  },
  
  parseHTML() {
    return [
      { tag: 'span[data-type="hp"]' },
      { tag: '[hp' }
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    const current = HTMLAttributes.current || 100;
    const max = HTMLAttributes.max || 100;
    const percent = Math.max(0, Math.min(100, (current / max) * 100));
    
    let colorClass = 'bg-green-500';
    if (percent <= 0) colorClass = 'bg-gray-600';
    else if (percent < 15) colorClass = 'bg-red-600';
    else if (percent < 30) colorClass = 'bg-orange-500';
    else if (percent < 60) colorClass = 'bg-yellow-500';
    
    return ['span', {
      'data-type': 'hp',
      'data-current': current,
      'data-max': max,
      class: 'inline-flex items-center gap-2 px-2 py-1 rounded bg-zinc-800 text-white text-sm font-medium cursor-pointer hover:bg-zinc-700 transition-colors'
    }, [
      ['span', { class: 'text-zinc-400' }, 'PV'],
      ['span', { class: 'font-bold' }, `${current}/${max}`],
      ['div', { class: 'w-16 h-2 bg-zinc-600 rounded overflow-hidden' }, [
        ['div', { 
          class: `h-full ${colorClass} transition-all`,
          style: `width: ${percent}%`
        }, '']
      ]]
    ]];
  },
  
  addCommands() {
    return {
      insertHp: (options = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            current: options.current || 100,
            max: options.max || 100
          }
        });
      }
    };
  }
});
