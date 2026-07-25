import { catalog } from "@/data/catalog.generated";

export function getSeries(slug: string) {
  return catalog.find((series) => series.slug === slug);
}

export function getAllImages(series: (typeof catalog)[number]) {
  return series.types.flatMap((type) =>
    type.images.map((image) => ({ ...image, type: type.name, typeSlug: type.slug })),
  );
}
