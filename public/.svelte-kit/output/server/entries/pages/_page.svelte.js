import 'clsx';
import '@sveltejs/kit/internal';
import '../../chunks/exports.js';
import '../../chunks/utils.js';
import '@sveltejs/kit/internal/server';
import '../../chunks/root.js';
import '../../chunks/state.svelte.js';
import {
  s as sanitize_props,
  e as spread_props,
  f as slot,
  d as derived,
  o as attributes,
  c as bind_props,
  g as ensure_array_like,
  i as escape_html,
  b as attr_class,
  j as clsx,
  a as attr,
} from '../../chunks/index2.js';
import { c as cn } from '../../chunks/cn.js';
import { gameState } from '../../chunks/gameState.svelte.js';
import { t as toast, o as onDestroy } from '../../chunks/toast.js';
import {
  A as ARROW_UP,
  e as ARROW_RIGHT,
  f as ARROW_LEFT,
  g as ARROW_DOWN,
  b as box,
  E as END,
  i as isBrowser,
  H as HOME,
  h as Context,
  u as useRefById,
  j as ENTER,
  S as SPACE,
  k as getAriaChecked,
  l as getAriaPressed,
  m as getDisabled,
  n as getDataDisabled,
  o as getDataOrientation,
  p as useId,
  q as noop,
  w as watch,
  r as mergeProps,
  D as Dialog_1,
  a as DialogContent,
  d as DialogTitle,
  X,
  P as Plus,
} from '../../chunks/DialogTitle.js';
import { D as DialogDescription, C as CardDialog } from '../../chunks/CardDialog.js';
import { B as Button } from '../../chunks/Button.js';
import { T as Trash_2 } from '../../chunks/trash-2.js';
import { I as Icon } from '../../chunks/Icon.js';
import 'style-to-object';
import { B as Badge } from '../../chunks/Badge.js';
import '../../chunks/client.js';
function Rotate_ccw($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ['path', { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }],
    ['path', { d: 'M3 3v5h5' }],
  ];
  Icon(
    $$renderer,
    spread_props([
      { name: 'rotate-ccw' },
      $$sanitized_props,
      {
        /**
         * @component @name RotateCcw
         * @description Lucide SVG icon component, renders SVG Element with children.
         *
         * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMyAxMmE5IDkgMCAxIDAgOS05IDkuNzUgOS43NSAwIDAgMC02Ljc0IDIuNzRMMyA4IiAvPgogIDxwYXRoIGQ9Ik0zIDN2NWg1IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/rotate-ccw
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
function Search($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ['circle', { cx: '11', cy: '11', r: '8' }],
    ['path', { d: 'm21 21-4.3-4.3' }],
  ];
  Icon(
    $$renderer,
    spread_props([
      { name: 'search' },
      $$sanitized_props,
      {
        /**
         * @component @name Search
         * @description Lucide SVG icon component, renders SVG Element with children.
         *
         * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMSIgY3k9IjExIiByPSI4IiAvPgogIDxwYXRoIGQ9Im0yMSAyMS00LjMtNC4zIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/search
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
function Square_pen($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    [
      'path',
      {
        d: 'M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',
      },
    ],
    [
      'path',
      {
        d: 'M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z',
      },
    ],
  ];
  Icon(
    $$renderer,
    spread_props([
      { name: 'square-pen' },
      $$sanitized_props,
      {
        /**
         * @component @name SquarePen
         * @description Lucide SVG icon component, renders SVG Element with children.
         *
         * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgM0g1YTIgMiAwIDAgMC0yIDJ2MTRhMiAyIDAgMCAwIDIgMmgxNGEyIDIgMCAwIDAgMi0ydi03IiAvPgogIDxwYXRoIGQ9Ik0xOC4zNzUgMi42MjVhMSAxIDAgMCAxIDMgM2wtOS4wMTMgOS4wMTRhMiAyIDAgMCAxLS44NTMuNTA1bC0yLjg3My44NGEuNS41IDAgMCAxLS42Mi0uNjJsLjg0LTIuODczYTIgMiAwIDAgMSAuNTA2LS44NTJ6IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/square-pen
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
function getElemDirection(elem) {
  const style = window.getComputedStyle(elem);
  const direction = style.getPropertyValue('direction');
  return direction;
}
function getNextKey(dir = 'ltr', orientation = 'horizontal') {
  return {
    horizontal: dir === 'rtl' ? ARROW_LEFT : ARROW_RIGHT,
    vertical: ARROW_DOWN,
  }[orientation];
}
function getPrevKey(dir = 'ltr', orientation = 'horizontal') {
  return {
    horizontal: dir === 'rtl' ? ARROW_RIGHT : ARROW_LEFT,
    vertical: ARROW_UP,
  }[orientation];
}
function getDirectionalKeys(dir = 'ltr', orientation = 'horizontal') {
  if (!['ltr', 'rtl'].includes(dir)) dir = 'ltr';
  if (!['horizontal', 'vertical'].includes(orientation)) orientation = 'horizontal';
  return {
    nextKey: getNextKey(dir, orientation),
    prevKey: getPrevKey(dir, orientation),
  };
}
function useRovingFocus(props) {
  const currentTabStopId = box(null);
  function getCandidateNodes() {
    if (!isBrowser) return [];
    const node = document.getElementById(props.rootNodeId.current);
    if (!node) return [];
    if (props.candidateSelector) {
      const candidates = Array.from(node.querySelectorAll(props.candidateSelector));
      return candidates;
    } else if (props.candidateAttr) {
      const candidates = Array.from(
        node.querySelectorAll(`[${props.candidateAttr}]:not([data-disabled])`),
      );
      return candidates;
    }
    return [];
  }
  function focusFirstCandidate() {
    const items = getCandidateNodes();
    if (!items.length) return;
    items[0]?.focus();
  }
  function handleKeydown(node, e, both = false) {
    const rootNode = document.getElementById(props.rootNodeId.current);
    if (!rootNode || !node) return;
    const items = getCandidateNodes();
    if (!items.length) return;
    const currentIndex = items.indexOf(node);
    const dir = getElemDirection(rootNode);
    const { nextKey, prevKey } = getDirectionalKeys(dir, props.orientation.current);
    const loop = props.loop.current;
    const keyToIndex = {
      [nextKey]: currentIndex + 1,
      [prevKey]: currentIndex - 1,
      [HOME]: 0,
      [END]: items.length - 1,
    };
    if (both) {
      const altNextKey = nextKey === ARROW_DOWN ? ARROW_RIGHT : ARROW_DOWN;
      const altPrevKey = prevKey === ARROW_UP ? ARROW_LEFT : ARROW_UP;
      keyToIndex[altNextKey] = currentIndex + 1;
      keyToIndex[altPrevKey] = currentIndex - 1;
    }
    let itemIndex = keyToIndex[e.key];
    if (itemIndex === void 0) return;
    e.preventDefault();
    if (itemIndex < 0 && loop) {
      itemIndex = items.length - 1;
    } else if (itemIndex === items.length && loop) {
      itemIndex = 0;
    }
    const itemToFocus = items[itemIndex];
    if (!itemToFocus) return;
    itemToFocus.focus();
    currentTabStopId.current = itemToFocus.id;
    props.onCandidateFocus?.(itemToFocus);
    return itemToFocus;
  }
  function getTabIndex(node) {
    const items = getCandidateNodes();
    const anyActive = currentTabStopId.current !== null;
    if (node && !anyActive && items[0] === node) {
      currentTabStopId.current = node.id;
      return 0;
    } else if (node?.id === currentTabStopId.current) {
      return 0;
    }
    return -1;
  }
  return {
    setCurrentTabStopId(id) {
      currentTabStopId.current = id;
    },
    getTabIndex,
    handleKeydown,
    focusFirstCandidate,
    currentTabStopId,
  };
}
const TOGGLE_GROUP_ROOT_ATTR = 'data-toggle-group-root';
const TOGGLE_GROUP_ITEM_ATTR = 'data-toggle-group-item';
class ToggleGroupBaseState {
  opts;
  rovingFocusGroup;
  constructor(opts) {
    this.opts = opts;
    this.rovingFocusGroup = useRovingFocus({
      candidateAttr: TOGGLE_GROUP_ITEM_ATTR,
      rootNodeId: opts.id,
      loop: opts.loop,
      orientation: opts.orientation,
    });
    useRefById(opts);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    [TOGGLE_GROUP_ROOT_ATTR]: '',
    role: 'group',
    'data-orientation': getDataOrientation(this.opts.orientation.current),
    'data-disabled': getDataDisabled(this.opts.disabled.current),
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class ToggleGroupSingleState extends ToggleGroupBaseState {
  opts;
  isMulti = false;
  #anyPressed = derived(() => this.opts.value.current !== '');
  get anyPressed() {
    return this.#anyPressed();
  }
  set anyPressed($$value) {
    return this.#anyPressed($$value);
  }
  constructor(opts) {
    super(opts);
    this.opts = opts;
  }
  includesItem(item) {
    return this.opts.value.current === item;
  }
  toggleItem(item, id) {
    if (this.includesItem(item)) {
      this.opts.value.current = '';
    } else {
      this.opts.value.current = item;
      this.rovingFocusGroup.setCurrentTabStopId(id);
    }
  }
}
class ToggleGroupMultipleState extends ToggleGroupBaseState {
  opts;
  isMulti = true;
  #anyPressed = derived(() => this.opts.value.current.length > 0);
  get anyPressed() {
    return this.#anyPressed();
  }
  set anyPressed($$value) {
    return this.#anyPressed($$value);
  }
  constructor(opts) {
    super(opts);
    this.opts = opts;
  }
  includesItem(item) {
    return this.opts.value.current.includes(item);
  }
  toggleItem(item, id) {
    if (this.includesItem(item)) {
      this.opts.value.current = this.opts.value.current.filter((v) => v !== item);
    } else {
      this.opts.value.current = [...this.opts.value.current, item];
      this.rovingFocusGroup.setCurrentTabStopId(id);
    }
  }
}
class ToggleGroupItemState {
  opts;
  root;
  #isDisabled = derived(() => this.opts.disabled.current || this.root.opts.disabled.current);
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById(opts);
    this.onclick = this.onclick.bind(this);
    this.onkeydown = this.onkeydown.bind(this);
  }
  #toggleItem() {
    if (this.#isDisabled()) return;
    this.root.toggleItem(this.opts.value.current, this.opts.id.current);
  }
  onclick(_) {
    if (this.#isDisabled()) return;
    this.root.toggleItem(this.opts.value.current, this.opts.id.current);
  }
  onkeydown(e) {
    if (this.#isDisabled()) return;
    if (e.key === ENTER || e.key === SPACE) {
      e.preventDefault();
      this.#toggleItem();
      return;
    }
    if (!this.root.opts.rovingFocus.current) return;
    this.root.rovingFocusGroup.handleKeydown(this.opts.ref.current, e);
  }
  #isPressed = derived(() => this.root.includesItem(this.opts.value.current));
  get isPressed() {
    return this.#isPressed();
  }
  set isPressed($$value) {
    return this.#isPressed($$value);
  }
  #ariaChecked = derived(() => {
    return this.root.isMulti ? void 0 : getAriaChecked(this.isPressed);
  });
  #ariaPressed = derived(() => {
    return this.root.isMulti ? getAriaPressed(this.isPressed) : void 0;
  });
  #tabIndex = 0;
  #snippetProps = derived(() => ({ pressed: this.isPressed }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    role: this.root.isMulti ? void 0 : 'radio',
    tabindex: this.#tabIndex,
    'data-orientation': getDataOrientation(this.root.opts.orientation.current),
    'data-disabled': getDataDisabled(this.#isDisabled()),
    'data-state': getToggleItemDataState(this.isPressed),
    'data-value': this.opts.value.current,
    'aria-pressed': this.#ariaPressed(),
    'aria-checked': this.#ariaChecked(),
    disabled: getDisabled(this.#isDisabled()),
    [TOGGLE_GROUP_ITEM_ATTR]: '',
    onclick: this.onclick,
    onkeydown: this.onkeydown,
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function getToggleItemDataState(condition) {
  return condition ? 'on' : 'off';
}
const ToggleGroupRootContext = new Context('ToggleGroup.Root');
function useToggleGroupRoot(props) {
  const { type, ...rest } = props;
  const rootState =
    type === 'single' ? new ToggleGroupSingleState(rest) : new ToggleGroupMultipleState(rest);
  return ToggleGroupRootContext.set(rootState);
}
function useToggleGroupItem(props) {
  return new ToggleGroupItemState(props, ToggleGroupRootContext.get());
}
function Toggle_group($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      id = useId(),
      ref = null,
      value = void 0,
      onValueChange = noop,
      type,
      disabled = false,
      loop = true,
      orientation = 'horizontal',
      rovingFocus = true,
      child,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    function handleDefaultValue() {
      if (value !== void 0) return;
      value = type === 'single' ? '' : [];
    }
    handleDefaultValue();
    watch.pre(
      () => value,
      () => {
        handleDefaultValue();
      },
    );
    const rootState = useToggleGroupRoot({
      id: box.with(() => id),
      value: box.with(
        () => value,
        (v) => {
          value = v;
          onValueChange(v);
        },
      ),
      disabled: box.with(() => disabled),
      loop: box.with(() => loop),
      orientation: box.with(() => orientation),
      rovingFocus: box.with(() => rovingFocus),
      type,
      ref: box.with(
        () => ref,
        (v) => (ref = v),
      ),
    });
    const mergedProps = derived(() => mergeProps(restProps, rootState.props));
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
    bind_props($$props, { ref, value });
  });
}
function Toggle_group_item($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      children,
      child,
      ref = null,
      value,
      disabled = false,
      id = useId(),
      type = 'button',
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const itemState = useToggleGroupItem({
      id: box.with(() => id),
      value: box.with(() => value),
      disabled: box.with(() => disabled ?? false),
      ref: box.with(
        () => ref,
        (v) => (ref = v),
      ),
    });
    const mergedProps = derived(() => mergeProps(restProps, itemState.props, { type }));
    if (child) {
      $$renderer2.push('<!--[0-->');
      child($$renderer2, { props: mergedProps(), ...itemState.snippetProps });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push('<!--[-1-->');
      $$renderer2.push(`<button${attributes({ ...mergedProps() })}>`);
      children?.($$renderer2, itemState.snippetProps);
      $$renderer2.push(`<!----></button>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
function TrashDialog($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { open = false } = $$props;
    let trashItems = [];
    let isLoading = false;
    async function loadTrash() {
      if (!gameState.isNarrator) return;
      isLoading = true;
      try {
        trashItems = await gameState.getTrashItems();
      } catch (error) {
        console.error('Error loading trash:', error);
        toast.error('Erro ao carregar lixeira');
      } finally {
        isLoading = false;
      }
    }
    async function handleRestore(itemId) {
      try {
        await gameState.restoreCard(itemId);
        toast.success('Card restaurado');
        await loadTrash();
      } catch (error) {
        console.error('Error restoring card:', error);
        toast.error('Erro ao restaurar card');
      }
    }
    async function handlePermanentDelete(itemId) {
      if (
        !confirm(
          'Tem certeza que deseja EXCLUIR PERMANENTEMENTE este card? Esta ação não pode ser desfeita.',
        )
      )
        return;
      try {
        await gameState.permanentlyDeleteCard(itemId);
        toast.success('Card excluído permanentemente');
        await loadTrash();
      } catch (error) {
        console.error('Error permanently deleting card:', error);
        toast.error('Erro ao excluir card');
      }
    }
    async function handleEmptyTrash() {
      if (
        !confirm(
          'Tem certeza que deseja LIMPAR A LIXEIRA? Todos os cards serão excluídos permanentemente.',
        )
      )
        return;
      try {
        await gameState.emptyTrash();
        toast.success('Lixeira limpa');
        await loadTrash();
      } catch (error) {
        console.error('Error emptying trash:', error);
        toast.error('Erro ao limpar lixeira');
      }
    }
    function formatDate(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    function isOlderThan30Days(dateStr) {
      if (!dateStr) return false;
      const deletedDate = new Date(dateStr);
      const now = /* @__PURE__ */ new Date();
      const diffDays = (now - deletedDate) / (1e3 * 60 * 60 * 24);
      return diffDays > 30;
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
            class: 'max-w-2xl max-h-[80vh] overflow-y-auto',
            children: ($$renderer5) => {
              DialogTitle($$renderer5, {
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->Lixeira`);
                },
                $$slots: { default: true },
              });
              $$renderer5.push(`<!----> `);
              DialogDescription($$renderer5, {
                children: ($$renderer6) => {
                  $$renderer6.push(
                    `<!---->Cards excluídos são mantidos por 30 dias. Narrador pode restaurar ou excluir permanentemente.`,
                  );
                },
                $$slots: { default: true },
              });
              $$renderer5.push(`<!----> `);
              if (!gameState.isNarrator) {
                $$renderer5.push('<!--[0-->');
                $$renderer5.push(
                  `<div class="text-center py-8 text-muted-foreground">Apenas o narrador pode acessar a lixeira.</div>`,
                );
              } else if (isLoading) {
                $$renderer5.push('<!--[1-->');
                $$renderer5.push(
                  `<div class="text-center py-8"><div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div></div>`,
                );
              } else if (trashItems.length === 0) {
                $$renderer5.push('<!--[2-->');
                $$renderer5.push(`<div class="text-center py-8 text-muted-foreground">`);
                Trash_2($$renderer5, { class: 'w-12 h-12 mx-auto mb-4 opacity-50' });
                $$renderer5.push(`<!----> <p>A lixeira está vazia.</p></div>`);
              } else {
                $$renderer5.push('<!--[-1-->');
                $$renderer5.push(`<div class="space-y-2 py-4"><!--[-->`);
                const each_array = ensure_array_like(trashItems);
                for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                  let item = each_array[$$index];
                  $$renderer5.push(
                    `<div class="flex items-center justify-between p-3 rounded-lg bg-muted/50"><div class="flex-1 min-w-0"><p class="font-medium truncate">${escape_html(item.titulo)}</p> <p class="text-xs text-muted-foreground">Excluído em ${escape_html(formatDate(item.deleted_at))} `,
                  );
                  if (isOlderThan30Days(item.deleted_at)) {
                    $$renderer5.push('<!--[0-->');
                    $$renderer5.push(
                      `<span class="text-destructive font-medium">(expirando)</span>`,
                    );
                  } else {
                    $$renderer5.push('<!--[-1-->');
                  }
                  $$renderer5.push(`<!--]--></p></div> <div class="flex gap-2 ml-4">`);
                  Button($$renderer5, {
                    size: 'sm',
                    variant: 'outline',
                    onclick: () => handleRestore(item.id),
                    children: ($$renderer6) => {
                      Rotate_ccw($$renderer6, { class: 'w-4 h-4 mr-1' });
                      $$renderer6.push(`<!----> Restaurar`);
                    },
                    $$slots: { default: true },
                  });
                  $$renderer5.push(`<!----> `);
                  Button($$renderer5, {
                    size: 'sm',
                    variant: 'destructive',
                    onclick: () => handlePermanentDelete(item.id),
                    children: ($$renderer6) => {
                      X($$renderer6, { class: 'w-4 h-4' });
                    },
                    $$slots: { default: true },
                  });
                  $$renderer5.push(`<!----></div></div>`);
                }
                $$renderer5.push(`<!--]--></div> <div class="flex justify-end pt-4 border-t">`);
                Button($$renderer5, {
                  variant: 'destructive',
                  onclick: handleEmptyTrash,
                  children: ($$renderer6) => {
                    Trash_2($$renderer6, { class: 'w-4 h-4 mr-2' });
                    $$renderer6.push(`<!----> Limpar Lixeira`);
                  },
                  $$slots: { default: true },
                });
                $$renderer5.push(`<!----></div>`);
              }
              $$renderer5.push(`<!--]-->`);
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
function CategoryFilters($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const categories = [
      { value: 'all', label: 'Todos', icon: null },
      { value: 'pj', label: 'Personagem', icon: null },
      { value: 'monstro', label: 'Monstro', icon: null },
      { value: 'npc', label: 'NPC', icon: null },
      { value: 'item', label: 'Item', icon: null },
      { value: 'anotacao', label: 'Anotação', icon: null },
    ];
    let value = 'all';
    let showTrashDialog = false;
    function handleValueChange(newValue) {
      value = newValue;
      gameState.setCategory(newValue === 'all' ? 'all' : newValue);
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="flex flex-wrap gap-2">`);
      if (Toggle_group) {
        $$renderer3.push('<!--[-->');
        Toggle_group($$renderer3, {
          type: 'single',
          onValueChange: handleValueChange,
          class:
            'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
          get value() {
            return value;
          },
          set value($$value) {
            value = $$value;
            $$settled = false;
          },
          children: ($$renderer4) => {
            $$renderer4.push(`<!--[-->`);
            const each_array = ensure_array_like(categories);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let cat = each_array[$$index];
              if (Toggle_group_item) {
                $$renderer4.push('<!--[-->');
                Toggle_group_item($$renderer4, {
                  value: cat.value,
                  class: cn(
                    'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'disabled:pointer-events-none disabled:opacity-50',
                    'data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm',
                  ),
                  children: ($$renderer5) => {
                    $$renderer5.push(`<!---->${escape_html(cat.label)}`);
                  },
                  $$slots: { default: true },
                });
                $$renderer4.push('<!--]-->');
              } else {
                $$renderer4.push('<!--[!-->');
                $$renderer4.push('<!--]-->');
              }
            }
            $$renderer4.push(`<!--]-->`);
          },
          $$slots: { default: true },
        });
        $$renderer3.push('<!--]-->');
      } else {
        $$renderer3.push('<!--[!-->');
        $$renderer3.push('<!--]-->');
      }
      $$renderer3.push(` `);
      if (gameState.isNarrator) {
        $$renderer3.push('<!--[0-->');
        $$renderer3.push(
          `<button type="button" class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all hover:bg-accent hover:text-accent-foreground">`,
        );
        Trash_2($$renderer3, { class: 'w-4 h-4 mr-1' });
        $$renderer3.push(`<!----> Lixeira</button>`);
      } else {
        $$renderer3.push('<!--[-1-->');
      }
      $$renderer3.push(`<!--]--></div> `);
      TrashDialog($$renderer3, {
        get open() {
          return showTrashDialog;
        },
        set open($$value) {
          showTrashDialog = $$value;
          $$settled = false;
        },
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
function Card($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { item } = $$props;
    function getCategoryVariant(cat) {
      const variants = {
        pj: 'default',
        monstro: 'destructive',
        npc: 'secondary',
        item: 'success',
        anotacao: 'warning',
      };
      return variants[cat] || 'outline';
    }
    function getCategoryLabel(cat) {
      const labels = {
        pj: 'Personagem',
        monstro: 'Monstro',
        npc: 'NPC',
        item: 'Item',
        anotacao: 'Anotação',
      };
      return labels[cat] || cat;
    }
    $$renderer2.push(
      `<div${attr_class(clsx(cn('group relative rounded-xl border bg-card text-card-foreground shadow-sm transition-all overflow-hidden', !item.isVisibleToPlayers && gameState.isNarrator && 'border-amber-500/50 border-dashed')))}>`,
    );
    if (item.imagemUrl) {
      $$renderer2.push('<!--[0-->');
      $$renderer2.push(
        `<div class="relative aspect-[3/4] w-full overflow-hidden"><img${attr('src', item.imagemUrl)}${attr('alt', item.titulo)} class="h-full w-full object-cover"/> <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div> `,
      );
      if (item.category) {
        $$renderer2.push('<!--[0-->');
        $$renderer2.push(`<div class="absolute top-3 left-3">`);
        Badge($$renderer2, {
          variant: getCategoryVariant(item.category),
          class: 'backdrop-blur-sm',
          children: ($$renderer3) => {
            $$renderer3.push(`<!---->${escape_html(getCategoryLabel(item.category))}`);
          },
          $$slots: { default: true },
        });
        $$renderer2.push(`<!----></div>`);
      } else {
        $$renderer2.push('<!--[-1-->');
      }
      $$renderer2.push(
        `<!--]--> <div class="absolute bottom-0 left-0 right-0 p-4"><h3 class="font-bold text-lg text-white line-clamp-2 drop-shadow-md">${escape_html(item.titulo)}</h3> `,
      );
      if (item.tags && item.tags.length > 0) {
        $$renderer2.push('<!--[0-->');
        $$renderer2.push(`<div class="flex flex-wrap gap-1 mt-2"><!--[-->`);
        const each_array = ensure_array_like(item.tags);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let tag = each_array[$$index];
          $$renderer2.push(
            `<span class="text-xs bg-white/20 text-white/90 px-2 py-0.5 rounded-full backdrop-blur-sm">${escape_html(tag)}</span>`,
          );
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push('<!--[-1-->');
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push('<!--[-1-->');
      $$renderer2.push(
        `<div class="p-4 space-y-3"><div class="flex items-start justify-between gap-2"><h3 class="font-bold text-lg line-clamp-2">${escape_html(item.titulo)}</h3> `,
      );
      if (item.category) {
        $$renderer2.push('<!--[0-->');
        Badge($$renderer2, {
          variant: getCategoryVariant(item.category),
          class: 'shrink-0',
          children: ($$renderer3) => {
            $$renderer3.push(`<!---->${escape_html(getCategoryLabel(item.category))}`);
          },
          $$slots: { default: true },
        });
      } else {
        $$renderer2.push('<!--[-1-->');
      }
      $$renderer2.push(`<!--]--></div> `);
      if (item.conteudo) {
        $$renderer2.push('<!--[0-->');
        $$renderer2.push(
          `<div class="text-sm text-muted-foreground line-clamp-3">${escape_html(item.conteudo.replace(/<[^>]*>/g, ''))}</div>`,
        );
      } else {
        $$renderer2.push('<!--[-1-->');
      }
      $$renderer2.push(`<!--]--> `);
      if (item.tags && item.tags.length > 0) {
        $$renderer2.push('<!--[0-->');
        $$renderer2.push(`<div class="flex flex-wrap gap-1"><!--[-->`);
        const each_array_1 = ensure_array_like(item.tags);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let tag = each_array_1[$$index_1];
          $$renderer2.push(
            `<span class="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">${escape_html(tag)}</span>`,
          );
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push('<!--[-1-->');
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(
      `<!--]--> <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1"><button class="bg-background/90 backdrop-blur-sm p-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors" title="Editar">`,
    );
    Square_pen($$renderer2, { class: 'w-4 h-4' });
    $$renderer2.push(
      `<!----></button> <button class="bg-background/90 backdrop-blur-sm p-2 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors" title="Excluir">`,
    );
    Trash_2($$renderer2, { class: 'w-4 h-4' });
    $$renderer2.push(`<!----></button></div></div>`);
  });
}
function GridContainer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const items = derived(() => gameState.filteredItems);
    let showCardDialog = false;
    let editingCard = null;
    let dragOverIndex = -1;
    function openNewCard() {
      editingCard = null;
      showCardDialog = true;
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="space-y-4"><div class="flex justify-end">`);
      Button($$renderer3, {
        onclick: openNewCard,
        children: ($$renderer4) => {
          Plus($$renderer4, { class: 'w-4 h-4 mr-2' });
          $$renderer4.push(`<!----> Novo Card`);
        },
        $$slots: { default: true },
      });
      $$renderer3.push(`<!----></div> `);
      if (items().length === 0) {
        $$renderer3.push('<!--[0-->');
        $$renderer3.push(
          `<div class="flex flex-col items-center justify-center py-12 text-center"><div class="text-6xl mb-4">🎲</div> <h3 class="text-lg font-medium">Nenhum card encontrado</h3> <p class="text-sm text-muted-foreground mt-1">Tente ajustar seus filtros ou buscar por outro termo</p> `,
        );
        Button($$renderer3, {
          class: 'mt-4',
          onclick: openNewCard,
          children: ($$renderer4) => {
            Plus($$renderer4, { class: 'w-4 h-4 mr-2' });
            $$renderer4.push(`<!----> Criar primeiro card`);
          },
          $$slots: { default: true },
        });
        $$renderer3.push(`<!----></div>`);
      } else {
        $$renderer3.push('<!--[-1-->');
        $$renderer3.push(
          `<div${attr_class(clsx(cn('grid gap-4', gameState.viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1')))}><!--[-->`,
        );
        const each_array = ensure_array_like(items());
        for (let index = 0, $$length = each_array.length; index < $$length; index++) {
          let item = each_array[index];
          $$renderer3.push(
            `<div draggable="true"${attr_class(clsx(cn('transition-all', dragOverIndex === index && 'opacity-50 scale-95')))}>`,
          );
          Card($$renderer3, { item });
          $$renderer3.push(`<!----></div>`);
        }
        $$renderer3.push(`<!--]--></div>`);
      }
      $$renderer3.push(`<!--]--></div> `);
      CardDialog($$renderer3, {
        editItem: editingCard,
        get open() {
          return showCardDialog;
        },
        set open($$value) {
          showCardDialog = $$value;
          $$settled = false;
        },
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
function SearchInput($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let searchValue = '';
    onDestroy(() => {});
    $$renderer2.push(`<div class="relative">`);
    Search($$renderer2, {
      class: 'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
    });
    $$renderer2.push(
      `<!----> <input type="text"${attr('value', searchValue)} placeholder="Buscar por título, conteúdo ou tag..." class="flex h-10 w-full rounded-md border bg-popover pl-10 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground border-input"/> `,
    );
    {
      $$renderer2.push('<!--[-1-->');
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function TagFilters($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const selectedTags = derived(() => gameState.filters.tags);
    $$renderer2.push(
      `<div class="relative"><button type="button"${attr_class(clsx(cn('inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border transition-colors', selectedTags().length > 0 ? 'bg-primary/20 border-primary text-primary' : 'bg-muted border-input hover:bg-accent')))}><span>Tags</span> `,
    );
    if (selectedTags().length > 0) {
      $$renderer2.push('<!--[0-->');
      $$renderer2.push(
        `<span class="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">${escape_html(selectedTags().length)}</span>`,
      );
    } else {
      $$renderer2.push('<!--[-1-->');
    }
    $$renderer2.push(`<!--]--></button> `);
    {
      $$renderer2.push('<!--[-1-->');
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push('<!--[-1-->');
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(
      `<div class="min-h-screen bg-background text-foreground"><main class="container px-4 py-6 space-y-6"><div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div class="flex-1 max-w-md">`,
    );
    SearchInput($$renderer2);
    $$renderer2.push(`<!----></div> <div class="flex items-center gap-2">`);
    CategoryFilters($$renderer2);
    $$renderer2.push(`<!----> `);
    TagFilters($$renderer2);
    $$renderer2.push(`<!----></div></div> `);
    GridContainer($$renderer2);
    $$renderer2.push(`<!----></main></div>`);
  });
}
export { _page as default };
