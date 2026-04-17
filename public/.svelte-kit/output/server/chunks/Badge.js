import { o as attributes, j as clsx } from "./index2.js";
import { c as cn } from "./cn.js";
function Badge($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      variant = "default",
      class: className = "",
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const variants = {
      default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      outline: "border-border text-foreground",
      success: "border-transparent bg-success text-success-foreground hover:bg-success/80",
      warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/80"
    };
    $$renderer2.push(`<span${attributes({
      class: clsx(cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></span>`);
  });
}
export {
  Badge as B
};
