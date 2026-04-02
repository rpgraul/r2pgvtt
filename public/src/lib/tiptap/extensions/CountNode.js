import { Node, mergeAttributes } from '@tiptap/core';

export default Node.create({
  name: 'countNode',
  group: 'inline',
  inline: true,
  atom: true,
  
  addAttributes() {
    return {
      name: {
        default: 'Items',
        parseHTML: element => element.dataset.name || 'Items',
        renderHTML: attributes => attributes.name
      },
      current: {
        default: 0,
        parseHTML: element => parseInt(element.dataset.current, 10) || 0,
        renderHTML: attributes => attributes.current
      },
      max: {
        default: 10,
        parseHTML: element => parseInt(element.dataset.max, 10) || 10,
        renderHTML: attributes => attributes.max
      }
    };
  },
  
  parseHTML() {
    return [
      { tag: 'span[data-type="count"]' },
      { tag: '[count' }
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    const name = HTMLAttributes.name || 'Items';
    const current = HTMLAttributes.current || 0;
    const max = HTMLAttributes.max || 10;
    
    return ['span', {
      'data-type': 'count',
      'data-name': name,
      'data-current': current,
      'data-max': max,
      class: 'inline-flex items-center gap-2 px-2 py-1 rounded bg-blue-900/50 text-blue-200 text-sm'
    }, [
      ['strong', { class: 'text-blue-400' }, `${name}:`],
      ['span', { class: 'font-bold' }, `${current}`],
      ['span', { class: 'text-blue-300' }, `/ ${max}`]
    ]];
  },
  
  addCommands() {
    return {
      insertCount: (options = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            name: options.name || 'Items',
            current: options.current || 0,
            max: options.max || 10
          }
        });
      }
    };
  }
});
