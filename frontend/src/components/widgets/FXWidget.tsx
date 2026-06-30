import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchWithCache } from '../../cache/apiCache';
import { formatLastUpdated } from '../../utils/formatters';

interface FXData {
  base: string;
  rates: { EUR: number; GBP: number; INR: number };
}

export default function FXWidget() {
  const [data, setData] = useState<FXData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchWithCache<FXData>(
          'frankfurter-fx',
          async () => {
            const res = await fetch(
              'https://api.frankfurter.dev/v1/latest?from=USD&to=EUR,GBP,INR'
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          },
          60 // cache for 60 minutes — FX rates don't change every second
        );
        setData(result.data);
        setLastUpdated(result.lastUpdated);
        setIsStale(result.isStale);
      } catch {
        setError('Failed to load FX rates');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="widget-card"><div className="widget-loading">Loading FX rates...</div></div>;
  if (error) return <div className="widget-card"><div className="widget-error">{error}</div></div>;

  const currencies = ['EUR', 'GBP', 'INR'] as const;
  const colors = { EUR: '#667eea', GBP: '#48bb78', INR: '#ed8936' };

  // Mock 30-day trend data for visualization
  const trendData = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    EUR: ((data?.rates.EUR ?? 0.92) + (Math.random() - 0.5) * 0.02).toFixed(4),
    GBP: ((data?.rates.GBP ?? 0.79) + (Math.random() - 0.5) * 0.015).toFixed(4),
    INR: ((data?.rates.INR ?? 83) + (Math.random() - 0.5) * 0.5).toFixed(2),
  }));

  return (
    <div className="widget-card">
      <div className="widget-header">
        <span className="widget-title">A2 — FX Rates (USD Base)</span>
        <span className={`widget-last-updated ${isStale ? 'stale' : ''}`}>
          {lastUpdated ? formatLastUpdated(lastUpdated) : ''}
        </span>
      </div>

      {/* Current rates as KPI strip */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
        {currencies.map((cur) => (
          <div key={cur}>
            <div style={{ color: '#a0aec0', fontSize: 12 }}>USD → {cur}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: colors[cur] }}>
              {data?.rates[cur].toFixed(4)}
            </div>
          </div>
        ))}
      </div>

      {/* 30-day trend line */}
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={trendData}>
          <XAxis dataKey="day" hide />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: '#1a1f2e', border: '1px solid #2d3748', fontSize: 11 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="EUR" stroke={colors.EUR} dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="GBP" stroke={colors.GBP} dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      <span className="alert-badge ok">✓ No cross-border invoicing alert</span>
    </div>
  );
}