export interface artworkObject {
  id: number
  museum_id: number
  artwork_id: number
  title: string
  artist: string
  date: string
  artwork_type: any
  classification: classificationObject
  medium: string
  colors: colorObject
  culture: string
  styles: any
  image: imageObect
}

interface colorObject {
  hex: hexObject[]
  hsl: any
}

interface hexObject {
  color: string
  spectrum: string
  hue: string
  percent: number
  css3: string
}

interface imageObect {
  id: number
  artwork_id: number
  imageUrl: string
  imageAlt: string
  imageWidth: number
  imageHeight: number
}

interface classificationObject {
  period: string
  division: string
  type: string
}
