<script>
import { HelpCircle } from 'lucide-svelte';
import { uiState } from '$lib/state/ui.svelte.js';

const isSidebarOpen = $derived(uiState.isSidebarOpen);
</script>

<div 
	class="fixed bottom-4 z-40 transition-all duration-200"
	style="right: {isSidebarOpen ? '336px' : '16px'};"
>
	<button
		onclick={() => uiState.toggleHelp()}
		class="flex h-9 w-9 items-center justify-center rounded border bg-card text-muted-foreground hover:text-foreground transition-all hover:bg-secondary/60 shadow-sm cursor-pointer"
		aria-label="Ajuda"
		title="Ajuda e Atalhos"
	>
		<HelpCircle class="h-5 w-5" />
	</button>
</div>