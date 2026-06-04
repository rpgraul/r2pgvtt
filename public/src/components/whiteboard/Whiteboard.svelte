<script>
import { Circle, Download, Eraser, Minus, Pencil, Square, Trash2, Type } from 'lucide-svelte';
import { onDestroy, onMount } from 'svelte';
import Button from '$components/ui/Button.svelte';
import { Tooltip } from '$components/ui/tooltip/index.js';
import { authState } from '$lib/state/auth.svelte.ts';
import { gameState } from '$lib/state/gameState.svelte.ts';
import { supabase } from '$lib/supabase/client';
import { db } from '$lib/supabase/tables';

let canvasContainer;
let canvas = null;
let selectedTool = $state('select');
let color = $state('#ef4444');
let brushSize = $state(4);
let isSyncing = false;

const tools = [
  { id: 'select', label: 'Selecionar', icon: 'cursor' },
  { id: 'draw', label: 'Desenhar', icon: 'pencil' },
  { id: 'erase', label: 'Borracha', icon: 'eraser' },
  { id: 'rectangle', label: 'Retângulo', icon: 'square' },
  { id: 'circle', label: 'Círculo', icon: 'circle' },
  { id: 'line', label: 'Linha', icon: 'line' },
  { id: 'text', label: 'Texto', icon: 'type' },
];

const colors = [
  '#000000',
  '#ffffff',
  '#ef4444',
  '#22c55e',
  '#3b82f6',
  '#eab308',
  '#a855f7',
  '#ec4899',
];

const isNarrator = $derived(gameState.currentGameRole === 'narrador');
let channel = null;

onMount(async () => {
  const fabric = await import('fabric');

  canvas = new fabric.Canvas('whiteboard-canvas', {
    width: canvasContainer?.clientWidth || 1200,
    height: canvasContainer?.clientHeight || 800,
    backgroundColor: '#18181b', // Dark theme background
    selection: true,
  });

  // Listeners de modificação do canvas
  canvas.on('object:modified', () => {
    if (isSyncing) return;
    saveCanvas();
  });
  canvas.on('object:added', () => {
    if (isSyncing) return;
    saveCanvas();
  });
  canvas.on('object:removed', () => {
    if (isSyncing) return;
    saveCanvas();
  });

  const gameId = gameState.gameId;
  if (gameId) {
    // 1. Carregar estado inicial do banco
    db.getSettings(`whiteboard_state:${gameId}`).then((val) => {
      if (val && val.canvasJson) {
        loadCanvasFromJson(val.canvasJson);
      }
    });

    // 2. Assinar Canal de Broadcast do Supabase
    channel = supabase.channel(`whiteboard:${gameId}`);
    channel
      .on('broadcast', { event: 'draw_update' }, ({ payload }) => {
        if (payload && payload.canvasJson) {
          loadCanvasFromJson(payload.canvasJson);
        }
      })
      .subscribe();
  }

  window.addEventListener('resize', handleResize);
});

onDestroy(() => {
  if (channel) {
    supabase.removeChannel(channel);
  }
  if (canvas) {
    canvas.dispose();
  }
  window.removeEventListener('resize', handleResize);
});

function handleResize() {
  if (canvas && canvasContainer) {
    canvas.setDimensions({
      width: canvasContainer.clientWidth,
      height: canvasContainer.clientHeight,
    });
  }
}

let saveTimeout = null;
async function saveCanvas() {
  if (!canvas) return;
  const gameId = gameState.gameId;
  if (!gameId) return;

  const canvasJson = JSON.stringify(canvas.toJSON());

  // 1. Broadcast em tempo real para os outros jogadores da mesa
  if (channel) {
    channel.send({
      type: 'broadcast',
      event: 'draw_update',
      payload: { canvasJson },
    });
  }

  // 2. Salvar no Supabase (Debounced em 1s para evitar sobrecarga no DB)
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    db.updateSettings(`whiteboard_state:${gameId}`, {
      canvasJson,
      updatedBy: authState.displayName,
      updatedAt: new Date().toISOString(),
    }).catch((err) => console.error('[Quadro] Erro ao salvar estado:', err));
  }, 1000);
}

async function loadCanvasFromJson(json) {
  if (!canvas) return;

  try {
    isSyncing = true;
    canvas.loadFromJSON(json, () => {
      canvas.renderAll();
      isSyncing = false;
    });
  } catch (error) {
    console.error('Error loading canvas:', error);
    isSyncing = false;
  }
}

