import React, { useEffect, useState } from 'react';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchWithCache } from '../../cache/apiCache';
import { formatCurrency, formatPercent, formatLastUpdated } from '../../utils/formatters';

interface CryptoData {
  bitcoin: { usd: number; usd_24h_change: number };
  ethereum: { usd: number; usd_24h_change: number };
}

// Generates fake sparkline data for the 24h trend visual
function generateSparkline(currentPrice: number) {
  const points = [];
  let price = currentPrice * 0.95;
  for (let i = 0; i < 24; i++) {
    price = price + (Math.random() - 0.48) * (currentPrice * 0.01);
    points.push({ hour: `${i}h`, price: Math.round(price) });
  }
  points.push({ hour: '24h', price: currentPrice });
  return points;
}

export default function CryptoWidget() {
  const [data, setData] = useState<CryptoData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchWithCache<CryptoData>(
          'coingecko-prices',
          async () => {
            const res = await fetch(
              'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true'
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          },
          5 // cache for 5 minutes
        );
        setData(result.data);
        setLastUpdated(result.lastUpdated);
        setIsStale(result.isStale);
      } catch (err) {
        setError('Failed to load crypto prices');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div className="widget-card">
      <div className="widget-loading">Loading crypto prices...</div>
    </div>
  );

  if (error) return (
    <div className="widget-card">
      <div className="widget-error">{error}</div>
    </div>
  );

  const btcChange = data?.bitcoin.usd_24h_change ?? 0;
  const ethChange = data?.ethereum.usd_24h_change ?? 0;
  const btcTriggered = Math.abs(btcChange) > 10;

  return (
    <div className="widget-card">
      <div className="widget-header">
        <span className="widget-title">A1 — Crypto Prices</span>
        <span className={`widget-last-updated ${isStale ? 'stale' : ''}`}>
          {lastUpdated ? formatLastUpdated(lastUpdated) : ''}
          {isStale ? ' (stale)' : ''}
        </span>
      </div>

      {/* Bitcoin KPI */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: '#a0aec0', fontSize: 13 }}>Bitcoin (BTC)</div>
        <div className="kpi-value">{formatCurrency(data?.bitcoin.usd ?? 0)}</div>
        <div className={`kpi-change ${btcChange >= 0 ? 'positive' : 'negative'}`}>
          {formatPercent(btcChange)} (24h)
        </div>
        {btcTriggered && (
          <span className="alert-badge triggered">
            ⚠ Treasury Reserve Review triggered
          </span>
        )}
        {!btcTriggered && (
          <span className="alert-badge ok">✓ Within threshold</span>
        )}
      </div>

      {/* 24h sparkline */}
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={generateSparkline(data?.bitcoin.usd ?? 0)}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={btcChange >= 0 ? '#48bb78' : '#f56565'}
            dot={false}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{ background: '#1a1f2e', border: '1px solid #2d3748', fontSize: 12 }}
            formatter={(value: any) => [formatCurrency(Number(value) || 0), 'BTC']}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Ethereum KPI */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #2d3748' }}>
        <div style={{ color: '#a0aec0', fontSize: 13 }}>Ethereum (ETH)</div>
        <div className="kpi-value" style={{ fontSize: 24 }}>
          {formatCurrency(data?.ethereum.usd ?? 0)}
        </div>
        <div className={`kpi-change ${ethChange >= 0 ? 'positive' : 'negative'}`}>
          {formatPercent(ethChange)} (24h)
        </div>
      </div>
    </div>
  );
}