import React, { useEffect, useState } from 'react';
import { fetchWithCache } from '../../cache/apiCache';
import { formatLastUpdated } from '../../utils/formatters';

interface HNStory {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
}

export default function HackerNewsWidget() {
  const [stories, setStories] = useState<HNStory[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchWithCache<HNStory[]>(
          'hackernews-top',
          async () => {
            const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
            const ids: number[] = await idsRes.json();
            const top10 = ids.slice(0, 10);
            const storyPromises = top10.map((id) =>
              fetch('https://hacker-news.firebaseio.com/v0/item/' + id + '.json').then((r) => r.json())
            );
            return Promise.all(storyPromises);
          },
          15
        );
        setStories(result.data);
        setLastUpdated(result.lastUpdated);
      } catch {
        setError('Failed to load Hacker News stories');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="widget-card">
        <div className="widget-loading">Loading HN stories...</div>
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
    <div className="widget-card full-width">
      <div className="widget-header">
        <span className="widget-title">A4 - Hacker News Top Stories</span>
        <span className="widget-last-updated">
          {lastUpdated ? formatLastUpdated(lastUpdated) : ''}
        </span>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Author</th>
            <th>Score</th>
            <th>SOP Alert</th>
          </tr>
        </thead>
        <tbody>
          {stories.map(function (story, i) {
            const isClientMentioned = story.title.toLowerCase().indexOf('google') !== -1;
            return (
              <tr key={story.id}>
                <td style={{ color: '#4a5568' }}>{i + 1}</td>
                <td>
                  <a href={story.url} target="_blank" rel="noreferrer" style={{ color: '#667eea', textDecoration: 'none' }}>
                    {story.title}
                  </a>
                </td>
                <td style={{ color: '#718096' }}>{story.by}</td>
                <td style={{ color: '#ed8936' }}>{story.score}</td>
                <td>
                  {isClientMentioned ? (
                    <span className="alert-badge triggered">Press Response</span>
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