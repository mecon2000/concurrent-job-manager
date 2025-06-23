import { Job } from '../types/Job';
import { Pattern, PatternBucketsResult } from '../types/Pattern';
import { config } from '../config';

export type HighMemFailure = { jobName: string; highestMem: number | undefined };

export class FailedDueToHighMem implements Pattern {
  readonly name = 'Memory is too high';
  readonly description = `Checks if process failed AND had more then ${config.memory.maxAllowedMB}MB memory consumption at some point`;

  calc(jobs: Job[], overallSuccessRate: number): PatternBucketsResult {
    const maxAllowedBytes = config.memory.maxAllowedMB * 1024 * 1024; // Convert MB to bytes
    const failedHighMemJobs = jobs.filter(job =>
      job.status === 'failed' &&
      job.highestMem !== undefined &&
      job.highestMem > maxAllowedBytes
    );

    // Sort by highestMem descending
    const sorted = failedHighMemJobs.sort((a, b) => (b.highestMem || 0) - (a.highestMem || 0));

    // Map to array of strings: 'jobName (highestMem MB)'
    const mostFailures = sorted.map(job => {
      const mb = job.highestMem ? (job.highestMem / 1024 / 1024).toFixed(0) : 'N/A';
      return `${job.name} (${mb} MB)`;
    });

    return {
      name: this.name,
      mostFailures
    };
  }
} 