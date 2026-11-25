import type { HalftoneGrid, ResolvedHalftoneOptions } from './types';

/**
 * Analysiert ImageData und berechnet die normalisierten Intensitätswerte
 * (0.0 = weiß / kein Punkt, 1.0 = schwarz / maximaler Punkt) pro Raster-Tile.
 */
export function analyzeImage(
  imageData: ImageData,
  options: Pick<ResolvedHalftoneOptions, 'tileSize' | 'columns' | 'sampling' | 'invert'>,
): HalftoneGrid {
  const { width, height, data } = imageData;

  // 1. Tile-Größe und Raster-Dimensionen bestimmen
  const tileSize = resolveTileSize(width, options);
  const cols = Math.max(1, Math.floor(width / tileSize));
  const rows = Math.max(1, Math.floor(height / tileSize));

  // Exakte Rastermaße (falls Bildbreite kein exaktes Vielfaches von tileSize ist)
  const gridWidth = cols * tileSize;
  const gridHeight = rows * tileSize;

  const intensities = new Float32Array(cols * rows);

  // Wiederverwendbarer Puffer für den Median (vermeidet tausende Array-Allokationen)
  const maxPixelsPerTile = Math.ceil(tileSize) * Math.ceil(tileSize);
  const medianBuffer =
    options.sampling === 'median' ? new Float32Array(maxPixelsPerTile) : null;

  // 2. Über alle Rasterzellen iterieren
  for (let row = 0; row < rows; row++) {
    const startY = Math.floor(row * tileSize);
    const endY = Math.min(Math.floor((row + 1) * tileSize), height);

    for (let col = 0; col < cols; col++) {
      const startX = Math.floor(col * tileSize);
      const endX = Math.min(Math.floor((col + 1) * tileSize), width);

      // Helligkeit (0.0 = schwarz, 1.0 = weiß) berechnen
      const brightness =
        medianBuffer !== null
          ? computeTileMedian(data, width, startX, startY, endX, endY, medianBuffer)
          : computeTileMean(data, width, startX, startY, endX, endY);

      // Intensität umkehren: 0.0 = weiß (kein Punkt), 1.0 = schwarz (voller Punkt)
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
 * Berechnet die effektive Tile-Größe basierend auf `columns` oder `tileSize`.
 */
function resolveTileSize(
  imageWidth: number,
  options: Pick<ResolvedHalftoneOptions, 'tileSize' | 'columns'>,
): number {
  if (options.columns !== null && options.columns > 0) {
    return imageWidth / options.columns;
  }
  return Math.max(1, options.tileSize);
}

/**
 * Berechnet die wahrgenommene Helligkeit (Luminanz) eines einzelnen Pixels (0.0 bis 1.0).
 * Berücksichtigt Alpha-Transparenz (transparent wird als Weiß behandelt).
 */
function getPixelBrightness(data: Uint8ClampedArray, offset: number): number {
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  const a = data[offset + 3] / 255;

  // Rec. 601 Luminanz-Formel (normalisiert auf 0..1)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Alpha-Blending gegen weißen Hintergrund (1.0)
  return luminance * a + (1 - a);
}

/**
 * Berechnet den arithmetischen Mittelwert der Helligkeit innerhalb eines Tiles.
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
 * Berechnet den Median der Helligkeit innerhalb eines Tiles.
 * Erhält harte Kanten und Linien besser als der Mittelwert.
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

  // Nur den befüllten Teil des Puffers sortieren
  const slice = buffer.subarray(0, count);
  slice.sort();

  const mid = Math.floor(count / 2);
  if (count % 2 === 0) {
    return (slice[mid - 1] + slice[mid]) / 2;
  }
  return slice[mid];
}

function clampZeroOne(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}