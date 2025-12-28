import "@testing-library/jest-dom";
import "@/i18n";

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!window.IntersectionObserver) {
  window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
}

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!window.ResizeObserver) {
  window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
}
