[halftone-canvas](../README.md) / Halftone

# Class: Halftone

Defined in: [halftone.ts:41](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/halftone.ts#L41)

Manages the lifecycle, image analysis, and rendering of a halftone effect.
This class encapsulates the logic for loading an image, analyzing it to create a halftone grid, and rendering that grid onto a canvas.
It also provides methods to update rendering options, start and stop animations, and clean up resources.

## Constructors

### Constructor

```ts
new Halftone(target, options?): Halftone;
```

Defined in: [halftone.ts:77](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/halftone.ts#L77)

Creates a new Halftone instance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | [`HalftoneTarget`](../type-aliases/HalftoneTarget.md) | Either an <canvas> element or a container element (e.g., <div>) into which a <canvas> will be automatically inserted. |
| `options?` | [`HalftoneOptions`](../interfaces/HalftoneOptions.md) | Configuration options for the halftone effect. |

#### Returns

`Halftone`

A new Halftone instance.

## Methods

### destroy()

```ts
destroy(): void;
```

Defined in: [halftone.ts:248](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/halftone.ts#L248)

Cleans up animations, references, and removes a self-generated <canvas> from the DOM.
This method should be called when the Halftone instance is no longer needed to free up resources.
After calling this method, the Halftone instance should not be used again.

#### Returns

`void`

void

***

### getCanvas()

```ts
getCanvas(): RenderTargetCanvas;
```

Defined in: [halftone.ts:95](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/halftone.ts#L95)

Returns the used (or automatically created within the container) canvas element.

#### Returns

[`RenderTargetCanvas`](../type-aliases/RenderTargetCanvas.md)

The canvas element.

***

### getGrid()

```ts
getGrid(): HalftoneGrid | null;
```

Defined in: [halftone.ts:238](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/halftone.ts#L238)

Gets the current halftone grid. Returns null if no image has been rendered yet.

#### Returns

[`HalftoneGrid`](../interfaces/HalftoneGrid.md) \| `null`

HalftoneGrid or null if no image has been rendered yet.

***

### isAnimating()

```ts
isAnimating(): boolean;
```

Defined in: [halftone.ts:230](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/halftone.ts#L230)

Checks if the animation is currently running.

#### Returns

`boolean`

boolean indicating whether the animation is currently running.

***

### render()

```ts
render(source): Promise<HalftoneGrid>;
```

Defined in: [halftone.ts:134](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/halftone.ts#L134)

Loads an image, calculates the halftone grid, and renders it onto the canvas.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | [`ImageSource`](../type-aliases/ImageSource.md) | The image source to load. |

#### Returns

`Promise`\<[`HalftoneGrid`](../interfaces/HalftoneGrid.md)\>

A promise that resolves to the resulting HalftoneGrid.

***

### start()

```ts
start(): void;
```

Defined in: [halftone.ts:191](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/halftone.ts#L191)

Starts the animation loop.

#### Returns

`void`

void

***

### stop()

```ts
stop(): void;
```

Defined in: [halftone.ts:219](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/halftone.ts#L219)

Stops the running animation loop.

#### Returns

`void`

void

***

### updateOptions()

```ts
updateOptions(newOptions): void;
```

Defined in: [halftone.ts:152](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/halftone.ts#L152)

Updates the options dynamically. Recomputes the grid only if analysis parameters have changed.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `newOptions` | `Partial`\<[`HalftoneOptions`](../interfaces/HalftoneOptions.md)\> | The partial set of options to update. |

#### Returns

`void`

void
