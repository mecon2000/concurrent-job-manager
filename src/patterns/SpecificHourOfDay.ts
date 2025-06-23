import { Job } from '../types/Job';
import { Pattern, PatternBucketsResult } from '../types/Pattern';

export class SpecificHourOfDay implements Pattern {
  readonly name = 'Specific Hour of Day';
  readonly description = 'Analyzes which hour of the day has the most failures';

  calc(jobs: Job[], overallSuccessRate: number): PatternBucketsResult {
    // Initialize array of 24 slots for hour counts
    const failedCounts = new Array(24).fill(0);

    // Count jobs and failures for each hour
    for (const job of jobs) {
      if (job.status === 'failed' && job.hourOfDay !== undefined) {
        failedCounts[job.hourOfDay]++;
      }
    }

    // Find hour with most failures
    let worstHour = -1
    let worstHourValue = -1 //number of failures in worstHour
    //TODO should account for several worst hours, with close number of failures
    //should group them together
    failedCounts.forEach((v,i)=> {
        if (v>worstHourValue) {
            worstHourValue = v
            worstHour = i
        }})

    const worstHourAsStr = worstHour.toString().padStart(2, '0')
    return {
      name: this.name,
      mostFailures: [worstHour >= 0 ? `${worstHourAsStr}:00 - ${worstHourAsStr}:59` : 'none']
    };
  }
} 