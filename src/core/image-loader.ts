import type { ImageSource } from "./types";

/**
 * Lädt eine beliebige ImageSource und extrahiert die rohen Pixeldaten (ImageData).
 */
export async function loadImageData(source: ImageSource): Promise<ImageData> {
  const drawable = await resolveDrawable(source);
  const { width, height } = getDimensions(drawable);

  if (width === 0 || height === 0) {
    throw new Error("Image has invalid dimensions (width or height is 0).");
  }

  return extractImageData(drawable, width, height);
}

/**
 * Normalisiert die Eingabequelle in ein zeichenbares Objekt (HTMLImageElement oder ImageBitmap).
 */
async function resolveDrawable(
  source: ImageSource,
): Promise<HTMLImageElement | ImageBitmap> {
  if (typeof source === "string") {
    return loadImageFromUrl(source);
  }

  if (source instanceof HTMLImageElement) {
    // Falls das <img>-Element im DOM noch nicht fertig geladen ist, warten wir darauf
    if (!source.complete) {
      await source.decode();
    }
    if (source.naturalWidth === 0) {
      throw new Error(
        `Failed to load HTMLImageElement from src: ${source.src}`,
      );
    }
    return source;
  }

  if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) {
    return source;
  }

  throw new TypeError(
    "Unsupported ImageSource. Expected a URL string, HTMLImageElement, or ImageBitmap.",
  );
}

/**
 * Lädt ein Bild asynchron über eine URL (inkl. CORS-Header für getImageData).
 */
function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // Ermöglicht getImageData() für Bilder von fremden Domains (sofern der Server CORS erlaubt).
    if (!url.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error(`Failed to load image from URL: ${url}`));
    img.src = url;
  });
}

/**
 * Liest die intrinsische Breite und Höhe unabhängig vom Element-Typ aus.
 */
function getDimensions(drawable: HTMLImageElement | ImageBitmap): {
  width: number;
  height: number;
} {
  if (drawable instanceof HTMLImageElement) {
    return {
      width: drawable.naturalWidth,
      height: drawable.naturalHeight,
    };
  }
  return {
    width: drawable.width,
    height: drawable.height,
  };
}

/**
 * Zeichnet das Bild auf ein unsichtbares Canvas und gibt die ImageData zurück.
 */
function extractImageData(
  drawable: HTMLImageElement | ImageBitmap,
  width: number,
  height: number,
): ImageData {
  // Nutzt OffscreenCanvas falls verfügbar (funktioniert auch in Web Workern),
  // sonst klassisches DOM-Canvas als Fallback.
  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(width, height)
      : createDomCanvas(width, height);

  const ctx = canvas.getContext("2d", { willReadFrequently: true }) as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;

  if (!ctx) {
    throw new Error(
      "Could not initialize 2D canvas context for image analysis.",
    );
  }

  ctx.drawImage(drawable, 0, 0, width, height);

  try {
    return ctx.getImageData(0, 0, width, height);
  } catch (error) {
    throw new Error(
      "Unable to read image pixel data. If loading from an external URL, ensure the server sends proper CORS headers.",
      { cause: error },
    );
  }
}

function createDomCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}
