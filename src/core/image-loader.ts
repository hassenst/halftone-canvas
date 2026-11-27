import type { ImageSource } from "./types";

/**
 * Loads an ImageSource and extracts the raw pixel data (ImageData).
 *
 * @param source - The image source as a URL, HTMLImageElement, or ImageBitmap.
 * @returns A promise that resolves to the ImageData of the loaded image.
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
 * Normalizes the input source into a drawable object (HTMLImageElement or ImageBitmap).
 *
 * @param source - The image source to resolve.
 * @returns A promise that resolves to the drawable HTMLImageElement or ImageBitmap.
 */
async function resolveDrawable(
  source: ImageSource,
): Promise<HTMLImageElement | ImageBitmap> {
  if (typeof source === "string") {
    return loadImageFromUrl(source);
  }

  if (source instanceof HTMLImageElement) {
    // If the <img> element in the DOM is not yet fully loaded, wait for it.
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
 * Loads an image asynchronously from a URL (including CORS headers for getImageData).
 *
 * @param url - The source URL of the image.
 * @returns A promise that resolves to an HTMLImageElement.
 */
function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // Enables getImageData() for images from different domains (provided the server allows CORS).
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
 * Reads the intrinsic width and height regardless of the element type.
 *
 * @param drawable - The HTMLImageElement or ImageBitmap to measure.
 * @returns An object containing the width and height of the image.
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
 * Draws the image onto an invisible canvas and returns the ImageData.
 *
 * @param drawable - The HTMLImageElement or ImageBitmap to draw.
 * @param width - The image width.
 * @param height - The image height.
 * @returns The ImageData from the canvas.
 */
function extractImageData(
  drawable: HTMLImageElement | ImageBitmap,
  width: number,
  height: number,
): ImageData {
  // Uses OffscreenCanvas if available (works also in Web Workers),
  // otherwise uses a standard DOM canvas as a fallback.
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
