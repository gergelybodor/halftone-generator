<script lang="ts">
  import { gridSize, brightness, contrast, gamma, smoothing, ditherType } from '$lib/utils/stores';
  import { DitherType } from '$lib/utils/halftoneProcessor';
</script>

<div class="card bg-base-100 shadow-sm">
  <div class="card-body">
    <fieldset class="fieldset">
      <label class="fieldset-label" for="gridSize">Grid Size</label>
      <div class="mb-4 flex items-center gap-2">
        <input
          class="range range-sm"
          type="range"
          id="gridSize"
          min="5"
          max="50"
          bind:value={$gridSize}
        />
        <span class="w-6 text-right">{$gridSize}</span>
      </div>

      <label class="fieldset-label" for="brightness">Brightness</label>
      <div class="mb-4 flex items-center gap-2">
        <input
          class="range range-sm"
          type="range"
          id="brightness"
          min="-100"
          max="100"
          bind:value={$brightness}
        />
        <span class="w-6 text-right">{$brightness}</span>
      </div>

      <label class="fieldset-label" for="contrast">Contrast</label>
      <div class="mb-4 flex items-center gap-2">
        <input
          class="range range-sm"
          type="range"
          id="contrast"
          min="-100"
          max="100"
          bind:value={$contrast}
        />
        <span class="w-6 text-right">{$contrast}</span>
      </div>

      <label class="fieldset-label" for="gamma">Gamma</label>
      <div class="mb-4 flex items-center gap-2">
        <input
          class="range range-sm"
          type="range"
          id="gamma"
          min="0.1"
          max="3"
          step="0.1"
          bind:value={$gamma}
        />
        <span class="w-6 text-right">{$gamma}</span>
      </div>

      <label class="fieldset-label" for="smoothing">Smoothing</label>
      <div class="mb-4 flex items-center gap-2">
        <input
          class="range range-sm"
          type="range"
          id="smoothing"
          min="0"
          max="5"
          step="0.5"
          bind:value={$smoothing}
        />
        <span class="w-6 text-right">{$smoothing}</span>
      </div>

      <label class="fieldset-label" for="ditherType">Dithering</label>
      <select id="ditherType" class="select" bind:value={$ditherType}>
        <option value={DitherType.FloydSteinberg}>Smooth Transition (Floyd‑Steinberg)</option>
        <option value={DitherType.Ordered}>Patterned Look (Ordered)</option>
        <option value={DitherType.Noise}>Grainy Texture (Noise)</option>
        <option value={DitherType.None}>No Extra Texture</option>
      </select>
    </fieldset>
  </div>
</div>
