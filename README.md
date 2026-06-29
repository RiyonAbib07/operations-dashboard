# Operations Dashboard

A production-grade dashboard built for a Founder's Office that drafts SOPs for companies.

## What it does
- Pulls live data from 25 sources (public APIs, key-based APIs, and web scrapers)
- Displays charts, KPI cards, tables, and alerts
- Triggers the right person when a metric crosses a threshold
- Tracks whether SOPs were executed within the agreed SLA

## The three questions every widget answers
1. Should someone be triggered to execute an SOP right now?
2. Did the team execute the SOP within the agreed SLA?
3. Is the client's business environment changing enough to warrant an SOP refresh?

## Tech Stack
- Frontend: React + TypeScript
- Backend: Node.js + Express
- Database: MongoDB + SQLite (cache)
- Auth: Better Auth
- Deploy: Vercel / Railway

## Project Structure (built across 5 levels)
- Level 0: Git, GitHub, HTTP fundamentals
- Level 1: Frontend — 8 public API widgets
- Level 2: Backend — 10 key-based API widgets
- Level 3: Auth, RBAC, 7 scrapers
- Level 4: Triggers, SOP queue, CI/CD, deploy
