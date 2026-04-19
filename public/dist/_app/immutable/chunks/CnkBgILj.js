var Fe = Object.defineProperty;
var de = (t) => {
  throw TypeError(t);
};
var Ie = (t, e, r) =>
  e in t ? Fe(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : (t[e] = r);
var $ = (t, e, r) => Ie(t, typeof e != 'symbol' ? e + '' : e, r),
  re = (t, e, r) => e.has(t) || de('Cannot ' + r);
var s = (t, e, r) => (re(t, e, 'read from private field'), r ? r.call(t) : e.get(t)),
  c = (t, e, r) =>
    e.has(t)
      ? de('Cannot add the same private member more than once')
      : e instanceof WeakSet
        ? e.add(t)
        : e.set(t, r),
  a = (t, e, r, i) => (re(t, e, 'write to private field'), i ? i.call(t, r) : e.set(t, r), r),
  p = (t, e, r) => (re(t, e, 'access private method'), r);
import {
  aU as Me,
  g as Ee,
  O as Ve,
  P as xe,
  aV as _e,
  aO as j,
  a0 as me,
  q as F,
  k as I,
  D as P,
  aW as pe,
  j as Ce,
  w as Pe,
  aD as We,
  aX as ge,
  as as L,
  i as we,
  ar as se,
  T as ve,
  at as Ye,
  aY as je,
  a8 as Z,
  aZ as K,
  a_ as ye,
  a$ as Be,
  b0 as He,
  b1 as Te,
  M as Se,
  aF as qe,
  aq as ie,
  o as Q,
  n as $e,
  z as ze,
  b2 as z,
  x as Ue,
  E as Ge,
  b3 as Je,
  b4 as Xe,
  b5 as Ze,
  af as Ke,
  ae as Qe,
  b6 as ne,
  v as et,
  C as Re,
  A as tt,
  l as rt,
  I as ae,
  m as U,
  b7 as st,
  aR as it,
  b8 as nt,
  aJ as at,
  p as ot,
  aE as ft,
  G as lt,
  a as ut,
} from './BesqfEI8.js';
import { b as ct } from './wRaPAkex.js';
function ht(t) {
  let e = 0,
    r = me(0),
    i;
  return () => {
    Me() &&
      (Ee(r),
      Ve(
        () => (
          e === 0 && (i = xe(() => t(() => _e(r)))),
          (e += 1),
          () => {
            j(() => {
              (e -= 1), e === 0 && (i == null || i(), (i = void 0), _e(r));
            });
          }
        ),
      ));
  };
}
var dt = Ue | Ge;
function _t(t, e, r, i) {
  new pt(t, e, r, i);
}
var E, B, T, V, g, S, m, w, R, x, N, W, H, q, k, ee, l, ke, Ae, Ne, oe, J, X, fe;
class pt {
  constructor(e, r, i, f) {
    c(this, l);
    $(this, 'parent');
    $(this, 'is_pending', !1);
    $(this, 'transform_error');
    c(this, E);
    c(this, B, I ? F : null);
    c(this, T);
    c(this, V);
    c(this, g);
    c(this, S, null);
    c(this, m, null);
    c(this, w, null);
    c(this, R, null);
    c(this, x, 0);
    c(this, N, 0);
    c(this, W, !1);
    c(this, H, new Set());
    c(this, q, new Set());
    c(this, k, null);
    c(
      this,
      ee,
      ht(
        () => (
          a(this, k, me(s(this, x))),
          () => {
            a(this, k, null);
          }
        ),
      ),
    );
    var n;
    a(this, E, e),
      a(this, T, r),
      a(this, V, (o) => {
        var d = P;
        (d.b = this), (d.f |= pe), i(o);
      }),
      (this.parent = P.b),
      (this.transform_error =
        f ?? ((n = this.parent) == null ? void 0 : n.transform_error) ?? ((o) => o)),
      a(
        this,
        g,
        Ce(() => {
          if (I) {
            const o = s(this, B);
            Pe();
            const d = o.data === We;
            if (o.data.startsWith(ge)) {
              const h = JSON.parse(o.data.slice(ge.length));
              p(this, l, Ae).call(this, h);
            } else d ? p(this, l, Ne).call(this) : p(this, l, ke).call(this);
          } else p(this, l, oe).call(this);
        }, dt),
      ),
      I && a(this, E, F);
  }
  defer_effect(e) {
    je(e, s(this, H), s(this, q));
  }
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!s(this, T).pending;
  }
  update_pending_count(e, r) {
    p(this, l, fe).call(this, e, r),
      a(this, x, s(this, x) + e),
      !(!s(this, k) || s(this, W)) &&
        (a(this, W, !0),
        j(() => {
          a(this, W, !1), s(this, k) && qe(s(this, k), s(this, x));
        }));
  }
  get_effect_pending() {
    return s(this, ee).call(this), Ee(s(this, k));
  }
  error(e) {
    var r = s(this, T).onerror;
    let i = s(this, T).failed;
    if (!r && !i) throw e;
    s(this, S) && (ie(s(this, S)), a(this, S, null)),
      s(this, m) && (ie(s(this, m)), a(this, m, null)),
      s(this, w) && (ie(s(this, w)), a(this, w, null)),
      I && (Q(s(this, B)), $e(), Q(ze()));
    var f = !1,
      n = !1;
    const o = () => {
        if (f) {
          Xe();
          return;
        }
        (f = !0),
          n && Je(),
          s(this, w) !== null &&
            se(s(this, w), () => {
              a(this, w, null);
            }),
          p(this, l, X).call(this, () => {
            p(this, l, oe).call(this);
          });
      },
      d = (u) => {
        try {
          (n = !0), r == null || r(u, o), (n = !1);
        } catch (h) {
          z(h, s(this, g) && s(this, g).parent);
        }
        i &&
          a(
            this,
            w,
            p(this, l, X).call(this, () => {
              try {
                return L(() => {
                  var h = P;
                  (h.b = this),
                    (h.f |= pe),
                    i(
                      s(this, E),
                      () => u,
                      () => o,
                    );
                });
              } catch (h) {
                return z(h, s(this, g).parent), null;
              }
            }),
          );
      };
    j(() => {
      var u;
      try {
        u = this.transform_error(e);
      } catch (h) {
        z(h, s(this, g) && s(this, g).parent);
        return;
      }
      u !== null && typeof u == 'object' && typeof u.then == 'function'
        ? u.then(d, (h) => z(h, s(this, g) && s(this, g).parent))
        : d(u);
    });
  }
}
(E = new WeakMap()),
  (B = new WeakMap()),
  (T = new WeakMap()),
  (V = new WeakMap()),
  (g = new WeakMap()),
  (S = new WeakMap()),
  (m = new WeakMap()),
  (w = new WeakMap()),
  (R = new WeakMap()),
  (x = new WeakMap()),
  (N = new WeakMap()),
  (W = new WeakMap()),
  (H = new WeakMap()),
  (q = new WeakMap()),
  (k = new WeakMap()),
  (ee = new WeakMap()),
  (l = new WeakSet()),
  (ke = function () {
    try {
      a(
        this,
        S,
        L(() => s(this, V).call(this, s(this, E))),
      );
    } catch (e) {
      this.error(e);
    }
  }),
  (Ae = function (e) {
    const r = s(this, T).failed;
    r &&
      a(
        this,
        w,
        L(() => {
          r(
            s(this, E),
            () => e,
            () => () => {},
          );
        }),
      );
  }),
  (Ne = function () {
    const e = s(this, T).pending;
    e &&
      ((this.is_pending = !0),
      a(
        this,
        m,
        L(() => e(s(this, E))),
      ),
      j(() => {
        var r = a(this, R, document.createDocumentFragment()),
          i = we();
        r.append(i),
          a(
            this,
            S,
            p(this, l, X).call(this, () => L(() => s(this, V).call(this, i))),
          ),
          s(this, N) === 0 &&
            (s(this, E).before(r),
            a(this, R, null),
            se(s(this, m), () => {
              a(this, m, null);
            }),
            p(this, l, J).call(this, ve));
      }));
  }),
  (oe = function () {
    try {
      if (
        ((this.is_pending = this.has_pending_snippet()),
        a(this, N, 0),
        a(this, x, 0),
        a(
          this,
          S,
          L(() => {
            s(this, V).call(this, s(this, E));
          }),
        ),
        s(this, N) > 0)
      ) {
        var e = a(this, R, document.createDocumentFragment());
        Ye(s(this, S), e);
        const r = s(this, T).pending;
        a(
          this,
          m,
          L(() => r(s(this, E))),
        );
      } else p(this, l, J).call(this, ve);
    } catch (r) {
      this.error(r);
    }
  }),
  (J = function (e) {
    (this.is_pending = !1), e.transfer_effects(s(this, H), s(this, q));
  }),
  (X = function (e) {
    var r = P,
      i = Te,
      f = Se;
    Z(s(this, g)), K(s(this, g)), ye(s(this, g).ctx);
    try {
      return Be.ensure(), e();
    } catch (n) {
      return He(n), null;
    } finally {
      Z(r), K(i), ye(f);
    }
  }),
  (fe = function (e, r) {
    var i;
    if (!this.has_pending_snippet()) {
      this.parent && p((i = this.parent), l, fe).call(i, e, r);
      return;
    }
    a(this, N, s(this, N) + e),
      s(this, N) === 0 &&
        (p(this, l, J).call(this, r),
        s(this, m) &&
          se(s(this, m), () => {
            a(this, m, null);
          }),
        s(this, R) && (s(this, E).before(s(this, R)), a(this, R, null)));
  });
