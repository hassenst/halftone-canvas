[halftone-canvas](../README.md) / ImageSource

# Type Alias: ImageSource

```ts
type ImageSource = string | HTMLImageElement | ImageBitmap;
```

Defined in: [types.ts:7](https://github.com/hassenst/halftone-canvas/blob/dbfea575b43d47eeb00fd61032abe937e7165429/src/core/types.ts#L7)

Supported input sources for the image.
- string: Image URL or Data URL
- HTMLImageElement: Reference to an existing <img> element in the DOM
- ImageBitmap: Image already decoded in memory (ideal for performance)
