"use client";

import { useState } from "react";

import { RemoteImage } from "@/components/common/remote-image";
import { cn } from "cn";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const gallery = images.length > 0 ? images : [""];

  return (
    <div className="space-y-3">
      <RemoteImage
        src={gallery[active]}
        alt={alt}
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="aspect-square w-full"
      />

      {gallery.length > 1 ? (
        <ul className="grid grid-cols-5 gap-2">
          {gallery.map((image, index) => (
            <li key={`${image}-${index}`}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`${alt} ${index + 1}`}
                aria-current={index === active}
                className={cn(
                  "block w-full rounded-lg border-2 transition-colors",
                  index === active ? "border-primary" : "border-transparent",
                )}
              >
                <RemoteImage
                  src={image}
                  alt=""
                  sizes="20vw"
                  className="aspect-square w-full"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
