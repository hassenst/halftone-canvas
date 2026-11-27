[halftone-canvas](../README.md) / HalftoneGrid

# Interface: HalftoneGrid

Defined in: [types.ts:98](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/types.ts#L98)

Result of the image analysis (Phase 2).
Contains only pure data, independent of rendering.

## Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="cols"></a> `cols` | `readonly` | `number` | Number of columns in the grid. | [types.ts:100](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/types.ts#L100) |
| <a id="height"></a> `height` | `readonly` | `number` | Total height of the grid in pixels. | [types.ts:108](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/types.ts#L108) |
| <a id="intensities"></a> `intensities` | `readonly` | `Float32Array` | Flat array of length `cols * rows`. Each value ranges between 0.0 (pure white -> no dot) and 1.0 (pure black -> maximum dot). | [types.ts:114](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/types.ts#L114) |
| <a id="rows"></a> `rows` | `readonly` | `number` | Number of rows in the grid. | [types.ts:102](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/types.ts#L102) |
| <a id="tilesize"></a> `tileSize` | `readonly` | `number` | Calculated width/height of a tile in pixels. | [types.ts:104](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/types.ts#L104) |
| <a id="width"></a> `width` | `readonly` | `number` | Total width of the grid in pixels. | [types.ts:106](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/types.ts#L106) |
