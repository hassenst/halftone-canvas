[halftone-canvas](../README.md) / analyzeImage

# Function: analyzeImage()

```ts
function analyzeImage(imageData, options): HalftoneGrid;
```

Defined in: [analyzer.ts:11](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/analyzer.ts#L11)

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
