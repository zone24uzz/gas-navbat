import React, { useRef, useState } from 'react';

export default function RippleButton({
  children,
  onClick,
  className = 'btn-primary',
  disabled = false,
  style = {},
  type = 'button',
}) {
  const btnRef = useRef(null);
  const [ripples, setRipples] = useState([]);

  function handleClick(e) {
    const rect = btnRef.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = Date.now() + Math.random();
    setRipples(prev => [...prev, { id, x, y, size }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
    onClick?.(e);
  }

  return (
    <button
      ref={btnRef}
      type={type}
      className={`btn-ripple ${className}`}
      onClick={handleClick}
      disabled={disabled}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      {children}
      {ripples.map(r => (
        <span
          key={r.id}
          className="ripple-effect"
          style={{
            width: r.size,
            height: r.size,
            left: r.x,
            top: r.y,
          }}
        />
      ))}
    </button>
  );
}
