import { Job } from '../types/Job';
import { Pattern, PatternSuccessRatesResult } from '../types/Pattern';

export class ArgCountPattern implements Pattern {
  readonly threshold = 2;
  readonly name = `Job has more than ${this.threshold} arguments`;
  readonly description = `Checks if job has more than ${this.threshold} arguments`;

  calc(jobs: Job[], overallSuccessRate: number): PatternSuccessRatesResult {
    const matchingJobs = jobs.filter(job => job.args.length > this.threshold);
    const matchCount = matchingJobs.length;
    const successCount = matchingJobs.filter(job => job.status === 'completed').length;
    const successRate = matchCount > 0 ? successCount / matchCount : 0;
    const difference = ((successRate - overallSuccessRate) / overallSuccessRate) * 100;

    return {
      name: this.name,
      matchCount,
      successRate: `${(successRate*100).toFixed(0)}%`,
      differenceFromAverage: `${difference >= 0 ? '+' : ''}${difference.toFixed(0)}%`
    };
  }
} 