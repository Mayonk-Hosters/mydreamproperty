import { db } from '../db';
import { properties } from '../../shared/schema';
import { Router } from 'express';
import { like } from 'drizzle-orm';

const router = Router();

// Get all MDP properties
router.get('/', async (req, res) => {
  try {
    const mdpProperties = await db.select().from(properties)
      .where(like(properties.propertyNumber, 'MDP%'))
      .orderBy(properties.id);
    
    res.json(mdpProperties);
  } catch (error) {
    console.error('Error fetching MDP properties:', error);
    res.status(500).json({ message: 'Failed to fetch MDP properties' });
  }
});

// Get MDP properties by type (rent or buy)
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    if (type !== 'rent' && type !== 'buy') {
      return res.status(400).json({ message: 'Invalid property type. Must be "rent" or "buy".' });
    }
    
    const mdpPropertiesByType = await db.select().from(properties)
      .where(like(properties.propertyNumber, 'MDP%'))
      .where(eq(properties.type, type))
      .orderBy(properties.id);
    
    res.json(mdpPropertiesByType);
  } catch (error) {
    console.error('Error fetching MDP properties by type:', error);
    res.status(500).json({ message: 'Failed to fetch MDP properties' });
  }
});

export default router;