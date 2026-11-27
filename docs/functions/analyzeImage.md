[halftone-canvas](../README.md) / analyzeImage

# Function: analyzeImage()

```ts
function analyzeImage(imageData, options): HalftoneGrid;
```

Defined in: [analyzer.ts:11](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/analyzer.ts#L11)

Analyzes ImageData and calculates the normalized intensity values
(0.0 = white / no dot, 1.0 = black / max dot) per grid tile.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `imageData` | `ImageData` | The raw image data to analyze. |
| `options` | `Pick`\<[`ResolvedHalftoneOptions`](../interfaces/ResolvedHalftoneOptions.md), `"tileSize"` \| `"columns"` \| `"sampling"` \| `"invert"`\> | Configuration options for the grid generation. |

## Returns

[`HalftoneGrid`](../interfaces/HalftoneGrid.md)

A HalftoneGrid containing calculated intensities and dimensions.
