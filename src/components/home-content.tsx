"use client";

import Image from "next/image";
import { NewBadge } from "@/components/new-badge";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Suspense } from "react";
import { catalog, catalogImageCount, heroImages } from "@/data/catalog.generated";
import { useLanguage } from "@/components/language-provider";
import { InquiryForm } from "@/components/inquiry-form";
import { SalesContacts } from "@/components/sales-contacts";
import ScrollStack, { ScrollStackItem } from "@/components/scroll-stack";

export function HomeContent() {
  const { locale, t } = useLanguage();
  return (
    <main id="top">
      <section className="home-intro">
        <div>
          <p className="eyebrow">Hunan Top Living Ceramic · 湖南顶点陶瓷</p>
          <h1>{t.heroTitle}</h1>
          <p className="hero-body">{t.heroBody}</p>
          <div className="hero-actions"><a href="#collections" className="button button-dark">{t.explore}<ArrowDown size={17} /></a><a href="#inquiry" className="button button-light">{t.inquire}<ArrowRight size={17} /></a></div>
        </div>
        <p className="home-intro-note">{catalogImageCount} {t.pieces}</p>
      </section>

      <section className="hero-stack-section" aria-label="Hunan Top Living Ceramic featured collections">
        <ScrollStack className="hero-stack" useWindowScroll>
          {heroImages.map((image, index) => <ScrollStackItem itemClassName="hero-stack-card" key={image.id}><Image src={image.src} alt="" fill priority={index < 2} sizes="(max-width: 860px) 88vw, 60vw" /><span>{String(index + 1).padStart(2, "0")}</span></ScrollStackItem>)}
        </ScrollStack>
      </section>

      <section className="collections-section" id="collections">
        <div className="section-heading"><div><p className="eyebrow">Hunan Top Living Ceramic</p><h2>{t.collections}</h2></div><p>{t.collectionsBody}</p></div>
        <div className="collection-grid">
          {catalog.map((series) => {
            const cover = series.types.find((type) => type.cover)?.cover || series.types[0]?.images[0];
            const count = series.types.reduce((sum, type) => sum + type.images.length, 0);
            return <Link className="collection-card" href={`/collections/${series.slug}`} key={series.slug}><div className="collection-image">{cover && <Image src={cover.src} alt={series.name[locale]} fill loading="lazy" sizes="(max-width: 760px) 100vw, 50vw" />}{cover?.isNew && <NewBadge />}</div><div className="collection-meta"><div><span className="collection-number">{String(series.order).padStart(2, "0")}</span><h3>{series.name[locale]}</h3></div><span>{count} {t.pieces}<ArrowRight size={18} /></span></div></Link>;
          })}
        </div>
      </section>

      <section className="manifesto-section"><div className="manifesto-title"><p className="eyebrow">Our point of view</p><h2>{t.craftTitle}</h2></div><p className="manifesto-lead">{t.craftBody}</p><div className="values-grid">{[["01", t.material, t.materialBody], ["02", t.variety, t.varietyBody], ["03", t.partnership, t.partnershipBody]].map(([number, title, body]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
      <section className="inquiry-section" id="inquiry"><div className="inquiry-intro"><p className="eyebrow">Trade & sourcing</p><h2>{t.inquiryTitle}</h2><p>{t.inquiryBody}</p></div><Suspense fallback={<div className="inquiry-form" aria-hidden="true" />}><InquiryForm /></Suspense></section>
      <SalesContacts />
    </main>
  );
}
