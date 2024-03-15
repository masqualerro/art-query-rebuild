import { defineStore } from 'pinia'

export const useArtworkStore = defineStore('artwork', {
  state: () => ({
    harvard: [] as number[],
    chicago: [] as number[]
    // other state properties...
  }),
  actions: {
    addHarvardArtwork(id: number) {
      this.harvard.push(id)
    },
    addChicagoArtwork(id: number) {
      this.chicago.push(id)
    },
    setHarvardArtworks(artworks: number[]) {
      this.harvard = artworks
    },
    setChicagoArtworks(artworks: number[]) {
      this.chicago = artworks
    }
  }
})
