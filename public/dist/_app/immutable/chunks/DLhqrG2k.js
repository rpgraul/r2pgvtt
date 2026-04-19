import { M as w, e as O, O as T, P as x, D, Q as E, S as M } from './BesqfEI8.js';
function n(r, f) {
  return r === f || (r == null ? void 0 : r[M]) === f;
}
function A(r = {}, f, i, Y) {
  var p = w.r,
    S = D;
  return (
    O(() => {
      var a, t;
      return (
        T(() => {
          (a = t),
            (t = []),
            x(() => {
              r !== i(...t) && (f(r, ...t), a && n(i(...a), r) && f(null, ...a));
            });
        }),
        () => {
          let s = S;
          for (; s !== p && s.parent !== null && s.parent.f & E; ) s = s.parent;
          const h = () => {
              t && n(i(...t), r) && f(null, ...t);
            },
            c = s.teardown;
          s.teardown = () => {
            h(), c == null || c();
          };
        }
      );
    }),
    r
  );
}
export { A as b };
