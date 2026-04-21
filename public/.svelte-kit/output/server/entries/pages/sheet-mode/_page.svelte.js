import { g as ensure_array_like, b as attr_class, l as stringify, a as attr, i as escape_html, d as derived } from "../../../chunks/index2.js";
import { g as gameState } from "../../../chunks/gameState.svelte.js";
import "../../../chunks/client.js";
import { B as Badge } from "../../../chunks/Badge.js";
import "clsx";
import "@tiptap/starter-kit";
import "@tiptap/extension-placeholder";
import "@tiptap/extension-highlight";
import "@tiptap/extension-link";
import "@tiptap/extension-text-align";
import "@tiptap/extension-underline";
import "../../../chunks/RichTextEditor.svelte_svelte_type_style_lang.js";
import { S as ScrollArea } from "../../../chunks/ScrollArea.js";
import { U as User } from "../../../chunks/user.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let selectedCard = null;
    const items = derived(() => gameState.items.filter((i) => i.category === "pj"));
    const characters = derived(items);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<main class="container px-4 py-6"><div class="flex items-center justify-between mb-6"><h1 class="text-2xl font-bold">Modo Ficha</h1> `);
      Badge($$renderer3, {
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->Em desenvolvimento`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div> <div class="grid grid-cols-1 md:grid-cols-4 gap-6"><div class="md:col-span-1"><div class="rounded-lg border bg-card"><div class="p-3 border-b"><h2 class="font-semibold flex items-center gap-2">`);
      User($$renderer3, { class: "w-4 h-4" });
      $$renderer3.push(`<!----> Personagens</h2></div> `);
      ScrollArea($$renderer3, {
        class: "h-[calc(100vh-300px)]",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="p-2 space-y-2">`);
          if (characters().length === 0) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<p class="text-sm text-muted-foreground p-2">Nenhum personagem encontrado</p>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<!--[-->`);
            const each_array = ensure_array_like(characters());
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let item = each_array[$$index];
              $$renderer4.push(`<button${attr_class(`w-full text-left p-3 rounded-lg border bg-card hover:bg-muted transition-colors ${stringify(selectedCard?.id === item.id ? "border-primary" : "")}`)}>`);
              if (item.imagemUrl) {
                $$renderer4.push("<!--[0-->");
                $$renderer4.push(`<img${attr("src", item.imagemUrl)}${attr("alt", item.titulo)} class="w-full h-24 object-cover rounded-lg mb-2"/>`);
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--> <h3 class="font-medium truncate">${escape_html(item.titulo)}</h3> <p class="text-xs text-muted-foreground truncate">${escape_html(item.category === "pj" ? "Personagem" : item.category)}</p></button>`);
            }
            $$renderer4.push(`<!--]-->`);
          }
          $$renderer4.push(`<!--]--></div>`);
        }
      });
      $$renderer3.push(`<!----></div></div> <div class="md:col-span-3">`);
      {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="rounded-lg border border-dashed p-12 text-center">`);
        User($$renderer3, { class: "w-16 h-16 mx-auto text-muted-foreground mb-4" });
        $$renderer3.push(`<!----> <p class="text-muted-foreground">Selecione um personagem para ver a ficha</p></div>`);
      }
      $$renderer3.push(`<!--]--></div></div></main>`);
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
