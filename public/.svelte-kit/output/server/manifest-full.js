export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["assets/dice-box/ammo/ammo.wasm.wasm","assets/dice-box/themes/default/default.json","assets/dice-box/themes/default/diffuse-dark.png","assets/dice-box/themes/default/diffuse-light.png","assets/dice-box/themes/default/normal.png","assets/dice-box/themes/default/specular.jpg","assets/dice-box/themes/default/theme.config.json"]),
	mimeTypes: {".wasm":"application/wasm",".json":"application/json",".png":"image/png",".jpg":"image/jpeg"},
	_: {
		client: {start:"_app/immutable/entry/start.BL9hXIJU.js",app:"_app/immutable/entry/app.D_NdyHbu.js",imports:["_app/immutable/entry/start.BL9hXIJU.js","_app/immutable/chunks/D2u6EJCm.js","_app/immutable/chunks/BesqfEI8.js","_app/immutable/chunks/DiGqoWnr.js","_app/immutable/entry/app.D_NdyHbu.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/BesqfEI8.js","_app/immutable/chunks/CnkBgILj.js","_app/immutable/chunks/wRaPAkex.js","_app/immutable/chunks/DiGqoWnr.js","_app/immutable/chunks/CctNoNeD.js","_app/immutable/chunks/BEPWXgdV.js","_app/immutable/chunks/DLhqrG2k.js","_app/immutable/chunks/DQIjwT0e.js","_app/immutable/chunks/GyiQ32Z2.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:true},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js')),
			__memo(() => import('./nodes/10.js')),
			__memo(() => import('./nodes/11.js')),
			__memo(() => import('./nodes/12.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/auth/callback",
				pattern: /^\/auth\/callback\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: __memo(() => import('./entries/endpoints/auth/callback/_server.ts.js'))
			},
			{
				id: "/auth/login",
				pattern: /^\/auth\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/converter",
				pattern: /^\/converter\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/drawing-mode",
				pattern: /^\/drawing-mode\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/games",
				pattern: /^\/games\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/games/[id]",
				pattern: /^\/games\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/games/[id]/settings",
				pattern: /^\/games\/([^/]+?)\/settings\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/join/[invite_code]",
				pattern: /^\/join\/([^/]+?)\/?$/,
				params: [{"name":"invite_code","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/sheet-mode",
				pattern: /^\/sheet-mode\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/text-mode",
				pattern: /^\/text-mode\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 12 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
