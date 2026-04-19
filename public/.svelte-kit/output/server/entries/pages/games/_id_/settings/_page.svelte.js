import { s as sanitize_props, e as spread_props, f as slot, h as head, i as escape_html, a as attr, l as stringify, d as derived, m as store_get, u as unsubscribe_stores } from "../../../../../chunks/index2.js";
import { p as page } from "../../../../../chunks/stores.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/root.js";
import "../../../../../chunks/state.svelte.js";
import "../../../../../chunks/client.js";
import "clsx";
import { I as Icon } from "../../../../../chunks/Icon.js";
function Arrow_left($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["path", { "d": "m12 19-7-7 7-7" }],
    ["path", { "d": "M19 12H5" }]
  ];
  Icon($$renderer, spread_props([
    { name: "arrow-left" },
    $$sanitized_props,
    {
      /**
       * @component @name ArrowLeft
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTIgMTktNy03IDctNyIgLz4KICA8cGF0aCBkPSJNMTkgMTJINSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/arrow-left
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
    var $$store_subs;
    const gameId = derived(() => store_get($$store_subs ??= {}, "$page", page).params.id);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head("n1urlm", $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>Configurações - ${escape_html("Mesa")} - R2PG VTT</title>`);
        });
      });
      $$renderer3.push(`<div class="min-h-screen bg-background"><header class="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40"><div class="container px-4 py-4"><div class="flex items-center gap-4"><a${attr("href", `/games/${stringify(gameId())}`)} class="p-2 hover:bg-muted rounded-lg transition-colors">`);
      Arrow_left($$renderer3, { class: "w-5 h-5" });
      $$renderer3.push(`<!----></a> <div><h1 class="text-xl font-bold text-foreground">Configurações da Mesa</h1> <p class="text-sm text-muted-foreground">${escape_html("Carregando...")}</p></div></div></div></header> <main class="container px-4 py-8">`);
      {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex items-center justify-center py-12"><div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div></div>`);
      }
      $$renderer3.push(`<!--]--></main></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
