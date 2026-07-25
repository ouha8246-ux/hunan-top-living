"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";

export function SiteHeader() {
  const { locale, t, toggleLocale } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    const siblings = [document.querySelector("main"), document.querySelector("footer")].filter(Boolean) as HTMLElement[];
    siblings.forEach((element) => { element.inert = mobileOpen; });
    return () => { document.body.style.overflow = ""; siblings.forEach((element) => { element.inert = false; }); };
  }, [mobileOpen]);

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link href="/" className="wordmark" aria-label="HunanTopLiving home">
          Hunan Top Living
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/">{t.home}</Link>
          <Link href="/#collections">{t.products}</Link>
        </nav>

        <div className="nav-actions">
          <button type="button" className="language-button" onClick={toggleLocale} aria-label="Switch language">
            {t.language}
          </button>
          <button type="button" className="menu-button" onClick={() => setMobileOpen(true)} aria-label={t.menu}>
            <Menu size={21} />
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${mobileOpen ? "is-open" : ""}`} aria-hidden={!mobileOpen}>
        <div className="mobile-menu-head">
          <span className="wordmark">Hunan Top Living</span>
          <button type="button" onClick={() => setMobileOpen(false)} aria-label={t.close}><X /></button>
        </div>
        <nav aria-label="Mobile navigation">
          <Link href="/" onClick={() => setMobileOpen(false)}>{t.home}</Link>
          <Link href="/#collections" onClick={() => setMobileOpen(false)}>{t.products}</Link>
        </nav>
      </div>
    </header>
  );
}
