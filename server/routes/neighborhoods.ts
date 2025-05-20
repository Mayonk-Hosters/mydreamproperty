import { Router, Request, Response } from 'express';
import { db } from '../db';
import { neighborhoods, neighborhoodMetrics, properties } from '@shared/schema';
import { eq, inArray, isNotNull, count } from 'drizzle-orm';

const router = Router();

// Important: Handle /compare route first, before any other routes with parameters
router.get('/compare', (_req: Request, res: Response) => {
  res.status(403).json({ 
    message: 'The Neighborhood Comparison feature has been disabled',
    disabled: true
  });
});

/**
 * Compare multiple neighborhoods - DISABLED
 * This feature has been disabled as per user request
 * NOTE: This must be placed before the /:id route to ensure it gets matched first
 */
router.get('/compare', (req: Request, res: Response) => {
  // Fixed implementation that doesn't try to access database
  res.status(403).json({ 
    message: 'The Neighborhood Comparison feature has been disabled',
    disabled: true
  });
});

/**
 * Get all neighborhoods with property counts - only returning neighborhoods that have properties
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    // Get all neighborhoods first
    const allNeighborhoods = await db
      .select({
        id: neighborhoods.id,
        name: neighborhoods.name,
        city: neighborhoods.city,
        description: neighborhoods.description,
        locationData: neighborhoods.locationData,
        createdAt: neighborhoods.createdAt
      })
      .from(neighborhoods);
    
    // Count properties for each neighborhood
    const propertyCounts = await db
      .select({
        neighborhoodId: properties.neighborhoodId,
        count: count(properties.id)
      })
      .from(properties)
      .where(isNotNull(properties.neighborhoodId))
      .groupBy(properties.neighborhoodId);
    
    // Combine the data and filter for neighborhoods that have properties
    const neighborhoodsWithProperties = allNeighborhoods
      .map(neighborhood => {
        const propertyData = propertyCounts.find(p => p.neighborhoodId === neighborhood.id);
        return {
          ...neighborhood,
          propertyCount: propertyData ? propertyData.count : 0
        };
      })
      .filter(neighborhood => neighborhood.propertyCount > 0);
    
    // Log the neighborhoods with properties for debugging
    console.log(`Found ${neighborhoodsWithProperties.length} neighborhoods with properties`);
    
    res.json(neighborhoodsWithProperties);
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



export default router;