function Rt(t) {
  return t.endsWith('capture') && t !== 'gotpointercapture' && t !== 'lostpointercapture';
}
const gt = [
  'beforeinput',
  'click',
  'change',
  'dblclick',
  'contextmenu',
  'focusin',
  'focusout',
  'input',
  'keydown',
  'keyup',
  'mousedown',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  'pointerdown',
  'pointermove',
  'pointerout',
  'pointerover',
  'pointerup',
  'touchend',
  'touchmove',
  'touchstart',
];
function kt(t) {
  return gt.includes(t);
}
const vt = {
  formnovalidate: 'formNoValidate',
  ismap: 'isMap',
  nomodule: 'noModule',
  playsinline: 'playsInline',
  readonly: 'readOnly',
  defaultvalue: 'defaultValue',
  defaultchecked: 'defaultChecked',
  srcobject: 'srcObject',
  novalidate: 'noValidate',
  allowfullscreen: 'allowFullscreen',
  disablepictureinpicture: 'disablePictureInPicture',
  disableremoteplayback: 'disableRemotePlayback',
};
function At(t) {
  return (t = t.toLowerCase()), vt[t] ?? t;
}
const yt = ['touchstart', 'touchmove'];
function bt(t) {
  return yt.includes(t);
}
const Et = ['textarea', 'script', 'style', 'title'];
function Nt(t) {
  return Et.includes(t);
}
const M = Symbol('events'),
  De = new Set(),
  le = new Set();
