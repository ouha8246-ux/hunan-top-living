"use client";

import { CSSProperties, PointerEvent, ReactNode, useRef } from "react";

type BorderGlowProps = { children: ReactNode; className?: string; borderRadius?: number; glowColor?: string; colors?: string[] };

export function BorderGlow({ children, className = "", borderRadius = 20, glowColor = "38 76 62", colors = ["#d6b879", "#e7d5ac", "#8fae9f"] }: BorderGlowProps) {
  const ref = useRef<HTMLDivElement>(null);
  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const edge = Math.min(x, y, rect.width - x, rect.height - y);
    const proximity = Math.max(0, 1 - edge / 72);
    const angle = Math.atan2(y - rect.height / 2, x - rect.width / 2) * (180 / Math.PI) + 90;
    card.style.setProperty("--glow-opacity", proximity.toFixed(3));
    card.style.setProperty("--glow-angle", `${angle}deg`);
  }
  const style = { "--glow-color": `hsl(${glowColor})`, "--glow-one": colors[0], "--glow-two": colors[1], "--glow-three": colors[2], "--border-radius": `${borderRadius}px` } as CSSProperties;
  return <div ref={ref} className={`border-glow-card ${className}`.trim()} style={style} onPointerMove={handlePointerMove}><span className="border-glow-light" /><div className="border-glow-inner">{children}</div></div>;
}
