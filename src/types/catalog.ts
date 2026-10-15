export type LocalizedName = { en: string; zh: string };

export type ImageAsset = {
  id: string;
  src: string;
  width: number;
  height: number;
  sourceName: string;
  isNew?: boolean;
};

export type HeroImage = ImageAsset;

export type ProductType = {
  order: number;
  slug: string;
  name: LocalizedName;
  cover?: ImageAsset;
  images: readonly ImageAsset[];
};

export type Series = { order: number; slug: string; name: LocalizedName; types: readonly ProductType[] };
export type Locale = "en" | "zh";
