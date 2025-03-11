import { writable } from 'svelte/store';
import { DitherType } from './halftoneProcessor';

export const defaults = {
  gridSize: 5,
  brightness: 20,
  contrast: 0,
  gamma: 1.0,
  smoothing: 0,
  ditherType: DitherType.None
};

export const gridSize = writable(defaults.gridSize);
export const brightness = writable(defaults.brightness);
export const contrast = writable(defaults.contrast);
export const gamma = writable(defaults.gamma);
export const smoothing = writable(defaults.smoothing);
export const ditherType = writable(defaults.ditherType);

export const mediaSource = writable<HTMLImageElement | HTMLVideoElement | null>(null);
export const isVideo = writable(false);

export function resetDefaults() {
  gridSize.set(defaults.gridSize);
  brightness.set(defaults.brightness);
  contrast.set(defaults.contrast);
  gamma.set(defaults.gamma);
  smoothing.set(defaults.smoothing);
  ditherType.set(defaults.ditherType);
}
