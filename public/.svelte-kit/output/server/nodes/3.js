export const index = 3;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/auth/callback/_page.svelte.js')).default);
export const imports = [
  '_app/immutable/nodes/3.CxBOfQkH.js',
  '_app/immutable/chunks/wRaPAkex.js',
  '_app/immutable/chunks/BesqfEI8.js',
  '_app/immutable/chunks/DiGqoWnr.js',
  '_app/immutable/chunks/CnkBgILj.js',
  '_app/immutable/chunks/CctNoNeD.js',
  '_app/immutable/chunks/nhGp3Nji.js',
  '_app/immutable/chunks/Cysni1N-.js',
  '_app/immutable/chunks/Cq0z1jm-.js',
];
export const stylesheets = [];
export const fonts = [];
