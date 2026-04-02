<script>
  import { Tabs, TabsList, TabsTrigger, TabsContent } from '$components/ui/tabs/index.js';
  import Button from '$components/ui/Button.svelte';
  import Input from '$components/ui/Input.svelte';
  
  let { onInsert, onClose } = $props();
  
  let activeTab = $state('hp');
  
  let hpCurrent = $state(100);
  let hpMax = $state(100);
  
  let statName = $state('FOR');
  let statValue = $state(10);
  let statMod = $state(0);
  
  let moneyCurrent = $state(0);
  let moneyCurrency = $state('po');
  
  let countName = $state('Items');
  let countCurrent = $state(0);
  let countMax = $state(10);
  
  let xpCurrent = $state(0);
  let xpTotal = $state(1000);
  
  function insert() {
    switch (activeTab) {
      case 'hp':
        onInsert('hp', { current: hpCurrent, max: hpMax });
        break;
      case 'stat':
        onInsert('stat', { name: statName, value: statValue, mod: statMod });
        break;
      case 'money':
        onInsert('money', { current: moneyCurrent, currency: moneyCurrency });
        break;
      case 'count':
        onInsert('count', { name: countName, current: countCurrent, max: countMax });
        break;
      case 'xp':
        onInsert('xp', { current: xpCurrent, total: xpTotal });
        break;
    }
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center">
  <button 
    class="absolute inset-0 bg-black/50"
    onclick={onClose}
    aria-label="Fechar"
  ></button>
  
  <div class="relative bg-popover border rounded-lg shadow-xl w-[450px] max-h-[80vh] overflow-auto">
    <div class="p-4 border-b border-border">
      <h2 class="text-lg font-semibold text-foreground">Inserir Shortcode RPG</h2>
      <p class="text-sm text-muted-foreground">Escolha o tipo de dado interativo</p>
    </div>
    
    <Tabs bind:value={activeTab} class="p-4">
      <TabsList class="w-full">
        <TabsTrigger value="hp" activeValue={activeTab}>HP</TabsTrigger>
        <TabsTrigger value="stat" activeValue={activeTab}>Atributo</TabsTrigger>
        <TabsTrigger value="money" activeValue={activeTab}>Dinheiro</TabsTrigger>
        <TabsTrigger value="count" activeValue={activeTab}>Contador</TabsTrigger>
        <TabsTrigger value="xp" activeValue={activeTab}>XP</TabsTrigger>
      </TabsList>
      
      <TabsContent value="hp" activeValue={activeTab} class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">HP Atual</label>
            <Input type="number" bind:value={hpCurrent} min="0" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">HP Máximo</label>
            <Input type="number" bind:value={hpMax} min="1" />
          </div>
        </div>
        <p class="text-xs text-muted-foreground">
          Exibe uma barra de pontos de vida interativa
        </p>
      </TabsContent>
      
      <TabsContent value="stat" activeValue={activeTab} class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">Nome do Atributo</label>
          <Input bind:value={statName} placeholder="FOR, DEX, INT..." />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Valor</label>
            <Input type="number" bind:value={statValue} />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Modificador</label>
            <Input type="number" bind:value={statMod} />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="money" activeValue={activeTab} class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Quantidade</label>
            <Input type="number" bind:value={moneyCurrent} min="0" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Moeda</label>
            <select bind:value={moneyCurrency} class="h-10 w-full rounded-md border bg-popover px-3 py-2 text-foreground border-input">
              <option value="po">Ouro (PO)</option>
              <option value="pp">Prata (PP)</option>
              <option value="pc">Cobre (PC)</option>
              <option value="pe">Platina (PE)</option>
            </select>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="count" activeValue={activeTab} class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">Nome</label>
          <Input bind:value={countName} placeholder="Flechas, Poções..." />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Atual</label>
            <Input type="number" bind:value={countCurrent} min="0" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Máximo</label>
            <Input type="number" bind:value={countMax} min="1" />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="xp" activeValue={activeTab} class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">XP Atual</label>
            <Input type="number" bind:value={xpCurrent} min="0" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">XP Total</label>
            <Input type="number" bind:value={xpTotal} min="1" />
          </div>
        </div>
      </TabsContent>
    </Tabs>
    
    <div class="p-4 border-t border-border flex justify-end gap-2">
      <Button variant="outline" onclick={onClose}>
        Cancelar
      </Button>
      <Button onclick={insert}>
        Inserir
      </Button>
    </div>
  </div>
</div>
