import { Router } from 'express';
import { JobStorageService } from '../services/JobStorageService';
import { JobStatsService } from '../services/JobStatsService';

export const statsRouter = Router();

export function setupStatsRoutes(
  storage: JobStorageService,
  stats: JobStatsService
) {
  // Get job statistics
  statsRouter.get('/', (req, res) => {
    try {
      const jobStats = stats.getStats(storage.getAllJobs());
      res.json(jobStats);
    } catch (error) {
      console.error('Failed to get stats:', error);
      res.status(500).json({
        error: 'Failed to get stats',
        reason: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return statsRouter;
} 