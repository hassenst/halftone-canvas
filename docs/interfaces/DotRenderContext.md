[halftone-canvas](../README.md) / DotRenderContext

# Interface: DotRenderContext

Defined in: [types.ts:121](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/types.ts#L121)

Mutable state of a single dot during the rendering process.
Passed to `onBeforeDrawDot` for animation control.

## Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="col"></a> `col` | `readonly` | `number` | Column index (0-indexed). | [types.ts:123](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/types.ts#L123) |
| <a id="color"></a> `color` | `public` | `string` | Color of this specific dot (changeable for gradients/highlights). | [types.ts:137](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/types.ts#L137) |
| <a id="done"></a> `done?` | `public` | `boolean` | Can be set to `false` in the callback as long as the dot is still animating. | [types.ts:139](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/types.ts#L139) |
| <a id="intensity"></a> `intensity` | `readonly` | `number` | Base intensity from the image (0.0 to 1.0). | [types.ts:127](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/types.ts#L127) |
| <a id="radius"></a> `radius` | `public` | `number` | Calculated radius or half-side length (changeable for size animations). | [types.ts:135](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/types.ts#L135) |
| <a id="row"></a> `row` | `readonly` | `number` | Row index (0-indexed). | [types.ts:125](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/types.ts#L125) |
| <a id="time"></a> `time` | `readonly` | `number` | Elapsed time in milliseconds (for animations). | [types.ts:129](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/types.ts#L129) |
| <a id="x"></a> `x` | `public` | `number` | X-coordinate of the dot's center on the canvas (changeable for position offsets). | [types.ts:131](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/types.ts#L131) |
| <a id="y"></a> `y` | `public` | `number` | Y-coordinate of the dot's center on the canvas (changeable for position offsets). | [types.ts:133](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/types.ts#L133) |
