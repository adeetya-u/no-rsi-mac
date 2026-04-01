import { MESSAGE_INTERVAL, TOTAL_TRANSITION } from './constants.js';

export class MessageRotator {
  constructor(board) {
    this.board = board;
    this.currentIndex = 0;
    this.flights = [];
    this._timer = null;
    this._fetchTimer = null;
    this._paused = false;
    this.isActive = true; // Track if this panel is visible
    this.targetLat = 19.104008; // Precise Latitude
    this.targetLon = 72.8992;   // Precise Longitude

    // Listen for messages from parent React component
    window.addEventListener('message', (e) => {
      if (e.data.type === 'START_FETCH') {
        this.isActive = true;
        this.fetchData(); // Fetch immediately when panel becomes visible
      } else if (e.data.type === 'STOP_FETCH') {
        this.isActive = false;
      }
    });
  }

  start() {
    this.fetchData(); // Initial fetch on load
    // Fetch new flight data every 60 seconds (instead of 15s) to save API limits
    this._fetchTimer = setInterval(() => {
      if (this.isActive && !document.hidden) {
        this.fetchData();
      }
    }, 60000);

    // Rotate between nearby flights every 9 seconds
    this._timer = setInterval(() => {
      if (!this._paused && !this.board.isTransitioning && !document.hidden && this.isActive) {
        this.next();
      }
    }, 8000 + TOTAL_TRANSITION);

    // Resume fetching immediately if the user comes back to the tab
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && this.isActive) {
        this.fetchData();
      }
    });
  }

  stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    if (this._fetchTimer) {
      clearInterval(this._fetchTimer);
      this._fetchTimer = null;
    }
  }

  async fetchData() {
    try {
      const resp = await fetch('/api/flights');
      const data = await resp.json();
      if (data && (data.version || data.full_count !== undefined)) {
        let parsed = [];
        for (const [key, flightInfo] of Object.entries(data)) {
           if (key === 'full_count' || key === 'version') continue;
           
           // FR24 API indexes:
           // 1=lat, 2=lon, 3=track, 4=alt(ft), 5=speed(kts), 11=Orig, 12=Dest, 14=on_ground, 16=Callsign
           if (!Array.isArray(flightInfo)) continue;

           const onGround = flightInfo[14];
           if (onGround === 1) continue; // Exclude grounded planes
           
           const alt = flightInfo[4] || 0;
           if (alt >= 9999) continue; // Exclude high-altitude overflights (cap < 9999 ft)
           
           const lat = flightInfo[1];
           const lon = flightInfo[2];
           let dist = 999;
           if (lat !== null && lon !== null) {
             dist = this.getHaversineDistance(this.targetLat, this.targetLon, lat, lon);
           }
           
           parsed.push({
             callsign: flightInfo[16] || flightInfo[13] || 'UNKNOWN',
             alt: flightInfo[4] || 0, // already ft
             speed: flightInfo[5] || 0, // already knots
             track: flightInfo[3] || 0,
             dist: dist,
             orig: flightInfo[11] || 'UNK',
             dest: flightInfo[12] || 'UNK'
           });
        }
        
        parsed.sort((a, b) => a.dist - b.dist);
        this.flights = parsed.slice(0, 5);
      } else {
        this.flights = [];
      }
      
      // If we just loaded and there's no data, show "NO FLIGHTS" immediately
      if (this.flights.length === 0 && !this.board.isTransitioning && this.currentIndex === 0) {
         this.showFlight(null);
      } else if (this.flights.length > 0 && !this.board.isTransitioning && this.currentIndex === 0) {
         // Show immediately on first load
         this.showFlight(this.flights[this.currentIndex]);
      }
    } catch (e) {
      console.error('Failed to fetch flight data:', e);
    }
  }

  getHaversineDistance(lat1, lon1, lat2, lon2) {
      const R = 3440.065; // Radius of Earth in nautical miles
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
  }

  next() {
    if (this.flights.length === 0) {
      this.showFlight(null);
      return;
    }
    this.currentIndex = (this.currentIndex + 1) % this.flights.length;
    this.showFlight(this.flights[this.currentIndex]);
    this._resetAutoRotation();
  }

  prev() {
    if (this.flights.length === 0) {
      this.showFlight(null);
      return;
    }
    this.currentIndex = (this.currentIndex - 1 + this.flights.length) % this.flights.length;
    this.showFlight(this.flights[this.currentIndex]);
    this._resetAutoRotation();
  }

  _resetAutoRotation() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = setInterval(() => {
        if (!this._paused && !this.board.isTransitioning) {
          this.next();
        }
      }, 8000 + TOTAL_TRANSITION);
    }
  }

  showFlight(flight) {
    if (!flight) {
      this.board.displayMessage([
        '',
        'NO FLIGHTS',
        'NEAR BRYONY',
        '',
        ''
      ]);
      return;
    }

    const lines = [
      `FLIGHT ${flight.callsign}`,
      `ROUTE  ${flight.orig}-${flight.dest}`,
      `ALT    ${flight.alt} FT`,
      `SPD    ${flight.speed} KTS`,
      `DIST   ${flight.dist.toFixed(1)} NM`
    ];
    this.board.displayMessage(lines);
  }
}
