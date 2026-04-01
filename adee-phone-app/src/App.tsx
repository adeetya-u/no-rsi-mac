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
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isPinError] = useState(false); // Kept for UI class binding
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // Logic: The browser no longer knows the PIN. It only knows what you type.
  // The Backend (Vercel) will do the real verification before sending your calendar data.

  // Listen for PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    try {
      (installPrompt as any).prompt();
      const { outcome } = await (installPrompt as any).userChoice;
      if (outcome === 'accepted') {
        setShowInstallButton(false);
      }
      setInstallPrompt(null);
    } catch (e) {
      console.error('Installation failed:', e);
    }
  };

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

            {/* Install PWA button */}
            {showInstallButton && (
              <motion.button
                className="install-pwa-btn"
                onClick={handleInstallClick}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                aria-label="Install app"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 14v5c0 .552-.45 1-1 1H6c-.55 0-1-.45-1-1v-5M12 2v12m5-7l-5 5-5-5" />
                </svg>
                <span>Install</span>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
