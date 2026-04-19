import {
  s as sanitize_props,
  e as spread_props,
  f as slot,
  o as attributes,
  c as bind_props,
  d as derived,
  b as attr_class,
  j as clsx,
  a as attr,
  i as escape_html,
} from './index2.js';
import { gameState } from './gameState.svelte.js';
import { o as onDestroy, t as toast } from './toast.js';
import {
  p as useId,
  s as useDialogDescription,
  b as box,
  r as mergeProps,
  C as Chevron_down,
  D as Dialog_1,
  a as DialogContent,
  d as DialogTitle,
} from './DialogTitle.js';
import 'style-to-object';
import { B as Button } from './Button.js';
import { I as Input } from './Input.js';
import { c as cn } from './cn.js';
import { I as Icon } from './Icon.js';
import '@tiptap/starter-kit';
import '@tiptap/extension-placeholder';
import '@tiptap/extension-highlight';
import '@tiptap/extension-link';
import '@tiptap/extension-text-align';
import '@tiptap/extension-underline';
import './RichTextEditor.svelte_svelte_type_style_lang.js';
import 'clsx';
function Check($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [['path', { d: 'M20 6 9 17l-5-5' }]];
  Icon(
    $$renderer,
    spread_props([
      { name: 'check' },
      $$sanitized_props,
      {
        /**
         * @component @name Check
         * @description Lucide SVG icon component, renders SVG Element with children.
         *
         * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjAgNiA5IDE3bC01LTUiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/check
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
function Dialog_description($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { id = useId(), children, child, ref = null, $$slots, $$events, ...restProps } = $$props;
    const descriptionState = useDialogDescription({
      id: box.with(() => id),
      ref: box.with(
        () => ref,
        (v) => (ref = v),
      ),
    });
    const mergedProps = derived(() => mergeProps(restProps, descriptionState.props));
    if (child) {
      $$renderer2.push('<!--[0-->');
      child($$renderer2, { props: mergedProps() });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push('<!--[-1-->');
      $$renderer2.push(`<div${attributes({ ...mergedProps() })}>`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
function DialogDescription($$renderer, $$props) {
  let { children, $$slots, $$events, ...restProps } = $$props;
  if (Dialog_description) {
    $$renderer.push('<!--[-->');
    Dialog_description(
      $$renderer,
      spread_props([
        restProps,
        {
          children: ($$renderer2) => {
            children?.($$renderer2);
            $$renderer2.push(`<!---->`);
          },
          $$slots: { default: true },
        },
      ]),
    );
    $$renderer.push('<!--]-->');
  } else {
    $$renderer.push('<!--[!-->');
    $$renderer.push('<!--]-->');
  }
}
function Select($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      value = '',
      id,
      placeholder = 'Select option',
      items = [],
      onValueChange,
      class: className,
    } = $$props;
    let open = false;
    $$renderer2.push(
      `<div${attr_class(clsx(cn('relative', className)))}><button type="button"${attr('id', id)} aria-haspopup="listbox"${attr('aria-expanded', open)}${attr_class(clsx(cn('flex h-10 w-full items-center justify-between rounded-md border bg-popover px-3 py-2 text-sm ring-offset-background', 'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', 'disabled:cursor-not-allowed disabled:opacity-50 text-foreground')))}><span>${escape_html(value ? items.find((i) => i.value === value)?.label || placeholder : placeholder)}</span> `,
    );
    Chevron_down($$renderer2, {
      class: cn('h-4 w-4 opacity-50 transition-transform', open),
    });
    $$renderer2.push(`<!----></button> `);
    {
      $$renderer2.push('<!--[-1-->');
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { value });
  });
}
function Checkbox($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { checked = false, id, onCheckedChange, class: className } = $$props;
    $$renderer2.push(
      `<button type="button" role="checkbox"${attr('aria-checked', checked)}${attr('id', id)}${attr_class(clsx(cn('peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', 'disabled:cursor-not-allowed disabled:opacity-50', checked && 'bg-primary text-primary-foreground', className)))}>`,
    );
    if (checked) {
      $$renderer2.push('<!--[0-->');
      Check($$renderer2, { class: 'h-3 w-3' });
    } else {
      $$renderer2.push('<!--[-1-->');
    }
    $$renderer2.push(`<!--]--></button>`);
    bind_props($$props, { checked });
  });
}
function RichTextEditor($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { content = '', editable = true, placeholder = '' } = $$props;
    onDestroy(() => {});
    $$renderer2.push(`<div class="rounded-lg border bg-card">`);
    {
      $$renderer2.push('<!--[-1-->');
    }
    $$renderer2.push(
      `<!--]--> <div class="prose prose-invert max-w-none p-4 min-h-[200px] focus:outline-none"></div></div> `,
    );
    {
      $$renderer2.push('<!--[-1-->');
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { content });
  });
}
function CardDialog($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { open = false, editItem = null } = $$props;
    let title = '';
    let content = '';
    let category = 'pj';
    let tags = '';
    let isVisibleToPlayers = true;
    let imagemUrl = '';
    let isSaving = false;
    const categories = [
      { value: 'pj', label: 'Personagem' },
      { value: 'npc', label: 'NPC' },
      { value: 'monstro', label: 'Monstro' },
      { value: 'item', label: 'Item' },
      { value: 'anotacao', label: 'Anotação' },
    ];
    async function handleSave() {
      if (!title.trim()) {
        toast.error('O título é obrigatório');
        return;
      }
      isSaving = true;
      try {
        const cardData = {
          titulo: title.trim(),
          conteudo: content,
          category,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t),
          isVisibleToPlayers,
          imagemUrl: imagemUrl.trim() || null,
        };
        if (editItem) {
          await gameState.editCard(editItem.id, cardData);
          toast.success('Card atualizado!');
        } else {
          await gameState.createCard(cardData);
          toast.success('Card criado!');
        }
        open = false;
      } catch (error) {
        console.error('Error saving card:', error);
        toast.error('Erro ao salvar card');
      } finally {
        isSaving = false;
      }
    }
    async function handleDelete() {
      if (!editItem) return;
      if (!confirm('Tem certeza que deseja excluir este card?')) return;
      try {
        await gameState.removeCard(editItem.id);
        toast.success('Card excluído!');
        open = false;
      } catch (error) {
        console.error('Error deleting card:', error);
        toast.error('Erro ao excluir card');
      }
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Dialog_1($$renderer3, {
        onOpenChange: (v) => (open = v),
        get open() {
          return open;
        },
        set open($$value) {
          open = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          DialogContent($$renderer4, {
            class: 'max-w-3xl max-h-[90vh] overflow-y-auto',
            children: ($$renderer5) => {
              DialogTitle($$renderer5, {
                children: ($$renderer6) => {
                  $$renderer6.push(
                    `<!---->${escape_html(editItem ? 'Editar Card' : 'Criar Card')}`,
                  );
                },
                $$slots: { default: true },
              });
              $$renderer5.push(`<!----> `);
              DialogDescription($$renderer5, {
                children: ($$renderer6) => {
                  $$renderer6.push(
                    `<!---->Preencha os detalhes do card. Use o editor de texto para formatar o conteúdo.`,
                  );
                },
                $$slots: { default: true },
              });
              $$renderer5.push(
                `<!----> <div class="space-y-4 py-4"><div class="space-y-2"><label class="text-sm font-medium" for="card-title">Título</label> `,
              );
              Input($$renderer5, {
                id: 'card-title',
                placeholder: 'Nome do personagem, item, local...',
                get value() {
                  return title;
                },
                set value($$value) {
                  title = $$value;
                  $$settled = false;
                },
              });
              $$renderer5.push(
                `<!----></div> <div class="grid grid-cols-2 gap-4"><div class="space-y-2"><label class="text-sm font-medium" for="card-category">Categoria</label> `,
              );
              Select($$renderer5, {
                id: 'card-category',
                items: categories,
                get value() {
                  return category;
                },
                set value($$value) {
                  category = $$value;
                  $$settled = false;
                },
              });
              $$renderer5.push(
                `<!----></div> <div class="space-y-2"><label class="text-sm font-medium" for="card-tags">Tags</label> `,
              );
              Input($$renderer5, {
                id: 'card-tags',
                placeholder: 'guerreiro, mago, rare',
                get value() {
                  return tags;
                },
                set value($$value) {
                  tags = $$value;
                  $$settled = false;
                },
              });
              $$renderer5.push(
                `<!----></div></div> <div class="space-y-2"><label class="text-sm font-medium" for="card-image">URL da Imagem</label> `,
              );
              Input($$renderer5, {
                id: 'card-image',
                placeholder: 'https://...',
                get value() {
                  return imagemUrl;
                },
                set value($$value) {
                  imagemUrl = $$value;
                  $$settled = false;
                },
              });
              $$renderer5.push(`<!----></div> `);
              if (imagemUrl) {
                $$renderer5.push('<!--[0-->');
                $$renderer5.push(
                  `<div class="aspect-video w-full max-w-xs mx-auto rounded-lg overflow-hidden bg-muted"><img${attr('src', imagemUrl)} alt="Preview" class="w-full h-full object-cover"/></div>`,
                );
              } else {
                $$renderer5.push('<!--[-1-->');
              }
              $$renderer5.push(`<!--]--> <div class="flex items-center gap-2">`);
              Checkbox($$renderer5, {
                id: 'card-visibility',
                get checked() {
                  return isVisibleToPlayers;
                },
                set checked($$value) {
                  isVisibleToPlayers = $$value;
                  $$settled = false;
                },
              });
              $$renderer5.push(
                `<!----> <label class="text-sm" for="card-visibility">Visível para jogadores</label></div> <div class="space-y-2"><label class="text-sm font-medium">Conteúdo</label> `,
              );
              RichTextEditor($$renderer5, {
                get content() {
                  return content;
                },
                set content($$value) {
                  content = $$value;
                  $$settled = false;
                },
              });
              $$renderer5.push(
                `<!----></div></div> <div class="flex justify-between pt-4 border-t"><div>`,
              );
              if (editItem) {
                $$renderer5.push('<!--[0-->');
                Button($$renderer5, {
                  variant: 'destructive',
                  onclick: handleDelete,
                  children: ($$renderer6) => {
                    $$renderer6.push(`<!---->Excluir`);
                  },
                  $$slots: { default: true },
                });
              } else {
                $$renderer5.push('<!--[-1-->');
              }
              $$renderer5.push(`<!--]--></div> <div class="flex gap-2">`);
              Button($$renderer5, {
                variant: 'outline',
                onclick: () => (open = false),
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->Cancelar`);
                },
                $$slots: { default: true },
              });
              $$renderer5.push(`<!----> `);
              Button($$renderer5, {
                onclick: handleSave,
                disabled: isSaving,
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->${escape_html(isSaving ? 'Salvando...' : 'Salvar')}`);
                },
                $$slots: { default: true },
              });
              $$renderer5.push(`<!----></div></div>`);
            },
            $$slots: { default: true },
          });
        },
        $$slots: { default: true },
      });
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { open });
  });
}
export { CardDialog as C, DialogDescription as D };
