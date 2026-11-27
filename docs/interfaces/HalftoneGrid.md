[halftone-canvas](../README.md) / HalftoneGrid

# Interface: HalftoneGrid

Defined in: [types.ts:92](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/types.ts#L92)

Result of the image analysis (Phase 2).
Contains only pure data, independent of rendering.

## Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="cols"></a> `cols` | `readonly` | `number` | Number of columns in the grid. | [types.ts:94](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/types.ts#L94) |
| <a id="height"></a> `height` | `readonly` | `number` | Total height of the grid in pixels. | [types.ts:102](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/types.ts#L102) |
| <a id="intensities"></a> `intensities` | `readonly` | `Float32Array` | Flat array of length `cols * rows`. Each value ranges between 0.0 (pure white -> no dot) and 1.0 (pure black -> maximum dot). | [types.ts:108](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/types.ts#L108) |
| <a id="rows"></a> `rows` | `readonly` | `number` | Number of rows in the grid. | [types.ts:96](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/types.ts#L96) |
| <a id="tilesize"></a> `tileSize` | `readonly` | `number` | Calculated width/height of a tile in pixels. | [types.ts:98](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/types.ts#L98) |
| <a id="width"></a> `width` | `readonly` | `number` | Total width of the grid in pixels. | [types.ts:100](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/types.ts#L100) |
