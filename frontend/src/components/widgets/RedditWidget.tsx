import React, { useEffect, useState } from 'react';
import { fetchWithCache } from '../../cache/apiCache';
import { formatLastUpdated } from '../../utils/formatters';

interface RedditPost {
  data: {
    id: string;
    title: string;
    score: number;
    url: string;
  };
}

interface RedditResponse {
  data: {
    children: RedditPost[];
  };
  isMock: boolean;
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'to', 'of', 'in', 'for', 'is', 'on', 'and', 'my',
  'i', 'it', 'this', 'that', 'with', 'how', 'are', 'be', 'do', 'you',
  'your', 'we', 'our', 'have', 'has', 'was', 'were', 'will', 'can',
  'just', 'not', 'but', 'or', 'as', 'at', 'by', 'from', 'about',
]);

function buildWordFrequency(posts: RedditPost[]) {
  const freq: Record<string, number> = {};
  posts.forEach(function(p) {
    const words = p.data.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    words.forEach(function(word) {
      if (word.length > 2 && !STOP_WORDS.has(word)) {
        freq[word] = (freq[word] || 0) + 1;
      }
    });
  });
  return Object.entries(freq)
    .map(function(entry) { return { word: entry[0], count: entry[1] }; })
    .sort(function(a, b) { return b.count - a.count; })
    .slice(0, 20);
}

export default function RedditWidget() {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [isMock, setIsMock] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchWithCache<RedditResponse>(
          'reddit-entrepreneur',
          async () => {
            const res = await fetch('http://localhost:4000/api/public/reddit');
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
          },
          30
        );
        setPosts(result.data.data ? result.data.data.children : []);
        setIsMock(result.data.isMock ?? false);
        setLastUpdated(result.lastUpdated);
      } catch {
        setError('Failed to load Reddit data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="widget-card">
        <div className="widget-loading">Loading Reddit...</div>
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

  const complaints = posts.filter(function(p) {
    return /fail|problem|issue|bad|worst|terrible|scam/.test(p.data.title.toLowerCase());
  });

  const wordFreq = buildWordFrequency(posts);
  const maxCount = wordFreq.length > 0 ? wordFreq[0].count : 1;

  return (
    <div className="widget-card full-width">
      <div className="widget-header">
        <span className="widget-title">A8 - Reddit Entrepreneur Sentiment</span>
        <span className="widget-last-updated">
          {lastUpdated ? formatLastUpdated(lastUpdated) : ''}
        </span>
      </div>
      {isMock && (
        <div style={{ background: '#2d374855', border: '1px solid #4a5568', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#a0aec0' }}>
          Live feed temporarily unavailable - showing representative sample data.
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <span style={{ color: '#718096', fontSize: 13 }}>
          Complaints: <strong style={{ color: complaints.length > 5 ? '#f56565' : '#48bb78' }}>{complaints.length}</strong> / {posts.length} posts
        </span>
        {complaints.length > 5 && (
          <span className="alert-badge triggered" style={{ marginLeft: 12 }}>Complaint spike detected</span>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', padding: '16px', background: '#0f1117', borderRadius: 8, marginBottom: 16, alignItems: 'center' }}>
        {wordFreq.map(function(item) {
          var fontSize = 12 + (item.count / maxCount) * 20;
          var opacity = 0.5 + (item.count / maxCount) * 0.5;
          return (
            <span key={item.word} style={{ fontSize: fontSize + 'px', opacity: opacity, color: '#667eea', fontWeight: item.count === maxCount ? 700 : 500 }}>
              {item.word}
            </span>
          );
        })}
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Score</th>
            <th>Flag</th>
          </tr>
        </thead>
        <tbody>
          {posts.slice(0, 8).map(function(p) {
            var isComplaint = /fail|problem|issue|bad|worst|terrible|scam/.test(p.data.title.toLowerCase());
            return (
              <tr key={p.data.id}>
                <td>
                  <a href={p.data.url} target="_blank" rel="noreferrer" style={{ color: '#667eea', textDecoration: 'none', fontSize: 13 }}>
                    {p.data.title.length > 70 ? p.data.title.slice(0, 70) + '...' : p.data.title}
                  </a>
                </td>
                <td style={{ color: '#ed8936' }}>{p.data.score}</td>
                <td>
                  {isComplaint ? (
                    <span style={{ color: '#f56565', fontSize: 12 }}>complaint</span>
                  ) : (
                    <span style={{ color: '#4a5568', fontSize: 12 }}>-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
