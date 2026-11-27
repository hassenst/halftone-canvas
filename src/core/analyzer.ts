import type { HalftoneGrid, ResolvedHalftoneOptions } from "./types";

/**
 * Analyzes ImageData and calculates the normalized intensity values
 * (0.0 = white / no dot, 1.0 = black / max dot) per grid tile.
 *
 * @param imageData - The raw image data to analyze.
 * @param options - Configuration options for the grid generation.
 * @returns A HalftoneGrid containing calculated intensities and dimensions.
 */
export function analyzeImage(
  imageData: ImageData,
  options: Pick<
    ResolvedHalftoneOptions,
    "tileSize" | "columns" | "sampling" | "invert"
  >,
): HalftoneGrid {
  const { width, height, data } = imageData;

  // 1. Determine tile size and grid dimensions
  const tileSize = resolveTileSize(width, options);
  const cols = Math.max(1, Math.floor(width / tileSize));
  const rows = Math.max(1, Math.floor(height / tileSize));

  // Exact grid dimensions (if image width is not an exact multiple of tileSize)
  const gridWidth = cols * tileSize;
  const gridHeight = rows * tileSize;

  const intensities = new Float32Array(cols * rows);

  // Reusable buffer for the median (prevents thousands of array allocations)
  const maxPixelsPerTile = Math.ceil(tileSize) * Math.ceil(tileSize);
  const medianBuffer =
    options.sampling === "median" ? new Float32Array(maxPixelsPerTile) : null;

  // 2. Iterate over all grid cells
  for (let row = 0; row < rows; row++) {
    const startY = Math.floor(row * tileSize);
    const endY = Math.min(Math.floor((row + 1) * tileSize), height);

    for (let col = 0; col < cols; col++) {
      const startX = Math.floor(col * tileSize);
      const endX = Math.min(Math.floor((col + 1) * tileSize), width);

      // Calculate brightness (0.0 = black, 1.0 = white)
      const brightness =
        medianBuffer !== null
          ? computeTileMedian(
              data,
              width,
              startX,
              startY,
              endX,
              endY,
              medianBuffer,
            )
          : computeTileMean(data, width, startX, startY, endX, endY);

      // Invert intensity: 0.0 = white (no dot), 1.0 = black (full dot)
      const intensity = options.invert ? brightness : 1 - brightness;

      intensities[row * cols + col] = clampZeroOne(intensity);
    }
  }

  return {
    cols,
    rows,
    tileSize,
    width: gridWidth,
    height: gridHeight,
    intensities,
  };
}

/**
 * Calculates the effective tile size based on `columns` or `tileSize`.
 *
 * @param imageWidth - The width of the source image.
 * @param options - Configuration options for tile size calculation.
 * @returns The calculated tile size.
 */
function resolveTileSize(
  imageWidth: number,
  options: Pick<ResolvedHalftoneOptions, "tileSize" | "columns">,
): number {
  if (options.columns !== null && options.columns > 0) {
    return imageWidth / options.columns;
  }
  return Math.max(1, options.tileSize);
}

/**
 * Calculates the perceived brightness (Luminance) of a single pixel (0.0 to 1.0).
 * Takes alpha transparency into account (transparent is treated as white).
 *
 * @param data - The raw RGBA pixel data.
 * @param offset - The starting index of the pixel in the data array.
 * @returns The calculated luminance value.
 */
function getPixelBrightness(data: Uint8ClampedArray, offset: number): number {
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  const a = data[offset + 3] / 255;

  // Rec. 601 Luminance formula (normalized to 0..1)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Alpha blending against white background (1.0)
  return luminance * a + (1 - a);
}

/**
 * Calculates the arithmetic mean of the brightness within a tile.
 *
 * @param data - The raw RGBA pixel data.
 * @param imageWidth - The width of the source image.
 * @param startX - The starting X-coordinate of the tile.
 * @param startY - The starting Y-coordinate of the tile.
 * @param endX - The ending X-coordinate of the tile.
 * @param endY - The ending Y-coordinate of the tile.
 * @returns The mean brightness value.
 */
function computeTileMean(
  data: Uint8ClampedArray,
  imageWidth: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): number {
  let sum = 0;
  let count = 0;

  for (let y = startY; y < endY; y++) {
    const rowOffset = y * imageWidth;
    for (let x = startX; x < endX; x++) {
      const pixelOffset = (rowOffset + x) * 4;
      sum += getPixelBrightness(data, pixelOffset);
      count++;
    }
  }

  return count > 0 ? sum / count : 1;
}

/**
 * Calculates the median brightness within a tile.
 * Provides better edge and line definition than the mean value.
 *
 * @param data - The raw RGBA pixel data.
 * @param imageWidth - The width of the source image.
 * @param startX - The starting X-coordinate of the tile.
 * @param startY - The starting Y-coordinate of the tile.
 * @param endX - The ending X-coordinate of the tile.
 * @param endY - The ending Y-coordinate of the tile.
 * @param buffer - A pre-allocated array to store pixel values for sorting.
 * @returns The median brightness value.
 */
function computeTileMedian(
  data: Uint8ClampedArray,
  imageWidth: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  buffer: Float32Array,
): number {
  let count = 0;

  for (let y = startY; y < endY; y++) {
    const rowOffset = y * imageWidth;
    for (let x = startX; x < endX; x++) {
      const pixelOffset = (rowOffset + x) * 4;
      if (count < buffer.length) {
        buffer[count] = getPixelBrightness(data, pixelOffset);
        count++;
      }
    }
  }

  if (count === 0) return 1;

  // Sort only the populated part of the buffer
  const slice = buffer.subarray(0, count);
  slice.sort();

  const mid = Math.floor(count / 2);
  if (count % 2 === 0) {
    return (slice[mid - 1] + slice[mid]) / 2;
  }
  return slice[mid];
}

/**
 * Clamps a numerical value to stay within the 0 to 1 range.
 *
 * @param value - The numeric value to clamp.
 * @returns The clamped value (minimum 0, maximum 1).
 */
function clampZeroOne(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}
