import {
  i as y,
  j as o,
  H as u,
  E as _,
  k as t,
  C as g,
  l as i,
  m as l,
  o as d,
  q as m,
  v as p,
} from './BesqfEI8.js';
function C(n, r) {
  let s = null,
    E = t;
  var a;
  if (t) {
    s = m;
    for (var e = p(document.head); e !== null && (e.nodeType !== g || e.data !== n); ) e = i(e);
    if (e === null) l(!1);
    else {
      var f = i(e);
      e.remove(), d(f);
    }
  }
  t || (a = document.head.appendChild(y()));
  try {
    o(() => r(a), u | _);
  } finally {
    E && (l(!0), d(s));
  }
}
export { C as h };
