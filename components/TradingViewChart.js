"use client";

import { useEffect, useRef, useState } from 'react';

export default function TradingViewChart({ symbol, height = 500, interval = '60' }) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Watch for the chart container scrolling into view
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Start loading 200px before chart enters viewport
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Inject TradingView script once visible, re-run when symbol changes
  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: '#0d1520',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      height,
      width: '100%',
    });
    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [isVisible, symbol, interval, height]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height: `${height}px`, width: '100%', position: 'relative', background: '#0d1520' }}
    >
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '8px',
          color: '#475569',
          fontSize: '12px',
          pointerEvents: 'none',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid #1a2535',
            borderTopColor: '#60c8d4',
            borderRadius: '50%',
            animation: 'tv-spin 0.8s linear infinite',
          }} />
          <div>{isVisible ? 'Loading chart…' : ''}</div>
          <style>{`@keyframes tv-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}