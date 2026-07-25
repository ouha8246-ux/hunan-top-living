"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
export function SiteFooter() { const { t } = useLanguage(); return <footer className="site-footer"><div><Link href="/" className="footer-mark">Hunan Top Living Ceramic<br />湖南顶点陶瓷</Link><p>{t.footer}</p></div><a href="#top" className="back-top" aria-label="Back to top"><ArrowUpRight size={18} /></a><span className="copyright">© {new Date().getFullYear()} Hunan Top Living Ceramic</span></footer>; }
