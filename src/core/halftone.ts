import { analyzeImage } from "./analyzer";
import { loadImageData } from "./image-loader";
import { renderGrid, setupCanvas, type RenderTargetCanvas } from "./renderer";
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

  constructor(canvas: RenderTargetCanvas, options: HalftoneOptions = {}) {
    this.canvas = canvas;
    this.options = resolveOptions(options);
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

    // Falls keine Animation läuft, sofort das aktualisierte statische Bild zeichnen
    if (!this.isAnimating()) {
      this.drawFrame(0);
    }
  }

  /**
   * Startet die Animations-Schleife (ruft pro Frame `onBeforeDrawDot` mit aktueller Zeit auf).
   */
  public start(): void {
    this.assertNotDestroyed();

    if (this.isAnimating()) return;

    this.animationStartTime = performance.now();

    const loop = (now: number): void => {
      if (this.isDestroyed || this.animationFrameId === null) return;

      const elapsed = now - this.animationStartTime;
      this.drawFrame(elapsed);

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

  /**
   * Gibt zurück, ob aktuell eine Animation läuft.
   */
  public isAnimating(): boolean {
    return this.animationFrameId !== null;
  }

  /**
   * Gibt das aktuell berechnete Raster zurück (oder null, falls noch kein Bild geladen wurde).
   */
  public getGrid(): HalftoneGrid | null {
    return this.grid;
  }

  /**
   * Bereinigt Animationen und Referenzen (wichtig für SPA-Frameworks wie React).
   */
  public destroy(): void {
    this.stop();
    this.isDestroyed = true;
    this.imageData = null;
    this.grid = null;
    this.ctx = null;
  }

  private recomputeGrid(): void {
    if (!this.imageData) return;

    this.grid = analyzeImage(this.imageData, this.options);
    this.ctx = setupCanvas(this.canvas, this.grid);
  }

  private drawFrame(time: number): void {
    if (!this.ctx || !this.grid) return;
    renderGrid(this.ctx, this.grid, this.options, time);
  }

  private assertNotDestroyed(): void {
    if (this.isDestroyed) {
      throw new Error("Halftone instance has already been destroyed.");
    }
  }
}

/**
 * Komfort-Funktion für den schnellen Einzeiler-Einsatz ohne `new`.
 */
export async function createHalftone(
  canvas: RenderTargetCanvas,
  source: ImageSource,
  options?: HalftoneOptions,
): Promise<Halftone> {
  const instance = new Halftone(canvas, options);
  await instance.render(source);
  return instance;
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
