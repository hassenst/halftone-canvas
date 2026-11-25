export { Halftone, createHalftone } from "./core/halftone";
export { analyzeImage } from "./core/analyzer";
export { loadImageData } from "./core/image-loader";
export { renderGrid, setupCanvas } from "./core/renderer";
export type { RenderTargetCanvas } from "./core/renderer";
export type {
  DotRenderContext,
  DotShape,
  HalftoneGrid,
  HalftoneOptions,
  ImageSource,
  ResolvedHalftoneOptions,
  SamplingMethod,
} from "./core/types";
