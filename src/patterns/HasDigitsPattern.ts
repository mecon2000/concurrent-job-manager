import { Job } from '../types/Job';
import { Pattern, PatternSuccessRatesResult } from '../types/Pattern';

export class HasDigitsPattern implements Pattern {
  readonly name = 'Job name contains digits';
  readonly description = 'Checks if job name contains any numeric digits';

  calc(jobs: Job[], overallSuccessRate: number): PatternSuccessRatesResult {
    const matchingJobs = jobs.filter(job => /\d/.test(job.name));
    const matchCount = matchingJobs.length;
    const successCount = matchingJobs.filter(job => job.status === 'completed').length;
    const successRate = matchCount > 0 ? successCount / matchCount : 0;
    const difference = ((successRate - overallSuccessRate) / overallSuccessRate) * 100;

    return {
      name: this.name,
      matchCount,
      successRate: `${(successRate * 100).toFixed(0)}%`,
      differenceFromAverage: `${difference >= 0 ? '+' : ''}${difference.toFixed(0)}%`
    };
  }
} 