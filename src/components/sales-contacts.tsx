"use client";

import { Check, Copy, Mail, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { BorderGlow } from "@/components/border-glow";

const managers = [
  { name: "Sandy", phone: "+86 15112434422", digits: "8615112434422", email: "sandy@toplivingceramic.com" },
  { name: "Jenny", phone: "+86 14787356563", digits: "8614787356563", email: "jenny@toplivingceramic.com" },
  { name: "Eva", phone: "+86 15292173386", digits: "8615292173386", email: "eva@toplivingceramic.com" },
];

export function SalesContacts() {
  const { locale, t } = useLanguage();
  const [copyState, setCopyState] = useState<{ email: string; success: boolean } | null>(null);
  const copyLabel = locale === "zh" ? "复制邮箱" : "Copy email";
  const copiedLabel = locale === "zh" ? "已复制" : "Copied";
  const failedLabel = locale === "zh" ? "复制失败" : "Copy failed";
  async function copyEmail(email: string) {
    try { await navigator.clipboard.writeText(email); setCopyState({ email, success: true }); }
    catch { setCopyState({ email, success: false }); }
  }
  return <section className="sales-contacts" aria-labelledby="sales-contact-title">
    <div className="sales-contact-heading"><p className="eyebrow">{t.directContactEyebrow}</p><h2 id="sales-contact-title">{t.directContactTitle}</h2><p>{t.directContactBody}</p></div>
    <div className="sales-contact-grid">
      {managers.map((manager, index) => <BorderGlow className="sales-contact-glow" key={manager.email} glowColor="38 76 62" colors={["#d6b879", "#f1e6c9", "#7fa692"]}><article className="sales-contact-card">
        <span>{String(index + 1).padStart(2, "0")}</span><h3>{manager.name}</h3>
        <a href={`tel:${manager.digits}`}><Phone size={16} /><div><small>{t.phone}</small><strong>{manager.phone}</strong></div></a>
        <a href={`https://wa.me/${manager.digits}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /><div><small>{t.wechatWhatsapp}</small><strong>+86 {manager.digits.slice(2, 5)} {manager.digits.slice(5)}</strong></div></a>
        <div className="sales-contact-email"><a href={`mailto:${manager.email}`}><Mail size={16} /><div><small>{t.email}</small><strong>{manager.email}</strong></div></a><button type="button" onClick={() => copyEmail(manager.email)} aria-label={`${copyLabel}: ${manager.email}`}>{copyState?.email === manager.email && copyState.success ? <Check size={15} /> : <Copy size={15} />}{copyState?.email === manager.email && copyState.success ? copiedLabel : copyLabel}</button>{copyState?.email === manager.email && <span className="sales-copy-status" role="status">{copyState.success ? copiedLabel : failedLabel}</span>}</div>
      </article></BorderGlow>)}
    </div>
  </section>;
}
