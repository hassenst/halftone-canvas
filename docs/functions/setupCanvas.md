[halftone-canvas](../README.md) / setupCanvas

# Function: setupCanvas()

```ts
function setupCanvas(
   canvas, 
   grid, 
   dpr?, 
   displayWidth?
): object;
```

Defined in: [renderer.ts:27](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/renderer.ts#L27)

Adjusts the physical resolution and CSS size of the target canvas to match the grid
and the display's pixel density (Retina / High-DPI).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `canvas` | [`RenderTargetCanvas`](../type-aliases/RenderTargetCanvas.md) | The target HTMLCanvasElement or OffscreenCanvas. |
| `grid` | [`HalftoneGrid`](../interfaces/HalftoneGrid.md) | The halftone grid information. |
| `dpr?` | `number` | The device pixel ratio (defaults to getDevicePixelRatio()). |
| `displayWidth?` | `number` | optional width in pixels for the canvas; if not provided, the grid's width is used. |

## Returns

`object`

Object containing the 2D canvas context and the scale factor.

### ctx

```ts
ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
```

### scale

```ts
scale: number;
```
