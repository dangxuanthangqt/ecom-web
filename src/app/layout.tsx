import type { ReactNode } from "react";

/**
 * `<html>` and `<body>` live in `[locale]/layout.tsx`, which is the first
 * layout that knows the language and text direction to declare.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
