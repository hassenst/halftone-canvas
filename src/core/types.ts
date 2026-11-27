/**
 * Supported input sources for the image.
 * - string: Image URL or Data URL
 * - HTMLImageElement: Reference to an existing <img> element in the DOM
 * - ImageBitmap: Image already decoded in memory (ideal for performance)
 */
export type ImageSource = string | HTMLImageElement | ImageBitmap;

/**
 * Shape of the individual grid dots.
 */
export type DotShape = "circle" | "square";

/**
 * Statistical method for calculating the brightness per grid cell (tile).
 */
export type SamplingMethod = "mean" | "median";

/**
 * Configuration options for the halftone rasterizer.
 */
export interface HalftoneOptions {
  /**
   * Size of a single grid square in pixels (Default: 10).
   * Ignored if `columns` is specified.
   */
  tileSize?: number;

  /**
   * Alternative to `tileSize`: Sets a fixed number of columns.
   * The `tileSize` is then dynamically calculated based on the image width.
   */
  columns?: number;

  /**
   * Shape of the rendered dots (Default: 'circle').
   */
  shape?: DotShape;

  /**
   * Method for calculating the tile intensity (Default: 'mean').
   */
  sampling?: SamplingMethod;

  /**
   * Color of the dots as a CSS color value (Default: '#000000').
   */
  dotColor?: string;

  /**
   * Background color of the canvas or 'transparent' (Default: '#ffffff').
   */
  backgroundColor?: string;

  /**
   * Scaling factor for the maximum dot size (Default: 1.0).
   * Values > 1.0 (e.g., 1.41 for circles) cause dark areas to merge completely.
   */
  maxDotScale?: number;

  /**
   * Inverts the brightness values (White = large dot, Black = no dot) (Default: false).
   */
  invert?: boolean;

  /**
   * Optional modifier callback called before drawing each individual dot.
   * Allows for animations (e.g., waves, mouse interaction, pulsing) without needing to re-analyze the image.
   */
  onBeforeDrawDot?: (context: DotRenderContext) => void;
}

/**
 * Internal, fully resolved configuration without optional fields.
 */
export interface ResolvedHalftoneOptions {
  tileSize: number;
  columns: number | null;
  shape: DotShape;
  sampling: SamplingMethod;
  dotColor: string;
  backgroundColor: string;
  maxDotScale: number;
  invert: boolean;
  onBeforeDrawDot: ((context: DotRenderContext) => void) | null;
}

/**
 * Result of the image analysis (Phase 2).
 * Contains only pure data, independent of rendering.
 */
export interface HalftoneGrid {
  /** Number of columns in the grid. */
  readonly cols: number;
  /** Number of rows in the grid. */
  readonly rows: number;
  /** Calculated width/height of a tile in pixels. */
  readonly tileSize: number;
  /** Total width of the grid in pixels. */
  readonly width: number;
  /** Total height of the grid in pixels. */
  readonly height: number;
  /**
   * Flat array of length `cols * rows`.
   * Each value ranges between 0.0 (pure white -> no dot)
   * and 1.0 (pure black -> maximum dot).
   */
  readonly intensities: Float32Array;
}

/**
 * Mutable state of a single dot during the rendering process.
 * Passed to `onBeforeDrawDot` for animation control.
 */
export interface DotRenderContext {
  /** Column index (0-indexed). */
  readonly col: number;
  /** Row index (0-indexed). */
  readonly row: number;
  /** Base intensity from the image (0.0 to 1.0). */
  readonly intensity: number;
  /** Elapsed time in milliseconds (for animations). */
  readonly time: number;
  /** X-coordinate of the dot's center on the canvas (changeable for position offsets). */
  x: number;
  /** Y-coordinate of the dot's center on the canvas (changeable for position offsets). */
  y: number;
  /** Calculated radius or half-side length (changeable for size animations). */
  radius: number;
  /** Color of this specific dot (changeable for gradients/highlights). */
  color: string;
  /** Can be set to `false` in the callback as long as the dot is still animating. */
  done?: boolean;
}
