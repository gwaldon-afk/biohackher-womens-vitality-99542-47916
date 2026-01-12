import React, { useEffect, useRef, useState } from "react";

type LazyOnVisibleProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  minHeight?: number | string;
};

/**
 * Mounts children only once the wrapper scrolls into view.
 * Useful for deferring heavy (e.g. chart) bundles until needed.
 */
export function LazyOnVisible({
  children,
  fallback = null,
  rootMargin = "200px",
  minHeight,
}: LazyOnVisibleProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;

    // No IO support (or during tests): just render.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, visible]);

  return (
    <div ref={ref} style={minHeight != null ? { minHeight } : undefined}>
      {visible ? children : fallback}
    </div>
  );
}

