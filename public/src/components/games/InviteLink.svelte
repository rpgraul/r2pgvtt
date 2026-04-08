<script lang="ts">
import type { Game } from '$lib/supabase/types';
import { Share2, Check } from 'lucide-svelte';
import Button from '$components/ui/Button.svelte';

interface Props {
  game: Game | null;
  userRole?: string;
}

let { game, userRole }: Props = $props();

let copied = $state(false);

async function copyLink() {
  if (!game) return;

  const link = `${window.location.origin}/join/${game.invite_code}`;
  await navigator.clipboard.writeText(link);
  copied = true;
  setTimeout(() => (copied = false), 2000);
}

const canInvite = $derived(userRole === 'narrador' || userRole === 'assistente');
</script>

{#if canInvite}
  <Button variant="outline" size="sm" onclick={copyLink}>
    {#if copied}
      <Check class="w-4 h-4 mr-2 text-green-500" />
      Copiado!
    {:else}
      <Share2 class="w-4 h-4 mr-2" />
      Compartilhar
    {/if}
  </Button>
{/if}
