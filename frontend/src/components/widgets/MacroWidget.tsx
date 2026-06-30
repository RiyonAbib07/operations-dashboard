import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchWithCache } from '../../cache/apiCache';
import { formatLastUpdated } from '../../utils/formatters';

interface WorldBankEntry {
  date: string;
  value: number | null;
}

export default function MacroWidget() {
  const [data, setData] = useState<WorldBankEntry[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchWithCache<[unknown, WorldBankEntry[]]>(
          'worldbank-gdp',
          async () => {
            const res = await fetch(
              'https://api.worldbank.org/v2/country/IND/indicator/NY.GDP.MKTP.CD?format=json&mrv=8'
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          },
          120
        );
        const entries = (result.data[1] ?? [])
          .filter((e: WorldBankEntry) => e.value !== null)
          .slice(0, 6)
          .reverse();
        setData(entries);
        setLastUpdated(result.lastUpdated);
      } catch {
        setError('Failed to load World Bank data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="widget-card"><div className="widget-loading">Loading macro data...</div></div>;
  if (error) return <div className="widget-card"><div className="widget-error">{error}</div></div>;

  const chartData = data.map((e) => ({
    year: e.date,
    gdp: +(e.value! / 1e12).toFixed(2),
  }));

  return (
    <div className="widget-card">
      <div className="widget-header">
        <span className="widget-title">A3 — India GDP (World Bank)</span>
        <span className="widget-last-updated">
          {lastUpdated ? formatLastUpdated(lastUpdated) : ''}
        </span>
      </div>

      <div className="kpi-value" style={{ fontSize: 24 }}>
        ${chartData[chartData.length - 1]?.gdp}T USD
      </div>
      <div style={{ color: '#718096', fontSize: 12, marginBottom: 12 }}>
        Latest annual GDP
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={chartData}>
          <XAxis dataKey="year" tick={{ fill: '#718096', fontSize: 11 }} />
          <YAxis tick={{ fill: '#718096', fontSize: 11 }} unit="T" />
          <Tooltip
            contentStyle={{ background: '#1a1f2e', border: '1px solid #2d3748', fontSize: 12 }}
            formatter={(value: any) => ['$' + value + 'T', 'GDP']}
          />
          <Bar dataKey="gdp" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={i === chartData.length - 1 ? '#667eea' : '#4a5568'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <span className="alert-badge ok">✓ No pricing review triggered</span>
    </div>
  );
}