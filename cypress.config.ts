const { defineConfig } = require('cypress')

module.exports = defineConfig({
  video: true,
  e2e: {
    baseUrl: 'http://localhost:5173'
  }
})
