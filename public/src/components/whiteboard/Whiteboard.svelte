<script>
import { onMount, onDestroy } from 'svelte';
import { gameState } from '$lib/state/game.svelte.ts';
import { authState } from '$lib/state/auth.svelte.ts';
import { toast } from '$lib/stores/toast.js';
import Button from '$components/ui/Button.svelte';
import { Tooltip } from '$components/ui/tooltip/index.js';
import {
  Pencil,
  Eraser,
  Square,
  Circle,
  Minus,
  Type,
  Image,
  Undo,
  Redo,
  Download,
  Trash2,
  Palette,
} from 'lucide-svelte';

let canvasContainer;
let canvas = null;
let isDrawing = $state(false);
let selectedTool = $state('select');
let color = $state('#000000');
let brushSize = $state(3);
let canUndo = $state(false);
let canRedo = $state(false);
let unsubscribe = null;

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

const isNarrator = $derived(authState.role === 'narrador');

onMount(async () => {
  const fabric = await import('fabric');

  canvas = new fabric.Canvas('whiteboard-canvas', {
    width: canvasContainer?.clientWidth || 1200,
    height: canvasContainer?.clientHeight || 800,
    backgroundColor: '#ffffff',
    selection: true,
  });

  canvas.on('object:modified', saveCanvas);
  canvas.on('object:added', () => {
    canUndo = true;
  });

  subscribeToWhiteboard();

  window.addEventListener('resize', handleResize);
});

onDestroy(() => {
  if (unsubscribe) unsubscribe();
  if (canvas) canvas.dispose();
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

function subscribeToWhiteboard() {
  if (!isNarrator) {
    const wbRef = doc(db, 'whiteboard', 'main');
    unsubscribe = onSnapshot(wbRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().canvasJson) {
        loadCanvasFromJson(docSnap.data().canvasJson);
      }
    });
  }
}

async function saveCanvas() {
  if (!canvas || !isNarrator) return;

  try {
    const canvasJson = JSON.stringify(canvas.toJSON());
    await setDoc(
      doc(db, 'whiteboard', 'main'),
      {
        canvasJson,
        updatedBy: auth.userName,
        updatedAt: new Date(),
      },
      { merge: true },
    );
  } catch (error) {
    console.error('Error saving canvas:', error);
  }
}

async function loadCanvasFromJson(json) {
  if (!canvas) return;

  try {
    const fabric = await import('fabric');
    canvas.loadFromJSON(json, () => {
      canvas.renderAll();
    });
  } catch (error) {
    console.error('Error loading canvas:', error);
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
      canvas.freeDrawingBrush.color = '#ffffff';
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
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill: 'transparent',
        stroke: color,
        strokeWidth: 2,
      });
      break;
    case 'circle':
      shape = new fabric.Circle({
        left: 100,
        top: 100,
        radius: 50,
        fill: 'transparent',
        stroke: color,
        strokeWidth: 2,
      });
      break;
    case 'line':
      shape = new fabric.Line([50, 100, 200, 100], {
        stroke: color,
        strokeWidth: 2,
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
    left: 100,
    top: 100,
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
    canvas.backgroundColor = '#ffffff';
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
  link.download = 'whiteboard.png';
  link.href = dataURL;
  link.click();
}
</script>

<div class="h-full flex flex-col">
  <!-- Toolbar -->
  <div class="flex items-center gap-2 p-2 border-b bg-card">
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
    
    <div class="w-px h-6 bg-border"></div>
    
    <!-- Colors -->
    <div class="flex gap-1">
      {#each colors as c}
        <button
          onclick={() => color = c}
          class="w-6 h-6 rounded border-2 transition-transform hover:scale-110"
          style="background-color: {c}; border-color: {color === c ? '#3b82f6' : 'transparent'}"
          aria-label="Cor {c}"
        ></button>
      {/each}
    </div>
    
    <div class="w-px h-6 bg-border"></div>
    
    <!-- Brush Size -->
    <div class="flex items-center gap-2">
      <input
        type="range"
        min="1"
        max="20"
        bind:value={brushSize}
        class="w-20"
      />
      <span class="text-xs text-muted-foreground">{brushSize}px</span>
    </div>
    
    <div class="flex-1"></div>
    
    <!-- Actions -->
    <Button variant="ghost" size="sm" onclick={downloadCanvas}>
      <Download class="w-4 h-4 mr-1" />
      Baixar
    </Button>
    
    {#if isNarrator}
      <Button variant="ghost" size="sm" onclick={clearCanvas}>
        <Trash2 class="w-4 h-4 mr-1" />
        Limpar
      </Button>
    {/if}
  </div>
  
  <!-- Canvas Container -->
  <div bind:this={canvasContainer} class="flex-1 bg-muted overflow-hidden">
    <canvas id="whiteboard-canvas"></canvas>
  </div>
</div>
