"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { cn } from "cn";

/**
 * Product images come from S3 and some seeded rows point at URLs that no
 * longer resolve. A broken image should degrade to a placeholder, not to a
 * torn icon in the middle of the grid.
 */
export function RemoteImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const usable = src && /^https?:\/\//.test(src) && !failed;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-muted",
        className,
      )}
    >
      {usable ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-200"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <ImageOff
            className="size-6 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="sr-only">{alt}</span>
        </div>
      )}
    </div>
  );
}
