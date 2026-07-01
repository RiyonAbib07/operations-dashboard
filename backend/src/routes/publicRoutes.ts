import { Router } from 'express';
import { getRedditData, getWHOData } from '../controllers/publicController';

const router = Router();

// GET /api/public/reddit
router.get('/reddit', getRedditData);

// GET /api/public/who
router.get('/who', getWHOData);

export default router;