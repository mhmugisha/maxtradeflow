"use client";

import { useEffect, useRef, useState } from 'react';

export default function TradingViewChart({ symbol, height = 500, interval = '60' }) {
  // outerRef = React owns this, never touched by TradingView
  // innerRef = TradingView's playground, React never touches this
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Watch for the chart scrolling into view
  useEffect(() => {
    if (!outerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(outerRef.current);
    return () => observer.disconnect();
  }, []);

  // Inject TradingView widget into the inner (React-untouched) div
  useEffect(() => {
    if (!isVisible || !innerRef.current) return;

    const inner = innerRef.current;
    // Safe — innerRef is not part of React's tree, only TradingView lives here
    inner.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';
    inner.appendChild(widgetDiv);

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
      gridColor: '#1a2535',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      height,
      width: '100%',
    });
    inner.appendChild(script);

    return () => {
      // Cleanup also only touches the inner div, never React's tree
      if (inner) inner.innerHTML = '';
    };
  }, [isVisible, symbol, interval, height]);

  return (
    <div
      ref={outerRef}
      style={{ height: `${height}px`, width: '100%', position: 'relative', background: '#0d1520' }}
    >
      {/* TradingView's playground - React never re-renders inside this */}
      <div
        ref={innerRef}
        className="tradingview-widget-container"
        style={{ height: '100%', width: '100%' }}
      />

      {/* Loader overlay - lives outside the TradingView div, React-managed */}
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
          background: '#0d1520',
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