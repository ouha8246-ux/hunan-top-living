"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import type { Series } from "@/types/catalog";
export function CollectionHeroCopy({ series, count }: { series: Series; count: number }) {
  const { locale, t } = useLanguage();
  return <div className="collection-hero-copy"><Link href="/#collections" className="back-link"><ArrowLeft size={16} />{t.collections}</Link><span className="collection-kicker">Hunan Top Living Ceramic</span><h1>{series.name[locale]}</h1><p>{series.types.map((type) => type.name[locale]).join(" · ")}</p><span className="collection-count">{count} {t.pieces}</span></div>;
}
