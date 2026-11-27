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

export class Halftone {
  private readonly canvas: RenderTargetCanvas;
  private readonly ownsCanvas: boolean;
  private options: ResolvedHalftoneOptions;
  private imageData: ImageData | null = null;
  private grid: HalftoneGrid | null = null;
  private ctx:
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null = null;

  private animationFrameId: number | null = null;
  private animationStartTime: number = 0;
  private isDestroyed: boolean = false;

  /**
   * @param target Entweder ein <canvas>-Element oder ein Container-Element (z. B. <div>),
   *               in das automatisch ein <canvas> eingefügt wird.
   */
  constructor(target: HalftoneTarget, options: HalftoneOptions = {}) {
    const resolved = resolveTarget(target);
    this.canvas = resolved.canvas;
    this.ownsCanvas = resolved.ownsCanvas;
    this.options = resolveOptions(options);
  }

  /**
   * Gibt das verwendete (oder automatisch im Container erzeugte) Canvas-Element zurück.
   */
  public getCanvas(): RenderTargetCanvas {
    return this.canvas;
  }

  /**
   * Lädt ein Bild, berechnet das Halbton-Raster und zeichnet es auf das Canvas.
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
   * Aktualisiert Optionen nachträglich.
   * Berechnet das Raster nur neu, wenn sich Analyse-Parameter geändert haben.
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
   * Startet die Animations-Schleife.
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
   * Stoppt die laufende Animations-Schleife.
   */
  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public isAnimating(): boolean {
    return this.animationFrameId !== null;
  }

  public getGrid(): HalftoneGrid | null {
    return this.grid;
  }

  /**
   * Bereinigt Animationen, Referenzen und entfernt ein selbst erzeugtes <canvas> aus dem DOM.
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

  private recomputeGrid(): void {
    if (!this.imageData) return;

    this.grid = analyzeImage(this.imageData, this.options);
    this.ctx = setupCanvas(this.canvas, this.grid);
  }

  private drawFrame(time: number): boolean {
    if (!this.ctx || !this.grid) return true;
    return renderGrid(this.ctx, this.grid, this.options, time);
  }

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
 * Prüft, ob das Ziel bereits ein Canvas ist oder ein Container-Element,
 * in dem ein neues <canvas> angelegt werden soll.
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
