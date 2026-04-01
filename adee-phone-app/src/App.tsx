import { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import FlightTracker from './panels/FlightTracker';
import WorldClock from './panels/WorldClock';
import SpotifyPlayer from './panels/SpotifyPlayer';
import CalendarClock from './panels/CalendarClock';
import './App.css';

const PANELS = [
  { id: 'flights', component: FlightTracker, label: 'Flights' },
  { id: 'clocks', component: WorldClock, label: 'Clocks' },
  { id: 'spotify', component: SpotifyPlayer, label: 'Spotify' },
  { id: 'calendar', component: CalendarClock, label: 'Calendar' },
];

export default function App() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isPinError] = useState(false); // Kept for UI class binding

  // Logic: The browser no longer knows the PIN. It only knows what you type.
  // The Backend (Vercel) will do the real verification before sending your calendar data.


  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const newPin = pinInput + digit;
      setPinInput(newPin);
      
      if (newPin.length === 4) {
        // Blind authentication: we "accept" any 4 digits in the UI,
        // but the backend will refuse to send any private data if they are wrong.
        localStorage.setItem('standby_pin', newPin);
        setTimeout(() => setIsUnlocked(true), 300);
      }
    }
  };

  useEffect(() => {
    if (!isUnlocked || !scrollRef.current) return;

    // Simple, reliable scroll tracking: directly calculate visible panel from scroll position
    const handleScroll = () => {
      if (!scrollRef.current) return;

      const scroll = scrollRef.current.scrollLeft;
      const panelWidth = scrollRef.current.offsetWidth;

      // Find which panel is most visible (closest to center)
      const newIndex = Math.round(scroll / panelWidth);
      const clampedIndex = Math.max(0, Math.min(newIndex, PANELS.length - 1));

      setActiveIndex(clampedIndex);
    };

    scrollRef.current.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isUnlocked]);

  useEffect(() => {
    if (!isUnlocked) return;
    setIsTransitioning(true);
    const t = setTimeout(() => setIsTransitioning(false), 400);
    return () => clearTimeout(t);
  }, [activeIndex, isUnlocked]);

  return (
    <div className="standby-root">
      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          <motion.div 
            key="lock-screen"
            className="passcode-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`passcode-container ${isPinError ? 'shake' : ''}`}>
              <h2 className="passcode-title">Enter Passcode</h2>
              <div className="pin-indicator">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`pin-dot ${pinInput.length > i ? 'filled' : ''}`}
                  />
                ))}
              </div>
              <div className="keypad">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'delete'].map((btn, i) => (
                  <button 
                    key={i} 
                    className={`key-btn ${btn === '' ? 'empty' : ''}`}
                    onClick={() => {
                      if (typeof btn === 'number') handlePinDigit(btn.toString());
                      if (btn === 'delete') setPinInput(prev => prev.slice(0, -1));
                    }}
                    disabled={btn === ''}
                  >
                    {btn === 'delete' ? (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/>
                      </svg>
                    ) : btn}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            className="standby-unlocked-wrapper"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Scroll-snap container */}
            <div className="standby-scroll hide-scrollbar" ref={scrollRef}>
              {PANELS.map(({ id, component: Panel }) => (
                <section className="standby-panel" key={id} id={id}>
                  <Panel />
                </section>
              ))}
            </div>

            <div className="standby-dots">
              {PANELS.map((p, i) => (
                <motion.div
                  key={p.id}
                  className="dot-indicator"
                  layout
                  animate={{
                    width: i === activeIndex ? 20 : 6,
                    backgroundColor: i === activeIndex
                      ? 'rgba(255, 255, 255, 1)'
                      : 'rgba(255, 255, 255, 0.2)',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              ))}
            </div>

            {/* Subtle edge glow for active transition */}
            <AnimatePresence>
              {isTransitioning && (
                <motion.div
                  className="edge-glow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.15 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
