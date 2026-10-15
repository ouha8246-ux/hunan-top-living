"use client";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { catalog } from "@/data/catalog.generated";

export function SiteHeader() {
  const { locale, t, toggleLocale } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const dropdown = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const mobilePanel = useRef<HTMLDivElement>(null);
  function closeMobile() { setMobileOpen(false); setMobileProductsOpen(false); mobileTrigger.current?.focus(); }
  useEffect(() => {
    function outside(event: PointerEvent) { if (!dropdown.current?.contains(event.target as Node)) setProductsOpen(false); }
    function escape(event: KeyboardEvent) { if (event.key === "Escape") { if (productsOpen) { setProductsOpen(false); trigger.current?.focus(); } if (mobileOpen) { setMobileOpen(false); setMobileProductsOpen(false); mobileTrigger.current?.focus(); } } }
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [productsOpen, mobileOpen]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    const siblings = [document.querySelector("main"), document.querySelector("footer"), document.querySelector(".nav-shell")].filter(Boolean) as HTMLElement[];
    siblings.forEach(element => { element.inert = mobileOpen; });
    if (mobileOpen) mobilePanel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => { document.body.style.overflow = ""; siblings.forEach(element => { element.inert = false; }); };
  }, [mobileOpen]);
  return <header className="site-header">
    <div className="nav-shell">
      <Link href="/" className="wordmark" aria-label="HunanTopLiving home">Hunan Top Living Ceramic</Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        <Link href="/">{t.home}</Link>
        <div className="products-dropdown" ref={dropdown} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setProductsOpen(false); }}>
          <button ref={trigger} className="nav-link-button" type="button" aria-expanded={productsOpen} aria-controls="desktop-products" onClick={() => setProductsOpen(!productsOpen)} onKeyDown={event => { if(event.key === "ArrowDown") { event.preventDefault(); setProductsOpen(true); requestAnimationFrame(() => dropdown.current?.querySelector<HTMLAnchorElement>("a")?.focus()); } }}>{t.products}<ChevronDown size={14} /></button>
          <div id="desktop-products" className="products-panel" hidden={!productsOpen}>{catalog.map(series => <Link key={series.slug} href={`/collections/${series.slug}`} onClick={() => setProductsOpen(false)}>{series.name[locale]}</Link>)}</div>
        </div>
      </nav>
      <div className="nav-actions"><button type="button" className="language-button" onClick={toggleLocale} aria-label="Switch language">{t.language}</button><button ref={mobileTrigger} type="button" className="menu-button" onClick={() => setMobileOpen(true)} aria-label={t.menu} aria-expanded={mobileOpen} aria-controls="mobile-navigation"><Menu size={21} /></button></div>
    </div>
    <div ref={mobilePanel} id="mobile-navigation" className={`mobile-menu ${mobileOpen ? "is-open" : ""}`} aria-hidden={!mobileOpen} inert={!mobileOpen} onKeyDown={event => {
      if(event.key !== "Tab") return;
      const items=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a, button')).filter(item=>item.getClientRects().length>0);
      const first=items[0],last=items[items.length-1];
      if(event.shiftKey && document.activeElement===first){event.preventDefault();last?.focus();} else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first?.focus();}
    }}>
      <div className="mobile-menu-head"><span className="wordmark">Hunan Top Living Ceramic</span><button type="button" onClick={closeMobile} aria-label={t.close}><X /></button></div>
      <nav aria-label="Mobile navigation"><Link href="/" onClick={closeMobile}>{t.home}</Link><button className="mobile-products-trigger" type="button" aria-expanded={mobileProductsOpen} aria-controls="mobile-products" onClick={() => setMobileProductsOpen(!mobileProductsOpen)}>{t.products}<ChevronDown size={22} /></button><div id="mobile-products" hidden={!mobileProductsOpen}>{catalog.map(series=><Link key={series.slug} href={`/collections/${series.slug}`} onClick={closeMobile}>{series.name[locale]}</Link>)}</div></nav>
    </div>
  </header>;
}
