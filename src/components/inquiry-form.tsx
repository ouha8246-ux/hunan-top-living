"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { catalog } from "@/data/catalog.generated";
import { useLanguage } from "@/components/language-provider";

type Status = "idle" | "sending" | "success" | "error";

export function InquiryForm() {
  const { locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("idle");
  const [seriesSlug, setSeriesSlug] = useState(() => searchParams.get("series") || "");
  const [typeSlug, setTypeSlug] = useState(() => searchParams.get("type") || "");
  const [imageIds, setImageIds] = useState<string[]>(() => searchParams.get("image") ? [searchParams.get("image")!] : []);
  const [errorMessage, setErrorMessage] = useState("");
  const selectedSeries = useMemo(() => catalog.find((series) => series.slug === seriesSlug), [seriesSlug]);
  const selectedType = useMemo(() => selectedSeries?.types.find((type) => type.slug === typeSlug), [selectedSeries, typeSlug]);
  const productLabel = locale === "zh" ? "单品项目（可多选）" : "Products (multiple)";
  const productHint = locale === "zh" ? "请先选择子系列" : "Select a subseries first";

  function toggleImage(imageId: string) { setImageIds((current) => current.includes(imageId) ? current.filter((id) => id !== imageId) : [...current, imageId]); }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (status === "sending") return;
    setStatus("sending"); setErrorMessage("");
    const form = event.currentTarget; const data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, imageIds, locale }) });
      if (!response.ok) { setErrorMessage(response.status === 503 ? t.serviceUnavailable : t.error); throw new Error("Request failed"); }
      setStatus("success"); form.reset(); setSeriesSlug(""); setTypeSlug(""); setImageIds([]);
    } catch { setStatus("error"); }
  }
  return <form className="inquiry-form" onSubmit={handleSubmit}>
    <div className="honeypot" hidden><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="form-row"><label><span>{t.name} *</span><input name="name" required maxLength={100} autoComplete="name" /></label><label><span>{t.email} *</span><input name="email" type="email" required maxLength={200} autoComplete="email" /></label></div>
    <div className="form-row"><label><span>{t.company} *</span><input name="company" required maxLength={150} autoComplete="organization" /></label><label><span>{t.phone}</span><input name="phone" maxLength={60} autoComplete="tel" /></label></div>
    <div className="form-row"><label><span>{t.series}</span><select name="seriesSlug" value={seriesSlug} onChange={(event) => { setSeriesSlug(event.target.value); setTypeSlug(""); setImageIds([]); }}><option value="">—</option>{catalog.map((series) => <option value={series.slug} key={series.slug}>{series.name[locale]}</option>)}</select></label><label><span>{t.productType}</span><select name="typeSlug" value={typeSlug} onChange={(event) => { setTypeSlug(event.target.value); setImageIds([]); }} disabled={!selectedSeries}><option value="">—</option>{selectedSeries?.types.map((type) => <option value={type.slug} key={type.slug}>{type.name[locale]}</option>)}</select></label></div>
    <fieldset className="product-picker" disabled={!selectedType}><legend>{productLabel}</legend>{selectedType ? <div className="product-picker-options">{selectedType.images.map((image, index) => <label key={image.id}><input type="checkbox" checked={imageIds.includes(image.id)} onChange={() => toggleImage(image.id)} /><span>{String(index + 1).padStart(3, "0")}</span></label>)}</div> : <p>{productHint}</p>}</fieldset>
    <label><span>{t.message} *</span><textarea name="message" required maxLength={3000} rows={5} /></label>
    <div className="form-submit-row"><button type="submit" className="button button-dark" disabled={status === "sending" || status === "success"}>{status === "sending" ? t.sending : t.submit}{status === "success" ? <CheckCircle2 size={18} /> : <ArrowUpRight size={18} />}</button><p role="status" className={`form-status ${status}`}>{status === "success" ? t.success : status === "error" ? (errorMessage || t.error) : ""}</p></div>
  </form>;
}