function Oe(t, e, r, i = {}) {
  function f(n) {
    if ((i.capture || ue.call(e, n), !n.cancelBubble))
      return Ze(() => (r == null ? void 0 : r.call(this, n)));
  }
  return (
    t.startsWith('pointer') || t.startsWith('touch') || t === 'wheel'
      ? j(() => {
          e.addEventListener(t, f, i);
        })
      : e.addEventListener(t, f, i),
    f
  );
}
function Dt(t, e, r, i = {}) {
  var f = Oe(e, t, r, i);
  return () => {
    t.removeEventListener(e, f, i);
  };
}
function Ot(t, e, r, i, f) {
  var n = { capture: i, passive: f },
    o = Oe(t, e, r, n);
  (e === document.body || e === window || e === document || e instanceof HTMLMediaElement) &&
    Qe(() => {
      e.removeEventListener(t, o, n);
    });
}
function Lt(t, e, r) {
  (e[M] ?? (e[M] = {}))[t] = r;
}
function Ft(t) {
  for (var e = 0; e < t.length; e++) De.add(t[e]);
  for (var r of le) r(t);
}
let be = null;
function ue(t) {
  var D, b;
  var e = this,
    r = e.ownerDocument,
    i = t.type,
    f = ((D = t.composedPath) == null ? void 0 : D.call(t)) || [],
    n = f[0] || t.target;
  be = t;
  var o = 0,
    d = be === t && t[M];
  if (d) {
    var u = f.indexOf(d);
    if (u !== -1 && (e === document || e === window)) {
      t[M] = e;
      return;
    }
    var h = f.indexOf(e);
    if (h === -1) return;
    u <= h && (o = u);
  }
  if (((n = f[o] || t.target), n !== e)) {
    Ke(t, 'currentTarget', {
      configurable: !0,
      get() {
        return n || r;
      },
    });
    var C = Te,
      Y = P;
    K(null), Z(null);
    try {
      for (var A, v = []; n !== null; ) {
        var _ = n.assignedSlot || n.parentNode || n.host || null;
        try {
          var y = (b = n[M]) == null ? void 0 : b[i];
          y != null && (!n.disabled || t.target === n) && y.call(n, t);
        } catch (O) {
          A ? v.push(O) : (A = O);
        }
        if (t.cancelBubble || _ === e || _ === null) break;
        n = _;
      }
      if (A) {
        for (let O of v)
          queueMicrotask(() => {
            throw O;
          });
        throw A;
      }
    } finally {
      (t[M] = e), delete t.currentTarget, K(C), Z(Y);
    }
  }
}
let ce = !0;
function It(t) {
  ce = t;
}
function Mt(t, e) {
  var r = e == null ? '' : typeof e == 'object' ? `${e}` : e;
  r !== (t.__t ?? (t.__t = t.nodeValue)) && ((t.__t = r), (t.nodeValue = `${r}`));
}
function mt(t, e) {
  return Le(t, e);
}
function Vt(t, e) {
  ne(), (e.intro = e.intro ?? !1);
  const r = e.target,
    i = I,
    f = F;
  try {
    for (var n = et(r); n && (n.nodeType !== Re || n.data !== tt); ) n = rt(n);
    if (!n) throw ae;
    U(!0), Q(n);
    const o = Le(t, { ...e, anchor: n });
    return U(!1), o;
  } catch (o) {
    if (
      o instanceof Error &&
      o.message
        .split(`
`)
        .some((d) => d.startsWith('https://svelte.dev/e/'))
    )
      throw o;
    return (
      o !== ae && console.warn('Failed to hydrate: ', o),
      e.recover === !1 && st(),
      ne(),
      it(r),
      U(!1),
      mt(t, e)
    );
  } finally {
    U(i), Q(f);
  }
}
const G = new Map();
function Le(
  t,
  { target: e, anchor: r, props: i = {}, events: f, context: n, intro: o = !0, transformError: d },
) {
  ne();
  var u = void 0,
    h = nt(() => {
      var C = r ?? e.appendChild(we());
      _t(
        C,
        { pending: () => {} },
        (v) => {
          ot({});
          var _ = Se;
          if (
            (n && (_.c = n),
            f && (i.$$events = f),
            I && ct(v, null),
            (ce = o),
            (u = t(v, i) || {}),
            (ce = !0),
            I && ((P.nodes.end = F), F === null || F.nodeType !== Re || F.data !== ft))
          )
            throw (lt(), ae);
          ut();
        },
        d,
      );
      var Y = new Set(),
        A = (v) => {
          for (var _ = 0; _ < v.length; _++) {
            var y = v[_];
            if (!Y.has(y)) {
              Y.add(y);
              var D = bt(y);
              for (const te of [e, document]) {
                var b = G.get(te);
                b === void 0 && ((b = new Map()), G.set(te, b));
                var O = b.get(y);
                O === void 0
                  ? (te.addEventListener(y, ue, { passive: D }), b.set(y, 1))
                  : b.set(y, O + 1);
              }
            }
          }
        };
      return (
        A(at(De)),
        le.add(A),
        () => {
          var D;
          for (var v of Y)
            for (const b of [e, document]) {
              var _ = G.get(b),
                y = _.get(v);
              --y == 0
                ? (b.removeEventListener(v, ue), _.delete(v), _.size === 0 && G.delete(b))
                : _.set(v, y);
            }
          le.delete(A), C !== r && ((D = C.parentNode) == null || D.removeChild(C));
        }
      );
    });
  return he.set(u, h), u;
}
let he = new WeakMap();
function xt(t, e) {
  const r = he.get(t);
  return r ? (he.delete(t), r(e)) : Promise.resolve();
}
export {
  Lt as a,
  It as b,
  Rt as c,
  Ft as d,
  Ot as e,
  Oe as f,
  kt as g,
  Vt as h,
  Nt as i,
  ht as j,
  ce as k,
  mt as m,
  At as n,
  Dt as o,
  Mt as s,
  xt as u,
};
