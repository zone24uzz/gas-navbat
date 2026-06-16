import React, { useEffect, useRef, useCallback } from 'react';

export default function CursorGlow() {
  const glowRef = useRef(null);
  const posRef = useRef({ x: -200, y: -200 });
  const targetRef = useRef({ x: -200, y: -200 });
  const rafRef = useRef(null);

  const animate = useCallback(() => {
    const current = posRef.current;
    const target = targetRef.current;
    current.x += (target.x - current.x) * 0.08;
    current.y += (target.y - current.y) * 0.08;
    if (glowRef.current) {
      glowRef.current.style.transform = `translate(${current.x - 150}px, ${current.y - 150}px)`;
    }
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const handleMouse = (e) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleTouch = () => {
      if (glowRef.current) glowRef.current.style.opacity = '0';
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    window.addEventListener('touchstart', handleTouch, { passive: true });
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('touchstart', handleTouch);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(82,127,176,0.06) 0%, rgba(124,159,201,0.03) 40%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 99999,
        transition: 'opacity 0.3s',
        willChange: 'transform',
      }}
    />
  );
}
