import { FailureReason } from '../types';

export interface Job {
  id: string;
  name: string;
  executablePath: string;
  args: string[];
  status: 'running' | 'completed' | 'failed' | 'retried';
  startTime: number;
  endTime?: number;
  duration?: number;
  retryOf?: string;
  failureReason?: FailureReason;
  failureDetails?: string;
} 