import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import './CalendarClock.css';

/*
 * Multi-Calendar Integration via Private ICS URLs
 * Blue = adeetya.upadhyay@gmail.com (personal)
 * Purple = adeeu2@illinois.edu (university)
 */

type CalendarSource = 'personal' | 'university' | 'classes';

interface CalendarEvent {
  summary: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  location?: string;
  source: CalendarSource;
}

// Calendar sources with their colors
const CALENDARS: { id: CalendarSource; color: string; label: string }[] = [
  { id: 'personal', color: '#0a84ff', label: 'Personal' },
  { id: 'university', color: '#bf5af2', label: 'University' },
  { id: 'classes', color: '#E84A27', label: 'Classes' },
];

/**
 * Minimal ICS parser — extracts VEVENT blocks from an .ics file
 */
function parseICS(icsText: string, source: CalendarSource): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const blocks = icsText.split('BEGIN:VEVENT');

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split('END:VEVENT')[0];

    const getField = (name: string): string => {
      // Unfold continuation lines (RFC 5545 §3.1)
      const unfolded = block.replace(/\r?\n[ \t]/g, '');
      const regex = new RegExp(`^${name}[;:](.*)$`, 'm');
      const match = unfolded.match(regex);
      if (!match) return '';
      // Unescape ICS text: \n → ' · ', \\ → \, \, → ,
      return match[1].trim()
        .replace(/\\n/gi, ' · ')
        .replace(/\\,/g, ',')
        .replace(/\\\\/g, '\\');
    };

    const summary = getField('SUMMARY');
    const dtStartRaw = getField('DTSTART');
    const dtEndRaw = getField('DTEND');
    const location = getField('LOCATION');

    const parseICSDate = (raw: string): Date => {
      const val = raw.includes(':') ? raw.split(':').pop()! : raw;
      if (val.length === 8) {
        return new Date(
          parseInt(val.slice(0, 4)),
          parseInt(val.slice(4, 6)) - 1,
          parseInt(val.slice(6, 8))
        );
      }
      const year = parseInt(val.slice(0, 4));
      const month = parseInt(val.slice(4, 6)) - 1;
      const day = parseInt(val.slice(6, 8));
      const hour = parseInt(val.slice(9, 11));
      const min = parseInt(val.slice(11, 13));
      const sec = parseInt(val.slice(13, 15)) || 0;

      if (val.endsWith('Z')) {
        return new Date(Date.UTC(year, month, day, hour, min, sec));
      }
      return new Date(year, month, day, hour, min, sec);
    };

    const isAllDay = dtStartRaw.includes('VALUE=DATE') || (
      !dtStartRaw.includes('T') && dtStartRaw.replace(/[^0-9]/g, '').length === 8
    );

    const start = parseICSDate(dtStartRaw);
    const end = dtEndRaw ? parseICSDate(dtEndRaw) : start;

    if (summary) {
      events.push({ summary, start, end, isAllDay, location: location || undefined, source });
    }
  }

  return events;
}

function getEventsForDate(allEvents: CalendarEvent[], targetDate: Date): CalendarEvent[] {
  const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const dayEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);
  const now = new Date();

  const dayEvts = allEvents
    .filter(e => {
      // Include event if it overlaps with the target date
      const overlaps = e.start <= dayEnd && e.end >= dayStart;
      // Filter out events that have already ended (unless they start today)
      const notEnded = e.end >= now || (e.start.getDate() === now.getDate() &&
                       e.start.getMonth() === now.getMonth() &&
                       e.start.getFullYear() === now.getFullYear());
      return overlaps && notEnded;
    })
    .sort((a, b) => {
      if (a.isAllDay && !b.isAllDay) return -1;
      if (!a.isAllDay && b.isAllDay) return 1;
      return a.start.getTime() - b.start.getTime();
    });

  return dayEvts.slice(0, 4);
}

