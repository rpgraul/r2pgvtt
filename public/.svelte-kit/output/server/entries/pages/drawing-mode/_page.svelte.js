import "clsx";
import { s as sanitize_props, e as spread_props, f as slot, b as attr_class, j as clsx, g as ensure_array_like, k as attr_style, a as attr, i as escape_html, d as derived, l as stringify } from "../../../chunks/index2.js";
import { o as onDestroy } from "../../../chunks/toast.js";
import "../../../chunks/client.js";
import { a as authState } from "../../../chunks/auth.svelte.js";
import { B as Button } from "../../../chunks/Button.js";
import { c as cn } from "../../../chunks/cn.js";
import { I as Icon } from "../../../chunks/Icon.js";
import { T as Trash_2 } from "../../../chunks/trash-2.js";
function Circle($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [["circle", { "cx": "12", "cy": "12", "r": "10" }]];
  Icon($$renderer, spread_props([
    { name: "circle" },
    $$sanitized_props,
    {
      /**
       * @component @name Circle
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/circle
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
function Download($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["path", { "d": "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }],
    ["polyline", { "points": "7 10 12 15 17 10" }],
    ["line", { "x1": "12", "x2": "12", "y1": "15", "y2": "3" }]
  ];
  Icon($$renderer, spread_props([
    { name: "download" },
    $$sanitized_props,
    {
      /**
       * @component @name Download
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjEgMTV2NGEyIDIgMCAwIDEtMiAySDVhMiAyIDAgMCAxLTItMnYtNCIgLz4KICA8cG9seWxpbmUgcG9pbnRzPSI3IDEwIDEyIDE1IDE3IDEwIiAvPgogIDxsaW5lIHgxPSIxMiIgeDI9IjEyIiB5MT0iMTUiIHkyPSIzIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/download
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
function Eraser($$renderer, $$props) {
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
        "d": "m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"
      }
    ],
    ["path", { "d": "M22 21H7" }],
    ["path", { "d": "m5 11 9 9" }]
  ];
  Icon($$renderer, spread_props([
    { name: "eraser" },
    $$sanitized_props,
    {
      /**
       * @component @name Eraser
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtNyAyMS00LjMtNC4zYy0xLTEtMS0yLjUgMC0zLjRsOS42LTkuNmMxLTEgMi41LTEgMy40IDBsNS42IDUuNmMxIDEgMSAyLjUgMCAzLjRMMTMgMjEiIC8+CiAgPHBhdGggZD0iTTIyIDIxSDciIC8+CiAgPHBhdGggZD0ibTUgMTEgOSA5IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/eraser
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
function Minus($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [["path", { "d": "M5 12h14" }]];
  Icon($$renderer, spread_props([
    { name: "minus" },
    $$sanitized_props,
    {
      /**
       * @component @name Minus
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNSAxMmgxNCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/minus
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
function Pencil($$renderer, $$props) {
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
        "d": "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
      }
    ],
    ["path", { "d": "m15 5 4 4" }]
  ];
  Icon($$renderer, spread_props([
    { name: "pencil" },
    $$sanitized_props,
    {
      /**
       * @component @name Pencil
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjEuMTc0IDYuODEyYTEgMSAwIDAgMC0zLjk4Ni0zLjk4N0wzLjg0MiAxNi4xNzRhMiAyIDAgMCAwLS41LjgzbC0xLjMyMSA0LjM1MmEuNS41IDAgMCAwIC42MjMuNjIybDQuMzUzLTEuMzJhMiAyIDAgMCAwIC44My0uNDk3eiIgLz4KICA8cGF0aCBkPSJtMTUgNSA0IDQiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/pencil
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
function Square($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    [
      "rect",
      { "width": "18", "height": "18", "x": "3", "y": "3", "rx": "2" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "square" },
    $$sanitized_props,
    {
      /**
       * @component @name Square
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/square
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
function Type($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["polyline", { "points": "4 7 4 4 20 4 20 7" }],
    ["line", { "x1": "9", "x2": "15", "y1": "20", "y2": "20" }],
    ["line", { "x1": "12", "x2": "12", "y1": "4", "y2": "20" }]
  ];
  Icon($$renderer, spread_props([
    { name: "type" },
    $$sanitized_props,
    {
      /**
       * @component @name Type
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cG9seWxpbmUgcG9pbnRzPSI0IDcgNCA0IDIwIDQgMjAgNyIgLz4KICA8bGluZSB4MT0iOSIgeDI9IjE1IiB5MT0iMjAiIHkyPSIyMCIgLz4KICA8bGluZSB4MT0iMTIiIHgyPSIxMiIgeTE9IjQiIHkyPSIyMCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/type
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
function Tooltip($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { class: className, children } = $$props;
    $$renderer2.push(`<div${attr_class(clsx(cn("relative inline-block", className)))}><div>`);
    children($$renderer2);
    $$renderer2.push(`<!----></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function Whiteboard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let selectedTool = "select";
    let color = "#000000";
    let brushSize = 3;
    const tools = [
      { id: "select", label: "Selecionar", icon: "cursor" },
      { id: "draw", label: "Desenhar", icon: "pencil" },
      { id: "erase", label: "Borracha", icon: "eraser" },
      { id: "rectangle", label: "Retângulo", icon: "square" },
      { id: "circle", label: "Círculo", icon: "circle" },
      { id: "line", label: "Linha", icon: "line" },
      { id: "text", label: "Texto", icon: "type" }
    ];
    const colors = [
      "#000000",
      "#ffffff",
      "#ef4444",
      "#22c55e",
      "#3b82f6",
      "#eab308",
      "#a855f7",
      "#ec4899"
    ];
    const isNarrator = derived(() => authState.role === "narrador");
    onDestroy(() => {
      window.removeEventListener("resize", handleResize);
    });
    function handleResize() {
    }
    function setTool(tool) {
      selectedTool = tool;
      return;
    }
    function clearCanvas() {
      if (!confirm("Limpar todo o quadro?")) return;
    }
    function downloadCanvas() {
      return;
    }
    $$renderer2.push(`<div class="h-full flex flex-col"><div class="flex items-center gap-2 p-2 border-b bg-card"><div class="flex gap-1"><!--[-->`);
    const each_array = ensure_array_like(tools);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tool = each_array[$$index];
      Tooltip($$renderer2, {
        content: tool.label,
        children: ($$renderer3) => {
          Button($$renderer3, {
            variant: selectedTool === tool.id ? "default" : "ghost",
            size: "sm",
            onclick: () => setTool(tool.id),
            children: ($$renderer4) => {
              if (tool.icon === "cursor") {
                $$renderer4.push("<!--[0-->");
                $$renderer4.push(`<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4l16 8-8 2-2 8z"></path></svg>`);
              } else if (tool.icon === "pencil") {
                $$renderer4.push("<!--[1-->");
                Pencil($$renderer4, { class: "w-4 h-4" });
              } else if (tool.icon === "eraser") {
                $$renderer4.push("<!--[2-->");
                Eraser($$renderer4, { class: "w-4 h-4" });
              } else if (tool.icon === "square") {
                $$renderer4.push("<!--[3-->");
                Square($$renderer4, { class: "w-4 h-4" });
              } else if (tool.icon === "circle") {
                $$renderer4.push("<!--[4-->");
                Circle($$renderer4, { class: "w-4 h-4" });
              } else if (tool.icon === "line") {
                $$renderer4.push("<!--[5-->");
                Minus($$renderer4, { class: "w-4 h-4" });
              } else if (tool.icon === "type") {
                $$renderer4.push("<!--[6-->");
                Type($$renderer4, { class: "w-4 h-4" });
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
        }
      });
    }
    $$renderer2.push(`<!--]--></div> <div class="w-px h-6 bg-border"></div> <div class="flex gap-1"><!--[-->`);
    const each_array_1 = ensure_array_like(colors);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let c = each_array_1[$$index_1];
      $$renderer2.push(`<button class="w-6 h-6 rounded border-2 transition-transform hover:scale-110"${attr_style(`background-color: ${stringify(c)}; border-color: ${stringify(color === c ? "#3b82f6" : "transparent")}`)}${attr("aria-label", `Cor ${stringify(c)}`)}></button>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="w-px h-6 bg-border"></div> <div class="flex items-center gap-2"><input type="range" min="1" max="20"${attr("value", brushSize)} class="w-20"/> <span class="text-xs text-muted-foreground">${escape_html(brushSize)}px</span></div> <div class="flex-1"></div> `);
    Button($$renderer2, {
      variant: "ghost",
      size: "sm",
      onclick: downloadCanvas,
      children: ($$renderer3) => {
        Download($$renderer3, { class: "w-4 h-4 mr-1" });
        $$renderer3.push(`<!----> Baixar`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    if (isNarrator()) {
      $$renderer2.push("<!--[0-->");
      Button($$renderer2, {
        variant: "ghost",
        size: "sm",
        onclick: clearCanvas,
        children: ($$renderer3) => {
          Trash_2($$renderer3, { class: "w-4 h-4 mr-1" });
          $$renderer3.push(`<!----> Limpar`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="flex-1 bg-muted overflow-hidden"><canvas id="whiteboard-canvas"></canvas></div></div>`);
  });
}
function _page($$renderer) {
  $$renderer.push(`<main class="h-[calc(100vh-64px)]">`);
  Whiteboard($$renderer);
  $$renderer.push(`<!----></main>`);
}
export {
  _page as default
};
