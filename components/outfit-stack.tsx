"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
  const [open, setOpen] = useState(false);

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

  const toggle = () => setOpen((value) => !value);

  return (
    <div className="relative">
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggle();
          }
        }}
        className="group relative aspect-[2/3] w-72 cursor-pointer md:w-80"
      >
        {items.map((item, i) => {
          const slot = layout[Math.min(i, layout.length - 1)];
          return (
            <div
              key={item.src}
              className={`pointer-events-none absolute inset-0 transition-all duration-500 ease-out will-change-transform ${open ? "opacity-0" : ""} ${slot.position} ${slot.open}`}
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
      {open && (
        <>
          <div className="absolute inset-0 z-50 -left-[45%] -right-[35%] -top-[1.5rem] bg-white md:top-[calc(var(--pull)*30rem-1.5rem)]" />
          <div className="absolute inset-0 z-50 overflow-y-auto p-4 md:top-[calc(var(--pull)*30rem)]">
            <div className="flex min-h-full flex-col justify-center gap-3">
            <button
              type="button"
              aria-label="back"
              onClick={toggle}
              className="cursor-pointer self-start p-1"
            >
              {"<-"}
            </button>
            <ul className="flex flex-col gap-3">
          {items.map((item) => {
            const row = (
              <>
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={30}
                  height={45}
                  className="h-[45px] w-[30px] shrink-0 object-contain"
                />
                <span className={item.url ? "underline" : undefined}>
                  {item.alt}
                </span>
                <span className="ml-auto">€{item.price.toFixed(2)}</span>
              </>
            );
            return (
              <li key={item.src}>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3"
                  >
                    {row}
                  </a>
                ) : (
                  <div className="flex items-center gap-3">{row}</div>
                )}
              </li>
            );
          })}
            </ul>
          </div>
          </div>
        </>
      )}
    </div>
  );
}
