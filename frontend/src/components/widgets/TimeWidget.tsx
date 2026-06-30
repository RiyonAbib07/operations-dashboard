import React, { useEffect, useState } from 'react';

export default function TimeWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Updates the time every second — classic setInterval usage
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    // Cleanup: stop the timer when the component unmounts
    // This prevents a memory leak — an important interview point
    return () => clearInterval(interval);
  }, []);

  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateString = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hour = now.getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  return (
    <div className="widget-card">
      <div className="widget-header">
        <span className="widget-title">Office Clock — IST</span>
      </div>

      <div style={{ textAlign: 'center', padding: '12px 0' }}>
        <div style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>
          {greeting}, Founder
        </div>
        <div style={{
          fontSize: 42,
          fontWeight: 700,
          color: '#667eea',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {timeString}
        </div>
        <div style={{ fontSize: 13, color: '#a0aec0', marginTop: 6 }}>
          {dateString}
        </div>
      </div>
    </div>
  );
}