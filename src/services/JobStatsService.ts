import { Job } from '../types/Job';
import { Pattern } from '../types/Pattern';
import { NameLengthPattern, HasDigitsPattern, ArgCountPattern, FailedDueToHighMem, SpecificHourOfDay, ProcessesPronedToFail } from '../patterns';

export class JobStatsService {
  private patterns: Pattern[];

  constructor() {
    this.patterns = [
      new NameLengthPattern(),
      new HasDigitsPattern(),
      new ArgCountPattern(),
      new FailedDueToHighMem(),
      new SpecificHourOfDay(),
      new ProcessesPronedToFail(),
    ];
  }

  public getStats(jobs: Job[]) {
    try {
      if (!Array.isArray(jobs)) {
        throw new Error('Jobs parameter must be an array');
      }

      const totalJobs = jobs.length;
      if (totalJobs === 0) {
        console.log('No jobs available for statistics');
        return {
          totalJobs: 0,
          successRate: 0,
          averageDuration: 0,
          patterns: []
        };
      }

      const nonFailedJobs = jobs.filter(j => j.status !== 'failed');
      const successRate = nonFailedJobs.length / totalJobs;
      const averageDuration = nonFailedJobs.length > 0 
        ? nonFailedJobs.reduce((acc, j) => acc + (j.duration || 0), 0) / nonFailedJobs.length
        : 0;

      const patternResults = this.patterns.map(pattern => 
        pattern.calc(jobs, successRate)
      );

      return {
        totalJobs,
        successRate,
        averageDuration,
        patterns: patternResults
      };
    } catch (error) {
      console.error('Error calculating job statistics:', error);
      throw error;
    }
  }
} 