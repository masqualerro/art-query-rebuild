import { defineStore } from 'pinia'

export const useArtworkStore = defineStore('artwork', {
  state: () => ({
    harvard: [] as string[],
    chicago: [] as string[],
    smithsonian: [] as string[],
    cleveland: [] as string[]
    // other state properties...
  }),
  actions: {
    addHarvardArtwork(id: string) {
      if (!this.harvard.includes(id)) this.harvard.push(id)
    },
    addChicagoArtwork(id: string) {
      if (!this.chicago.includes(id)) this.chicago.push(id)
    },
    addSmithsonianArtwork(id: string) {
      if (!this.smithsonian.includes(id)) this.smithsonian.push(id)
    },
    addClevelandArtwork(id: string) {
      if (!this.cleveland.includes(id)) this.cleveland.push(id)
    },
    removeArtwork(source: 'HARVARD' | 'CHICAGO' | 'SMITHSONIAN' | 'cleveland', externalId: string) {
      if (source === 'HARVARD') {
        this.harvard = this.harvard.filter((id) => id !== externalId)
      } else if (source === 'CHICAGO') {
        this.chicago = this.chicago.filter((id) => id !== externalId)
      } else if (source === 'SMITHSONIAN') {
        this.smithsonian = this.smithsonian.filter((id) => id !== externalId)
      } else {
        this.cleveland = this.cleveland.filter((id) => id !== externalId)
      }
    },
    setHarvardArtworks(artworks: string[]) {
      this.harvard = artworks
    },
    setChicagoArtworks(artworks: string[]) {
      this.chicago = artworks
    },
    setSmithsonianArtworks(artworks: string[]) {
      this.smithsonian = artworks
    },
    setClevelandArtworks(artworks: string[]) {
      this.cleveland = artworks
    }
  }
})
