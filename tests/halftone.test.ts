import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as analyzerModule from "../src/core/analyzer";
import { createHalftone, Halftone } from "../src/core/halftone";
import * as imageLoaderModule from "../src/core/image-loader";
import * as rendererModule from "../src/core/renderer";

function createMockImageData(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  data.fill(128);
  return new ImageData(data, width, height);
}

describe("Halftone", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(imageLoaderModule, "loadImageData").mockResolvedValue(
      createMockImageData(40, 40),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Target-Handling (Canvas vs. Container)", () => {
    it("verwendet ein direkt übergebenes <canvas>-Element und entfernt es bei destroy() nicht", async () => {
      const container = document.createElement("div");
      const canvas = document.createElement("canvas");
      container.appendChild(canvas);

      const halftone = await createHalftone(canvas, "/test.jpg");

      expect(halftone.getCanvas()).toBe(canvas);
      expect(container.contains(canvas)).toBe(true);

      halftone.destroy();
      expect(container.contains(canvas)).toBe(true);
    });

    it("erzeugt automatisch ein <canvas> in einem Container-Element und entfernt es bei destroy()", async () => {
      const container = document.createElement("div");
      const halftone = await createHalftone(container, "/test.jpg");

      const createdCanvas = halftone.getCanvas();
      expect(createdCanvas).toBeInstanceOf(HTMLCanvasElement);
      expect(container.contains(createdCanvas as Node)).toBe(true);

      halftone.destroy();
      expect(container.contains(createdCanvas as Node)).toBe(false);
    });

    it("wirft einen TypeError bei ungültigem Target", () => {
      expect(() => new Halftone(null as unknown as HTMLElement)).toThrow(
        TypeError,
      );
    });
  });

  describe("Caching & updateOptions()", () => {
    it("rendert nur neu (ohne Re-Analyse), wenn sich reine Darstellungsoptionen ändern", async () => {
      const analyzeSpy = vi.spyOn(analyzerModule, "analyzeImage");
      const renderSpy = vi.spyOn(rendererModule, "renderGrid");

      const canvas = document.createElement("canvas");
      const halftone = await createHalftone(canvas, "/test.jpg", {
        tileSize: 10,
        dotColor: "#000000",
      });

      expect(analyzeSpy).toHaveBeenCalledTimes(1);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Nur Farbe und Form ändern -> keine erneute Bildanalyse nötig
      halftone.updateOptions({ dotColor: "#ff0000", shape: "square" });

      expect(analyzeSpy).toHaveBeenCalledTimes(1);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it("berechnet das Raster neu, wenn sich Analyse-Parameter (z. B. columns oder sampling) ändern", async () => {
      const analyzeSpy = vi.spyOn(analyzerModule, "analyzeImage");

      const canvas = document.createElement("canvas");
      const halftone = await createHalftone(canvas, "/test.jpg", {
        tileSize: 10,
      });

      expect(analyzeSpy).toHaveBeenCalledTimes(1);

      halftone.updateOptions({ columns: 8 });
      expect(analyzeSpy).toHaveBeenCalledTimes(2);
      expect(halftone.getGrid()?.cols).toBe(8);

      halftone.updateOptions({ sampling: "median" });
      expect(analyzeSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe("Animations-Lifecycle (start, stop, Auto-Stop)", () => {
    it("startet und stoppt die requestAnimationFrame-Schleife manuell", async () => {
      const rafCallbacks: FrameRequestCallback[] = [];
      vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        rafCallbacks.push(cb);
        return rafCallbacks.length;
      });
      const cancelSpy = vi
        .spyOn(window, "cancelAnimationFrame")
        .mockImplementation(() => {});

      const canvas = document.createElement("canvas");
      const halftone = await createHalftone(canvas, "/test.jpg", {
        onBeforeDrawDot: (dot) => {
          dot.radius *= 0.9;
        },
      });

      expect(halftone.isAnimating()).toBe(false);

      halftone.start();
      expect(halftone.isAnimating()).toBe(true);
      expect(rafCallbacks).toHaveLength(1);

      // Nächsten Frame simulieren
      rafCallbacks[0](performance.now() + 16);
      expect(rafCallbacks).toHaveLength(2);

      halftone.stop();
      expect(halftone.isAnimating()).toBe(false);
      expect(cancelSpy).toHaveBeenCalled();
    });

    it("stoppt die Animation automatisch, sobald alle Punkte done = true melden", async () => {
      const rafCallbacks: FrameRequestCallback[] = [];
      vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        rafCallbacks.push(cb);
        return rafCallbacks.length;
      });
      vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

      let isFinished = false;
      const canvas = document.createElement("canvas");
      const halftone = await createHalftone(canvas, "/test.jpg", {
        onBeforeDrawDot: (dot) => {
          dot.done = isFinished;
        },
      });

      halftone.start();
      expect(halftone.isAnimating()).toBe(true);

      // Frame 1: noch nicht fertig -> läuft weiter
      rafCallbacks[0](16);
      expect(halftone.isAnimating()).toBe(true);

      // Frame 2: alle Punkte fertig -> stoppt selbstständig
      isFinished = true;
      rafCallbacks[1](32);
      expect(halftone.isAnimating()).toBe(false);
    });
  });

  describe("destroy()", () => {
    it("wirft Fehler bei Methodenaufrufen nach destroy()", async () => {
      const canvas = document.createElement("canvas");
      const halftone = await createHalftone(canvas, "/test.jpg");

      halftone.destroy();

      await expect(halftone.render("/test.jpg")).rejects.toThrow(
        "Halftone instance has already been destroyed.",
      );
      expect(() => halftone.start()).toThrow(
        "Halftone instance has already been destroyed.",
      );
      expect(() => halftone.updateOptions({ dotColor: "#123456" })).toThrow(
        "Halftone instance has already been destroyed.",
      );
    });
  });
});
