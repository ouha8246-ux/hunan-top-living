"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";

type ScrollStackProps = { children: React.ReactNode; className?: string; itemDistance?: number };

export function ScrollStackItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <article className={`scroll-stack-card ${className}`.trim()}>{children}</article>;
}

export default function ScrollStack({ children, className = "", itemDistance = 36 }: ScrollStackProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".scroll-stack-card"));
    const end = root.querySelector<HTMLElement>(".scroll-stack-end");
    let rootTop = 0;
    let cardTops: number[] = [];
    let endTop = Number.POSITIVE_INFINITY;
    let frame = 0;
    let animationFrame = 0;

    const measure = () => {
      rootTop = root.getBoundingClientRect().top + window.scrollY;
      cardTops = cards.map((card) => rootTop + card.offsetTop);
      endTop = end ? rootTop + end.offsetTop : Number.POSITIVE_INFINITY;
    };

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const scrollY = window.scrollY;
      const endY = endTop - viewport * 0.42;
      cards.forEach((card, index) => {
        const top = cardTops[index];
        const start = top - viewport * 0.2 - itemDistance * index;
        const progress = Math.max(0, Math.min(1, (scrollY - start) / (viewport * 0.32)));
        const pinStart = start;
        const pinEnd = Math.max(pinStart, endY);
        const translateY = scrollY >= pinStart ? Math.min(scrollY, pinEnd) - top + viewport * 0.2 + itemDistance * index : 0;
        const targetScale = Math.min(0.96, 0.84 + index * 0.025);
        const scale = 1 - progress * (1 - targetScale);
        const rotation = (index % 2 === 0 ? -0.35 : 0.35) * progress;
        card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale}) rotate(${rotation}deg)`;
        card.style.boxShadow = `0 ${24 + index * 4}px ${62 + index * 5}px rgba(26, 25, 21, ${0.18 - index * 0.012})`;
        card.style.zIndex = String(index + 1);
      });
    };
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    const handleResize = () => { measure(); requestUpdate(); };
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, syncTouch: true, touchMultiplier: 1.4 });
    const raf = (time: number) => { lenis.raf(time); animationFrame = requestAnimationFrame(raf); };
    lenis.on("scroll", requestUpdate);
    animationFrame = requestAnimationFrame(raf);
    measure();
    window.addEventListener("resize", handleResize);
    requestUpdate();
    return () => {
      window.removeEventListener("resize", handleResize);
      if (frame) cancelAnimationFrame(frame);
      cancelAnimationFrame(animationFrame);
      lenis.destroy();
      cards.forEach((card) => { card.style.transform = ""; card.style.zIndex = ""; card.style.boxShadow = ""; });
    };
  }, [itemDistance]);

  return <div ref={rootRef} className={`scroll-stack ${className}`.trim()}>{children}<div className="scroll-stack-end" /></div>;
}
