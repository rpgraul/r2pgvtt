<script lang="ts">
import type { Game } from '$lib/supabase/types';
import { Gamepad2, Calendar } from 'lucide-svelte';
import Button from '$components/ui/Button.svelte';

interface Props {
  game: Game;
  userRole?: string;
}

let { game, userRole }: Props = $props();

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
</script>

<a
  href="/games/{game.id}"
  class="group block p-6 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200"
>
  <div class="flex items-start gap-4">
    <div class="p-3 bg-primary/10 rounded-lg">
      <Gamepad2 class="w-6 h-6 text-primary" />
    </div>
    
    <div class="flex-1 min-w-0">
      <h3 class="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
        {game.nome}
      </h3>
      <div class="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
        {#if game.sistema}
          <span class="px-2 py-0.5 bg-secondary rounded text-xs">
            {game.sistema}
          </span>
        {/if}
        <span class="flex items-center gap-1">
          <Calendar class="w-3 h-3" />
          {formatDate(game.created_at)}
        </span>
      </div>
    </div>

    {#if userRole}
      <span class="px-2 py-1 text-xs font-medium rounded-full
        {userRole === 'narrador' ? 'bg-purple-500/20 text-purple-400' :
         userRole === 'assistente' ? 'bg-blue-500/20 text-blue-400' :
         'bg-green-500/20 text-green-400'}">
        {userRole === 'narrador' ? 'Mestre' : userRole === 'assistente' ? 'Assistente' : 'Jogador'}
      </span>
    {/if}
  </div>
</a>
