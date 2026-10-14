"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export type OutfitItem = {
  src: string;
  alt: string;
  price: number;
  url?: string;
};

const layout = [
  {
    position: "z-30 -rotate-2",
    open: "group-open:-translate-x-[35%] group-open:-translate-y-6 group-open:-rotate-12",
  },
  {
    position: "z-20 rotate-3 translate-x-1 translate-y-5",
    open: "group-open:translate-y-6 group-open:rotate-6",
  },
  {
    position: "z-10 rotate-8 translate-x-3 translate-y-10",
    open: "group-open:translate-x-[35%] group-open:translate-y-6 group-open:rotate-12",
  },
  {
    position: "z-0 -rotate-12 -translate-x-6 translate-y-16",
    open: "group-open:-translate-x-[45%] group-open:translate-y-10 group-open:-rotate-[16deg]",
  },
];

export default function OutfitStack({
  items,
  eager = false,
}: {
  items: OutfitItem[];
  eager?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const touch = window.matchMedia("(hover: none)");
    let observer: IntersectionObserver | null = null;

    const sync = () => {
      if (touch.matches && !observer) {
        observer = new IntersectionObserver(
          ([entry]) => el.toggleAttribute("data-open", entry.isIntersecting),
          { threshold: 0.75 },
        );
        observer.observe(el);
      } else if (!touch.matches && observer) {
        observer.disconnect();
        observer = null;
        el.removeAttribute("data-open");
      }
    };

    sync();
    touch.addEventListener("change", sync);
    return () => {
      observer?.disconnect();
      touch.removeEventListener("change", sync);
    };
  }, []);

  return (
    <div ref={ref} className="group relative aspect-[2/3] w-72 md:w-80">
      {items.map((item, i) => {
        const slot = layout[Math.min(i, layout.length - 1)];
        return (
          <div
            key={item.src}
            className={`absolute inset-0 transition-all duration-500 ease-out will-change-transform ${slot.position} ${slot.open}`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(min-width: 768px) 20rem, 18rem"
              loading={eager ? "eager" : undefined}
              className="object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
