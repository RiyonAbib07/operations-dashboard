import React, { useEffect, useState } from 'react';
import { fetchWithCache } from '../../cache/apiCache';
import { formatLastUpdated } from '../../utils/formatters';

interface Person {
  name: { first: string; last: string };
  email: string;
  location: { country: string };
  picture: { thumbnail: string };
  login: { uuid: string };
}

export default function HRWidget() {
  const [people, setPeople] = useState<Person[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchWithCache<{ results: Person[] }>(
          'randomuser-hr',
          async () => {
            const res = await fetch('https://randomuser.me/api/?results=12&nat=us,in,gb&seed=elevate');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          },
          60
        );
        setPeople(result.data.results ?? []);
        setLastUpdated(result.lastUpdated);
      } catch {
        setError('Failed to load HR data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="widget-card"><div className="widget-loading">Loading HR data...</div></div>;
  if (error) return <div className="widget-card"><div className="widget-error">{error}</div></div>;

  return (
    <div className="widget-card">
      <div className="widget-header">
        <span className="widget-title">A7 — HR Directory (Mock)</span>
        <span className="widget-last-updated">
          {lastUpdated ? formatLastUpdated(lastUpdated) : ''}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {people.map((p) => (
          <div key={p.login.uuid} style={{ textAlign: 'center', width: 72 }}>
            <img
              src={p.picture.thumbnail}
              alt={p.name.first}
              style={{ borderRadius: '50%', width: 48, height: 48 }}
            />
            <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 4 }}>
              {p.name.first}
            </div>
            <div style={{ fontSize: 10, color: '#4a5568' }}>
              {p.location.country}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: '#718096' }}>
        Seed data — swap for real HRIS in production
      </div>
    </div>
  );
}