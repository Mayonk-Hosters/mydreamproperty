import { Router, Request, Response } from 'express';
import { db } from '../db';
import { neighborhoods, neighborhoodMetrics } from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';

const router = Router();

/**
 * Get all neighborhoods
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const allNeighborhoods = await db.select().from(neighborhoods);
    res.json(allNeighborhoods);
  } catch (error) {
    console.error('Error fetching neighborhoods:', error);
    res.status(500).json({ message: 'Failed to fetch neighborhoods' });
  }
});

/**
 * Get a single neighborhood by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const neighborhood = await db.select().from(neighborhoods).where(eq(neighborhoods.id, parseInt(id))).limit(1);
    
    if (neighborhood.length === 0) {
      return res.status(404).json({ message: 'Neighborhood not found' });
    }
    
    res.json(neighborhood[0]);
  } catch (error) {
    console.error('Error fetching neighborhood:', error);
    res.status(500).json({ message: 'Failed to fetch neighborhood' });
  }
});

/**
 * Get metrics for a neighborhood
 */
router.get('/:id/metrics', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const metrics = await db.select().from(neighborhoodMetrics).where(eq(neighborhoodMetrics.neighborhoodId, parseInt(id))).limit(1);
    
    if (metrics.length === 0) {
      return res.status(404).json({ message: 'Neighborhood metrics not found' });
    }
    
    res.json(metrics[0]);
  } catch (error) {
    console.error('Error fetching neighborhood metrics:', error);
    res.status(500).json({ message: 'Failed to fetch neighborhood metrics' });
  }
});

/**
 * Compare multiple neighborhoods
 */
router.get('/compare', async (req: Request, res: Response) => {
  try {
    const { ids } = req.query;
    
    if (!ids) {
      return res.status(400).json({ message: 'Neighborhood IDs are required' });
    }
    
    // Parse and validate neighborhood IDs
    const neighborhoodIds = Array.isArray(ids) 
      ? ids.map(id => parseInt(id as string)).filter(id => !isNaN(id))
      : (ids as string).split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    
    if (neighborhoodIds.length === 0) {
      return res.status(400).json({ message: 'Invalid neighborhood IDs' });
    }
    
    // Get neighborhood details
    const neighborhoodDetails = await db.select().from(neighborhoods).where(inArray(neighborhoods.id, neighborhoodIds));
    
    // Get neighborhood metrics
    const neighborhoodMetricsData = await db.select().from(neighborhoodMetrics).where(inArray(neighborhoodMetrics.neighborhoodId, neighborhoodIds));
    
    // Combine data
    const result = neighborhoodDetails.map(neighborhood => {
      const metrics = neighborhoodMetricsData.find(m => m.neighborhoodId === neighborhood.id);
      return {
        ...neighborhood,
        metrics: metrics || null
      };
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error comparing neighborhoods:', error);
    res.status(500).json({ message: 'Failed to compare neighborhoods' });
  }
});

export default router;