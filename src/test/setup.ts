import "@testing-library/jest-dom/vitest";

// Ensure i18n is initialized for components using useTranslation.
import "../i18n/config";

// Common browser APIs used by UI libs (Radix, charts, etc).
if (!window.matchMedia) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    // Deprecated but sometimes called:
    addListener: () => {},
    removeListener: () => {},
  })) as any;
}

if (!("ResizeObserver" in window)) {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ResizeObserver = ResizeObserver;
}

if (!("IntersectionObserver" in window)) {
  class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).IntersectionObserver = IntersectionObserver;
}

