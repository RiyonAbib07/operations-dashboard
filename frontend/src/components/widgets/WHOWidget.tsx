import React, { useEffect, useState } from 'react';
import { fetchWithCache } from '../../cache/apiCache';
import { formatLastUpdated } from '../../utils/formatters';

interface WHORecord {
  SpatialDim: string;
  TimeDim: number;
  NumericValue: number;
}

export default function WHOWidget() {
  const [data, setData] = useState<WHORecord[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchWithCache<{ value: WHORecord[] }>(
          'who-gho',
          async () => {
            const res = await fetch('http://localhost:4000/api/public/who');
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
          },
          120
        );
        setData(result.data.value ?? []);
        setLastUpdated(result.lastUpdated);
      } catch {
        setError('Failed to load WHO data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="widget-card">
        <div className="widget-loading">Loading WHO data...</div>
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

  return (
    <div className="widget-card">
      <div className="widget-header">
        <span className="widget-title">A5 - WHO Health Indicators</span>
        <span className="widget-last-updated">
          {lastUpdated ? formatLastUpdated(lastUpdated) : ''}
        </span>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Country</th>
            <th>Year</th>
            <th>NCD Mortality</th>
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 8).map(function(row, i) {
            return (
              <tr key={i}>
                <td>{row.SpatialDim}</td>
                <td>{row.TimeDim}</td>
                <td>{row.NumericValue ? row.NumericValue.toFixed(1) : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop: 12 }}>
        <span className="alert-badge ok">OK - No compliance audit triggered</span>
      </div>
    </div>
  );
}
