import express from 'express';
import { JobManagerService } from './services/JobManagerService';
import { JobStorageService } from './services/JobStorageService';
import { JobStatsService } from './services/JobStatsService';
import { setupJobRoutes } from './routes/jobs';
import { setupStatsRoutes } from './routes/stats';

const app = express();
app.use(express.json());

const storage = new JobStorageService();
const manager = new JobManagerService(storage);
const stats = new JobStatsService();

// Setup routes
app.use('/jobs', setupJobRoutes(manager, storage));
app.use('/stats', setupStatsRoutes(storage, stats));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 