import { describe, expect, it } from "vitest";
import { analyzeImage } from "../src/core/analyzer";

/**
 * Hilfsfunktion: Erzeugt ein einfarbiges ImageData-Objekt (RGBA).
 */
function createSolidImageData(
  width: number,
  height: number,
  rgba: [number, number, number, number],
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = rgba[0];
    data[i + 1] = rgba[1];
    data[i + 2] = rgba[2];
    data[i + 3] = rgba[3];
  }
  return new ImageData(data, width, height);
}

describe("analyzeImage", () => {
  const baseOptions = {
    tileSize: 10,
    columns: null,
    sampling: "mean" as const,
    invert: false,
  };

  it("liefert Intensität 0.0 für ein rein weißes Bild", () => {
    const img = createSolidImageData(20, 20, [255, 255, 255, 255]);
    const grid = analyzeImage(img, baseOptions);

    expect(grid.cols).toBe(2);
    expect(grid.rows).toBe(2);
    expect(grid.intensities).toHaveLength(4);
    grid.intensities.forEach((val) => {
      expect(val).toBeCloseTo(0.0, 5);
    });
  });

  it("liefert Intensität 1.0 für ein rein schwarzes Bild", () => {
    const img = createSolidImageData(20, 20, [0, 0, 0, 255]);
    const grid = analyzeImage(img, baseOptions);

    grid.intensities.forEach((val) => {
      expect(val).toBeCloseTo(1.0, 5);
    });
  });

  it("kehrt die Intensitäten mit invert: true um", () => {
    const whiteImg = createSolidImageData(10, 10, [255, 255, 255, 255]);
    const grid = analyzeImage(whiteImg, { ...baseOptions, invert: true });

    expect(grid.intensities[0]).toBeCloseTo(1.0, 5);
  });

  it("behandelt komplett transparente Pixel (Alpha = 0) wie Weiß", () => {
    const transparentBlack = createSolidImageData(10, 10, [0, 0, 0, 0]);
    const grid = analyzeImage(transparentBlack, baseOptions);

    expect(grid.intensities[0]).toBeCloseTo(0.0, 5);
  });

  it("berechnet tileSize dynamisch, wenn columns angegeben ist", () => {
    const img = createSolidImageData(100, 50, [0, 0, 0, 255]);
    const grid = analyzeImage(img, { ...baseOptions, columns: 20 });

    expect(grid.tileSize).toBe(5);
    expect(grid.cols).toBe(20);
    expect(grid.rows).toBe(10);
  });

  it("verarbeitet ungerade Bildmaße ohne NaN oder Out-of-Bounds", () => {
    const img = createSolidImageData(25, 17, [128, 128, 128, 255]);
    const grid = analyzeImage(img, { ...baseOptions, tileSize: 10 });

    expect(grid.cols).toBe(2);
    expect(grid.rows).toBe(1);
    expect(Number.isNaN(grid.intensities[0])).toBe(false);
    expect(grid.intensities[0]).toBeGreaterThan(0.4);
    expect(grid.intensities[0]).toBeLessThan(0.6);
  });

  it("unterscheidet sauber zwischen Mittelwert (mean) und Median bei Ausreißern", () => {
    // 3x3 Tile = 9 Pixel: 8 weiße Pixel + 1 schwarzer Ausreißer-Pixel
    const img = createSolidImageData(3, 3, [255, 255, 255, 255]);
    img.data[0] = 0; // R
    img.data[1] = 0; // G
    img.data[2] = 0; // B

    const meanGrid = analyzeImage(img, {
      ...baseOptions,
      tileSize: 3,
      sampling: "mean",
    });
    const medianGrid = analyzeImage(img, {
      ...baseOptions,
      tileSize: 3,
      sampling: "median",
    });

    // Mittelwert reagiert auf den 1/9 schwarzen Pixel (~0.111)
    expect(meanGrid.intensities[0]).toBeCloseTo(1 / 9, 3);

    // Median ignoriert den einzelnen Ausreißer komplett (bleibt 0.0)
    expect(medianGrid.intensities[0]).toBeCloseTo(0.0, 5);
  });
});
