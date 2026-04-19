export const index = 6;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/drawing-mode/_page.svelte.js')).default);
export const imports = [
  '_app/immutable/nodes/6.DuVwFxXV.js',
  '_app/immutable/chunks/wRaPAkex.js',
  '_app/immutable/chunks/BesqfEI8.js',
  '_app/immutable/chunks/sV_nQZLa.js',
  '_app/immutable/chunks/Dp1pzeXC.js',
  '_app/immutable/chunks/DiGqoWnr.js',
  '_app/immutable/chunks/CnkBgILj.js',
  '_app/immutable/chunks/CctNoNeD.js',
  '_app/immutable/chunks/C6o-dkjc.js',
  '_app/immutable/chunks/DgSRL2mV.js',
  '_app/immutable/chunks/DQIjwT0e.js',
  '_app/immutable/chunks/GyiQ32Z2.js',
  '_app/immutable/chunks/CeCyYOpZ.js',
  '_app/immutable/chunks/DLhqrG2k.js',
  '_app/immutable/chunks/BL7wsZiz.js',
  '_app/immutable/chunks/Cq0z1jm-.js',
  '_app/immutable/chunks/NfsFcSt2.js',
  '_app/immutable/chunks/C75dnbUw.js',
];
export const stylesheets = [];
export const fonts = [];
