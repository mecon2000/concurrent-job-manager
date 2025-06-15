import axios from 'axios';
import { spawn, exec } from 'child_process';
import path, { resolve } from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);
const API_URL = 'http://localhost:3000';

export interface TestJob {
  name: string;
  args: string[];
}

export class TestHelper {
  private serverProcess: any;
  private readonly serverPath: string;
  private readonly simulateJobPath: string;

  constructor() {
    this.serverPath = path.join(__dirname, '../dist/index.js');
    this.simulateJobPath = path.join(__dirname, 'simulate-job.bat');
  }

  private formatJobStatus(job: any): string {
    return `${job.name} (${job.status})`;
  }

  async startServer(): Promise<void> {
    // Clean up any leftover processes before starting
    this.serverProcess = spawn('node', [this.serverPath], {
      stdio: 'pipe'
    });
    return new Promise((resolve) => {
      this.serverProcess.stdout.on('data', (data: Buffer) => {
        console.log('SERVER STDOUT:', data.toString());
        if (data.toString().includes('Server is running')) {
          resolve();
        }
      });
      this.serverProcess.stderr.on('data', (data: Buffer) => {
        console.error('SERVER STDERR:', data.toString());
      });
      this.serverProcess.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
        console.error(`SERVER PROCESS EXITED: code=${code}, signal=${signal}`);
      });
    });
  }

  async stopServer(): Promise<void> {
    if (this.serverProcess) {
      this.serverProcess.kill();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    // Clean up any processes that might have been left running
    await this.cleanupProcesses();
  }

  async cleanupProcesses(): Promise<void> {
    try {
      // Find and kill only our job manager node process
      const { stdout: nodeProcesses } = await execAsync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH');
      const lines = nodeProcesses.split('\n').filter(Boolean);

      for (const line of lines) {
        const [name, pid] = line.split(',').map(s => s.replace(/"/g, '').trim());
        if (name === 'node.exe') {
          try {
            // Get the command line for this process
            const { stdout: cmdLine } = await execAsync(`wmic process where "ProcessId=${pid}" get CommandLine /value`);
            // Only kill if it's our job manager process
            if (cmdLine.includes('job-manager') || cmdLine.includes(this.serverPath)) {
              await execAsync(`taskkill /F /PID ${pid}`);
            }
          } catch (error) {
            // Ignore errors if process is already gone
          }
        }
      }

      // Find and kill only our simulate-job.bat processes
      const { stdout: batProcesses } = await execAsync('tasklist /FI "IMAGENAME eq cmd.exe" /FO CSV /NH');
      const batLines = batProcesses.split('\n').filter(Boolean);

      for (const line of batLines) {
        const [name, pid] = line.split(',').map(s => s.replace(/"/g, '').trim());
        if (name === 'cmd.exe') {
          try {
            // Get the command line for this process
            const { stdout: cmdLine } = await execAsync(`wmic process where "ProcessId=${pid}" get CommandLine /value`);
            // Only kill if it's our simulate-job.bat process
            if (cmdLine.includes('simulate-job.bat')) {
              await execAsync(`taskkill /F /PID ${pid}`);
            }
          } catch (error) {
            // Ignore errors if process is already gone
          }
        }
      }
    } catch (error) {
      console.error('Error during process cleanup:', error);
    }
  }

  async createJob(job: TestJob) {
    try {
      console.log('Sending job creation request:', job.name, job.args, this.simulateJobPath)
      
      const response = await axios.post(`${API_URL}/jobs`, {
        ...job,
        executablePath: this.simulateJobPath
      });
      
      console.log('Job created:', this.formatJobStatus(response.data));
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Failed to create job:', error.response?.status, error.response?.data, error.message)
      } else {
        console.error('Failed to create job:', error);
      }
      throw error;
    }
  }

  async getAllJobs() {
    const response = await axios.get(`${API_URL}/jobs`);
    return response.data;
  }

  async getStats() {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
  }

  async waitForJobCompletion(jobId: string, timeout = 10000): Promise<boolean> {
    console.log(`Waiting for job ${jobId} to complete (timeout: ${timeout}ms)...`);
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const jobs = await this.getAllJobs();
      const job = jobs.find((j: any) => j.id === jobId);
      console.log(`Current job status:`, this.formatJobStatus(job));
      if (job && (job.status === 'completed' || job.status === 'crashed')) {
        console.log(`Job ${jobId} finished with status: ${job.status}`);
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log(`Timeout waiting for job ${jobId}`);
    return false;
  }
} 