[halftone-canvas](../README.md) / loadImageData

# Function: loadImageData()

```ts
function loadImageData(source): Promise<ImageData>;
```

Defined in: [image-loader.ts:9](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/image-loader.ts#L9)

Loads an ImageSource and extracts the raw pixel data (ImageData).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | [`ImageSource`](../type-aliases/ImageSource.md) | The image source as a URL, HTMLImageElement, or ImageBitmap. |

## Returns

`Promise`\<`ImageData`\>

A promise that resolves to the ImageData of the loaded image.
