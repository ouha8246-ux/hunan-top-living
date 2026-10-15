"use client";

import Image from "next/image";
import { NewBadge } from "@/components/new-badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import type { Series } from "@/types/catalog";

export function CollectionCoverCarousel({ series }: { series: Series }) {
  const { locale } = useLanguage();
  const slides = series.types.map((type) => ({ type, image: type.cover || type.images[0] })).filter((slide) => Boolean(slide.image));
  const [active, setActive] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % count), 5000);
    return () => window.clearInterval(timer);
  }, [count]);

  if (!count) return null;
  const go = (direction: -1 | 1) => setActive((value) => (value + direction + count) % count);
  return <section className="collection-cover-carousel" aria-label={`${series.name[locale]} subseries`}>
    {slides.map((slide, index) => <div key={slide.type.slug} className={`collection-cover-slide ${index === active ? "is-active" : ""}`} aria-hidden={index !== active}>{slide.image && <Image src={slide.image.src} alt={slide.type.name[locale]} fill priority={index === 0} sizes="(max-width: 860px) 100vw, 55vw" />}{slide.image?.isNew && <NewBadge />}<div className="collection-cover-caption"><span>{String(index + 1).padStart(2, "0")}</span><strong>{slide.type.name[locale]}</strong></div></div>)}
    {count > 1 && <><button className="collection-carousel-control collection-carousel-prev" type="button" onClick={() => go(-1)} aria-label="Previous subseries"><ChevronLeft size={20} /></button><button className="collection-carousel-control collection-carousel-next" type="button" onClick={() => go(1)} aria-label="Next subseries"><ChevronRight size={20} /></button><div className="collection-carousel-dots">{slides.map((slide, index) => <button key={slide.type.slug} type="button" className={index === active ? "is-active" : ""} onClick={() => setActive(index)} aria-label={`Show ${slide.type.name[locale]}`} />)}</div></>}
  </section>;
}
