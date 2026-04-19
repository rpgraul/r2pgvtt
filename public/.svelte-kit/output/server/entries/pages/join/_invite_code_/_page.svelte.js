import {
  s as sanitize_props,
  e as spread_props,
  f as slot,
  h as head,
  i as escape_html,
  d as derived,
  m as store_get,
  u as unsubscribe_stores,
} from '../../../../chunks/index2.js';
import '@sveltejs/kit/internal';
import '../../../../chunks/exports.js';
import '../../../../chunks/utils.js';
import '@sveltejs/kit/internal/server';
import '../../../../chunks/root.js';
import '../../../../chunks/state.svelte.js';
import { p as page } from '../../../../chunks/stores.js';
import 'clsx';
import '../../../../chunks/client.js';
import { I as Icon } from '../../../../chunks/Icon.js';
function Loader_circle($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [['path', { d: 'M21 12a9 9 0 1 1-6.219-8.56' }]];
  Icon(
    $$renderer,
    spread_props([
      { name: 'loader-circle' },
      $$sanitized_props,
      {
        /**
         * @component @name LoaderCircle
         * @description Lucide SVG icon component, renders SVG Element with children.
         *
         * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjEgMTJhOSA5IDAgMSAxLTYuMjE5LTguNTYiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/loader-circle
         * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
         *
         * @param {Object} props - Lucide icons props and any valid SVG attribute
         * @returns {FunctionalComponent} Svelte component
         *
         */
        iconNode,
        children: ($$renderer2) => {
          $$renderer2.push(`<!--[-->`);
          slot($$renderer2, $$props, 'default', {});
          $$renderer2.push(`<!--]-->`);
        },
        $$slots: { default: true },
      },
    ]),
  );
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const inviteCode = derived(
      () => store_get(($$store_subs ??= {}), '$page', page).params.invite_code,
    );
    head('20vcod', $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Entrar na Mesa - R2PG VTT</title>`);
      });
    });
    $$renderer2.push(
      `<div class="min-h-screen flex items-center justify-center bg-background px-4"><div class="w-full max-w-md text-center space-y-6">`,
    );
    {
      $$renderer2.push('<!--[0-->');
      $$renderer2.push(
        `<div class="space-y-4"><div class="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">`,
      );
      Loader_circle($$renderer2, { class: 'w-8 h-8 text-primary animate-spin' });
      $$renderer2.push(
        `<!----></div> <h1 class="text-2xl font-bold text-foreground">Entrando na Mesa</h1> <p class="text-muted-foreground">`,
      );
      {
        $$renderer2.push('<!--[-1-->');
        $$renderer2.push(`Verificando código de convite...`);
      }
      $$renderer2.push(`<!--]--></p></div>`);
    }
    $$renderer2.push(
      `<!--]--> <div class="pt-4"><p class="text-xs text-muted-foreground">Código: <span class="font-mono font-semibold">${escape_html(inviteCode())}</span></p></div></div></div>`,
    );
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export { _page as default };
