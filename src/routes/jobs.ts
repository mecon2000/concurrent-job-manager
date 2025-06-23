import { Router } from 'express';
import { JobManagerService } from '../services/JobManagerService';
import { JobStorageService } from '../services/JobStorageService';

export const jobsRouter = Router();

export function setupJobRoutes(
  manager: JobManagerService,
  storage: JobStorageService,
) {
  // Create a new job
  jobsRouter.post('/', (req, res) => {
    try {
      // Validate request body exists
      if (!req.body) {
        return res.status(400).json({
          error: 'Invalid request',
          reason: 'Request body is required'
        });
      }

      const { name, executablePath, args } = req.body;

      // Validate required fields
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          error: 'Invalid request',
          reason: 'Job name is required and must be a non-empty string'
        });
      }

      if (!executablePath || typeof executablePath !== 'string' || executablePath.trim().length === 0) {
        return res.status(400).json({
          error: 'Invalid request',
          reason: 'Executable path is required and must be a non-empty string'
        });
      }

      if (!Array.isArray(args)) {
        return res.status(400).json({
          error: 'Invalid request',
          reason: 'Arguments must be an array'
        });
      }

      if (executablePath.length > 260) { // Windows MAX_PATH
        return res.status(400).json({
          error: 'Invalid request',
          reason: 'Executable path must not exceed 260 characters'
        });
      }

      // Validate args content
      for (const arg of args) {
        if (typeof arg !== 'string') {
          return res.status(400).json({
            error: 'Invalid request',
            reason: 'All arguments must be strings'
          });
        }
      }

      const job = manager.createJob(name.trim(), executablePath.trim(), args);
      res.status(201).json(job);
    } catch (error: unknown) {
      console.error('Failed to create job:', error);

      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('ENOENT')) {
          return res.status(404).json({
            error: 'File not found',
            reason: 'The specified executable file does not exist'
          });
        }
        if (error.message.includes('EACCES')) {
          return res.status(403).json({
            error: 'Permission denied',
            reason: 'The specified executable file is not accessible'
          });
        }
      }

      res.status(500).json({
        error: 'Internal server error',
        reason: 'An unexpected error occurred while creating the job'
      });
    }
  });

  // Get all jobs
  jobsRouter.get('/', (req, res) => {
    try {
      const jobs = storage.getAllJobs().map(job => {
        const highestMem = job.highestMem ? job.highestMem / 1024 / 1024 : 0 //show in MB 
        return `${job.id}, ${job.pid}, ${job.status}, ${job.retryOf}, highestMem=${highestMem.toFixed(0)}MB, hour=${job.hourOfDay}`
      })
      res.json(jobs);
    } catch (error) {
      console.error('Failed to get jobs:', error);
      res.status(500).json({
        error: 'Failed to get jobs',
        reason: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return jobsRouter;
} 