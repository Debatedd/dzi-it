"use client";

import { useEffect, useRef } from "react";

export default function ParallaxOrbs() {
  const orb1 = useRef<HTMLDivElement>(null);
  const orb2 = useRef<HTMLDivElement>(null);
  const orb3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (orb1.current) orb1.current.style.transform = `translateY(${y * 0.28}px)`;
      if (orb2.current) orb2.current.style.transform = `translateY(${y * 0.14}px)`;
      if (orb3.current) orb3.current.style.transform = `translateY(${y * 0.4}px)`;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {/* Top-left violet orb */}
      <div
        ref={orb1}
        className="orb"
        style={{
          width: 600,
          height: 600,
          top: -150,
          left: -180,
          background: "radial-gradient(circle, rgba(167,139,250,0.45) 0%, transparent 70%)",
        }}
      />
      {/* Centre-right cyan orb */}
      <div
        ref={orb2}
        className="orb"
        style={{
          width: 500,
          height: 500,
          top: 200,
          right: -140,
          background: "radial-gradient(circle, rgba(34,211,238,0.35) 0%, transparent 70%)",
        }}
      />
      {/* Bottom-left warm orb */}
      <div
        ref={orb3}
        className="orb"
        style={{
          width: 400,
          height: 400,
          top: 700,
          left: 100,
          background: "radial-gradient(circle, rgba(244,114,182,0.28) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
