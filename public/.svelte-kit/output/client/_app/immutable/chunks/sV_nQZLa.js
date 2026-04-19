import {
  M as d,
  ak as g,
  al as c,
  ad as i,
  P as m,
  g as p,
  am as b,
  an as k,
  a5 as v,
  ao as h,
} from './BesqfEI8.js';
function x(n = !1) {
  const a = d,
    e = a.l.u;
  if (!e) return;
  let f = () => k(a.s);
  if (n) {
    let t = 0,
      s = {};
    const _ = v(() => {
      let l = !1;
      const r = a.s;
      for (const o in r) r[o] !== s[o] && ((s[o] = r[o]), (l = !0));
      return l && t++, t;
    });
    f = () => p(_);
  }
  e.b.length &&
    g(() => {
      u(a, f), c(e.b);
    }),
    i(() => {
      const t = m(() => e.m.map(b));
      return () => {
        for (const s of t) typeof s == 'function' && s();
      };
    }),
    e.a.length &&
      i(() => {
        u(a, f), c(e.a);
      });
}
function u(n, a) {
  if (n.l.s) for (const e of n.l.s) p(e);
  a();
}
h();
export { x as i };
