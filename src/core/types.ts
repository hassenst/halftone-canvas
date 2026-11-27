/**
 * Unterstützte Eingabequellen für das Bild.
 * - string: Bild-URL oder Data-URL
 * - HTMLImageElement: Referenz auf ein bestehendes <img>-Element im DOM
 * - ImageBitmap: Bereits im Speicher dekodiertes Bild (ideal für Performance)
 */
export type ImageSource = string | HTMLImageElement | ImageBitmap;

/**
 * Form der einzelnen Raster-Elemente.
 */
export type DotShape = "circle" | "square";

/**
 * Statistische Methode zur Berechnung der Helligkeit pro Rasterzelle (Tile).
 */
export type SamplingMethod = "mean" | "median";

/**
 * Konfigurationsoptionen für den Halbton-Rasterizer.
 */
export interface HalftoneOptions {
  /**
   * Größe eines einzelnen Raster-Quadrats in Pixeln (Standard: 10).
   * Wird ignoriert, falls `columns` angegeben ist.
   */
  tileSize?: number;

  /**
   * Alternative zu `tileSize`: Legt eine feste Spaltenanzahl fest.
   * Die `tileSize` wird dann dynamisch aus der Bildbreite berechnet.
   */
  columns?: number;

  /**
   * Form der gerenderten Punkte (Standard: 'circle').
   */
  shape?: DotShape;

  /**
   * Berechnungsmethode für die Tile-Intensität (Standard: 'mean').
   */
  sampling?: SamplingMethod;

  /**
   * Farbe der Punkte als CSS-Farbwert (Standard: '#000000').
   */
  dotColor?: string;

  /**
   * Hintergrundfarbe des Canvas oder 'transparent' (Standard: '#ffffff').
   */
  backgroundColor?: string;

  /**
   * Skalierungsfaktor für die maximale Punktgröße (Standard: 1.0).
   * Werte > 1.0 (z. B. 1.41 bei Kreisen) lassen dunkle Bereiche komplett verschmelzen.
   */
  maxDotScale?: number;

  /**
   * Kehrt die Helligkeitswerte um (Weiß = großer Punkt, Schwarz = kein Punkt) (Standard: false).
   */
  invert?: boolean;

  /**
   * Optionaler Modifier-Callback, der vor dem Zeichnen jedes einzelnen Punktes aufgerufen wird.
   * Ermöglicht Animationen (z. B. Wellen, Maus-Interaktion, Pulsieren),
   * ohne das Bild neu analysieren zu müssen.
   */
  onBeforeDrawDot?: (context: DotRenderContext) => void;
}

/**
 * Interne, vollständig aufgelöste Konfiguration ohne optionale Felder.
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
 * Ergebnis der Bildanalyse (Phase 2).
 * Enthält ausschließlich reine Daten, unabhängig vom Rendering.
 */
export interface HalftoneGrid {
  /** Anzahl der Spalten im Raster */
  readonly cols: number;
  /** Anzahl der Zeilen im Raster */
  readonly rows: number;
  /** Berechnete Breite/Höhe eines Tiles in Pixeln */
  readonly tileSize: number;
  /** Gesamtbreite des Rasters in Pixeln */
  readonly width: number;
  /** Gesamthöhe des Rasters in Pixeln */
  readonly height: number;
  /**
   * Flaches Array der Länge `cols * rows`.
   * Jeder Wert liegt zwischen 0.0 (reines Weiß -> kein Punkt)
   * und 1.0 (reines Schwarz -> maximaler Punkt).
   */
  readonly intensities: Float32Array;
}

/**
 * Veränderbarer Zustand eines einzelnen Punktes während des Render-Vorgangs.
 * Wird an `onBeforeDrawDot` übergeben, um Animationen zu steuern.
 */
export interface DotRenderContext {
  /** Spalten-Index (0-basiert) */
  readonly col: number;
  /** Zeilen-Index (0-basiert) */
  readonly row: number;
  /** Basis-Intensität aus dem Bild (0.0 bis 1.0) */
  readonly intensity: number;
  /** Verstrichene Zeit in Millisekunden (für Animationen) */
  readonly time: number;
  /** X-Mittelpunkt des Punktes auf dem Canvas (veränderbar für Position-Offsets) */
  x: number;
  /** Y-Mittelpunkt des Punktes auf dem Canvas (veränderbar für Position-Offsets) */
  y: number;
  /** Berechneter Radius bzw. halbe Seitenlänge (veränderbar für Größen-Animationen) */
  radius: number;
  /** Farbe dieses spezifischen Punktes (veränderbar für Farbverläufe/Highlights) */
  color: string;
  /** Kann im Callback auf `false` gesetzt werden, solange der Punkt noch animiert */
  done?: boolean;
}
