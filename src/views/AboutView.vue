<template>
  <div class="about text-sm">
    <section>
      <h2 class="text-xl font-semibold mb-2">Exploring Artworks</h2>
      <p class="mb-4">
        This app serves as a platform for exploring a diverse range of artworks and gaining insights
        from your favorites.
      </p>
    </section>

    <section>
      <h2 class="text-xl font-semibold mb-2">Discovering Artworks</h2>
      <p class="mb-4">
        Use the search input in the main navbar to find artworks that capture your interest. You can
        specify which art API to search from using the dropdown menu. Navigate to 'Chicago Art
        Institute' or 'Harvard Art Museums' to view an unfiltered display of art from each
        respective museum. Save your favorite pieces to your collection by hovering over them and
        clicking the heart icon.
      </p>
    </section>

    <section>
      <h2 class="text-xl font-semibold mb-2">Your Collection</h2>
      <p class="mb-4">
        Explore your saved collection of art and gain insights into your preferences, such as color
        palettes and cultural themes, on the "Collection" page.
      </p>
    </section>

    <section>
      <h2 class="text-xl font-semibold mb-2">Data Sources</h2>
      <p class="mb-4">
        This app utilizes data from the Harvard Art Museums and the Art Institute of Chicago APIs.
      </p>
      <p>For more information, visit the respective API documentation:</p>
      <div class="flex flex-col mt-4">
        <a
          class="text-indigo-600 hover:text-indigo-500"
          href="https://api.artic.edu/docs"
          target="_blank"
          rel="noopener noreferrer"
          >Art Institute of Chicago API</a
        >
        <a
          class="text-indigo-600 hover:text-indigo-500"
          href="https://harvardartmuseums.org/collections/api"
          target="_blank"
          rel="noopener noreferrer"
          >Harvard Art Museums API</a
        >
      </div>
    </section>
  </div>
</template>
