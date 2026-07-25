import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
export const metadata: Metadata = { metadataBase: new URL("https://hunan-top-living.ouha8246.workers.dev"), title: { default: "湖南顶点陶瓷｜Hunan Top Living", template: "%s｜湖南顶点陶瓷" }, description: "Hunan Top Living / 湖南顶点陶瓷 ceramic collections for retail, hospitality, and daily living.", keywords: ["ceramics", "tableware", "cups", "Hunan Top Living", "湖南顶点陶瓷", "陶瓷"], openGraph: { title: "Hunan Top Living | 湖南顶点陶瓷", description: "Ceramics for considered living.", type: "website", locale: "en_US", alternateLocale: "zh_CN" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><LanguageProvider><SiteHeader />{children}<SiteFooter /></LanguageProvider></body></html>; }
