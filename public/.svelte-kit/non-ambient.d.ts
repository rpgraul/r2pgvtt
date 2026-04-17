
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/auth" | "/auth/callback" | "/auth/login" | "/converter" | "/drawing-mode" | "/games" | "/games/[id]" | "/games/[id]/settings" | "/join" | "/join/[invite_code]" | "/sheet-mode" | "/text-mode";
		RouteParams(): {
			"/games/[id]": { id: string };
			"/games/[id]/settings": { id: string };
			"/join/[invite_code]": { invite_code: string }
		};
		LayoutParams(): {
			"/": { id?: string; invite_code?: string };
			"/auth": Record<string, never>;
			"/auth/callback": Record<string, never>;
			"/auth/login": Record<string, never>;
			"/converter": Record<string, never>;
			"/drawing-mode": Record<string, never>;
			"/games": { id?: string };
			"/games/[id]": { id: string };
			"/games/[id]/settings": { id: string };
			"/join": { invite_code?: string };
			"/join/[invite_code]": { invite_code: string };
			"/sheet-mode": Record<string, never>;
			"/text-mode": Record<string, never>
		};
		Pathname(): "/" | "/auth/callback" | "/auth/login" | "/converter" | "/drawing-mode" | "/games" | `/games/${string}` & {} | `/games/${string}/settings` & {} | `/join/${string}` & {} | "/sheet-mode" | "/text-mode";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/assets/dice-box/ammo/ammo.wasm.wasm" | "/assets/dice-box/themes/default/default.json" | "/assets/dice-box/themes/default/diffuse-dark.png" | "/assets/dice-box/themes/default/diffuse-light.png" | "/assets/dice-box/themes/default/normal.png" | "/assets/dice-box/themes/default/specular.jpg" | "/assets/dice-box/themes/default/theme.config.json" | string & {};
	}
}