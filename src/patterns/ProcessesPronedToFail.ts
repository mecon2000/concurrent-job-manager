import { Job } from '../types/Job';
import { Pattern, PatternBucketsResult } from '../types/Pattern';

export class ProcessesPronedToFail implements Pattern {
  readonly failureThreshold = 5;
  readonly name = 'Processes Prone to Fail';
  readonly description = `Identifies processes that have failed more than ${this.failureThreshold} times`;

  calc(jobs: Job[], overallSuccessRate: number): PatternBucketsResult {
    // Create a map to count failures for each process name
    const failureCounts = new Map<string, number>();

    // Count failures for each process
    for (const job of jobs) {
      if (job.status === 'failed') {
        const currentCount = failureCounts.get(job.name) || 0;
        failureCounts.set(job.name, currentCount + 1);
      }
    }

    // Find processes with more than 5 failures
    const proneProcesses = Array.from(failureCounts.entries())
      .filter(([_, count]) => count > this.failureThreshold)
      .map(([name, count]) => `${name} failed (${count} times)`);

    return {
      name: this.name,
      mostFailures: proneProcesses.length > 0 ? proneProcesses : [`No processes with more than ${this.failureThreshold} failures`]
    };
  }
} 