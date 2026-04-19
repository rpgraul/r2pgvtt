import { B as w } from './BesqfEI8.js';
function T() {
  const { subscribe: f, update: t } = w([]);
  let l = 0;
  function a(e, r = 'default', u = 4e3) {
    const c = ++l;
    return (
      t((m) => [...m, { id: c, message: e, type: r, duration: u }]),
      u > 0 &&
        setTimeout(() => {
          d(c);
        }, u),
      c
    );
  }
  function d(e) {
    t((r) => r.filter((u) => u.id !== e));
  }
  return {
    subscribe: f,
    success: (e, r) => a(e, 'success', (r == null ? void 0 : r.duration) ?? 4e3),
    error: (e, r) => a(e, 'error', (r == null ? void 0 : r.duration) ?? 4e3),
    warning: (e, r) => a(e, 'warning', (r == null ? void 0 : r.duration) ?? 4e3),
    info: (e, r) => a(e, 'info', (r == null ? void 0 : r.duration) ?? 4e3),
    default: (e, r) => a(e, 'default', (r == null ? void 0 : r.duration) ?? 4e3),
    dismiss: d,
  };
}
const s = T();
export { s as t };
