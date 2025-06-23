import { Job } from '../types/Job';
import { Pattern, PatternSuccessRatesResult } from '../types/Pattern';

export class NameLengthPattern implements Pattern {
  readonly threshold = 10;
  readonly name = `Job name length > ${this.threshold}`;
  readonly description = `Checks if job name length exceeds ${this.threshold} characters`;

  calc(jobs: Job[], overallSuccessRate: number): PatternSuccessRatesResult {
    const matchingJobs = jobs.filter(job => job.name.length > this.threshold);
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