import express from 'express';
import cors from 'cors';
import publicRoutes from './routes/publicRoutes';

const app = express();
const PORT = 4000;

// Middleware: allow requests from our React frontend
app.use(cors({ origin: 'http://localhost:3000' }));

// Middleware: parse JSON bodies (needed later for Level 2 POST routes)
app.use(express.json());

// Mount our public data routes under /api/public
app.use('/api/public', publicRoutes);

// Health check route — confirms the server is alive
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});