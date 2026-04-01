import { useEffect, useRef } from 'react';
import './FlightTracker.css';

export default function FlightTracker() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Detect when this panel becomes visible/hidden using IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some(entry => entry.isIntersecting);

        if (iframeRef.current?.contentWindow) {
          // Tell iframe to start/stop fetching
          iframeRef.current.contentWindow.postMessage(
            { type: isVisible ? 'START_FETCH' : 'STOP_FETCH' },
            '*'
          );
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flight-panel" ref={containerRef}>
      <iframe
        ref={iframeRef}
        src="/flight-tracker/index.html"
        className="flight-iframe"
        title="BOM Flight Tracker"
        frameBorder="0"
        scrolling="no"
        allow="accelerometer; autoplay"
      />
    </div>
  );
}
