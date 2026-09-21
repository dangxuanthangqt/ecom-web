import { Star } from "lucide-react";

import { cn } from "cn";

export function StarRating({
  value,
  size = "sm",
  label,
}: {
  value: number;
  size?: "sm" | "md";
  label: string;
}) {
  const rounded = Math.round(value);

  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={label}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          className={cn(
            size === "sm" ? "size-3.5" : "size-5",
            star <= rounded
              ? "fill-cta text-cta"
              : "fill-transparent text-muted-foreground/50",
          )}
        />
      ))}
    </span>
  );
}
