<script>
import { onMount, onDestroy } from 'svelte';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import HpNode from '$lib/tiptap/extensions/HpNode.js';
import MoneyNode from '$lib/tiptap/extensions/MoneyNode.js';
import StatNode from '$lib/tiptap/extensions/StatNode.js';
import CountNode from '$lib/tiptap/extensions/CountNode.js';
import XpNode from '$lib/tiptap/extensions/XpNode.js';

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Highlighter,
  Undo,
  Redo,
} from 'lucide-svelte';

import Button from '$components/ui/Button.svelte';
import ShortcodeInserter from './ShortcodeInserter.svelte';

let { content = $bindable(''), editable = true, placeholder = '' } = $props();

let element;
let editor = $state(null);
let showShortcodeModal = $state(false);
let linkUrl = $state('');
let showLinkInput = $state(false);

onMount(() => {
  editor = new Editor({
    element: element,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || ' ',
      }),
      Highlight,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign,
      Underline,
      HpNode,
      MoneyNode,
      StatNode,
      CountNode,
      XpNode,
    ],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      content = editor.getHTML();
    },
  });
});

onDestroy(() => {
  if (editor) {
    editor.destroy();
  }
});

function toggleBold() {
  editor?.chain().focus().toggleBold().run();
}

function toggleItalic() {
  editor?.chain().focus().toggleItalic().run();
}

function toggleUnderline() {
  editor?.chain().focus().toggleUnderline().run();
}

function toggleStrike() {
  editor?.chain().focus().toggleStrike().run();
}

function toggleBulletList() {
  editor?.chain().focus().toggleBulletList().run();
}

function toggleOrderedList() {
  editor?.chain().focus().toggleOrderedList().run();
}

function toggleBlockquote() {
  editor?.chain().focus().toggleBlockquote().run();
}

function toggleCode() {
  editor?.chain().focus().toggleCode().run();
}

function setHeading(level) {
  editor?.chain().focus().toggleHeading({ level }).run();
}

function setTextAlign(align) {
  editor?.chain().focus().setTextAlign(align).run();
}

function toggleHighlight() {
  editor?.chain().focus().toggleHighlight().run();
}

function setLink() {
  if (linkUrl) {
    editor?.chain().focus().setLink({ href: linkUrl }).run();
  } else {
    editor?.chain().focus().unsetLink().run();
  }
  showLinkInput = false;
  linkUrl = '';
}

function undo() {
  editor?.chain().focus().undo().run();
}

function redo() {
  editor?.chain().focus().redo().run();
}

function insertShortcode(type, data) {
  let html = '';

  switch (type) {
    case 'hp':
      html = `<span data-type="hp" data-current="${data.current || 100}" data-max="${data.max || 100}">[hp current="${data.current || 100}" max="${data.max || 100}"]</span> `;
      break;
    case 'stat':
      html = `<span data-type="stat" data-name="${data.name || 'FOR'}" data-value="${data.value || 10}" data-mod="${data.mod || 0}">[stat "${data.name || 'FOR'}" ${data.value || 10}]</span> `;
      break;
    case 'money':
      html = `<span data-type="money" data-current="${data.current || 0}" data-currency="${data.currency || 'po'}">[money ${data.current || 0} ${data.currency || 'po'}]</span> `;
      break;
    case 'count':
      html = `<span data-type="count" data-name="${data.name || 'Items'}" data-current="${data.current || 0}" data-max="${data.max || 10}">[count "${data.name || 'Items'}" current="${data.current || 0}" max="${data.max || 10}"]</span> `;
      break;
    case 'xp':
      html = `<span data-type="xp" data-current="${data.current || 0}" data-total="${data.total || 1000}">[xp ${data.current || 0}/${data.total || 1000}]</span> `;
      break;
  }

  if (html && editor) {
    editor.chain().focus().insertContent(html).run();
  }

  showShortcodeModal = false;
}

const isActive = $derived((type, attrs = {}) => {
  if (!editor) return false;
  return editor.isActive(type, attrs);
});
</script>

