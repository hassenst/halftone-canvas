[halftone-canvas](../README.md) / loadImageData

# Function: loadImageData()

```ts
function loadImageData(source): Promise<ImageData>;
```

Defined in: [image-loader.ts:9](https://github.com/hassenst/halftone-canvas/blob/3d958ed35903c4e61b1a0b7078c8a24631be5634/src/core/image-loader.ts#L9)

Loads an ImageSource and extracts the raw pixel data (ImageData).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | [`ImageSource`](../type-aliases/ImageSource.md) | The image source as a URL, HTMLImageElement, or ImageBitmap. |

## Returns

`Promise`\<`ImageData`\>

A promise that resolves to the ImageData of the loaded image.
