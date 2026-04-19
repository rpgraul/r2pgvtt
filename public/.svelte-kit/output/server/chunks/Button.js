import { o as attributes, j as clsx } from './index2.js';
import { c as cn } from './cn.js';
function Button($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      variant = 'default',
      size = 'default',
      class: className = '',
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    };
    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    };
    $$renderer2.push(
      `<button${attributes({
        class: clsx(
          cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            variants[variant],
            sizes[size],
            className,
          ),
        ),
        ...restProps,
      })}>`,
    );
    children?.($$renderer2);
    $$renderer2.push(`<!----></button>`);
  });
}
export { Button as B };
