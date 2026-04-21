

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.D7hF7OPf.js","_app/immutable/chunks/wRaPAkex.js","_app/immutable/chunks/BesqfEI8.js","_app/immutable/chunks/DiGqoWnr.js","_app/immutable/chunks/GyiQ32Z2.js","_app/immutable/chunks/CctNoNeD.js","_app/immutable/chunks/DgSRL2mV.js","_app/immutable/chunks/CnkBgILj.js","_app/immutable/chunks/DQIjwT0e.js","_app/immutable/chunks/nhGp3Nji.js","_app/immutable/chunks/DjNPMece.js","_app/immutable/chunks/sV_nQZLa.js","_app/immutable/chunks/C6o-dkjc.js","_app/immutable/chunks/BEPWXgdV.js","_app/immutable/chunks/jkRVSXQV.js","_app/immutable/chunks/BJY7JW43.js","_app/immutable/chunks/6z3mXIkd.js","_app/immutable/chunks/Dg4UCz-X.js","_app/immutable/chunks/lVQ7SHiO.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/BLTiAIHX.js","_app/immutable/chunks/DLhqrG2k.js","_app/immutable/chunks/CeCyYOpZ.js","_app/immutable/chunks/NfsFcSt2.js","_app/immutable/chunks/DZgCvw_a.js","_app/immutable/chunks/BVaKngtf.js"];
export const stylesheets = ["_app/immutable/assets/0.XLxCy-b4.css"];
export const fonts = [];
