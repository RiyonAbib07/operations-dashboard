import React, { useEffect, useState } from 'react';
import { fetchWithCache } from '../../cache/apiCache';
import { formatLastUpdated } from '../../utils/formatters';

interface AQData {
  hourly: {
    time: string[];
    pm2_5: number[];
    pm10: number[];
  };
}

function getAQIColor(value: number): string {
  if (value <= 50) return '#48bb78';
  if (value <= 100) return '#ed8936';
  if (value <= 150) return '#e53e3e';
  return '#742a2a';
}

function getAQILabel(value: number): string {
  if (value <= 50) return 'Good';
  if (value <= 100) return 'Moderate';
  if (value <= 150) return 'Unhealthy for Sensitive Groups';
  return 'Unhealthy';
}

export default function AirQualityWidget() {
  const [data, setData] = useState<AQData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchWithCache<AQData>(
          'open-meteo-aqi',
          async () => {
            // Hyderabad coordinates
            const res = await fetch(
              'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=17.385&longitude=78.4867&hourly=pm2_5,pm10'
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          },
          30
        );
        setData(result.data);
        setLastUpdated(result.lastUpdated);
      } catch {
        setError('Failed to load air quality data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="widget-card"><div className="widget-loading">Loading air quality...</div></div>;
  if (error) return <div className="widget-card"><div className="widget-error">{error}</div></div>;

  const currentPM25 = data?.hourly.pm2_5[0] ?? 0;
  const color = getAQIColor(currentPM25);
  const label = getAQILabel(currentPM25);
  const wfhTriggered = currentPM25 > 200;

  return (
    <div className="widget-card">
      <div className="widget-header">
        <span className="widget-title">A6 — Air Quality (Hyderabad)</span>
        <span className="widget-last-updated">
          {lastUpdated ? formatLastUpdated(lastUpdated) : ''}
        </span>
      </div>

      {/* Gauge display */}
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{
          width: 120, height: 120, borderRadius: '50%',
          border: `8px solid ${color}`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: 32, fontWeight: 700, color }}>
            {Math.round(currentPM25)}
          </div>
          <div style={{ fontSize: 11, color: '#718096' }}>PM2.5</div>
        </div>
        <div style={{ marginTop: 12, fontSize: 16, color, fontWeight: 600 }}>
          {label}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
        <div>
          <span style={{ color: '#718096' }}>PM10: </span>
          <span style={{ color: '#e2e8f0' }}>{Math.round(data?.hourly.pm10[0] ?? 0)}</span>
        </div>
        <div>
          <span style={{ color: '#718096' }}>Location: </span>
          <span style={{ color: '#e2e8f0' }}>Hyderabad</span>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {wfhTriggered ? (
          <span className="alert-badge triggered">⚠ WFH Advisory triggered (AQI &gt; 200)</span>
        ) : (
          <span className="alert-badge ok">✓ Air quality acceptable</span>
        )}
      </div>
    </div>
  );
}