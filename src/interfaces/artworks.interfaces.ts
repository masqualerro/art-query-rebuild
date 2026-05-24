export interface artworkObject {
  id: string
  source: 'HARVARD' | 'CHICAGO' | 'SMITHSONIAN' | 'cleveland'
  externalId: string
  title: string
  artistName: string | null
  dateText: string | null
  classification: classificationObject | null
  medium: string | null
  colors: colorObject
  culture: string | null
  styles: string[]
  imageUrl: string | null
  imageAlt: string | null
  imageWidth: number | null
  imageHeight: number | null
}

interface colorObject {
  hex: hexObject[] | null
  hsl: string | null
}

interface hexObject {
  color: string
  spectrum: string
  hue: string
  percent: number
  css3: string
}

interface classificationObject {
  period?: string | null
  division?: string | null
  type?: string | null
  classifications?: string[]
  department?: string | null
  dimensions?: string | null
  sourceUrl?: string | null
  description?: string | null
}
