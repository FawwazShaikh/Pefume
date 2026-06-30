import { useState, useEffect, useRef } from 'react';

/**
 * LazyRender defers rendering of its children until they are scrolled close to the viewport,
 * significantly improving initial FCP, DOM size, and initial JS execution latency.
 */
export default function LazyRender({ children, placeholderHeight = '300px' }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    // If IntersectionObserver is not supported, render immediately
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' } // Preload 300px before scrolling into view
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return isVisible ? (
    children
  ) : (
    <div ref={ref} style={{ minHeight: placeholderHeight, width: '100%' }} />
  );
}