async function fetchICS(type: CalendarSource, skipCache: boolean = false): Promise<string> {
  const pin = localStorage.getItem('standby_pin') || '';
  try {
    const url = new URL(`/api/calendar?type=${type}`, window.location.origin);
    // Add cache-busting parameter on manual refresh
    if (skipCache) {
      url.searchParams.set('_t', Date.now().toString());
    }
    const resp = await fetch(url.toString(), {
      headers: { 'x-app-pin': pin }
    });
    if (resp.ok) return await resp.text();
  } catch (e) {
    console.error('Secure fetch failed:', e);
  }
  return '';
}

// ── Digital Squircle Clock ────────────────────────────────────────────────────
//
// 60 tick marks follow the perimeter of a rounded-square (squircle).
// Each tick brightens as its second passes within the current minute.
// The time display is a large digital HH:MM in the center.
// All updates go through RAF + direct DOM attrs — zero React re-renders.

const DC_SIZE = 320;
const DC_CX = DC_SIZE / 2;
const DC_CY = DC_SIZE / 2;
const DC_SIDE = 286;   // squircle outer side length
const DC_RADIUS = 52;  // corner radius
const TICK_COUNT = 60;

/** Distribute `count` points evenly around a rounded-rect perimeter,
 *  clockwise from 12 o'clock (top-center). Returns {x,y,nx,ny} where
 *  nx/ny is the outward unit normal at each point. */
function squirclePerimeter(
  count: number, cx: number, cy: number, W: number, R: number
): { x: number; y: number; nx: number; ny: number }[] {
  const S = W - 2 * R;                  // straight-section length per side
  const A = (Math.PI / 2) * R;          // arc length per corner
  const total = 4 * S + 4 * A;

  type Seg = { len: number; pos: (t: number) => { x: number; y: number; nx: number; ny: number } };
  const segs: Seg[] = [
    // 1. Top right half
    { len: S / 2, pos: t => ({ x: cx + t * S / 2,              y: cy - W / 2, nx: 0, ny: -1 }) },
    // 2. Top-right corner
    { len: A, pos: t => { const a = -Math.PI/2 + t*Math.PI/2; return { x: cx+W/2-R + R*Math.cos(a), y: cy-W/2+R + R*Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) }; } },
    // 3. Right side
    { len: S, pos: t => ({ x: cx + W / 2,                      y: cy-W/2+R + t*S, nx: 1,  ny: 0 }) },
    // 4. Bottom-right corner
    { len: A, pos: t => { const a = t*Math.PI/2;               return { x: cx+W/2-R + R*Math.cos(a), y: cy+W/2-R + R*Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) }; } },
    // 5. Bottom side (going left)
    { len: S, pos: t => ({ x: cx+W/2-R - t*S,                  y: cy + W / 2, nx: 0,  ny: 1 }) },
    // 6. Bottom-left corner
    { len: A, pos: t => { const a = Math.PI/2 + t*Math.PI/2;  return { x: cx-W/2+R + R*Math.cos(a), y: cy+W/2-R + R*Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) }; } },
    // 7. Left side (going up)
    { len: S, pos: t => ({ x: cx - W / 2,                      y: cy+W/2-R - t*S, nx: -1, ny: 0 }) },
    // 8. Top-left corner
    { len: A, pos: t => { const a = Math.PI + t*Math.PI/2;    return { x: cx-W/2+R + R*Math.cos(a), y: cy-W/2+R + R*Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) }; } },
    // 9. Top left half
    { len: S / 2, pos: t => ({ x: cx-W/2+R + t*S/2,            y: cy - W / 2, nx: 0, ny: -1 }) },
  ];

  const pts: { x: number; y: number; nx: number; ny: number }[] = [];
  for (let i = 0; i < count; i++) {
    let dist = (i / count) * total;
    let acc = 0;
    for (const seg of segs) {
      if (dist <= acc + seg.len + 1e-9) {
        pts.push(seg.pos(seg.len > 0 ? Math.min((dist - acc) / seg.len, 1) : 0));
        break;
      }
      acc += seg.len;
    }
  }
  return pts;
}

const TICK_POS = squirclePerimeter(TICK_COUNT, DC_CX, DC_CY, DC_SIDE, DC_RADIUS);

