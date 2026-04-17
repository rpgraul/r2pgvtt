import { h as head, i as escape_html } from "../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import "../../../../chunks/state.svelte.js";
import "../../../../chunks/client.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let message = "Processando login...";
    head("3cfahf", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Processando Login - R2PG VTT</title>`);
      });
    });
    $$renderer2.push(`<div class="min-h-screen flex items-center justify-center bg-background px-4"><div class="w-full max-w-md text-center space-y-6">`);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="space-y-4"><div class="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse"><svg class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"></path><path d="M12 6V12L16 14"></path></svg></div> <h1 class="text-2xl font-bold text-foreground">Processando Login</h1> <p class="text-muted-foreground">${escape_html(message)}</p></div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
