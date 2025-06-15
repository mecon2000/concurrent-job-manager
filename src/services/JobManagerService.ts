import { spawn, ChildProcess } from 'child_process';
import { Job, FailureReason, JobStatus } from '../types';
import path from 'path';
import fs from 'fs';
import { JobStorageService } from './JobStorageService';
import { config } from '../config';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class JobManagerService {
    private storage: JobStorageService;
    private monitorInterval: NodeJS.Timeout | null;

    constructor(storage: JobStorageService) {
        this.storage = storage;
        this.monitorInterval = null;
        this.startProcessMonitoring();
    }

    private startProcessMonitoring(): void {
        this.monitorInterval = setInterval(() => {
            this.checkRunningProcesses();
        }, config.processMonitoring.intervalMs);
    }

    private async checkRunningProcesses(): Promise<void> {
        const runningJobs = this.storage.getRunningJobs();
        if (runningJobs.length === 0) return;

        try {
            // Get all running processes once
            const { stdout } = await execAsync('tasklist /FO CSV /NH');
            const runningProcesses = stdout.split('\n')
                .map(line => {
                    const [name, pid] = line.split(',').map(s => s.replace(/"/g, ''));
                    return { name, pid: parseInt(pid) };
                });

            const now = Date.now();

            // Check each running job against the process list
            for (const job of runningJobs) {
                if (!job.pid) {
                    console.error(`No PID found for job ${job.id}`);
                    continue;
                }

                const process = runningProcesses.find(p => p.pid === job.pid);
                if (!process) {
                    console.log(`Process ${job.pid} for job ${job.id} not found`);
                    this.handleProcessDeath(job.id, FailureReason.UNEXPECTED_DEATH, 'Process not found');
                    continue;
                }

                // TODO: while today it's not a must to use taskkill, 
                // In a future version we'll use it to handle processes
                // spawned by previous instances of the manager (e.g., after upgrades
                // or unexpected terminations). this is why i'm using it now.
                const processObj = {
                    connected: true,
                    pid: process.pid,
                    kill: () => execAsync(`taskkill /PID ${process.pid} /F`)
                } as unknown as ChildProcess;

                if (!processObj.connected) {
                    console.log(`Process for job ${job.id} is no longer connected`);
                    this.handleProcessDeath(job.id, FailureReason.UNEXPECTED_DEATH, 'Process disconnected unexpectedly');
                }

                // TODO: Mock memory usage for testing. Replace with actual process memory usage
                const currentMem = Math.floor(Math.random() * (1024 * 1024 * 1024 - 100 * 1024) + 100 * 1024); // Random between 100KB and 1GB

                // Calculate new memory stats
                const highestMem = Math.max(currentMem, job.highestMem || 0);
                const averageMem = job.averageMem 
                    ? (job.averageMem + currentMem) / 2  // Simple moving average
                    : currentMem;

                // Update memory stats
                this.storage.updateJob({
                    ...job,
                    duration: now - job.startTime,
                    highestMem,
                    averageMem
                });
            }
        } catch (error) {
            console.error('Error checking processes:', error);
            // Don't mark jobs as failed for monitoring errors
            // Just log the error and try again next interval
        }
    }

    private handleProcessDeath(jobId: string, reason: FailureReason, details: string): void {
        this.storage.setJobAsFailed(jobId, reason, details);
        
        const job = this.storage.getJob(jobId);
        if (job && !job.retryOf && config.retry.enabled) {
            console.log(`Automatically retrying job ${job.name}...`);
            this.retryJob(job.id);
        }
    }

    private validateJobParams(name: string, executablePath: string, args: string[]): void {
        if (!name) {
            throw new Error('Job name is required');
        }

        if (!executablePath) {
            throw new Error('Executable path is required');
        }

        // Convert to absolute path if relative
        const absolutePath = path.isAbsolute(executablePath)
            ? executablePath
            : path.resolve(process.cwd(), executablePath);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`Executable not found at path: ${absolutePath}`);
        }

        if (!Array.isArray(args)) {
            throw new Error('Arguments must be an array');
        }
    }

    public createJob(name: string, executablePath: string, args: string[]): Job {
        this.validateJobParams(name, executablePath, args);

        const timestamp = Date.now();
        // TODO: Mock hour of day for testing. Replace with actual hour from timestamp
        const hourOfDay = Math.floor(Math.random() * 24); // Random hour between 0 and 23
        const job: Job = {
            id: `${name}-${timestamp}`,
            name,
            executablePath,
            args,
            status: 'running' as JobStatus,
            startTime: timestamp,
            failureReason: FailureReason.NONE,
            hourOfDay
        };

        this.storage.addJob(job);
        
        try {
            this.executeJob(job);
        } catch (error) {
            if (error instanceof Error) {
                this.handleProcessDeath(job.id, FailureReason.PROCESS_ERROR, error.message);
            }
            throw error;
        }

        return job;
    }

    private executeJob(job: Job): void {
        console.log(`Starting job: ${job.name} (${job.status})`);
        const process = spawn(job.executablePath, job.args, {
            shell: true,  // Use shell to handle Windows paths
            windowsHide: true
        });

        // Store the PID in the job
        if (process.pid) {
            this.storage.updateJob({ ...job, pid: process.pid });
        }

        process.stdout.on('data', (data) => {
            console.log(`Job ${job.name} output: ${data}`);
        });

        process.stderr.on('data', (data) => {
            console.error(`Job ${job.name} error output: ${data}`);
        });

        process.on('close', (code) => {
            if (code === 0) {
                console.log(`Job ${job.name} completed successfully`);
                this.storage.setJobAsCompleted(job.id);
            } else {
                console.error(`Job ${job.name} failed with exit code ${code}`);
                this.handleProcessDeath(job.id, FailureReason.EXIT_CODE, `Process exited with code ${code}`);
            }
        });

        process.on('error', (error) => {
            console.error(`Job ${job.name} process error: ${error.message}`);
            this.handleProcessDeath(job.id, FailureReason.PROCESS_ERROR, error.message);
        });
    }

    public retryJob(jobId: string): Job | null {
        const job = this.storage.getJob(jobId);
        if (!job) {
            console.error(`Job ${jobId} not found`);
            return null;
        }

        console.log(`Retrying job: ${job.name}`);
        const timestamp = Date.now();
        const retryJob: Job = {
            ...job,
            id: `${job.name}-${timestamp}`,
            retryOf: job.id,
            status: 'running' as JobStatus,
            startTime: timestamp,
            failureReason: FailureReason.NONE,
            failureDetails: undefined
        };

        this.storage.addJob(retryJob);

        try {
            this.executeJob(retryJob);
        } catch (error) {
            if (error instanceof Error) {
                this.handleProcessDeath(retryJob.id, FailureReason.PROCESS_ERROR, error.message);
            }
            throw error;
        }

        return retryJob;
    }

    public cleanup(): void {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }

        // Dump current state to file for persistence
        this.storage.dumpToFile();
    }
} 