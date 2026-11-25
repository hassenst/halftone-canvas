import type {
  DotRenderContext,
  HalftoneGrid,
  ResolvedHalftoneOptions,
} from "./types";

export type RenderTargetCanvas = HTMLCanvasElement | OffscreenCanvas;

/**
 * Passt die physische Auflösung und CSS-Größe des Ziel-Canvas an das Raster
 * und die Pixeldichte des Displays (Retina / High-DPI) an.
 */
export function setupCanvas(
  canvas: RenderTargetCanvas,
  grid: HalftoneGrid,
  dpr: number = getDevicePixelRatio(),
): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D {
  const targetWidth = Math.round(grid.width * dpr);
  const targetHeight = Math.round(grid.height * dpr);

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // CSS-Größe nur bei echten DOM-Canvas-Elementen setzen
    if ("style" in canvas) {
      canvas.style.width = `${grid.width}px`;
      canvas.style.height = `${grid.height}px`;
    }
  }

  const ctx = canvas.getContext("2d") as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;

  if (!ctx) {
    throw new Error("Could not initialize 2D context on target canvas.");
  }

  // Transformation zurücksetzen und DPR-Skalierung anwenden
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return ctx;
}

/**
 * Zeichnet ein einzelnes Frame des Halbton-Rasters auf den 2D-Kontext.
 */
export function renderGrid(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  grid: HalftoneGrid,
  options: Pick<
    ResolvedHalftoneOptions,
    "shape" | "dotColor" | "backgroundColor" | "maxDotScale" | "onBeforeDrawDot"
  >,
  time: number = 0,
): void {
  const { cols, rows, tileSize, width, height, intensities } = grid;
  const { shape, dotColor, backgroundColor, maxDotScale, onBeforeDrawDot } =
    options;

  // 1. Hintergrund leeren oder füllen
  if (backgroundColor === "transparent") {
    ctx.clearRect(0, 0, width, height);
  } else {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  const halfTile = tileSize * 0.5;
  const maxRadius = halfTile * maxDotScale;
  const twoPi = Math.PI * 2;

  // Fast-Path: Keine individuellen Modifikationen pro Punkt -> ein einziger Pfad für alle Punkte
  if (!onBeforeDrawDot) {
    ctx.fillStyle = dotColor;
    ctx.beginPath();

    for (let row = 0; row < rows; row++) {
      const cy = row * tileSize + halfTile;
      const rowOffset = row * cols;

      for (let col = 0; col < cols; col++) {
        const intensity = intensities[rowOffset + col];
        if (intensity <= 0) continue;

        const radius = intensity * maxRadius;
        const cx = col * tileSize + halfTile;

        addDotToPath(ctx, shape, cx, cy, radius, twoPi);
      }
    }

    ctx.fill();
    return;
  }

  // Animierter / Dynamischer Pfad: Hook wird für jeden Punkt aufgerufen
  const dotContext: DotRenderContext = {
    col: 0,
    row: 0,
    intensity: 0,
    time,
    x: 0,
    y: 0,
    radius: 0,
    color: dotColor,
  };

  let currentFillColor = dotColor;
  ctx.fillStyle = currentFillColor;
  ctx.beginPath();

  for (let row = 0; row < rows; row++) {
    const baseY = row * tileSize + halfTile;
    const rowOffset = row * cols;

    for (let col = 0; col < cols; col++) {
      const intensity = intensities[rowOffset + col];

      // Context-Objekt für diesen Punkt aktualisieren (Zero-Allocation)
      (dotContext as { col: number }).col = col;
      (dotContext as { row: number }).row = row;
      (dotContext as { intensity: number }).intensity = intensity;
      (dotContext as { time: number }).time = time;
      dotContext.x = col * tileSize + halfTile;
      dotContext.y = baseY;
      dotContext.radius = intensity * maxRadius;
      dotContext.color = dotColor;

      onBeforeDrawDot(dotContext);

      if (dotContext.radius <= 0) continue;

      // Falls der Hook die Farbe für diesen Punkt geändert hat, bisherigen Pfad flushen
      if (dotContext.color !== currentFillColor) {
        ctx.fill();
        ctx.beginPath();
        currentFillColor = dotContext.color;
        ctx.fillStyle = currentFillColor;
      }

      addDotToPath(
        ctx,
        shape,
        dotContext.x,
        dotContext.y,
        dotContext.radius,
        twoPi,
      );
    }
  }

  ctx.fill();
}

/**
 * Fügt einen Kreis oder ein zentriertes Quadrat zum aktuellen Canvas-Pfad hinzu.
 */
function addDotToPath(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  shape: "circle" | "square",
  cx: number,
  cy: number,
  radius: number,
  twoPi: number,
): void {
  if (shape === "circle") {
    ctx.moveTo(cx + radius, cy);
    ctx.arc(cx, cy, radius, 0, twoPi);
  } else {
    const size = radius * 2;
    ctx.rect(cx - radius, cy - radius, size, size);
  }
}

function getDevicePixelRatio(): number {
  return typeof window !== "undefined" && window.devicePixelRatio
    ? window.devicePixelRatio
    : 1;
}
