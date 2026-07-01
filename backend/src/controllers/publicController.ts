import { Request, Response } from 'express';
import fetch from 'node-fetch';

// Mock Reddit data — used as fallback when Reddit blocks our request
// In production this would be the last successfully cached response
const MOCK_REDDIT_DATA = {
  data: {
    children: [
      { data: { id: '1', title: 'How I grew my SaaS from 0 to $10k MRR in 6 months', score: 1842, url: 'https://reddit.com/r/Entrepreneur' } },
      { data: { id: '2', title: 'Cold email templates that actually get responses', score: 1203, url: 'https://reddit.com/r/Entrepreneur' } },
      { data: { id: '3', title: 'Worst mistake I made scaling my startup — terrible hiring decision', score: 987, url: 'https://reddit.com/r/Entrepreneur' } },
      { data: { id: '4', title: 'How to fire a client without burning the relationship', score: 876, url: 'https://reddit.com/r/Entrepreneur' } },
      { data: { id: '5', title: 'Problem with our payment processor — anyone else having issues?', score: 754, url: 'https://reddit.com/r/Entrepreneur' } },
      { data: { id: '6', title: 'My honest review after 2 years of running an agency', score: 698, url: 'https://reddit.com/r/Entrepreneur' } },
      { data: { id: '7', title: 'Bad experience with a contractor — how do I handle this?', score: 621, url: 'https://reddit.com/r/Entrepreneur' } },
      { data: { id: '8', title: 'Raised my prices by 40% — here is what happened', score: 589, url: 'https://reddit.com/r/Entrepreneur' } },
      { data: { id: '9', title: 'Worst advice I ever got about starting a business', score: 534, url: 'https://reddit.com/r/Entrepreneur' } },
      { data: { id: '10', title: 'Finally profitable after 18 months — breakdown of what changed', score: 478, url: 'https://reddit.com/r/Entrepreneur' } },
      { data: { id: '11', title: 'Failed my first launch completely — lessons learned', score: 412, url: 'https://reddit.com/r/Entrepreneur' } },
      { data: { id: '12', title: 'Best tools for running a remote team in 2024', score: 387, url: 'https://reddit.com/r/Entrepreneur' } },
      { data: { id: '13', title: 'Client dispute turned terrible — need advice', score: 356, url: 'https://reddit.com/r/Entrepreneur' } },
      { data: { id: '14', title: 'How we cut our churn rate in half', score: 334, url: 'https://reddit.com/r/Entrepreneur' } },
      { data: { id: '15', title: 'Terrible experience with a scam investor — warning', score: 298, url: 'https://reddit.com/r/Entrepreneur' } },
    ]
  }
};

// Controller: fetch Reddit data with fallback to mock data
export async function getRedditData(req: Request, res: Response) {
  try {
    const response = await fetch(
      'https://www.reddit.com/r/Entrepreneur/top.json?limit=15&t=day',
      {
        headers: {
          'User-Agent': 'operations-dashboard/1.0 (by ElevateBox)',
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      // Reddit is blocking us — return mock data with a flag
      console.warn('Reddit blocked request, serving mock data');
      return res.json({ ...MOCK_REDDIT_DATA, isMock: true });
    }

    const data = await response.json();
    res.json({ ...data as object, isMock: false });

  } catch (error) {
    // Network error — return mock data with a flag
    console.warn('Reddit fetch failed, serving mock data:', error);
    res.json({ ...MOCK_REDDIT_DATA, isMock: true });
  }
}

// Controller: fetch WHO GHO data
export async function getWHOData(req: Request, res: Response) {
  try {
    const response = await fetch('https://ghoapi.azureedge.net/api/NCDMORT3070?$top=20');

    if (!response.ok) {
      return res.status(response.status).json({ error: 'WHO API error' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('WHO controller error:', error);
    res.status(500).json({ error: 'Failed to fetch WHO data' });
  }
}