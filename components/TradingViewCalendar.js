"use client";
import { useEffect, useRef, useState } from 'react';

export default function TradingViewCalendar({ height = 600 }) {
  // outerRef = React owns this, never touched by TradingView
  // innerRef = TradingView's playground, React never touches this
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Watch for the widget scrolling into view
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

  // Inject TradingView calendar widget into the inner (React-untouched) div
  useEffect(() => {
    if (!isVisible || !innerRef.current) return;
    const inner = innerRef.current;

    inner.innerHTML = '';
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';
    inner.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.innerHTML = JSON.stringify({
      colorTheme: 'dark',
      isTransparent: false,
      width: '100%',
      height,
      locale: 'en',
      importanceFilter: '-1,0,1',
      countryFilter: 'us,eu,gb,jp,ch,au,ca,nz,cn',
    });
    inner.appendChild(script);

    return () => {
      if (inner) inner.innerHTML = '';
    };
  }, [isVisible, height]);

  return (
    <div
      ref={outerRef}
      style={{ height: `${height}px`, width: '100%', position: 'relative', background: '#0d1520', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1a2535' }}
    >
      <div
        ref={innerRef}
        className="tradingview-widget-container"
        style={{ height: '100%', width: '100%' }}
      />
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
            animation: 'tvcal-spin 0.8s linear infinite',
          }} />
          <div>{isVisible ? 'Loading calendar…' : ''}</div>
          <style>{`@keyframes tvcal-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}
