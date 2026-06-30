import React, { useEffect, useState } from 'react';
import { fetchWithCache } from '../../cache/apiCache';
import { formatLastUpdated } from '../../utils/formatters';

interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
}

// Open-Meteo gives weather as a numeric code, this maps it to a label + icon
function getWeatherInfo(code: number): { label: string; icon: string } {
  if (code === 0) return { label: 'Clear sky', icon: 'CLEAR' };
  if (code <= 3) return { label: 'Partly cloudy', icon: 'CLOUDY' };
  if (code <= 48) return { label: 'Foggy', icon: 'FOG' };
  if (code <= 67) return { label: 'Rainy', icon: 'RAIN' };
  if (code <= 77) return { label: 'Snowy', icon: 'SNOW' };
  if (code <= 99) return { label: 'Thunderstorm', icon: 'STORM' };
  return { label: 'Unknown', icon: '--' };
}

export default function WeatherWidget() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchWithCache<WeatherData>(
          'open-meteo-weather',
          async () => {
            const res = await fetch(
              'https://api.open-meteo.com/v1/forecast?latitude=17.385&longitude=78.4867&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code'
            );
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
          },
          15
        );
        setData(result.data);
        setLastUpdated(result.lastUpdated);
      } catch {
        setError('Failed to load weather data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="widget-card">
        <div className="widget-loading">Loading weather...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget-card">
        <div className="widget-error">{error}</div>
      </div>
    );
  }

  const temp = data?.current.temperature_2m ?? 0;
  const humidity = data?.current.relative_humidity_2m ?? 0;
  const wind = data?.current.wind_speed_10m ?? 0;
  const code = data?.current.weather_code ?? 0;
  const weatherInfo = getWeatherInfo(code);

  return (
    <div className="widget-card">
      <div className="widget-header">
        <span className="widget-title">Weather — Hyderabad</span>
        <span className="widget-last-updated">
          {lastUpdated ? formatLastUpdated(lastUpdated) : ''}
        </span>
      </div>

      <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: '#f7fafc' }}>
          {Math.round(temp)}°C
        </div>
        <div style={{ fontSize: 14, color: '#a0aec0', marginTop: 4 }}>
          {weatherInfo.label}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 13 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#718096', fontSize: 11 }}>HUMIDITY</div>
          <div style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 600 }}>{humidity}%</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#718096', fontSize: 11 }}>WIND</div>
          <div style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 600 }}>{wind} km/h</div>
        </div>
      </div>
    </div>
  );
}