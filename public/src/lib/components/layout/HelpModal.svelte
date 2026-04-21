<script>
import Dialog from '$components/ui/Dialog.svelte';
import DialogContent from '$components/ui/DialogContent.svelte';
import DialogTitle from '$components/ui/DialogTitle.svelte';
import { uiState } from '$lib/state/ui.svelte.js';
</script>

<Dialog open={uiState.isHelpOpen} onOpenChange={(v) => (uiState.isHelpOpen = v)}>
	<DialogContent class="max-w-lg">
		<DialogTitle>Ajuda - Shortcodes</DialogTitle>
		<div class="space-y-4 text-sm">
			<div>
				<h4 class="font-medium">Atributos</h4>
				<code class="text-xs bg-muted p-1">[stat "Nome" valor]</code>
			</div>
			<div>
				<h4 class="font-medium">Pontos de Vida</h4>
				<code class="text-xs bg-muted p-1">[hp max=100 current=75]</code>
			</div>
			<div>
				<h4 class="font-medium">Dinheiro</h4>
				<code class="text-xs bg-muted p-1">[money current=500 GP]</code>
			</div>
			<div>
				<h4 class="font-medium">Contador</h4>
				<code class="text-xs bg-muted p-1">[count "Nome" max=10]</code>
			</div>
			<div>
				<h4 class="font-medium">Experiência</h4>
				<code class="text-xs bg-muted p-1">[xp current=1000/5000]</code>
			</div>
			<div>
				<h4 class="font-medium">Ocultar dos jogadores</h4>
				<code class="text-xs bg-muted p-1">[hide]...[/hide]</code>
			</div>
		</div>
	</DialogContent>
</Dialog>