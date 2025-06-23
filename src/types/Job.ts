export enum FailureReason {
  NONE = 'NONE',
  UNEXPECTED_DEATH = 'UNEXPECTED_DEATH',
  EXIT_CODE = 'EXIT_CODE',
  PROCESS_ERROR = 'PROCESS_ERROR'
}

export type JobStatus = 'running' | 'completed' | 'failed';

export interface Job {
  id: string;
  name: string;
  executablePath: string;  // Path to the executable/bat file
  args: string[];
  status: JobStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  exitCode?: number;
  retryOf?: string;
  failureReason: FailureReason;
  failureDetails?: string;
  pid?: number;
  highestMem?: number;  // Highest memory usage recorded in bytes
  averageMem?: number;  // Average memory usage in bytes
  hourOfDay?: number;   // Hour of the day (0-23) when the job was started

  // TODO: The following fields are not part of the current implementation requirements
  // But for a production-ready system, we should definitely consider these fields:
  // averageCpu?: number;
  // highestCpu?: number;
  // memTrend?: string; //is it steadily increasing?
  // averageIO?: number;  //i.e number of read/writes to disk
  // rollingIO?: number[];
  // averageNetwork?: number;  //i.e network calls
  // rollingNetwork?: number[];
  // zombieTime?: number;  //time in seconds where a process is stale, like in a deadlock 
  // parentPid?: number;
  // eventViewerLogs?: string[];
} 