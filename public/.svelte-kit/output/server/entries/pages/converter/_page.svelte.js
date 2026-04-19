import { i as escape_html, b as attr_class, l as stringify } from '../../../chunks/index2.js';
import '../../../chunks/client.js';
import { B as Button } from '../../../chunks/Button.js';
import 'clsx';
import { B as Badge } from '../../../chunks/Badge.js';
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let textInput = '';
    let jsonOutput = '';
    let notification = '';
    let notificationType = 'success';
    function showNotification(message, type = 'success') {
      notification = message;
      notificationType = type;
      setTimeout(() => {
        notification = '';
      }, 3e3);
    }
    function handleConversion() {
      if (!textInput.trim()) {
        showNotification('O campo de texto não pode estar vazio.', 'warning');
        return;
      }
      jsonOutput = '';
      const cardBlocks = textInput.split(/^\s*---\s*$/m);
      const cardsArray = [];
      cardBlocks.forEach((block, index) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return;
        const cardObject = {};
        const lines = trimmedBlock.split('\n');
        lines.forEach((line) => {
          const colonIndex = line.indexOf(':');
          if (colonIndex === -1) return;
          const key = line.substring(0, colonIndex).trim().toLowerCase();
          const value = line.substring(colonIndex + 1).trim();
          if (key === 'title' || key === 'titulo') {
            cardObject.titulo = value;
          } else if (key === 'content' || key === 'conteudo') {
            cardObject.conteudo = value;
          } else if (key === 'tags') {
            cardObject.tags = value
              .split(',')
              .map((t) => t.trim())
              .filter((t) => t);
          } else if (key === 'category') {
            cardObject.category = value;
          } else if (key === 'visible' || key === 'visivel') {
            cardObject.isVisibleToPlayers = value.toLowerCase() === 'true';
          }
        });
        if (Object.keys(cardObject).length > 0) {
          cardsArray.push(cardObject);
        }
      });
      jsonOutput = JSON.stringify(cardsArray, null, 2);
      showNotification(`${cardsArray.length} card(s) convertido(s) com sucesso!`, 'success');
    }
    function copyToClipboard() {
      if (!jsonOutput) return;
      navigator.clipboard.writeText(jsonOutput);
      showNotification('Copiado para a área de transferência!', 'success');
    }
    $$renderer2.push(
      `<main class="container px-4 py-6 max-w-4xl"><div class="flex items-center justify-between mb-6"><div><h1 class="text-2xl font-bold">Conversor de Cards</h1> <p class="text-sm text-muted-foreground mt-1">Converta texto formatado para JSON de cards</p></div> `,
    );
    Badge($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Utilitário`);
      },
      $$slots: { default: true },
    });
    $$renderer2.push(`<!----></div> `);
    if (notification) {
      $$renderer2.push('<!--[0-->');
      $$renderer2.push(
        `<div${attr_class(`mb-4 p-3 rounded-lg ${stringify(notificationType === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400')}`)}>${escape_html(notification)}</div>`,
      );
    } else {
      $$renderer2.push('<!--[-1-->');
    }
    $$renderer2.push(`<!--]--> <div class="space-y-4"><div><label class="text-sm font-medium mb-2 block">Texto de Entrada</label> <textarea class="w-full h-64 p-4 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Título: Meu Personagem
Tags: guerra, mago
Categoria: pj
---
Título: Outro NPC
...">`);
    const $$body = escape_html(textInput);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea></div> <div class="flex gap-2">`);
    Button($$renderer2, {
      onclick: handleConversion,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Converter`);
      },
      $$slots: { default: true },
    });
    $$renderer2.push(`<!----></div> `);
    if (jsonOutput) {
      $$renderer2.push('<!--[0-->');
      $$renderer2.push(
        `<div><label class="text-sm font-medium mb-2 block">JSON de Saída</label> <textarea class="w-full h-64 p-4 rounded-lg border bg-muted font-mono text-sm resize-none" readonly="">`,
      );
      const $$body_1 = escape_html(jsonOutput);
      if ($$body_1) {
        $$renderer2.push(`${$$body_1}`);
      }
      $$renderer2.push(`</textarea></div> `);
      Button($$renderer2, {
        variant: 'outline',
        onclick: copyToClipboard,
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->Copiar JSON`);
        },
        $$slots: { default: true },
      });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push('<!--[-1-->');
    }
    $$renderer2.push(`<!--]--></div></main>`);
  });
}
export { _page as default };
