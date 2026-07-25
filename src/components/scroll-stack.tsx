"use client";

import Lenis from "lenis";
import { useCallback, useLayoutEffect, useRef } from "react";

type ScrollStackProps = {
  children: React.ReactNode;
  className?: string;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
};

export function ScrollStackItem({ children, itemClassName = "" }: { children: React.ReactNode; itemClassName?: string }) {
  return <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>;
}

export default function ScrollStack({
  children,
  className = "",
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}: ScrollStackProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const windowOffsetsRef = useRef(new WeakMap<HTMLElement, number>());
  const lastTransformsRef = useRef(new Map<number, { translateY: number; scale: number; rotation: number; blur: number }>());
  const isUpdatingRef = useRef(false);

  const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value: string, containerHeight: number) => {
    if (value.includes("%")) return (Number.parseFloat(value) / 100) * containerHeight;
    return Number.parseFloat(value);
  }, []);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) return { scrollTop: window.scrollY, containerHeight: window.innerHeight };
    const scroller = scrollerRef.current;
    return { scrollTop: scroller?.scrollTop ?? 0, containerHeight: scroller?.clientHeight ?? window.innerHeight };
  }, [useWindowScroll]);

  const getElementOffset = useCallback((element: HTMLElement) => {
    if (useWindowScroll) {
      const stableOffset = windowOffsetsRef.current.get(element);
      if (stableOffset !== undefined) return stableOffset;
      const rect = element.getBoundingClientRect();
      return rect.top + window.scrollY;
    }
    return element.offsetTop;
  }, [useWindowScroll]);

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    const { scrollTop, containerHeight } = getScrollData();
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);
    const endElement = useWindowScroll ? document.querySelector<HTMLElement>(".scroll-stack-end") : scrollerRef.current?.querySelector<HTMLElement>(".scroll-stack-end");
    const endElementTop = endElement ? getElementOffset(endElement) : 0;

    cardsRef.current.forEach((card, index) => {
      const cardTop = getElementOffset(card);
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * index;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = cardTop - stackPositionPx - itemStackDistance * index;
      const pinEnd = endElementTop - containerHeight / 2;
      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + index * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? index * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (blurAmount) {
        let topCardIndex = 0;
        for (let i = 0; i < cardsRef.current.length; i += 1) {
          const candidateTop = getElementOffset(cardsRef.current[i]);
          const candidateTriggerStart = candidateTop - stackPositionPx - itemStackDistance * i;
          if (scrollTop >= candidateTriggerStart) topCardIndex = i;
        }
        if (index < topCardIndex) blur = Math.max(0, (topCardIndex - index) * blurAmount);
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;
      if (isPinned) translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * index;
      else if (scrollTop > pinEnd) translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * index;

      const nextTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100,
      };
      const lastTransform = lastTransformsRef.current.get(index);
      const hasChanged = !lastTransform
        || Math.abs(lastTransform.translateY - nextTransform.translateY) > 0.1
        || Math.abs(lastTransform.scale - nextTransform.scale) > 0.001
        || Math.abs(lastTransform.rotation - nextTransform.rotation) > 0.1
        || Math.abs(lastTransform.blur - nextTransform.blur) > 0.1;

      if (hasChanged) {
        card.style.transform = `translate3d(0, ${nextTransform.translateY}px, 0) scale(${nextTransform.scale}) rotate(${nextTransform.rotation}deg)`;
        card.style.filter = nextTransform.blur > 0 ? `blur(${nextTransform.blur}px)` : "";
        lastTransformsRef.current.set(index, nextTransform);
      }

      if (index === cardsRef.current.length - 1) {
        if (isPinned && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isPinned && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });
    isUpdatingRef.current = false;
  }, [baseScale, blurAmount, calculateProgress, getElementOffset, getScrollData, itemScale, itemStackDistance, onStackComplete, parsePercentage, rotationAmount, scaleEndPosition, stackPosition, useWindowScroll]);

  const handleScroll = useCallback(() => updateCardTransforms(), [updateCardTransforms]);

  const setupLenis = useCallback(() => {
    const lenis = useWindowScroll
      ? new Lenis({
        duration: 1.2,
        easing: (time: number) => Math.min(1, 1.001 - 2 ** (-10 * time)),
        smoothWheel: true,
        touchMultiplier: 2,
        infinite: false,
        wheelMultiplier: 1,
        lerp: 0.1,
        syncTouch: true,
        syncTouchLerp: 0.075,
      })
      : new Lenis({
        wrapper: scrollerRef.current ?? undefined,
        content: scrollerRef.current?.querySelector<HTMLElement>(".scroll-stack-inner") ?? undefined,
        duration: 1.2,
        easing: (time: number) => Math.min(1, 1.001 - 2 ** (-10 * time)),
        smoothWheel: true,
        touchMultiplier: 2,
        infinite: false,
        gestureOrientationHandler: true,
        normalizeWheel: true,
        wheelMultiplier: 1,
        touchInertiaMultiplier: 35,
        lerp: 0.1,
        syncTouch: true,
        syncTouchLerp: 0.075,
        touchInertia: 0.6,
      } as never);
    lenis.on("scroll", handleScroll);
    const raf = (time: number) => {
      lenis.raf(time);
      animationFrameRef.current = requestAnimationFrame(raf);
    };
    animationFrameRef.current = requestAnimationFrame(raf);
    lenisRef.current = lenis;
  }, [handleScroll, useWindowScroll]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = Array.from(useWindowScroll ? document.querySelectorAll<HTMLElement>(".scroll-stack-card") : scroller.querySelectorAll<HTMLElement>(".scroll-stack-card"));
    cardsRef.current = cards;
    const measureWindowOffsets = () => {
      if (!useWindowScroll) return;
      const offsets = new WeakMap<HTMLElement, number>();
      const rootTop = scroller.getBoundingClientRect().top + window.scrollY;
      cards.forEach((card) => offsets.set(card, rootTop + card.offsetTop));
      const end = scroller.querySelector<HTMLElement>(".scroll-stack-end");
      if (end) offsets.set(end, rootTop + end.offsetTop);
      windowOffsetsRef.current = offsets;
    };
    cards.forEach((card, index) => {
      if (index < cards.length - 1) card.style.marginBottom = `${itemDistance}px`;
      card.style.willChange = "transform, filter";
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
      card.style.transform = "translateZ(0)";
      card.style.webkitTransform = "translateZ(0)";
      card.style.perspective = "1000px";
      card.style.webkitPerspective = "1000px";
    });
    measureWindowOffsets();
    setupLenis();
    updateCardTransforms();
    window.addEventListener("resize", measureWindowOffsets);

    return () => {
      window.removeEventListener("resize", measureWindowOffsets);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      lenisRef.current?.destroy();
      stackCompletedRef.current = false;
      cardsRef.current = [];
      lastTransformsRef.current.clear();
      isUpdatingRef.current = false;
    };
  }, [baseScale, blurAmount, itemDistance, itemScale, itemStackDistance, onStackComplete, rotationAmount, scaleDuration, scaleEndPosition, setupLenis, stackPosition, updateCardTransforms, useWindowScroll]);

  return <div className={`scroll-stack-scroller ${className}`.trim()} ref={scrollerRef}><div className="scroll-stack-inner">{children}<div className="scroll-stack-end" /></div></div>;
}
