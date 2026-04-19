import { b as attr_class, j as clsx } from './index2.js';
import { c as cn } from './cn.js';
function ScrollArea($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { class: className, children } = $$props;
    $$renderer2.push(`<div${attr_class(clsx(cn('relative overflow-auto', className)))}>`);
    children($$renderer2);
    $$renderer2.push(`<!----></div>`);
  });
}
export { ScrollArea as S };
