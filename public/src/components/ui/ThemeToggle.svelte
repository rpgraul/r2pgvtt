<script>
import { toggleMode } from 'mode-watcher';
import { Sun, Moon } from 'lucide-svelte';
import Button from './Button.svelte';
</script>

<Button variant="ghost" size="icon" onclick={toggleMode}>
  <Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 dark:scale-0 dark:-rotate-90 transition-all" />
  <Moon class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 dark:scale-100 dark:rotate-0 transition-all" />
  <span class="sr-only">Alternar tema</span>
</Button>