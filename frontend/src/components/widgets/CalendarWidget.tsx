import React from 'react';

interface ScheduleItem {
  time: string;
  title: string;
  type: 'meeting' | 'call' | 'deadline' | 'personal' | 'review';
  withWhom?: string;
}

// Mock schedule — represents a realistic Founder's Office day
const todaySchedule: ScheduleItem[] = [
  { time: '9:00 AM', title: 'Daily SOP Action Queue review', type: 'review' },
  { time: '10:30 AM', title: 'Client onboarding call — Meridian Corp', type: 'call', withWhom: 'Meridian Corp' },
  { time: '12:00 PM', title: 'Lunch with the ops team', type: 'personal' },
  { time: '1:30 PM', title: 'SOP refresh deadline — Q3 Compliance doc', type: 'deadline' },
  { time: '3:00 PM', title: 'Investor Update prep meeting', type: 'meeting' },
  { time: '4:30 PM', title: 'Capacity reallocation review — Engineering team', type: 'review' },
  { time: '6:00 PM', title: 'Crisis Comms briefing — Press mention follow-up', type: 'meeting' },
];

const typeStyles: Record<ScheduleItem['type'], { color: string; label: string }> = {
  meeting:  { color: '#667eea', label: 'MEETING' },
  call:     { color: '#48bb78', label: 'CALL' },
  deadline: { color: '#f56565', label: 'DEADLINE' },
  personal: { color: '#ed8936', label: 'PERSONAL' },
  review:   { color: '#9f7aea', label: 'REVIEW' },
};

export default function CalendarWidget() {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  // Roughly figures out which schedule item is "current" based on time of day
  function parseTimeToHour(timeStr: string): number {
    const [time, period] = timeStr.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h + m / 60;
  }

  return (
    <div className="widget-card full-width">
      <div className="widget-header">
        <span className="widget-title">Today's Schedule — Founder's Office</span>
        <span className="widget-last-updated">
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {todaySchedule.map((item, i) => {
          const itemHour = parseTimeToHour(item.time);
          const isPast = itemHour < currentHour - 0.5;
          const isCurrent = Math.abs(itemHour - currentHour) <= 0.5;
          const style = typeStyles[item.type];

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                background: isCurrent ? '#2d374855' : 'transparent',
                border: isCurrent ? '1px solid #667eea' : '1px solid transparent',
                opacity: isPast ? 0.45 : 1,
              }}
            >
              <div style={{ width: 80, fontSize: 13, color: '#a0aec0', flexShrink: 0 }}>
                {item.time}
              </div>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: style.color,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, fontSize: 14, color: '#e2e8f0' }}>
                {item.title}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: style.color,
                  border: '1px solid ' + style.color,
                  borderRadius: 12,
                  padding: '2px 8px',
                  flexShrink: 0,
                }}
              >
                {style.label}
              </div>
              {isCurrent && (
                <span style={{ fontSize: 11, color: '#667eea', fontWeight: 600, flexShrink: 0 }}>
                  NOW
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}