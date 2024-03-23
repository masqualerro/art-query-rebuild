export interface colorInsight {
  hue: string
  frequency: number
  hex_colors: string[]
}
export interface colorResponse {
  insights: colorInsight[]
  total: number
}
export interface cultureInsight {
  culture: string
  frequency: number
  country: string | null
}

export interface styleInsight {
  style: string
  frequency: number
}
export interface artistInsight {
  artist: string
  frequency: number
}
