import type {
  DotRenderContext,
  HalftoneGrid,
  ResolvedHalftoneOptions,
} from "./types";

/**
 * Represents the target for rendering (either a standard HTML canvas or an OffscreenCanvas).
 */
export type RenderTargetCanvas = HTMLCanvasElement | OffscreenCanvas;

/**
 * Represents the target element for the halftone output.
 */
export type HalftoneTarget = RenderTargetCanvas | HTMLElement;

/**
 * Adjusts the physical resolution and CSS size of the target canvas to match the grid
 * and the display's pixel density (Retina / High-DPI).
 *
 * @param canvas - The target HTMLCanvasElement or OffscreenCanvas.
 * @param grid - The halftone grid information.
 * @param dpr - The device pixel ratio (defaults to getDevicePixelRatio()).
 * @returns The 2D canvas context.
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

    // Set CSS size only for actual DOM Canvas elements
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

  // Reset transformation and apply DPR scaling
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return ctx;
}

/**
 * Renders a single frame of the halftone grid on the 2D context.
 *
 * @param ctx - The active 2D canvas or off-screen context.
 * @param grid - The halftone grid information.
 * @param options - Rendering and style options.
 * @param time - The current timestamp used for animations.
 * @returns A boolean indicating whether all animation steps are complete.
 */
export function renderGrid(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  grid: HalftoneGrid,
  options: Pick<
    ResolvedHalftoneOptions,
    "shape" | "dotColor" | "backgroundColor" | "maxDotScale" | "onBeforeDrawDot"
  >,
  time: number = 0,
): boolean {
  const { cols, rows, tileSize, width, height, intensities } = grid;
  const { shape, dotColor, backgroundColor, maxDotScale, onBeforeDrawDot } =
    options;

  // 1. Clear or fill the background
  if (backgroundColor === "transparent") {
    ctx.clearRect(0, 0, width, height);
  } else {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  const halfTile = tileSize * 0.5;
  const maxRadius = halfTile * maxDotScale;
  const twoPi = Math.PI * 2;

  // Fast-Path: No individual modifications per dot -> a single path for all dots
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
    return true;
  }

  // Animated / Dynamic Path: Hook is called for each dot
  const dotContext: DotRenderContext = {
    col: 0,
    row: 0,
    intensity: 0,
    time,
    x: 0,
    y: 0,
    radius: 0,
    color: dotColor,
    done: undefined,
  };

  let currentFillColor = dotColor;
  let hasExplicitDone = false;
  let allDone = true;

  ctx.fillStyle = currentFillColor;
  ctx.beginPath();

  for (let row = 0; row < rows; row++) {
    const baseY = row * tileSize + halfTile;
    const rowOffset = row * cols;

    for (let col = 0; col < cols; col++) {
      const intensity = intensities[rowOffset + col];

      // Update dot context object (Zero-Allocation)
      (dotContext as { col: number }).col = col;
      (dotContext as { row: number }).row = row;
      (dotContext as { intensity: number }).intensity = intensity;
      (dotContext as { time: number }).time = time;
      dotContext.x = col * tileSize + halfTile;
      dotContext.y = baseY;
      dotContext.radius = intensity * maxRadius;
      dotContext.color = dotColor;
      dotContext.done = undefined;

      onBeforeDrawDot(dotContext);

      if (dotContext.done !== undefined) {
        hasExplicitDone = true;
        if (!dotContext.done) {
          allDone = false;
        }
      }

      if (dotContext.radius <= 0) continue;

      // If the hook changed the color for this dot, flush the previous path
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
  return hasExplicitDone && allDone;
}

/**
 * Adds a circle or a centered square to the current canvas path.
 *
 * @param ctx - The 2D context.
 * @param shape - The type of the dot ('circle' or 'square').
 * @param cx - The X-coordinate of the dot.
 * @param cy - The Y-coordinate of the dot.
 * @param radius - The radius (or half-side length) of the dot.
 * @param twoPi - The value of 2 * PI.
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

/**
 * Retrieves the device pixel ratio. Returns 1 if not available (e.g., in a non-browser environment).
 *
 * @returns The device pixel ratio.
 */
function getDevicePixelRatio(): number {
  return typeof window !== "undefined" && window.devicePixelRatio
    ? window.devicePixelRatio
    : 1;
}