function setTool(tool) {
  selectedTool = tool;

  if (!canvas) return;

  canvas.isDrawingMode = false;
  canvas.selection = true;

  switch (tool) {
    case 'select':
      canvas.selection = true;
      break;
    case 'draw':
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = brushSize;
      break;
    case 'erase':
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = '#18181b'; // Cor de fundo do canvas (borracha)
      canvas.freeDrawingBrush.width = 20;
      break;
    case 'rectangle':
      addShape('rectangle');
      break;
    case 'circle':
      addShape('circle');
      break;
    case 'line':
      addShape('line');
      break;
    case 'text':
      addText();
      break;
  }
}

async function addShape(type) {
  const fabric = await import('fabric');
  let shape;

  switch (type) {
    case 'rectangle':
      shape = new fabric.Rect({
        left: 150,
        top: 150,
        width: 120,
        height: 120,
        fill: 'transparent',
        stroke: color,
        strokeWidth: 3,
      });
      break;
    case 'circle':
      shape = new fabric.Circle({
        left: 150,
        top: 150,
        radius: 60,
        fill: 'transparent',
        stroke: color,
        strokeWidth: 3,
      });
      break;
    case 'line':
      shape = new fabric.Line([50, 150, 250, 150], {
        stroke: color,
        strokeWidth: 3,
      });
      break;
  }

  if (shape && canvas) {
    canvas.add(shape);
    canvas.setActiveObject(shape);
  }
}

async function addText() {
  const fabric = await import('fabric');
  const text = new fabric.IText('Texto', {
    left: 150,
    top: 150,
    fontFamily: 'Arial',
    fontSize: 24,
    fill: color,
  });

  if (canvas) {
    canvas.add(text);
    canvas.setActiveObject(text);
  }
}

function clearCanvas() {
  if (!confirm('Limpar todo o quadro?')) return;
  if (canvas) {
    canvas.clear();
    canvas.backgroundColor = '#18181b';
    saveCanvas();
  }
}

function downloadCanvas() {
  if (!canvas) return;

  const dataURL = canvas.toDataURL({
    format: 'png',
    quality: 1,
  });

  const link = document.createElement('a');
  link.download = 'quadro.png';
  link.href = dataURL;
  link.click();
}
</script>

<div class="h-full flex flex-col">
  <!-- Toolbar -->
  <div class="flex flex-wrap items-center gap-2 p-2 border-b bg-card">
    <div class="flex gap-1">
      {#each tools as tool}
        <Tooltip content={tool.label}>
          <Button
            variant={selectedTool === tool.id ? 'default' : 'ghost'}
            size="sm"
            onclick={() => setTool(tool.id)}
          >
            {#if tool.icon === 'cursor'}
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4l16 8-8 2-2 8z"/>
              </svg>
            {:else if tool.icon === 'pencil'}
              <Pencil class="w-4 h-4" />
            {:else if tool.icon === 'eraser'}
              <Eraser class="w-4 h-4" />
            {:else if tool.icon === 'square'}
              <Square class="w-4 h-4" />
            {:else if tool.icon === 'circle'}
              <Circle class="w-4 h-4" />
            {:else if tool.icon === 'line'}
              <Minus class="w-4 h-4" />
            {:else if tool.icon === 'type'}
              <Type class="w-4 h-4" />
            {/if}
          </Button>
        </Tooltip>
      {/each}
    </div>
    
    <div class="hidden sm:block w-px h-6 bg-border"></div>
    
    <!-- Colors -->
    <div class="flex gap-1">
      {#each colors as c}
        <button
          onclick={() => { color = c; if (canvas && canvas.isDrawingMode) canvas.freeDrawingBrush.color = c; }}
          class="w-6 h-6 rounded border-2 transition-transform hover:scale-110"
          style="background-color: {c}; border-color: {color === c ? 'var(--color-primary)' : 'transparent'}"
          aria-label="Cor {c}"
        ></button>
      {/each}
    </div>
    
    <div class="hidden sm:block w-px h-6 bg-border"></div>
    
    <!-- Brush Size -->
    <div class="flex items-center gap-2">
      <input
        type="range"
        min="1"
        max="20"
        bind:value={brushSize}
        onchange={() => { if (canvas && canvas.isDrawingMode) canvas.freeDrawingBrush.width = brushSize; }}
        class="w-20"
        aria-label="Tamanho do pincel"
      />
      <span class="text-xs text-muted-foreground">{brushSize}px</span>
    </div>
    
    <div class="flex-1"></div>
    
    <!-- Actions -->
    <Button variant="ghost" size="sm" onclick={downloadCanvas}>
      Baixar Quadro
    </Button>
    
    <Button variant="ghost" size="sm" onclick={clearCanvas}>
      <Trash2 class="w-4 h-4 mr-1 text-destructive" />
      Limpar
    </Button>
  </div>
  
  <!-- Canvas Container -->
  <div bind:this={canvasContainer} class="flex-1 bg-muted overflow-hidden">
    <canvas id="whiteboard-canvas"></canvas>
  </div>
</div>
