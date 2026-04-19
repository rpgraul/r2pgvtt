import { a as attr, i as escape_html, h as head } from '../../../../chunks/index2.js';
import '../../../../chunks/client.js';
import { B as Button } from '../../../../chunks/Button.js';
import { I as Input } from '../../../../chunks/Input.js';
import '@sveltejs/kit/internal';
import '../../../../chunks/exports.js';
import '../../../../chunks/utils.js';
import '@sveltejs/kit/internal/server';
import '../../../../chunks/root.js';
import '../../../../chunks/state.svelte.js';
function OAuthButton($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let loading = false;
    $$renderer2.push(
      `<button type="button"${attr('disabled', loading, true)} class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path></svg> <span class="font-medium">${escape_html('Entrar com Google')}</span></button>`,
    );
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let email = '';
    let password = '';
    let loading = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head('1i2smtp', $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>${escape_html('Entrar')} - R2PG VTT</title>`);
        });
      });
      $$renderer3.push(
        `<div class="min-h-screen flex items-center justify-center bg-background px-4"><div class="w-full max-w-md space-y-6"><div class="text-center space-y-2"><h1 class="text-3xl font-bold text-foreground">${escape_html('Bem-vindo de volta!')}</h1> <p class="text-muted-foreground">${escape_html(
          'Entre na sua conta para continuar',
        )}</p></div> <div class="space-y-4">`,
      );
      OAuthButton($$renderer3);
      $$renderer3.push(
        `<!----> <div class="relative"><div class="absolute inset-0 flex items-center"><span class="w-full border-t border-border"></span></div> <div class="relative flex justify-center text-xs uppercase"><span class="bg-background px-2 text-muted-foreground">ou</span></div></div> <form class="space-y-4">`,
      );
      {
        $$renderer3.push('<!--[-1-->');
      }
      $$renderer3.push(
        `<!--]--> <div class="space-y-2"><label for="email" class="text-sm font-medium">Email</label> `,
      );
      Input($$renderer3, {
        id: 'email',
        type: 'email',
        placeholder: 'seu@email.com',
        required: true,
        get value() {
          return email;
        },
        set value($$value) {
          email = $$value;
          $$settled = false;
        },
      });
      $$renderer3.push(
        `<!----></div> <div class="space-y-2"><label for="password" class="text-sm font-medium">Senha</label> `,
      );
      Input($$renderer3, {
        id: 'password',
        type: 'password',
        placeholder: '••••••••',
        required: true,
        minlength: 6,
        get value() {
          return password;
        },
        set value($$value) {
          password = $$value;
          $$settled = false;
        },
      });
      $$renderer3.push(`<!----></div> `);
      {
        $$renderer3.push('<!--[-1-->');
      }
      $$renderer3.push(`<!--]--> `);
      Button($$renderer3, {
        type: 'submit',
        disabled: loading,
        class: 'w-full',
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->${escape_html('Entrar')}`);
        },
        $$slots: { default: true },
      });
      $$renderer3.push(
        `<!----> <button type="button" class="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">${escape_html('Não tem conta? Criar')}</button></form></div></div></div>`,
      );
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
export { _page as default };
