<script>
import { Tabs, TabsList, TabsTrigger, TabsContent } from '$components/ui/tabs/index.js';
import { uiState } from '$lib/state/ui.svelte.js';
import { X, MessageCircle, Music } from 'lucide-svelte';
import ChatPanel from '$components/chat/ChatSidebar.svelte';
import MusicPlayer from '$components/player/MusicPlayer.svelte';
import { diceStore } from '$lib/state/diceStore.svelte.js';

const diceTypes = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

function handleRoll(formula) {
  diceStore.rollDice(formula).catch((err) => console.error('[Sidebar] Dice error:', err));
}
</script>

<div class="flex h-full flex-col">
	<div class="flex items-center justify-between border-b px-4 py-3">
		<h2 class="font-semibold">Painel</h2>
		<button
			onclick={() => uiState.toggleSidebar()}
			class="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
			aria-label="Fechar painel"
		>
			<X class="h-4 w-4" />
		</button>
	</div>

	<Tabs bind:value={uiState.activeTab} class="flex flex-1 flex-col overflow-hidden">
		<TabsList class="w-full">
			<TabsTrigger value="chat" activeValue={uiState.activeTab} class="flex-1">
				<MessageCircle class="mr-1 h-4 w-4" />
				Chat
			</TabsTrigger>
			<TabsTrigger value="music" activeValue={uiState.activeTab} class="flex-1">
				<Music class="mr-1 h-4 w-4" />
				Música
			</TabsTrigger>
		</TabsList>

		<div class="flex-1 overflow-hidden">
			<TabsContent value="chat" activeValue={uiState.activeTab} class="h-full">
				<ChatPanel />
			</TabsContent>

			<TabsContent value="music" activeValue={uiState.activeTab} class="h-full overflow-y-auto p-4">
				<MusicPlayer />
			</TabsContent>
		</div>

		<div class="border-t p-4">
			<h3 class="mb-2 text-xs font-medium uppercase text-muted-foreground">Dados Rápidos</h3>
			<div class="grid grid-cols-7 gap-1">
				{#each diceTypes as dice}
					<button
						onclick={() => handleRoll(`1${dice}`)}
						class="rounded bg-success px-1 py-2 text-center text-xs font-bold text-success-foreground transition-transform hover:scale-110"
					>
						{dice}
					</button>
				{/each}
			</div>
		</div>
	</Tabs>
</div>