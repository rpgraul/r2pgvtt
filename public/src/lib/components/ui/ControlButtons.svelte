<script>
	import { uiState } from '$lib/state/ui.svelte.js';
	import { MessageSquare, HelpCircle } from 'lucide-svelte';
</script>

<div class="fixed bottom-6 right-6 z-50 flex gap-3">
	<button
		onclick={() => uiState.toggleHelp()}
		class="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-lg transition-transform hover:scale-110 hover:bg-muted/80"
		aria-label="Ajuda"
	>
		<HelpCircle class="h-5 w-5" />
	</button>
	<button
		onclick={() => uiState.toggleSidebar()}
		class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 hover:bg-primary/90"
		aria-label={uiState.isSidebarOpen ? 'Fechar painel' : 'Abrir painel'}
	>
		<MessageSquare class="h-5 w-5" />
	</button>
</div>