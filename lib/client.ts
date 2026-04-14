// structure
// - api
// -

// artworks
interface Client {
  artworks: {
    get(params: {
      ids: string[];
      limit: number;
      page: number;
      fields: string[];
      include: ("artist_pivots" | "dates" | "place_pivots" | "sites")[];
    }): Promise<{}>;
  };
  sounds: {
    get();
  };
}

// client.artworks.
// client.artworks.search({ query: string })
// client.artworks.get({ id: string })
// client.artworks.create({ title: string, description: string })
// client.artworks.update({ id: string, title: string, description: string })
// client.artworks.delete({ id: string })

// client.artworks.search({ query: string })
// client.artworks.get({ id: string })
// client.artworks.create({ title: string, description: string })
// client.artworks.update({ id: string, title: string, description: string })
// client.artworks.delete({ id: string })