function DigitalClock() {
  const timeRef  = useRef<SVGTextElement>(null);
  const tickRefs = useRef<(SVGLineElement | null)[]>(new Array(TICK_COUNT).fill(null));

  useEffect(() => {
    let raf: number;

    const animate = () => {
      const now = new Date();
      const h = now.getHours() % 12 || 12;
      const m = now.getMinutes();
      const s = now.getSeconds();
      const ms = now.getMilliseconds();

      // Update digital time label
      if (timeRef.current) {
        timeRef.current.textContent = `${h}:${String(m).padStart(2, '0')}`;
      }

      // Update tick colours
      const sFloat = s + ms / 1000;
      const ticks = tickRefs.current;
      
      for (let i = 0; i < TICK_COUNT; i++) {
        const el = ticks[i];
        if (!el) continue;
        
        const isHour = i % 5 === 0;
        
        // Circular distance from sFloat to tick i
        // (sFloat - i + 60) % 60 gives how many seconds ago this tick was "current"
        const dist = (sFloat - i + 60) % 60;
        
        let opacity = 0.15;
        let width = isHour ? 2 : 1.5;

        // One single smooth decay function spanning 0 to 20 seconds
        if (dist >= 0 && dist <= 20) {
          const factor = dist / 20; // 0 to 1
          // Exponential ease for a sharper leading edge then a long tail
          const ease = 1 - Math.pow(factor, 0.5); 
          opacity = 0.15 + ease * 0.85;
          width = (isHour ? 2 : 1.5) + ease * 1.5;
        }
        
        el.setAttribute('stroke', `rgba(255,255,255,${opacity.toFixed(3)})`);
        el.setAttribute('stroke-width', width.toFixed(2));
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const initialH = new Date().getHours() % 12 || 12;
  const initialM = new Date().getMinutes();

  return (
    <svg
      width={DC_SIZE}
      height={DC_SIZE}
      viewBox={`0 0 ${DC_SIZE} ${DC_SIZE}`}
      className="cal-digital-clock"
    >
      {TICK_POS.map((tp, i) => {
        const isHour = i % 5 === 0;
        const len = isHour ? 14 : 9;
        const dx = DC_CX - tp.x;
        const dy = DC_CY - tp.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        return (
          <line
            key={i}
            ref={el => { tickRefs.current[i] = el; }}
            x1={tp.x}
            y1={tp.y}
            x2={tp.x + len * (dx / d)}
            y2={tp.y + len * (dy / d)}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={isHour ? 2 : 1.5}
            strokeLinecap="round"
          />
        );
      })}

      <text
        ref={timeRef}
        x={DC_CX}
        y={DC_CY}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize="106"
        fontWeight="800"
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"
        letterSpacing="-4"
      >
        {`${initialH}:${String(initialM).padStart(2, '0')}`}
      </text>
    </svg>
  );
}

function getEventColor(source: CalendarSource): string {
  const cal = CALENDARS.find(c => c.id === source);
  return cal?.color ?? '#0a84ff';
}

export default function CalendarClock() {
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetchVersion = useRef(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const configured = true;

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllCalendars = useCallback(async (isManualRefresh = false) => {
    if (!configured) { setLoading(false); return; }

    const version = ++fetchVersion.current;
    if (isManualRefresh) setRefreshing(true);

    try {
      const results = await Promise.allSettled(
        CALENDARS.map(async (cal) => {
          const icsText = await fetchICS(cal.id, isManualRefresh);
          return parseICS(icsText, cal.id);
        })
      );

      if (version !== fetchVersion.current) return;

      const events: CalendarEvent[] = [];
      for (const result of results) {
        if (result.status === 'fulfilled') {
          events.push(...result.value);
        }
      }

      // Only keep future events (not ended)
      const now = new Date();
      setAllEvents(events.filter(e => e.end >= now));
    } catch (e) {
      console.error('Calendar fetch error:', e);
    }

    setLoading(false);
    setRefreshing(false);
  }, [configured]);

  useEffect(() => {
    fetchAllCalendars();
    const interval = setInterval(() => fetchAllCalendars(), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAllCalendars]);

  const handleRefresh = () => {
    if (refreshing) return;
    fetchAllCalendars(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // Require significant vertical swipe (down/up) with minimal horizontal movement
    if (Math.abs(deltaY) > 50 && Math.abs(deltaX) < Math.abs(deltaY)) {
      const newDate = new Date(selectedDate);
      if (deltaY > 0) {
        // Swipe down: next day
        newDate.setDate(newDate.getDate() + 1);
      } else {
        // Swipe up: previous day
        newDate.setDate(newDate.getDate() - 1);
      }
      setSelectedDate(newDate);
    }
  };

  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const events = getEventsForDate(allEvents, selectedDate);
  const nextEvent = events.length > 0 ? events[0] : null;
  const remainingEvents = events.slice(1);

  const formatEventTime = (evt: CalendarEvent) => {
    if (evt.isAllDay) return 'All day';
    const fmt = (d: Date) => d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).replace(' ', '\u2009');
    return `${fmt(evt.start)} – ${fmt(evt.end)}`;
  };

  const isEventNow = (evt: CalendarEvent) => {
    return !evt.isAllDay && evt.start <= now && evt.end >= now;
  };

  return (
    <div
      className="cal-panel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div
        className="cal-clock-side"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <DigitalClock />
      </motion.div>

      <motion.div
        className="cal-info-side"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <button
          className={`cal-refresh-btn ${refreshing ? 'cal-refresh-spinning' : ''}`}
          onClick={handleRefresh}
          aria-label="Refresh calendars"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M13.65 2.35A7.96 7.96 0 0 0 8 0C3.58 0 0 3.58 0 8s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 8 14 6 6 0 1 1 8 2c1.66 0 3.14.69 4.22 1.78L9 7h7V0l-2.35 2.35z"
              fill="rgba(255,255,255,0.2)"
            />
          </svg>
        </button>

        {!configured ? (
          <div className="cal-unconfigured">
            <span className="cal-hero-title">Calendar</span>
            <span className="cal-empty-sub">Add ICS URLs to .env</span>
          </div>
        ) : loading ? (
          <div className="cal-empty-state">
            <span className="cal-empty-sub">Loading…</span>
          </div>
        ) : (
          <>
            <div className="cal-date-header">
              {formatDateHeader(selectedDate)}
            </div>
            {events.length === 0 ? (
              <div className="cal-empty-state">
                <span className="cal-hero-title">No Events</span>
                <span className="cal-empty-sub">Your day is clear · Swipe to navigate</span>
              </div>
            ) : (
              <>
                {nextEvent && (
                  <div className="cal-hero-event">
                    <div
                      className="cal-hero-bar"
                      style={{ background: getEventColor(nextEvent.source) }}
                    />
                    <div className="cal-hero-content">
                      <span className="cal-hero-time" style={{ color: getEventColor(nextEvent.source) }}>
                        {formatEventTime(nextEvent)}
                      </span>
                      <span className="cal-hero-title" style={{ color: getEventColor(nextEvent.source) }}>
                        {nextEvent.summary}
                      </span>
                      {nextEvent.location && (
                        <span className="cal-hero-location" style={{ color: getEventColor(nextEvent.source) }}>
                          {nextEvent.location}
                        </span>
                      )}
                      {isEventNow(nextEvent) && (
                        <span className="cal-now-badge">NOW</span>
                      )}
                    </div>
                  </div>
                )}

                {remainingEvents.length > 0 && (
                  <div className="cal-secondary-events">
                    {remainingEvents.map((evt, i) => (
                      <motion.div
                        className="cal-secondary-item"
                        key={evt.summary + evt.source + i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.05, duration: 0.25 }}
                      >
                        <div
                          className="cal-secondary-bar"
                          style={{ background: getEventColor(evt.source) }}
                        />
                        <div className="cal-secondary-content">
                          <span className="cal-secondary-time" style={{ color: getEventColor(evt.source) }}>
                            {formatEventTime(evt)}
                          </span>
                          <span className="cal-secondary-name" style={{ color: getEventColor(evt.source) }}>
                            {evt.summary}
                          </span>
                          {evt.location && (
                            <span className="cal-secondary-location" style={{ color: getEventColor(evt.source), opacity: 0.7 }}>
                              {evt.location}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
