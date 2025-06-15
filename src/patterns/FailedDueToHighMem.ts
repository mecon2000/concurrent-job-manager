import { Job } from '../types';
import { Pattern, PatternSuccessRatesResult } from '../types/Pattern';
import { config } from '../config';

export class FailedDueToHighMem implements Pattern {
  readonly name = 'Memory is too high';
  readonly description = 'Checks if process failed AND had high memory consumption at some point';

  calc(jobs: Job[], overallSuccessRate: number): PatternSuccessRatesResult {
    const maxAllowedBytes = config.memory.maxAllowedMB * 1024 * 1024; // Convert MB to bytes
    const matchingJobs = jobs.filter(job =>  
      job.highestMem !== undefined && 
      job.highestMem > maxAllowedBytes
    );

    const matchCount = matchingJobs.length;
    const successRate = matchCount > 0 
      ? (matchingJobs.filter(job => job.status !== 'failed').length / matchCount)
      : 0;
    const difference = ((successRate - overallSuccessRate) / overallSuccessRate) * 100;

    return {
      name: this.name,
      matchCount,
      successRate: `${(successRate*100).toFixed(0)}%`,
      differenceFromAverage: `${difference >= 0 ? '+' : ''}${difference.toFixed(0)}%`
    };
  }
} 