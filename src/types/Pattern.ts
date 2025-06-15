import { Job } from '../types';

export interface PatternResult {
    name: string;
}  

//Shows the success rates in a pattern vs general success rates
export interface PatternSuccessRatesResult extends PatternResult {
  matchCount: number;
  successRate: string;
  differenceFromAverage: string;
}

//Shows a number/string representing the bucket with most failures.
//For example - the hour of the day with most failures
export interface PatternBucketsResult extends PatternResult {
    mostFailures: string[] //a number/string representing the bucket with most failures.
  }

export interface Pattern {
  readonly name: string;
  readonly description: string;
  
  calc(jobs: Job[], overallSuccessRate: number): PatternResult;
} 