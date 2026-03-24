import { useEffect, useRef, useState } from 'react';

export function AnimatedNumber({
  value,
  format = (n) => n.toString(),
  className,
  duration = 600,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);
  const rafId = useRef<number>();

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    prevValue.current = value;

    if (from === to) return;

    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) {
        rafId.current = requestAnimationFrame(step);
      }
    };
    rafId.current = requestAnimationFrame(step);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [value, duration]);

  return <span className={className}>{format(display)}</span>;
}
