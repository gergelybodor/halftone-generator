<script lang="ts">
  import { resetDefaults } from '$lib/utils/stores';

  function exportImage() {
    const halftoneCanvas = document.getElementById('halftoneCanvas') as
      | HTMLCanvasElement
      | undefined;
    if (!halftoneCanvas) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = halftoneCanvas.width * 2;
    exportCanvas.height = halftoneCanvas.height * 2;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(halftoneCanvas, 0, 0, exportCanvas.width, exportCanvas.height);

    const dataUrl = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'halftone.png';
    link.click();
  }
</script>

<div class="card bg-base-100 shadow-sm">
  <div class="card-body gap-2">
    <button class="btn btn-outline" on:click={resetDefaults}>Reset All</button>
    <button class="btn btn-primary" on:click={exportImage}>Export PNG</button>
  </div>
</div>
