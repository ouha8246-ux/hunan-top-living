import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeriesGallery } from "@/components/series-gallery";
import { catalog } from "@/data/catalog.generated";
import { CollectionHeroCopy } from "@/components/collection-hero-copy";
import { CollectionCoverCarousel } from "@/components/collection-cover-carousel";
type PageProps = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return catalog.map((series) => ({ slug: series.slug })); }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> { const { slug } = await params; const series = catalog.find((item) => item.slug === slug); if (!series) return {}; const cover = series.types.find((type) => type.cover)?.cover; return { title: `${series.name.en} | Hunan Top Living Ceramic`, description: `${series.name.en} by Hunan Top Living Ceramic. ${series.name.zh}产品系列。`, openGraph: { images: cover ? [cover.src] : [] } }; }
export default async function CollectionPage({ params }: PageProps) { const { slug } = await params; const series = catalog.find((item) => item.slug === slug); if (!series) notFound(); const count = series.types.reduce((sum, type) => sum + type.images.length, 0); return <main id="top" className="collection-page"><section className="collection-hero collection-overview"><CollectionHeroCopy series={series} count={count} /><CollectionCoverCarousel series={series} /></section><SeriesGallery series={series} /></main>; }
