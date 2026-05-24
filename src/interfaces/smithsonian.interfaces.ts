export interface smithsonianObject {
  id: string
  title: string
  artistName: string | null
  dateText: string | null
  classification: string | null
  medium: string | null
  culture: string | null
  styles: string[]
  imageUrl: string
  imageAlt: string
  imageWidth: number | null
  imageHeight: number | null
  sourceUrl: string | null
  rawSource: Record<string, unknown>
}
