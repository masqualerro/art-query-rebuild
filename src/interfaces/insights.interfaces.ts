export interface colorInsight {
  hue: string
  frequency: number
  hex_colors: string[]
}
export interface colorResponse {
  insights: colorInsight[]
  total: number
}
