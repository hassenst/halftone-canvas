import { analyzeImage } from "./analyzer";
import { loadImageData } from "./image-loader";
import {
  renderGrid,
  setupCanvas,
  type HalftoneTarget,
  type RenderTargetCanvas,
} from "./renderer";
import type {
  HalftoneGrid,
  HalftoneOptions,
  ImageSource,
  ResolvedHalftoneOptions,
} from "./types";

/**
 * The default configuration options for the Halftone class.
 * These values are used when the user does not provide specific options.
 * They can be overridden by passing a HalftoneOptions object to the constructor or updateOptions method.
 * @internal
 */
const DEFAULT_OPTIONS: ResolvedHalftoneOptions = {
  tileSize: 10,
  columns: null,
  shape: "circle",
  sampling: "mean",
  dotColor: "#000000",
  backgroundColor: "#ffffff",
  maxDotScale: 1.0,
  invert: false,
  onBeforeDrawDot: null,
};

/**
 * Manages the lifecycle, image analysis, and rendering of a halftone effect.
 * This class encapsulates the logic for loading an image, analyzing it to create a halftone grid, and rendering that grid onto a canvas.
 * It also provides methods to update rendering options, start and stop animations, and clean up resources.
 * @public
 */
export class Halftone {
  /** The target canvas element used for rendering. */
  private readonly canvas: RenderTargetCanvas;
  /** Indicates whether this class owns the canvas element. */
  private readonly ownsCanvas: boolean;
  /** The resolved configuration options. */
  private options: ResolvedHalftoneOptions;
  /** The raw image data. */
  private imageData: ImageData | null = null;
  /** The calculated halftone grid. */
  private grid: HalftoneGrid | null = null;
  /** The 2D rendering context. */
  private ctx:
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null = null;

  /** The ID of the current animation frame request. */
  private animationFrameId: number | null = null;
  /** The timestamp when the animation started. */
  private animationStartTime: number = 0;
  /** Flag indicating if the instance has been destroyed. */
  private isDestroyed: boolean = false;

  /**
   * Creates a new Halftone instance.
   *
   * @param target - Either an <canvas> element or a container element (e.g., <div>) into which a <canvas> will be automatically inserted.
   * @param options - Configuration options for the halftone effect.
   * @returns A new Halftone instance.
   */
  constructor(target: HalftoneTarget, options: HalftoneOptions = {}) {
    const resolved = resolveTarget(target);
    this.canvas = resolved.canvas;
    this.ownsCanvas = resolved.ownsCanvas;
    this.options = resolveOptions(options);
  }

  /**
   * Returns the used (or automatically created within the container) canvas element.
   * @returns The canvas element.
   */
  public getCanvas(): RenderTargetCanvas {
    return this.canvas;
  }

  /**
   * Loads an image, calculates the halftone grid, and renders it onto the canvas.
   *
   * @param source - The image source to load.
   * @returns A promise that resolves to the resulting HalftoneGrid.
   */
  public async render(source: ImageSource): Promise<HalftoneGrid> {
    this.assertNotDestroyed();

    this.imageData = await loadImageData(source);
    this.assertNotDestroyed();

    this.recomputeGrid();
    this.drawFrame(0);

    return this.grid!;
  }

  /**
   * Updates the options dynamically. Recomputes the grid only if analysis parameters have changed.
   *
   * @param newOptions - The partial set of options to update.
   * @returns void
   */
  public updateOptions(newOptions: Partial<HalftoneOptions>): void {
    this.assertNotDestroyed();

    const needsReanalysis =
      (newOptions.tileSize !== undefined &&
        newOptions.tileSize !== this.options.tileSize) ||
      (newOptions.columns !== undefined &&
        newOptions.columns !== this.options.columns) ||
      (newOptions.sampling !== undefined &&
        newOptions.sampling !== this.options.sampling) ||
      (newOptions.invert !== undefined &&
        newOptions.invert !== this.options.invert);

    this.options = {
      ...this.options,
      ...newOptions,
      columns:
        newOptions.columns !== undefined
          ? newOptions.columns
          : newOptions.tileSize !== undefined
            ? null
            : this.options.columns,
    };

    if (!this.imageData) return;

    if (needsReanalysis) {
      this.recomputeGrid();
    }

    if (!this.isAnimating()) {
      this.drawFrame(0);
    }
  }

