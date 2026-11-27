[halftone-canvas](../README.md) / setupCanvas

# Function: setupCanvas()

```ts
function setupCanvas(
   canvas, 
   grid, 
   dpr?
): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
```

Defined in: [renderer.ts:26](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/renderer.ts#L26)

Adjusts the physical resolution and CSS size of the target canvas to match the grid
and the display's pixel density (Retina / High-DPI).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `canvas` | [`RenderTargetCanvas`](../type-aliases/RenderTargetCanvas.md) | The target HTMLCanvasElement or OffscreenCanvas. |
| `grid` | [`HalftoneGrid`](../interfaces/HalftoneGrid.md) | The halftone grid information. |
| `dpr?` | `number` | The device pixel ratio (defaults to getDevicePixelRatio()). |

## Returns

`CanvasRenderingContext2D` \| `OffscreenCanvasRenderingContext2D`

The 2D canvas context.
