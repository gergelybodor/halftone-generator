export enum DitherType {
  None = 'None',
  FloydSteinberg = 'FloydSteinberg',
  Ordered = 'Ordered',
  Noise = 'Noise'
}

// Generate halftone: compute grayscale per grid cell by iterating over full-resolution data.
export function generateHalftone(
  targetCanvas: HTMLCanvasElement,
  source: HTMLImageElement | HTMLVideoElement | null,
  isVideo: boolean,
  gridSize: number,
  brightness: number,
  contrast: number,
  gamma: number,
  smoothing: number,
  ditherType: DitherType,
  scaleFactor = 1
) {
  if (!source) return;

  const previewWidth = targetCanvas.width;
  const previewHeight = targetCanvas.height;
  const targetWidth = previewWidth * scaleFactor;
  const targetHeight = previewHeight * scaleFactor;

  targetCanvas.width = targetWidth;
  targetCanvas.height = targetHeight;

  // Draw the full-resolution image/video onto a temporary canvas.
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = targetWidth;
  tempCanvas.height = targetHeight;
  const tempCtx = tempCanvas.getContext('2d');

  if (!tempCtx || !targetWidth || !targetHeight) return;

  tempCtx.drawImage(source, 0, 0, targetWidth, targetHeight);

  const imgData = tempCtx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imgData.data;

  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  // Compute grayscale value per pixel.
  const grayData = new Float32Array(targetWidth * targetHeight);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;
    gray = contrastFactor * (gray - 128) + 128 + brightness;
    gray = Math.max(0, Math.min(255, gray));
    gray = 255 * Math.pow(gray / 255, 1 / gamma);
    grayData[i / 4] = gray;
  }

  // Divide the image into grid cells.
  const grid = gridSize * scaleFactor;
  const numCols = Math.ceil(targetWidth / grid);
  const numRows = Math.ceil(targetHeight / grid);
  let cellValues = new Float32Array(numRows * numCols);

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      let sum = 0,
        count = 0;
      const startY = row * grid;
      const startX = col * grid;
      const endY = Math.min(startY + grid, targetHeight);
      const endX = Math.min(startX + grid, targetWidth);
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          sum += grayData[y * targetWidth + x];
          count++;
        }
      }
      cellValues[row * numCols + col] = sum / count;
    }
  }

  // Apply smoothing if enabled.
  if (smoothing > 0) {
    cellValues = applyBoxBlur(cellValues, numRows, numCols, smoothing);
  }

  // Apply dithering if selected.
  if (ditherType === DitherType.FloydSteinberg) {
    applyFloydSteinbergDithering(cellValues, numRows, numCols);
  } else if (ditherType === DitherType.Ordered) {
    applyOrderedDithering(cellValues, numRows, numCols);
  } else if (ditherType === DitherType.Noise) {
    applyNoiseDithering(cellValues, numRows, numCols);
  }

  // Draw the halftone dots.
  const ctx = targetCanvas.getContext('2d');

  if (!ctx) return;

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const brightnessValue = cellValues[row * numCols + col];
      const norm = brightnessValue / 255;
      const maxRadius = grid / 2;
      const radius = maxRadius * (1 - norm);
      if (radius > 0.5) {
        ctx.beginPath();
        const centerX = col * grid + grid / 2;
        const centerY = row * grid + grid / 2;
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
      }
    }
  }
}

// 3× Box Blur for smoothing grid cell values.
export function applyBoxBlur(
  cellValues: Float32Array<ArrayBuffer>,
  numRows: number,
  numCols: number,
  strength: number
) {
  let result = new Float32Array(cellValues);
  const passes = Math.floor(strength);
  for (let p = 0; p < passes; p++) {
    const temp = new Float32Array(result.length);
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        let sum = 0,
          count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const r = row + dy,
              c = col + dx;
            if (r >= 0 && r < numRows && c >= 0 && c < numCols) {
              sum += result[r * numCols + c];
              count++;
            }
          }
        }
        temp[row * numCols + col] = sum / count;
      }
    }
    result = temp;
  }
  const frac = strength - Math.floor(strength);
  if (frac > 0) {
    for (let i = 0; i < result.length; i++) {
      result[i] = cellValues[i] * (1 - frac) + result[i] * frac;
    }
  }
  return result;
}

export function applyFloydSteinbergDithering(
  cellValues: Float32Array<ArrayBuffer>,
  numRows: number,
  numCols: number
) {
  const threshold = 128;
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const index = row * numCols + col;
      const oldVal = cellValues[index];
      const newVal = oldVal < threshold ? 0 : 255;
      const error = oldVal - newVal;
      cellValues[index] = newVal;
      if (col + 1 < numCols) {
        cellValues[row * numCols + (col + 1)] += error * (7 / 16);
      }
      if (row + 1 < numRows) {
        if (col - 1 >= 0) {
          cellValues[(row + 1) * numCols + (col - 1)] += error * (3 / 16);
        }
        cellValues[(row + 1) * numCols + col] += error * (5 / 16);
        if (col + 1 < numCols) {
          cellValues[(row + 1) * numCols + (col + 1)] += error * (1 / 16);
        }
      }
    }
  }
}

export function applyOrderedDithering(
  cellValues: Float32Array<ArrayBuffer>,
  numRows: number,
  numCols: number
) {
  const bayerMatrix = [
    [0, 2],
    [3, 1]
  ];
  const matrixSize = 2;
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const index = row * numCols + col;
      const threshold =
        (bayerMatrix[row % matrixSize][col % matrixSize] + 0.5) * (255 / (matrixSize * matrixSize));
      cellValues[index] = cellValues[index] < threshold ? 0 : 255;
    }
  }
}

export function applyNoiseDithering(
  cellValues: Float32Array<ArrayBuffer>,
  numRows: number,
  numCols: number
) {
  const threshold = 128;
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const index = row * numCols + col;
      const noise = (Math.random() - 0.5) * 50;
      const adjustedVal = cellValues[index] + noise;
      cellValues[index] = adjustedVal < threshold ? 0 : 255;
    }
  }
}
