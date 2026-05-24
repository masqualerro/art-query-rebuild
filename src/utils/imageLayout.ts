interface ImageDimensions {
  imageWidth: number | null
  imageHeight: number | null
}

function hasUsableDimensions(
  item: ImageDimensions
): item is { imageWidth: number; imageHeight: number } {
  return (
    typeof item.imageWidth === 'number' &&
    Number.isFinite(item.imageWidth) &&
    item.imageWidth > 0 &&
    typeof item.imageHeight === 'number' &&
    Number.isFinite(item.imageHeight) &&
    item.imageHeight > 0
  )
}

export function imageAspectRatioStyle(item: ImageDimensions) {
  if (!hasUsableDimensions(item)) return {}

  return {
    aspectRatio: `${item.imageWidth} / ${item.imageHeight}`
  }
}

export function isWideImage(item: ImageDimensions) {
  return hasUsableDimensions(item) && item.imageWidth > item.imageHeight
}

export function isFullSpanImage(item: ImageDimensions) {
  return hasUsableDimensions(item) && item.imageWidth > 2 * item.imageHeight
}
