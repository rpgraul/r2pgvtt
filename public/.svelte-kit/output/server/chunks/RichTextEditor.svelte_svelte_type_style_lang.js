import { Node } from "@tiptap/core";
Node.create({
  name: "hpNode",
  group: "inline",
  inline: true,
  atom: true,
  addAttributes() {
    return {
      current: {
        default: 100,
        parseHTML: (element) => parseInt(element.dataset.current, 10) || 100,
        renderHTML: (attributes) => attributes.current
      },
      max: {
        default: 100,
        parseHTML: (element) => parseInt(element.dataset.max, 10) || 100,
        renderHTML: (attributes) => attributes.max
      }
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-type="hp"]' }, { tag: "[hp" }];
  },
  renderHTML({ HTMLAttributes }) {
    const current = HTMLAttributes.current || 100;
    const max = HTMLAttributes.max || 100;
    const percent = Math.max(0, Math.min(100, current / max * 100));
    let colorClass = "bg-green-500";
    if (percent <= 0) colorClass = "bg-gray-600";
    else if (percent < 15) colorClass = "bg-red-600";
    else if (percent < 30) colorClass = "bg-orange-500";
    else if (percent < 60) colorClass = "bg-yellow-500";
    return [
      "span",
      {
        "data-type": "hp",
        "data-current": current,
        "data-max": max,
        class: "inline-flex items-center gap-2 px-2 py-1 rounded bg-zinc-800 text-white text-sm font-medium cursor-pointer hover:bg-zinc-700 transition-colors"
      },
      [
        ["span", { class: "text-zinc-400" }, "PV"],
        ["span", { class: "font-bold" }, `${current}/${max}`],
        [
          "div",
          { class: "w-16 h-2 bg-zinc-600 rounded overflow-hidden" },
          [
            [
              "div",
              {
                class: `h-full ${colorClass} transition-all`,
                style: `width: ${percent}%`
              },
              ""
            ]
          ]
        ]
      ]
    ];
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
Node.create({
  name: "moneyNode",
  group: "inline",
  inline: true,
  atom: true,
  addAttributes() {
    return {
      current: {
        default: 0,
        parseHTML: (element) => parseInt(element.dataset.current, 10) || 0,
        renderHTML: (attributes) => attributes.current
      },
      currency: {
        default: "po",
        parseHTML: (element) => element.dataset.currency || "po",
        renderHTML: (attributes) => attributes.currency
      }
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-type="money"]' }, { tag: "[money" }];
  },
  renderHTML({ HTMLAttributes }) {
    const current = HTMLAttributes.current || 0;
    const currency = HTMLAttributes.currency || "po";
    const currencySymbols = {
      po: "PO",
      pp: "PP",
      pc: "PC",
      pe: "PE"
    };
    return [
      "span",
      {
        "data-type": "money",
        "data-current": current,
        "data-currency": currency,
        class: "inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-900/50 text-amber-200 text-sm font-medium"
      },
      [
        ["span", { class: "text-amber-400" }, "⬡"],
        ["span", { class: "font-bold" }, current.toLocaleString("pt-BR")],
        ["span", { class: "text-amber-300" }, currencySymbols[currency] || currency]
      ]
    ];
  },
  addCommands() {
    return {
      insertMoney: (options = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            current: options.current || 0,
            currency: options.currency || "po"
          }
        });
      }
    };
  }
});
Node.create({
  name: "statNode",
  group: "inline",
  inline: true,
  atom: true,
  addAttributes() {
    return {
      name: {
        default: "FOR",
        parseHTML: (element) => element.dataset.name || "FOR",
        renderHTML: (attributes) => attributes.name
      },
      value: {
        default: 10,
        parseHTML: (element) => parseInt(element.dataset.value, 10) || 10,
        renderHTML: (attributes) => attributes.value
      },
      mod: {
        default: 0,
        parseHTML: (element) => parseInt(element.dataset.mod, 10) || 0,
        renderHTML: (attributes) => attributes.mod
      }
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-type="stat"]' }, { tag: "[stat" }];
  },
  renderHTML({ HTMLAttributes }) {
    const name = HTMLAttributes.name || "FOR";
    const value = HTMLAttributes.value || 10;
    const mod = HTMLAttributes.mod || 0;
    const modSign = mod >= 0 ? "+" : "";
    return [
      "span",
      {
        "data-type": "stat",
        "data-name": name,
        "data-value": value,
        "data-mod": mod,
        class: "inline-flex items-center gap-2 px-2 py-1 rounded bg-zinc-800 text-white text-sm"
      },
      [
        ["strong", { class: "text-zinc-400" }, `${name}:`],
        ["span", { class: "font-bold text-lg" }, value],
        mod !== 0 ? ["span", { class: "text-zinc-400" }, `(${modSign}${mod})`] : ""
      ].filter(Boolean)
    ];
  },
  addCommands() {
    return {
      insertStat: (options = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            name: options.name || "FOR",
            value: options.value || 10,
            mod: options.mod || 0
          }
        });
      }
    };
  }
});
Node.create({
  name: "countNode",
  group: "inline",
  inline: true,
  atom: true,
  addAttributes() {
    return {
      name: {
        default: "Items",
        parseHTML: (element) => element.dataset.name || "Items",
        renderHTML: (attributes) => attributes.name
      },
      current: {
        default: 0,
        parseHTML: (element) => parseInt(element.dataset.current, 10) || 0,
        renderHTML: (attributes) => attributes.current
      },
      max: {
        default: 10,
        parseHTML: (element) => parseInt(element.dataset.max, 10) || 10,
        renderHTML: (attributes) => attributes.max
      }
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-type="count"]' }, { tag: "[count" }];
  },
  renderHTML({ HTMLAttributes }) {
    const name = HTMLAttributes.name || "Items";
    const current = HTMLAttributes.current || 0;
    const max = HTMLAttributes.max || 10;
    return [
      "span",
      {
        "data-type": "count",
        "data-name": name,
        "data-current": current,
        "data-max": max,
        class: "inline-flex items-center gap-2 px-2 py-1 rounded bg-blue-900/50 text-blue-200 text-sm"
      },
      [
        ["strong", { class: "text-blue-400" }, `${name}:`],
        ["span", { class: "font-bold" }, `${current}`],
        ["span", { class: "text-blue-300" }, `/ ${max}`]
      ]
    ];
  },
  addCommands() {
    return {
      insertCount: (options = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            name: options.name || "Items",
            current: options.current || 0,
            max: options.max || 10
          }
        });
      }
    };
  }
});
Node.create({
  name: "xpNode",
  group: "inline",
  inline: true,
  atom: true,
  addAttributes() {
    return {
      current: {
        default: 0,
        parseHTML: (element) => parseInt(element.dataset.current, 10) || 0,
        renderHTML: (attributes) => attributes.current
      },
      total: {
        default: 1e3,
        parseHTML: (element) => parseInt(element.dataset.total, 10) || 1e3,
        renderHTML: (attributes) => attributes.total
      }
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-type="xp"]' }, { tag: "[xp" }];
  },
  renderHTML({ HTMLAttributes }) {
    const current = HTMLAttributes.current || 0;
    const total = HTMLAttributes.total || 1e3;
    const percent = Math.min(100, current / total * 100);
    return [
      "span",
      {
        "data-type": "xp",
        "data-current": current,
        "data-total": total,
        class: "inline-flex items-center gap-2 px-2 py-1 rounded bg-purple-900/50 text-purple-200 text-sm"
      },
      [
        ["span", { class: "text-purple-400" }, "★"],
        ["span", { class: "font-bold" }, current.toLocaleString("pt-BR")],
        ["span", { class: "text-purple-300" }, `/ ${total.toLocaleString("pt-BR")} XP`],
        ["span", { class: "text-xs text-purple-400" }, `(${Math.round(percent)}%)`]
      ]
    ];
  },
  addCommands() {
    return {
      insertXp: (options = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            current: options.current || 0,
            total: options.total || 1e3
          }
        });
      }
    };
  }
});
