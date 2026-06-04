<script>
import { MessageSquare, Music, X } from 'lucide-svelte';
import ChatPanel from '$components/chat/ChatSidebar.svelte';
import MusicPlayer from '$components/player/MusicPlayer.svelte';
import { uiState } from '$lib/state/ui.svelte.js';
</script>

<div class="flex h-full flex-col bg-background select-none">
	
	<!-- Header -->
	<div class="flex items-center justify-between border-b px-4 py-3 shrink-0 bg-sidebar">
		<span class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Painel Lateral</span>
		<button
			onclick={() => uiState.toggleSidebar()}
			class="p-2 rounded hover:bg-secondary/60 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
			aria-label="Fechar painel"
		>
			<X class="h-4.5 w-4.5" />
		</button>
	</div>

	<!-- Custom Notion Tab list switcher -->
	<div class="flex border-b bg-sidebar shrink-0 text-sm">
		<button
			onclick={() => uiState.activeTab = 'chat'}
			class="flex-1 py-3 font-semibold uppercase tracking-wider transition-colors border-r cursor-pointer text-center flex items-center justify-center gap-2 {uiState.activeTab === 'chat' ? 'bg-background text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'}"
		>
			<MessageSquare class="w-4 h-4" />
			Chat
		</button>
		<button
			onclick={() => uiState.activeTab = 'music'}
			class="flex-1 py-3 font-semibold uppercase tracking-wider transition-colors cursor-pointer text-center flex items-center justify-center gap-2 {uiState.activeTab === 'music' ? 'bg-background text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'}"
		>
			<Music class="w-4 h-4" />
			Música
		</button>
	</div>

	<!-- Content panels -->
	<div class="flex-1 overflow-hidden">
		{#if uiState.activeTab === 'chat'}
			<div class="h-full">
				<ChatPanel />
			</div>
		{:else if uiState.activeTab === 'music'}
			<div class="h-full overflow-y-auto p-4 scrollbar-thin bg-background">
				<MusicPlayer />
			</div>
		{/if}
	</div>
</div>