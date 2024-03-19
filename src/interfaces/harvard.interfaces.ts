export interface peopleObject {
  alphasort: string
  birthplace: string
  culture: string
  deathplace: any
  displaydate: string
  displayname: string
  displayorder: number
  gender: string
  name: string
  personid: number
  prefix: any
  role: string
}

export interface imageObject {
  alttext: any
  baseimageurl: string
  copyright: any
  date: string
  description: any
  displayorder: number
  format: string
  height: number
  idsid: number
  iiifbaseuri: string
  imageid: number
  publiccaption: any
  renditionnumber: string
  technique: any
  width: number
}

export interface colorObject {
  color: string
  css3: string
  hue: string
  percent: number
  spectrum: string
}

export interface harvardObject {
  id: number
  dated: string
  imagepermissionlevel: number
  primaryimageurl: string
  title: string
  medium: string
  culture: string
  classification: string
  division: string
  period: string
  people: peopleObject[]
  images: imageObject[]
  colors: colorObject[]
}

export interface paginationObject {
  next?: string
  page: number
  pages: number
  responsetime: string
  totalrecords: number
  totalrecordsperquery: number
}
