import { s as sanitize_props, e as spread_props, f as slot, i as escape_html, d as derived, g as ensure_array_like, b as attr_class, l as stringify } from "../../../chunks/index2.js";
import { gameState } from "../../../chunks/gameState.svelte.js";
import { B as Button } from "../../../chunks/Button.js";
import { B as Badge } from "../../../chunks/Badge.js";
import { S as ScrollArea } from "../../../chunks/ScrollArea.js";
import "@tiptap/starter-kit";
import "@tiptap/extension-placeholder";
import "@tiptap/extension-highlight";
import "@tiptap/extension-link";
import "@tiptap/extension-text-align";
import "@tiptap/extension-underline";
import "../../../chunks/RichTextEditor.svelte_svelte_type_style_lang.js";
import "clsx";
import { C as CardDialog } from "../../../chunks/CardDialog.js";
import { P as Plus } from "../../../chunks/DialogTitle.js";
import { I as Icon } from "../../../chunks/Icon.js";
function File_text($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
      }
    ],
    ["path", { "d": "M14 2v4a2 2 0 0 0 2 2h4" }],
    ["path", { "d": "M10 9H8" }],
    ["path", { "d": "M16 13H8" }],
    ["path", { "d": "M16 17H8" }]
  ];
  Icon($$renderer, spread_props([
    { name: "file-text" },
    $$sanitized_props,
    {
      /**
       * @component @name FileText
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTUgMkg2YTIgMiAwIDAgMC0yIDJ2MTZhMiAyIDAgMCAwIDIgMmgxMmEyIDIgMCAwIDAgMi0yVjdaIiAvPgogIDxwYXRoIGQ9Ik0xNCAydjRhMiAyIDAgMCAwIDIgMmg0IiAvPgogIDxwYXRoIGQ9Ik0xMCA5SDgiIC8+CiAgPHBhdGggZD0iTTE2IDEzSDgiIC8+CiAgPHBhdGggZD0iTTE2IDE3SDgiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/file-text
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let selectedItem = null;
    let showNewCardDialog = false;
    const items = derived(() => gameState.items);
    function getCategoryIcon(cat) {
      return "📝";
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<main class="container px-4 py-6 h-[calc(100vh-64px)]"><div class="flex items-center justify-between mb-6"><h1 class="text-2xl font-bold">Notas</h1> <div class="flex gap-2">`);
      Button($$renderer3, {
        onclick: () => showNewCardDialog = true,
        children: ($$renderer4) => {
          Plus($$renderer4, { class: "w-4 h-4 mr-2" });
          $$renderer4.push(`<!----> Nova Nota`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div></div> <div class="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100%-80px)]"><div class="md:col-span-1 h-full"><div class="rounded-lg border bg-card h-full flex flex-col"><div class="p-3 border-b flex items-center justify-between"><h2 class="font-semibold flex items-center gap-2">`);
      File_text($$renderer3, { class: "w-4 h-4" });
      $$renderer3.push(`<!----> Notas</h2> `);
      Badge($$renderer3, {
        variant: "outline",
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->${escape_html(items().length)}`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div> `);
      ScrollArea($$renderer3, {
        class: "flex-1",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="p-2 space-y-2">`);
          if (items().length === 0) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<p class="text-sm text-muted-foreground p-2">Nenhuma nota encontrada</p>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<!--[-->`);
            const each_array = ensure_array_like(items());
            for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
              let item = each_array[$$index_1];
              $$renderer4.push(`<button${attr_class(`w-full text-left p-3 rounded-lg border bg-card hover:bg-muted transition-colors ${stringify(selectedItem?.id === item.id ? "border-primary" : "")}`)}><div class="flex items-start gap-2"><span class="text-lg">${escape_html(getCategoryIcon(item.category))}</span> <div class="flex-1 min-w-0"><h3 class="font-medium truncate">${escape_html(item.titulo)}</h3> <p class="text-xs text-muted-foreground truncate">${escape_html(item.conteudo?.replace(/<[^>]*>/g, "").slice(0, 50) || "Sem conteúdo")}</p></div></div> `);
              if (item.tags && item.tags.length > 0) {
                $$renderer4.push("<!--[0-->");
                $$renderer4.push(`<div class="flex flex-wrap gap-1 mt-2"><!--[-->`);
                const each_array_1 = ensure_array_like(item.tags.slice(0, 3));
                for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
                  let tag = each_array_1[$$index];
                  $$renderer4.push(`<span class="text-xs bg-muted px-1.5 py-0.5 rounded">${escape_html(tag)}</span>`);
                }
                $$renderer4.push(`<!--]--></div>`);
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--></button>`);
            }
            $$renderer4.push(`<!--]-->`);
          }
          $$renderer4.push(`<!--]--></div>`);
        }
      });
      $$renderer3.push(`<!----></div></div> <div class="md:col-span-3 h-full">`);
      {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="rounded-lg border border-dashed p-12 text-center h-full flex items-center justify-center"><div>`);
        File_text($$renderer3, { class: "w-16 h-16 mx-auto text-muted-foreground mb-4" });
        $$renderer3.push(`<!----> <p class="text-muted-foreground">Selecione uma nota para editar</p></div></div>`);
      }
      $$renderer3.push(`<!--]--></div></div></main> `);
      CardDialog($$renderer3, {
        get open() {
          return showNewCardDialog;
        },
        set open($$value) {
          showNewCardDialog = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
export {
  _page as default
};
