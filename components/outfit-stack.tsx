import Image from "next/image";

export type OutfitItem = {
  src: string;
  alt: string;
  price: number;
};

const layout = [
  {
    position: "z-30 -rotate-2",
    hover:
      "group-hover:-translate-x-[35%] group-hover:-translate-y-6 group-hover:-rotate-12",
  },
  {
    position: "z-20 rotate-3 translate-x-1 translate-y-5",
    hover: "group-hover:translate-y-6 group-hover:rotate-6",
  },
  {
    position: "z-10 rotate-8 translate-x-3 translate-y-10",
    hover:
      "group-hover:translate-x-[35%] group-hover:translate-y-6 group-hover:rotate-12",
  },
];

export default function OutfitStack({
  items,
  eager = false,
}: {
  items: OutfitItem[];
  eager?: boolean;
}) {
  return (
    <div className="group relative aspect-[2/3] w-52 sm:w-80">
      {items.map((item, i) => {
        const slot = layout[Math.min(i, layout.length - 1)];
        return (
          <div
            key={item.src}
            className={`absolute inset-0 transition-all duration-500 ease-out will-change-transform ${slot.position} ${slot.hover}`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(min-width: 640px) 20rem, 13rem"
              loading={eager ? "eager" : undefined}
              className="object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
