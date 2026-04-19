import { b as _e, a as ae, d as ge, c as he } from './wRaPAkex.js';
import { i as pe } from './sV_nQZLa.js';
import {
  i as Y,
  j as oe,
  aC as ue,
  k as m,
  o as F,
  v as de,
  w as G,
  g as L,
  y as me,
  aD as Ee,
  z as ne,
  m as W,
  q as D,
  C as we,
  aE as ke,
  aF as re,
  T as Te,
  aG as N,
  as as K,
  aH as Ce,
  au as Ne,
  a6 as Se,
  aI as be,
  aJ as U,
  aK as Ae,
  aL as xe,
  ag as Ie,
  a0 as ie,
  aM as De,
  _ as Me,
  ap as ce,
  ar as ve,
  aN as J,
  aO as Re,
  aP as ze,
  aQ as Oe,
  aR as Fe,
  at as He,
  aq as ye,
  l as Be,
  aS as Le,
  x as We,
  J as Pe,
  N as qe,
  D as Ve,
  ae as Ye,
  p as Ge,
  a as Je,
  c as Ke,
  an as H,
  P as fe,
  h as Qe,
  d as Ue,
  r as Xe,
  u as Ze,
  aT as $e,
} from './BesqfEI8.js';
import { i as je, b as V } from './CnkBgILj.js';
import { B as ea } from './CctNoNeD.js';
import { d as se } from './DgSRL2mV.js';
import { l as le, p as O } from './DQIjwT0e.js';
function aa(e, n) {
  return n;
}
function na(e, n, t) {
  for (var o = [], c = n.length, l, i = n.length, f = 0; f < c; f++) {
    let g = n[f];
    ve(
      g,
      () => {
        if (l) {
          if ((l.pending.delete(g), l.done.add(g), l.pending.size === 0)) {
            var u = e.outrogroups;
            Q(e, U(l.done)), u.delete(l), u.size === 0 && (e.outrogroups = null);
          }
        } else i -= 1;
      },
      !1,
    );
  }
  if (i === 0) {
    var s = o.length === 0 && t !== null;
    if (s) {
      var v = t,
        r = v.parentNode;
      Fe(r), r.append(v), e.items.clear();
    }
    Q(e, n, !s);
  } else
    (l = { pending: new Set(n), done: new Set() }),
      (e.outrogroups ?? (e.outrogroups = new Set())).add(l);
}
function Q(e, n, t = !0) {
  var o;
  if (e.pending.size > 0) {
    o = new Set();
    for (const i of e.pending.values()) for (const f of i) o.add(e.items.get(f).e);
  }
  for (var c = 0; c < n.length; c++) {
    var l = n[c];
    if (o != null && o.has(l)) {
      l.f |= N;
      const i = document.createDocumentFragment();
      He(l, i);
    } else ye(n[c], t);
  }
}
var te;
function ra(e, n, t, o, c, l = null) {
  var i = e,
    f = new Map(),
    s = (n & ue) !== 0;
  if (s) {
    var v = e;
    i = m ? F(de(v)) : v.appendChild(Y());
  }
  m && G();
  var r = null,
    g = Se(() => {
      var _ = t();
      return be(_) ? _ : _ == null ? [] : U(_);
    }),
    u,
    h = new Map(),
    p = !0;
  function E(_) {
    (C.effect.f & Me) === 0 &&
      (C.pending.delete(_),
      (C.fallback = r),
      ia(C, u, i, n, o),
      r !== null &&
        (u.length === 0
          ? (r.f & N) === 0
            ? ce(r)
            : ((r.f ^= N), B(r, null, i))
          : ve(r, () => {
              r = null;
            })));
  }
  function a(_) {
    C.pending.delete(_);
  }
  var d = oe(() => {
      u = L(g);
      var _ = u.length;
      let w = !1;
      if (m) {
        var M = me(i) === Ee;
        M !== (_ === 0) && ((i = ne()), F(i), W(!1), (w = !0));
      }
      for (var S = new Set(), k = Te, R = Ne(), A = 0; A < _; A += 1) {
        m && D.nodeType === we && D.data === ke && ((i = D), (w = !0), W(!1));
        var z = u[A],
          I = o(z, A),
          T = p ? null : f.get(I);
        T
          ? (T.v && re(T.v, z), T.i && re(T.i, A), R && k.unskip_effect(T.e))
          : ((T = fa(f, p ? i : (te ?? (te = Y())), z, I, A, c, n, t)),
            p || (T.e.f |= N),
            f.set(I, T)),
          S.add(I);
      }
      if (
        (_ === 0 &&
          l &&
          !r &&
          (p ? (r = K(() => l(i))) : ((r = K(() => l(te ?? (te = Y())))), (r.f |= N))),
        _ > S.size && Ce(),
        m && _ > 0 && F(ne()),
        !p)
      )
        if ((h.set(k, S), R)) {
          for (const [P, q] of f) S.has(P) || k.skip_effect(q.e);
          k.oncommit(E), k.ondiscard(a);
        } else E(k);
      w && W(!0), L(g);
    }),
    C = { effect: d, items: f, pending: h, outrogroups: null, fallback: r };
  (p = !1), m && (i = D);
}
function y(e) {
  for (; e !== null && (e.f & ze) === 0; ) e = e.next;
  return e;
}
function ia(e, n, t, o, c) {
  var z, I, T, P, q, X, Z, $, j;
  var l = (o & Oe) !== 0,
    i = n.length,
    f = e.items,
    s = y(e.effect.first),
    v,
    r = null,
    g,
    u = [],
    h = [],
    p,
    E,
    a,
    d;
  if (l)
    for (d = 0; d < i; d += 1)
      (p = n[d]),
        (E = c(p, d)),
        (a = f.get(E).e),
        (a.f & N) === 0 &&
          ((I = (z = a.nodes) == null ? void 0 : z.a) == null || I.measure(),
          (g ?? (g = new Set())).add(a));
  for (d = 0; d < i; d += 1) {
    if (((p = n[d]), (E = c(p, d)), (a = f.get(E).e), e.outrogroups !== null))
      for (const b of e.outrogroups) b.pending.delete(a), b.done.delete(a);
    if (
      ((a.f & J) !== 0 &&
        (ce(a),
        l &&
          ((P = (T = a.nodes) == null ? void 0 : T.a) == null || P.unfix(),
          (g ?? (g = new Set())).delete(a))),
      (a.f & N) !== 0)
    )
      if (((a.f ^= N), a === s)) B(a, null, t);
      else {
        var C = r ? r.next : s;
        a === e.effect.last && (e.effect.last = a.prev),
          a.prev && (a.prev.next = a.next),
          a.next && (a.next.prev = a.prev),
          x(e, r, a),
          x(e, a, C),
          B(a, C, t),
          (r = a),
          (u = []),
          (h = []),
          (s = y(r.next));
        continue;
      }
    if (a !== s) {
      if (v !== void 0 && v.has(a)) {
        if (u.length < h.length) {
          var _ = h[0],
            w;
          r = _.prev;
          var M = u[0],
            S = u[u.length - 1];
          for (w = 0; w < u.length; w += 1) B(u[w], _, t);
          for (w = 0; w < h.length; w += 1) v.delete(h[w]);
          x(e, M.prev, S.next),
            x(e, r, M),
            x(e, S, _),
            (s = _),
            (r = S),
            (d -= 1),
            (u = []),
            (h = []);
        } else
          v.delete(a),
            B(a, s, t),
            x(e, a.prev, a.next),
            x(e, a, r === null ? e.effect.first : r.next),
            x(e, r, a),
            (r = a);
        continue;
      }
      for (u = [], h = []; s !== null && s !== a; )
        (v ?? (v = new Set())).add(s), h.push(s), (s = y(s.next));
      if (s === null) continue;
    }
    (a.f & N) === 0 && u.push(a), (r = a), (s = y(a.next));
  }
  if (e.outrogroups !== null) {
    for (const b of e.outrogroups)
      b.pending.size === 0 && (Q(e, U(b.done)), (q = e.outrogroups) == null || q.delete(b));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (s !== null || v !== void 0) {
    var k = [];
    if (v !== void 0) for (a of v) (a.f & J) === 0 && k.push(a);
    for (; s !== null; ) (s.f & J) === 0 && s !== e.fallback && k.push(s), (s = y(s.next));
    var R = k.length;
    if (R > 0) {
      var A = (o & ue) !== 0 && i === 0 ? t : null;
      if (l) {
        for (d = 0; d < R; d += 1)
          (Z = (X = k[d].nodes) == null ? void 0 : X.a) == null || Z.measure();
        for (d = 0; d < R; d += 1) (j = ($ = k[d].nodes) == null ? void 0 : $.a) == null || j.fix();
      }
      na(e, k, A);
    }
  }
  l &&
    Re(() => {
      var b, ee;
      if (g !== void 0)
        for (a of g) (ee = (b = a.nodes) == null ? void 0 : b.a) == null || ee.apply();
    });
}
function fa(e, n, t, o, c, l, i, f) {
  var s = (i & Ae) !== 0 ? ((i & xe) === 0 ? Ie(t, !1, !1) : ie(t)) : null,
    v = (i & De) !== 0 ? ie(c) : null;
  return {
    v: s,
    i: v,
    e: K(
      () => (
        l(n, s ?? t, v ?? c, f),
        () => {
          e.delete(o);
        }
      ),
    ),
  };
}
function B(e, n, t) {
  if (e.nodes)
    for (
      var o = e.nodes.start, c = e.nodes.end, l = n && (n.f & N) === 0 ? n.nodes.start : t;
      o !== null;
    ) {
      var i = Be(o);
      if ((l.before(o), o === c)) return;
      o = i;
    }
}
function x(e, n, t) {
  n === null ? (e.effect.first = t) : (n.next = t), t === null ? (e.effect.last = n) : (t.prev = n);
}
function sa(e, n, t, o, c) {
  var f;
  m && G();
  var l = (f = n.$$slots) == null ? void 0 : f[t],
    i = !1;
  l === !0 && ((l = n.children), (i = !0)), l === void 0 || l(e, i ? () => o : o);
}
function la(e, n, t, o, c, l) {
  let i = m;
  m && G();
  var f = null;
  m && D.nodeType === Le && ((f = D), G());
  var s = m ? D : e,
    v = new ea(s, !1);
  oe(() => {
    const r = n() || null;
    var g = qe;
    if (r === null) {
      v.ensure(null, null), V(!0);
      return;
    }
    return (
      v.ensure(r, (u) => {
        if (r) {
          if (((f = m ? f : Pe(r, g)), _e(f, f), o)) {
            m && je(r) && f.append(document.createComment(''));
            var h = m ? de(f) : f.appendChild(Y());
            m && (h === null ? W(!1) : F(h)), o(f, h);
          }
          (Ve.nodes.end = f), u.before(f);
        }
        m && F(u);
      }),
      V(!0),
      () => {
        r && V(!1);
      }
    );
  }, We),
    Ye(() => {
      V(!0);
    }),
    i && (W(!0), F(s));
} /**
 * @license lucide-svelte v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ta = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': 2,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
};
var oa = ge('<svg><!><!></svg>');
function pa(e, n) {
  const t = le(n, ['children', '$$slots', '$$events', '$$legacy']),
    o = le(t, ['name', 'color', 'size', 'strokeWidth', 'absoluteStrokeWidth', 'iconNode']);
  Ge(n, !1);
  let c = O(n, 'name', 8, void 0),
    l = O(n, 'color', 8, 'currentColor'),
    i = O(n, 'size', 8, 24),
    f = O(n, 'strokeWidth', 8, 2),
    s = O(n, 'absoluteStrokeWidth', 8, !1),
    v = O(n, 'iconNode', 24, () => []);
  const r = (...p) => p.filter((E, a, d) => !!E && d.indexOf(E) === a).join(' ');
  pe();
  var g = oa();
  se(
    g,
    (p, E) => ({ ...ta, ...o, width: i(), height: i(), stroke: l(), 'stroke-width': p, class: E }),
    [
      () => (H(s()), H(f()), H(i()), fe(() => (s() ? (Number(f()) * 24) / Number(i()) : f()))),
      () => (
        H(c()), H(t), fe(() => r('lucide-icon', 'lucide', c() ? `lucide-${c()}` : '', t.class))
      ),
    ],
  );
  var u = Ke(g);
  ra(u, 1, v, aa, (p, E) => {
    var a = Ze(() => $e(L(E), 2));
    let d = () => L(a)[0],
      C = () => L(a)[1];
    var _ = he(),
      w = Qe(_);
    la(w, d, !0, (M, S) => {
      se(M, () => ({ ...C() }));
    }),
      ae(p, _);
  });
  var h = Ue(u);
  sa(h, n, 'default', {}), Xe(g), ae(e, g), Je();
}
export { pa as I, ra as e, aa as i, sa as s };
