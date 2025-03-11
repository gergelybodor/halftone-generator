<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    mediaSource,
    isVideo,
    gridSize,
    brightness,
    contrast,
    gamma,
    smoothing,
    ditherType
  } from '$lib/utils/stores';
  import { generateHalftone } from '$lib/utils/halftoneProcessor';

  let canvas: HTMLCanvasElement;
  let animationFrameId: number;

  function processFrame() {
    if (!canvas || !$mediaSource) return;

    generateHalftone(
      canvas,
      $mediaSource,
      $isVideo,
      $gridSize,
      $brightness,
      $contrast,
      $gamma,
      $smoothing,
      $ditherType
    );
  }

  function processVideoFrame() {
    if (!$isVideo) return;
    processFrame();
    animationFrameId = requestAnimationFrame(processVideoFrame);
  }

  function setupCanvasDimensions() {
    if (!canvas || !$mediaSource) return;

    const halftoneCanvas = document.getElementById('halftoneCanvasContainer');
    if (!halftoneCanvas) return;

    const maxWidth = halftoneCanvas.getBoundingClientRect().width * 0.95;
    const maxHeight = halftoneCanvas.getBoundingClientRect().height * 0.95;

    let sourceWidth = $isVideo
      ? ($mediaSource as HTMLVideoElement).videoWidth
      : ($mediaSource as HTMLImageElement).width;

    let sourceHeight = $isVideo
      ? ($mediaSource as HTMLVideoElement).videoHeight
      : ($mediaSource as HTMLImageElement).height;

    let newWidth = sourceWidth;
    let newHeight = sourceHeight;

    if (sourceWidth > maxWidth || sourceHeight > maxHeight) {
      const ratio = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
      newWidth = sourceWidth * ratio;
      newHeight = sourceHeight * ratio;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;
  }

  onMount(() => {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    canvas.width = 800;
    canvas.height = 600;
  });

  onDestroy(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });

  $effect(() => {
    if ($mediaSource) {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      setupCanvasDimensions();

      if ($isVideo) {
        processVideoFrame();
      } else {
        processFrame();
      }
    }
  });

  $effect(() => {
    if (canvas && $mediaSource) {
      if ($isVideo) {
        // For video, the animation frame handles the updates
      } else {
        // For images, update the canvas immediately
        processFrame();
      }
    }
  });

  $effect(() => {
    if ($gridSize || $brightness || $contrast || $gamma || $smoothing || $ditherType) {
      processFrame();
    }
  });

  function handleResize() {
    setupCanvasDimensions();
    processFrame();
  }
</script>

<svelte:window on:resize={handleResize} />

<canvas id="halftoneCanvas" bind:this={canvas} class="max-h-full max-w-full object-contain"
></canvas>
