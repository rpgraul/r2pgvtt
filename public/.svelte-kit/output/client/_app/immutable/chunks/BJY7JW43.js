import {
  k as d,
  o as c,
  v as i,
  t as w,
  w as M,
  D as y,
  F as A,
  q as m,
  C,
  l as N,
  G as T,
  I as b,
  J as g,
  N as H,
  K as O,
} from './BesqfEI8.js';
import { b as _ } from './wRaPAkex.js';
function S(h, E, u = !1, f = !1, t = !1, R = !1) {
  var n = h,
    a = '';
  if (u) {
    var l = h;
    d && (n = c(i(l)));
  }
  w(() => {
    var r = y;
    if (a === (a = E() ?? '')) {
      d && M();
      return;
    }
    if (u && !d) {
      (r.nodes = null), (l.innerHTML = a), a !== '' && _(i(l), l.lastChild);
      return;
    }
    if ((r.nodes !== null && (A(r.nodes.start, r.nodes.end), (r.nodes = null)), a !== '')) {
      if (d) {
        m.data;
        for (var e = M(), v = e; e !== null && (e.nodeType !== C || e.data !== ''); )
          (v = e), (e = N(e));
        if (e === null) throw (T(), b);
        _(m, v), (n = c(e));
        return;
      }
      var p = f ? H : t ? O : void 0,
        o = g(f ? 'svg' : t ? 'math' : 'template', p);
      o.innerHTML = a;
      var s = f || t ? o : o.content;
      if ((_(i(s), s.lastChild), f || t)) for (; i(s); ) n.before(i(s));
      else n.before(s);
    }
  });
}
export { S as h };
