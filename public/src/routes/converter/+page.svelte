<script>
  import { onMount } from 'svelte';
  import { gameState } from '$lib/state/game.svelte.js';
  import Button from '$components/ui/Button.svelte';
  import Input from '$components/ui/Input.svelte';
  import Badge from '$components/ui/Badge.svelte';
  
  let textInput = $state('');
  let jsonOutput = $state('');
  let notification = $state('');
  let notificationType = $state('success');
  
  function showNotification(message, type = 'success') {
    notification = message;
    notificationType = type;
    setTimeout(() => {
      notification = '';
    }, 3000);
  }
  
  function handleConversion() {
    if (!textInput.trim()) {
      showNotification('O campo de texto não pode estar vazio.', 'warning');
      return;
    }
    
    jsonOutput = '';
    
    const cardBlocks = textInput.split(/^\s*---\s*$/m);
    const cardsArray = [];
    
    cardBlocks.forEach((block, index) => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return;
      
      const cardObject = {};
      const lines = trimmedBlock.split('\n');
      
      lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;
        
        const key = line.substring(0, colonIndex).trim().toLowerCase();
        const value = line.substring(colonIndex + 1).trim();
        
        if (key === 'title' || key === 'titulo') {
          cardObject.titulo = value;
        } else if (key === 'content' || key === 'conteudo') {
          cardObject.conteudo = value;
        } else if (key === 'tags') {
          cardObject.tags = value.split(',').map(t => t.trim()).filter(t => t);
        } else if (key === 'category') {
          cardObject.category = value;
        } else if (key === 'visible' || key === 'visivel') {
          cardObject.isVisibleToPlayers = value.toLowerCase() === 'true';
        }
      });
      
      if (Object.keys(cardObject).length > 0) {
        cardsArray.push(cardObject);
      }
    });
    
    jsonOutput = JSON.stringify(cardsArray, null, 2);
    showNotification(`${cardsArray.length} card(s) convertido(s) com sucesso!`, 'success');
  }
  
  function copyToClipboard() {
    if (!jsonOutput) return;
    navigator.clipboard.writeText(jsonOutput);
    showNotification('Copiado para a área de transferência!', 'success');
  }
</script>

<main class="container px-4 py-6 max-w-4xl">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold">Conversor de Cards</h1>
      <p class="text-sm text-muted-foreground mt-1">Converta texto formatado para JSON de cards</p>
    </div>
    <Badge>Utilitário</Badge>
  </div>
  
  {#if notification}
    <div class="mb-4 p-3 rounded-lg {notificationType === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}">
      {notification}
    </div>
  {/if}
  
  <div class="space-y-4">
    <div>
      <label class="text-sm font-medium mb-2 block">Texto de Entrada</label>
      <textarea
        bind:value={textInput}
        class="w-full h-64 p-4 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Título: Meu Personagem
Tags: guerra, mago
Categoria: pj
---
Título: Outro NPC
..."
      ></textarea>
    </div>
    
    <div class="flex gap-2">
      <Button onclick={handleConversion}>
        Converter
      </Button>
    </div>
    
    {#if jsonOutput}
      <div>
        <label class="text-sm font-medium mb-2 block">JSON de Saída</label>
        <textarea
          bind:value={jsonOutput}
          class="w-full h-64 p-4 rounded-lg border bg-muted font-mono text-sm resize-none"
          readonly
        ></textarea>
      </div>
      
      <Button variant="outline" onclick={copyToClipboard}>
        Copiar JSON
      </Button>
    {/if}
  </div>
</main>
