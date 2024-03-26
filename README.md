# Art Query Rebuild :art:

## About

This project is a rebuild of one of my first projects, art-query. The original project was built using vanilla JavaScript, HTML, and CSS. This project is built using Vue and TailwindCSS. :rocket:

I have built an API with NestJs, MySQL, and TypeORM to serve the data for this project. The API and DB are hosted on Digital Ocean and the client is hosted on Vercel.

The API is available here: [Art Query API](https://github.com/masqualerro/art-query-api)

### Exploring Artworks
This app serves as a platform for exploring a diverse range of artworks and gaining insights from your favorites.

### Discovering Artworks
Use the search input in the main navbar to find artworks that capture your interest. You can specify which art API to search from using the dropdown menu. Navigate to 'Chicago Art Institute' or 'Harvard Art Museums' to view an unfiltered display of art from each respective museum. Save your favorite pieces to your collection by hovering over them and clicking the heart icon.

### Your Collection
Explore your saved collection of art and gain insights into your preferences, such as color palettes and cultural themes, on the "Collection" page.

### Data Sources
This app utilizes data from the Harvard Art Museums and the Art Institute of Chicago APIs.

For more information, visit the respective API documentation:

[Art Institute of Chicago API](https://api.artic.edu/docs/)

[Harvard Art Museums API](https://github.com/harvardartmuseums/api-docs)

## Installation

```bash
npm install
npm run dev