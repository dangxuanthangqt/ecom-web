import { cn } from "cn";
import type { ComponentProps } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type ButtonLinkProps = ComponentProps<typeof Link> &
  Parameters<typeof buttonVariants>[0];

/**
 * A link wearing button styling. Routing it through `Button` instead would put
 * base-ui's `useButton` on an anchor, which either logs a `nativeButton`
 * mismatch or stamps `role="button"` over the anchor's own role — a navigation
 * control should stay announced as a link.
 */
export function ButtonLink({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
