import { Job, FailureReason } from '../types';

export class JobStorageService {
  private jobs: Map<string, Job> = new Map();

  public addJob(job: Job): void {
    this.jobs.set(job.id, job);
  }

  public getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  public getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  public getRunningJobs(): Job[] {
    return this.getAllJobs().filter(job => job.status === 'running');
  }

  public updateJob(job: Job): void {
    this.jobs.set(job.id, job);
  }

  public setJobAsCompleted(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      const endTime = Date.now();
      const duration = Number(((endTime - job.startTime) / 1000).toFixed(2));
      this.jobs.set(jobId, {
        ...job,
        status: 'completed',
        endTime,
        duration,
        failureReason: FailureReason.NONE
      });
    }
  }

  public setJobAsFailed(jobId: string, reason: FailureReason, details: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      const endTime = Date.now();
      const duration = Number(((endTime - job.startTime) / 1000).toFixed(2));
      this.jobs.set(jobId, {
        ...job,
        status: 'failed',
        endTime,
        duration,
        failureReason: reason,
        failureDetails: details
      });
    }
  }

  public dumpToFile(): void {
    // TODO: Implement dumping jobs to a file for persistence
    // This will be used during cleanup to save the state
  }
} 