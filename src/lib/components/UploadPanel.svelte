<script lang="ts">
  import { mediaSource, isVideo } from '$lib/utils/stores';
  import { onMount } from 'svelte';

  let dragging = false;
  let fileInput: HTMLInputElement;

  function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);

    if (file.type.startsWith('video/')) {
      $isVideo = true;
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = fileUrl;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('webkit-playsinline', 'true');

      video.addEventListener('loadeddata', () => {
        video.play();
        $mediaSource = video;
      });

      video.addEventListener('error', (e) => {
        console.error('Error loading video', e);
      });
    } else if (file.type.startsWith('image/')) {
      $isVideo = false;
      const img = new Image();
      img.src = fileUrl;
      img.addEventListener('load', () => {
        $mediaSource = img;
      });
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragging = true;
  }

  function handleDragLeave() {
    dragging = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragging = false;

    const file = event.dataTransfer?.files?.[0];
    if (!file) return;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event('change'));
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      fileInput.click();
    }
  }

  onMount(() => {
    const videoUrl = '/cat-dance.mp4';
    $isVideo = true;

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', 'true');

    video.addEventListener('loadeddata', () => {
      video.play();
      $mediaSource = video;
    });

    video.addEventListener('error', (e) => {
      console.error('Error loading video', e);
    });
  });
</script>

<div class="card bg-base-100 shadow-sm">
  <div
    class="bg-base-100 hover:bg-base-300 rounded-lg transition-colors"
    class:bg-neutral-50={dragging}
    role="button"
    aria-labelledby="upload-label"
    tabindex="0"
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    on:keydown={handleKeyDown}
  >
    <label
      for="fileUpload"
      id="upload-label"
      class="flex cursor-pointer flex-col items-center gap-2 p-10 text-center"
    >
      <span class="text-2xl">📁</span>
      <span>Drop image/video or click to upload</span>
    </label>
    <input
      type="file"
      id="fileUpload"
      accept="image/*,video/*"
      class="hidden"
      bind:this={fileInput}
      on:change={handleFileUpload}
    />
  </div>
</div>
