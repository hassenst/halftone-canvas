[halftone-canvas](../README.md) / renderGrid

# Function: renderGrid()

```ts
function renderGrid(
   ctx, 
   grid, 
   options, 
   time?
): boolean;
```

Defined in: [renderer.ts:78](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/renderer.ts#L78)

Renders a single frame of the halftone grid on the 2D context.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `ctx` | `CanvasRenderingContext2D` \| `OffscreenCanvasRenderingContext2D` | `undefined` | The active 2D canvas or off-screen context. |
| `grid` | [`HalftoneGrid`](../interfaces/HalftoneGrid.md) | `undefined` | The halftone grid information. |
| `options` | `Pick`\<[`ResolvedHalftoneOptions`](../interfaces/ResolvedHalftoneOptions.md), \| `"shape"` \| `"dotColor"` \| `"backgroundColor"` \| `"maxDotScale"` \| `"onBeforeDrawDot"`\> | `undefined` | Rendering and style options. |
| `time?` | `number` | `0` | The current timestamp used for animations. |

## Returns

`boolean`

A boolean indicating whether all animation steps are complete.