<div class="rounded-lg border bg-card">
  {#if editor && editable}
    <div class="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
      <!-- Heading -->
      <div class="flex gap-1">
        <Button 
          size="sm" 
          variant={isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
          onclick={() => setHeading(1)}
          title="Título 1"
        >
          <Heading1 class="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant={isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
          onclick={() => setHeading(2)}
          title="Título 2"
        >
          <Heading2 class="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant={isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
          onclick={() => setHeading(3)}
          title="Título 3"
        >
          <Heading3 class="w-4 h-4" />
        </Button>
      </div>
      
      <div class="w-px h-6 bg-border"></div>
      
      <!-- Text Format -->
      <div class="flex gap-1">
        <Button 
          size="sm" 
          variant={isActive('bold') ? 'default' : 'ghost'}
          onclick={toggleBold}
          title="Negrito"
        >
          <Bold class="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant={isActive('italic') ? 'default' : 'ghost'}
          onclick={toggleItalic}
          title="Itálico"
        >
          <Italic class="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant={isActive('underline') ? 'default' : 'ghost'}
          onclick={toggleUnderline}
          title="Sublinhado"
        >
          <UnderlineIcon class="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant={isActive('strike') ? 'default' : 'ghost'}
          onclick={toggleStrike}
          title="Tachado"
        >
          <Strikethrough class="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant={isActive('highlight') ? 'default' : 'ghost'}
          onclick={toggleHighlight}
          title="Highlight"
        >
          <Highlighter class="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant={isActive('code') ? 'default' : 'ghost'}
          onclick={toggleCode}
          title="Código"
        >
          <Code class="w-4 h-4" />
        </Button>
      </div>
      
      <div class="w-px h-6 bg-border"></div>
      
      <!-- Lists -->
      <div class="flex gap-1">
        <Button 
          size="sm" 
          variant={isActive('bulletList') ? 'default' : 'ghost'}
          onclick={toggleBulletList}
          title="Lista"
        >
          <List class="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant={isActive('orderedList') ? 'default' : 'ghost'}
          onclick={toggleOrderedList}
          title="Lista Ordenada"
        >
          <ListOrdered class="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant={isActive('blockquote') ? 'default' : 'ghost'}
          onclick={toggleBlockquote}
          title="Citação"
        >
          <Quote class="w-4 h-4" />
        </Button>
      </div>
      
      <div class="w-px h-6 bg-border"></div>
      
      <!-- Align -->
      <div class="flex gap-1">
        <Button 
          size="sm" 
          variant={isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
          onclick={() => setTextAlign('left')}
          title="Alinhar Esquerda"
        >
          <AlignLeft class="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant={isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
          onclick={() => setTextAlign('center')}
          title="Alinhar Centro"
        >
          <AlignCenter class="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant={isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
          onclick={() => setTextAlign('right')}
          title="Alinhar Direita"
        >
          <AlignRight class="w-4 h-4" />
        </Button>
      </div>
      
      <div class="w-px h-6 bg-border"></div>
      
      <!-- Link -->
      {#if showLinkInput}
        <div class="flex gap-1">
          <input 
            type="url" 
            bind:value={linkUrl}
            placeholder="URL..."
            class="h-8 px-2 text-sm rounded border bg-background w-32"
            onkeydown={(e) => e.key === 'Enter' && setLink()}
          />
          <Button size="sm" onclick={setLink}>OK</Button>
          <Button size="sm" variant="ghost" onclick={() => showLinkInput = false}>X</Button>
        </div>
      {:else}
        <Button 
          size="sm" 
          variant={isActive('link') ? 'default' : 'ghost'}
          onclick={() => showLinkInput = true}
          title="Link"
        >
          <LinkIcon class="w-4 h-4" />
        </Button>
      {/if}
      
      <div class="w-px h-6 bg-border"></div>
      
      <!-- Undo/Redo -->
      <div class="flex gap-1">
        <Button size="sm" variant="ghost" onclick={undo} title="Desfazer">
          <Undo class="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onclick={redo} title="Refazer">
          <Redo class="w-4 h-4" />
        </Button>
      </div>
      
      <div class="w-px h-6 bg-border"></div>
      
      <!-- Shortcodes -->
      <Button 
        size="sm" 
        variant="outline"
        onclick={() => showShortcodeModal = true}
        title="Inserir Shortcode RPG"
      >
        + RPG
      </Button>
    </div>
  {/if}
  
  <div 
    bind:this={element} 
    class="prose prose-invert max-w-none p-4 min-h-[200px] focus:outline-none"
  ></div>
</div>

{#if showShortcodeModal}
  <ShortcodeInserter 
    onInsert={insertShortcode}
    onClose={() => showShortcodeModal = false}
  />
{/if}

<style>
  :global(.ProseMirror) {
    min-height: 180px;
    outline: none;
  }
  
  :global(.ProseMirror p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    float: left;
    color: hsl(var(--muted-foreground));
    pointer-events: none;
    height: 0;
  }
  
  :global(.ProseMirror h1) {
    font-size: 1.8em;
    font-weight: 600;
    margin-top: 1em;
    margin-bottom: 0.5em;
  }
  
  :global(.ProseMirror h2) {
    font-size: 1.5em;
    font-weight: 600;
    margin-top: 1em;
    margin-bottom: 0.5em;
  }
  
  :global(.ProseMirror h3) {
    font-size: 1.25em;
    font-weight: 600;
    margin-top: 1em;
    margin-bottom: 0.5em;
  }
  
  :global(.ProseMirror ul, .ProseMirror ol) {
    padding-left: 1.5em;
  }
  
  :global(.ProseMirror blockquote) {
    border-left: 3px solid hsl(var(--primary));
    padding-left: 1em;
    color: hsl(var(--muted-foreground));
    margin: 0.5em 0;
  }
  
  :global(.ProseMirror code) {
    background-color: hsl(var(--muted));
    padding: 0.2em 0.4em;
    border-radius: 0.25em;
    font-size: 0.9em;
  }
  
  :global(.ProseMirror mark) {
    background-color: rgba(255, 221, 87, 0.4);
    padding: 0.1em 0.2em;
    border-radius: 0.2em;
  }
  
  :global(.ProseMirror a) {
    color: hsl(var(--primary));
    text-decoration: underline;
  }
</style>
