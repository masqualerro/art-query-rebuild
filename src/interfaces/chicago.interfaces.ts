export interface chicagoObject {
  id: number
  image_id: string
  title: string
  artist_title: string
  classification_titles: String[]
  color: colorObject
  style_titles: string[]
  artwork_type_title: string
  medium_display: string
  date_display: string
  artist_display: string
  thumbnail: thumbnailObject
}
export interface imageObject {
  iiif_url: string
  website_url: string
}

export interface thumbnailObject {
  alt_text: string
  height: number
  lqip: string
  width: number
}

export interface colorObject {
  h: number
  l: number
  percentage: number
  population: number
  s: number
}
