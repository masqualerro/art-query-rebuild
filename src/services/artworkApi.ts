import { apiClient } from './apiClient'
import type { chicagoObject } from '@/interfaces/chicago.interfaces'
import type { harvardObject, paginationObject } from '@/interfaces/harvard.interfaces'
import type { artworkObject } from '@/interfaces/artworks.interfaces'
import type { smithsonianObject } from '@/interfaces/smithsonian.interfaces'
import type { clevelandObject } from '@/interfaces/cleveland.interfaces'

interface SearchOptions {
  signal?: AbortSignal
}

interface HarvardSearchResponse {
  records: harvardObject[]
  info: paginationObject
}

interface ChicagoSearchResponse {
  data: chicagoObject[]
  config: {
    iiif_url: string
    website_url: string
  }
  pagination: {
    total_pages: number
  }
}

interface SmithsonianSearchResponse {
  rows: smithsonianObject[]
  rowCount: number
  totalCount: number
  start: number
  rowsPerPage: number
  nextStart: number | null
}

interface ClevelandSearchResponse {
  artworks: clevelandObject[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

export interface DiscoverArtwork {
  id: string
  source: ArtworkSource
  sourceLabel: string
  externalId: string
  title: string
  artist: string | null
  imageUrl: string
  imageAlt: string
  imageWidth: number | null
  imageHeight: number | null
  date: string | null
  culture: string | null
  medium: string | null
  sourceUrl: string | null
  infoItems: string[]
  colorInfo: {
    values: string[]
    gradient: string | null
  } | null
  savePayload: SaveArtworkPayload
}

interface DiscoverResponse {
  term: string
  artworks: DiscoverArtwork[]
  sources: Record<string, number>
  unavailableSources: ArtworkSource[]
}

interface SavedArtworkMap {
  harvard: string[]
  chicago: string[]
  smithsonian: string[]
  cleveland: string[]
}

type ArtworkSource = 'HARVARD' | 'CHICAGO' | 'SMITHSONIAN' | 'cleveland'

type SaveArtworkPayload =
  | { source: 'HARVARD'; artwork: harvardObject }
  | { source: 'CHICAGO'; artwork: chicagoObject; imageBaseUrl: string }
  | { source: 'SMITHSONIAN'; artwork: smithsonianObject }
  | { source: 'cleveland'; artwork: clevelandObject }

export async function searchHarvardArtworks(searchTerm: string, options: SearchOptions = {}) {
  const response = await apiClient.get<HarvardSearchResponse>('/museums/harvard/search', {
    params: { q: searchTerm },
    signal: options.signal
  })

  return response.data
}

export async function fetchHarvardNextPage(nextUrl: string, options: SearchOptions = {}) {
  const response = await apiClient.get<HarvardSearchResponse>('/museums/harvard/search', {
    params: { nextUrl },
    signal: options.signal
  })

  return response.data
}

export async function searchChicagoArtworks(
  searchTerm: string,
  page = 1,
  options: SearchOptions = {}
) {
  const response = await apiClient.get<ChicagoSearchResponse>('/museums/chicago/search', {
    params: { q: searchTerm, page },
    signal: options.signal
  })

  return response.data
}

export async function searchSmithsonianArtworks(
  searchTerm: string,
  start = 0,
  options: SearchOptions = {}
) {
  const response = await apiClient.get<SmithsonianSearchResponse>('/museums/smithsonian/search', {
    params: { q: searchTerm, start },
    signal: options.signal
  })

  return response.data
}

export async function searchClevelandArtworks(
  searchTerm: string,
  start = 0,
  options: SearchOptions = {}
) {
  const response = await apiClient.get<ClevelandSearchResponse>('/museums/cleveland/search', {
    params: { q: searchTerm, start },
    signal: options.signal
  })

  return response.data
}

export async function discoverArtworks(searchTerm = '', options: SearchOptions = {}) {
  const response = await apiClient.get<DiscoverResponse>('/museums/discover', {
    params: searchTerm ? { q: searchTerm } : undefined,
    signal: options.signal
  })

  return response.data
}

export async function fetchSavedArtworkMap() {
  const response = await apiClient.get<SavedArtworkMap>('/artworks/saved-map')
  return response.data
}

export async function fetchUserCollection() {
  const response = await apiClient.get<{ artworks: artworkObject[] }>('/artworks/collection')
  return response.data.artworks
}

export async function saveArtwork(payload: SaveArtworkPayload) {
  const response = await apiClient.post<{ artwork: artworkObject }>('/artworks', payload)
  return response.data.artwork
}

export async function deleteArtworkById(id: string) {
  const response = await apiClient.delete(`/artworks/${id}`)
  return response.data
}

export async function deleteArtworkBySource(source: ArtworkSource, externalId: string) {
  const response = await apiClient.delete(
    `/artworks/source/${encodeURIComponent(source)}/${encodeURIComponent(externalId)}`
  )
  return response.data
}
