<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import HalftoneCanvas from '$lib/components/HalftoneCanvas.svelte';
</script>

<svelte:head>
  <title>Halftone Image Generator</title>
  <meta name="description" content="Create halftone images from images or videos." />
</svelte:head>

<div class="container mx-auto grid grid-cols-[320px_1fr] gap-4 p-8">
  <Sidebar />
  <main class="card min-h-[600px] flex-1 overflow-hidden shadow-sm">
    <div
      id="halftoneCanvasContainer"
      class="flex h-full w-full items-center justify-center bg-white"
    >
      <HalftoneCanvas />
    </div>
  </main>
</div>
