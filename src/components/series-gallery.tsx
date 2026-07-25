"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import type { Series } from "@/types/catalog";

export function SeriesGallery({ series }: { series: Series }) {
  const { locale, t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const touchStart = useRef<number | null>(null);
  const allImages = useMemo(() => series.types.flatMap((type) => type.images.map((image) => ({ ...image, type }))), [series]);
  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setActiveIndex(null); if (event.key === "ArrowRight") setActiveIndex((index) => index === null ? null : (index + 1) % allImages.length); if (event.key === "ArrowLeft") setActiveIndex((index) => index === null ? null : (index - 1 + allImages.length) % allImages.length); };
    document.body.style.overflow = "hidden"; window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKeyDown); };
  }, [activeIndex, allImages.length]);
  const move = (direction: 1 | -1) => setActiveIndex((index) => index === null ? null : (index + direction + allImages.length) % allImages.length);
  return <>
    <section className="subseries-showcase" aria-label={t.collections}><div className="subseries-showcase-heading"><p className="eyebrow">{t.featuredSubseries}</p><p>{t.subseriesIntro}</p></div><div className="subseries-grid">{series.types.map((type) => { const cover = type.cover || type.images[0]; return <a href={`#${type.slug}`} className="subseries-card" key={type.slug}>{cover && <Image src={cover.src} alt={type.name[locale]} fill sizes="(max-width: 760px) 88vw, 33vw" />}<div><span>{String(type.order).padStart(2, "0")}</span><h2>{type.name[locale]}</h2></div></a>; })}</div></section>
    <nav className="type-nav" aria-label="Product subseries"><a href="#gallery-top">{t.all}</a>{series.types.map((type) => <a key={type.slug} href={`#${type.slug}`}>{type.name[locale]}</a>)}</nav>
    <div id="gallery-top" className="gallery-sections">{series.types.map((type) => <section className="type-section" id={type.slug} key={type.slug}><div className="type-heading"><h2>{type.name[locale]}</h2><span>{type.images.length} {t.pieces}</span></div><div className="image-grid">{type.images.map((image, index) => { const globalIndex = allImages.findIndex((item) => item.id === image.id); return <button type="button" className="image-card" key={image.id} onClick={() => setActiveIndex(globalIndex)} aria-label={`${t.viewImage}: ${type.name[locale]}`}><Image src={image.src} alt={`${series.name[locale]} · ${type.name[locale]} ${index + 1}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" /><span className="image-card-index">{String(index + 1).padStart(3, "0")}</span></button>; })}</div></section>)}</div>
    {activeIndex !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label={t.viewImage} onPointerDown={(event) => { touchStart.current = event.clientX; }} onPointerUp={(event) => { if (touchStart.current === null) return; const delta = event.clientX - touchStart.current; if (Math.abs(delta) > 50) move(delta < 0 ? 1 : -1); touchStart.current = null; }}><button className="lightbox-close" type="button" onClick={() => setActiveIndex(null)} aria-label={t.close} autoFocus><X /></button><button className="lightbox-arrow lightbox-prev" type="button" onClick={() => move(-1)} aria-label={t.previous}><ArrowLeft /></button><div className="lightbox-image"><Image src={allImages[activeIndex].src} alt={`${series.name[locale]} · ${allImages[activeIndex].type.name[locale]}`} fill priority sizes="100vw" /></div><button className="lightbox-arrow lightbox-next" type="button" onClick={() => move(1)} aria-label={t.next}><ArrowRight /></button><div className="lightbox-footer"><div className="lightbox-product-info"><strong>{series.name[locale]}</strong><span>{allImages[activeIndex].type.name[locale]} · {t.imageOf.replace("{current}", String(activeIndex + 1)).replace("{total}", String(allImages.length))}</span></div><Link href={`/?series=${series.slug}&type=${allImages[activeIndex].type.slug}&image=${allImages[activeIndex].id}#inquiry`} className="lightbox-inquire">{t.inquireAbout}<Mail size={17} /></Link></div></div>}
  </>;
}
