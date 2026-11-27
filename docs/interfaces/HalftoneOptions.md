[halftone-canvas](../README.md) / HalftoneOptions

# Interface: HalftoneOptions

Defined in: [types.ts:22](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/types.ts#L22)

Configuration options for the halftone rasterizer.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="backgroundcolor"></a> `backgroundColor?` | `string` | Background color of the canvas or 'transparent' (Default: '#ffffff'). | [types.ts:53](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/types.ts#L53) |
| <a id="columns"></a> `columns?` | `number` | Alternative to `tileSize`: Sets a fixed number of columns. The `tileSize` is then dynamically calculated based on the image width. | [types.ts:33](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/types.ts#L33) |
| <a id="dotcolor"></a> `dotColor?` | `string` | Color of the dots as a CSS color value (Default: '#000000'). | [types.ts:48](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/types.ts#L48) |
| <a id="invert"></a> `invert?` | `boolean` | Inverts the brightness values (White = large dot, Black = no dot) (Default: false). | [types.ts:64](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/types.ts#L64) |
| <a id="maxdotscale"></a> `maxDotScale?` | `number` | Scaling factor for the maximum dot size (Default: 1.0). Values > 1.0 (e.g., 1.41 for circles) cause dark areas to merge completely. | [types.ts:59](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/types.ts#L59) |
| <a id="onbeforedrawdot"></a> `onBeforeDrawDot?` | (`context`) => `void` | Optional modifier callback called before drawing each individual dot. Allows for animations (e.g., waves, mouse interaction, pulsing) without needing to re-analyze the image. | [types.ts:70](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/types.ts#L70) |
| <a id="sampling"></a> `sampling?` | [`SamplingMethod`](../type-aliases/SamplingMethod.md) | Method for calculating the tile intensity (Default: 'mean'). | [types.ts:43](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/types.ts#L43) |
| <a id="shape"></a> `shape?` | [`DotShape`](../type-aliases/DotShape.md) | Shape of the rendered dots (Default: 'circle'). | [types.ts:38](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/types.ts#L38) |
| <a id="tilesize"></a> `tileSize?` | `number` | Size of a single grid square in pixels (Default: 10). Ignored if `columns` is specified. | [types.ts:27](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/types.ts#L27) |
