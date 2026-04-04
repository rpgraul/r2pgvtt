<script lang="ts">
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';

const gameId = $derived($page.params.id);

onMount(async () => {
  await goto(`/?gameId=${gameId}`);
});
</script>

<div class="min-h-screen flex items-center justify-center">
  <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
</div>
