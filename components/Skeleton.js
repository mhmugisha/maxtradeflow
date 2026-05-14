"use client";

/**
 * Skeleton — pulsing placeholder for loading states.
 *
 * Usage:
 *   <Skeleton width="80px" height="22px" />
 *   <Skeleton style={{ width: '100%', height: 120, borderRadius: 10 }} />
 */
export default function Skeleton({ width, height, style = {}, borderRadius = 4 }) {
  return (
    <div
      style={{
        width: width || '100%',
        height: height || '14px',
        background: 'linear-gradient(90deg, #0d1520 0%, #1a2535 50%, #0d1520 100%)',
        backgroundSize: '200% 100%',
        borderRadius,
        animation: 'skeleton-pulse 1.4s ease-in-out infinite',
        ...style,
      }}
    >
      <style>{`
        @keyframes skeleton-pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}