  /**
   * Starts the animation loop.
   * @returns void
   */
  public start(): void {
    this.assertNotDestroyed();

    if (this.isAnimating()) return;

    this.animationStartTime = performance.now();

    const loop = (now: number): void => {
      if (this.isDestroyed || this.animationFrameId === null) return;

      const elapsed = now - this.animationStartTime;
      const allDone = this.drawFrame(elapsed);

      if (allDone) {
        this.stop();
        return;
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * Stops the running animation loop.
   * @returns void
   */
  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Checks if the animation is currently running.
   * @returns boolean indicating whether the animation is currently running.
   */
  public isAnimating(): boolean {
    return this.animationFrameId !== null;
  }

  /**
   * Gets the current halftone grid. Returns null if no image has been rendered yet.
   * @returns HalftoneGrid or null if no image has been rendered yet.
   */
  public getGrid(): HalftoneGrid | null {
    return this.grid;
  }

  /**
   * Cleans up animations, references, and removes a self-generated <canvas> from the DOM.
   * This method should be called when the Halftone instance is no longer needed to free up resources.
   * After calling this method, the Halftone instance should not be used again.
   * @returns void
   */
  public destroy(): void {
    this.stop();
    this.isDestroyed = true;

    if (this.ownsCanvas && "remove" in this.canvas) {
      this.canvas.remove();
    }

    this.imageData = null;
    this.grid = null;
    this.ctx = null;
  }

  /**
   * Recomputes the halftone grid based on the current image data and options.
   * @returns void
   */
  private recomputeGrid(): void {
    if (!this.imageData) return;

    this.grid = analyzeImage(this.imageData, this.options);
    this.ctx = setupCanvas(this.canvas, this.grid);
  }

  /**
   * Draws a single frame of the animation.
   * @param time
   * @returns boolean
   */
  private drawFrame(time: number): boolean {
    if (!this.ctx || !this.grid) return true;
    return renderGrid(this.ctx, this.grid, this.options, time);
  }

  /**
   * Asserts that the Halftone instance has not been destroyed.
   * @returns void
   * @throws {Error} If the Halftone instance has already been destroyed.
   */
  private assertNotDestroyed(): void {
    if (this.isDestroyed) {
      throw new Error("Halftone instance has already been destroyed.");
    }
  }
}

export async function createHalftone(
  target: HalftoneTarget,
  source: ImageSource,
  options?: HalftoneOptions,
): Promise<Halftone> {
  const instance = new Halftone(target, options);
  await instance.render(source);
  return instance;
}

/**
 * Checks if the target is already a canvas or a container element where a new <canvas> should be created.
 *
 * @param target - The target element to resolve.
 * @returns An object containing the canvas and a flag indicating if ownership is held.
 * @throws {TypeError} If the target is not a valid HTMLCanvasElement, OffscreenCanvas, or HTMLElement.
 */
function resolveTarget(target: HalftoneTarget): {
  canvas: RenderTargetCanvas;
  ownsCanvas: boolean;
} {
  if (
    (typeof HTMLCanvasElement !== "undefined" &&
      target instanceof HTMLCanvasElement) ||
    (typeof OffscreenCanvas !== "undefined" &&
      target instanceof OffscreenCanvas)
  ) {
    return { canvas: target, ownsCanvas: false };
  }

  if (typeof HTMLElement !== "undefined" && target instanceof HTMLElement) {
    const canvas = target.ownerDocument.createElement("canvas");
    target.appendChild(canvas);
    return { canvas, ownsCanvas: true };
  }

  throw new TypeError(
    "Invalid target: Expected an HTMLCanvasElement, OffscreenCanvas, or container HTMLElement.",
  );
}

function resolveOptions(options: HalftoneOptions): ResolvedHalftoneOptions {
  return {
    tileSize: options.tileSize ?? DEFAULT_OPTIONS.tileSize,
    columns: options.columns ?? DEFAULT_OPTIONS.columns,
    shape: options.shape ?? DEFAULT_OPTIONS.shape,
    sampling: options.sampling ?? DEFAULT_OPTIONS.sampling,
    dotColor: options.dotColor ?? DEFAULT_OPTIONS.dotColor,
    backgroundColor: options.backgroundColor ?? DEFAULT_OPTIONS.backgroundColor,
    maxDotScale: options.maxDotScale ?? DEFAULT_OPTIONS.maxDotScale,
    invert: options.invert ?? DEFAULT_OPTIONS.invert,
    onBeforeDrawDot: options.onBeforeDrawDot ?? DEFAULT_OPTIONS.onBeforeDrawDot,
  };
}
