import { TestHelper, TestJob } from './helpers';

console.log('Test file loaded');

describe('Job Manager', () => {
  let helper: TestHelper;

  beforeAll(async () => {
    console.log('Setting up test suite...');
    helper = new TestHelper();
    await helper.startServer();
    console.log('Server started');
  });

  afterAll(async () => {
    console.log('Cleaning up test suite...');
    await helper.stopServer();
    console.log('Server stopped');
  });

  beforeEach(() => {
    console.log('Starting new test...');
  });

  afterEach(async () => {
    console.log('Cleaning up after test...');
    // Clean up any leftover processes after each test
    await helper.cleanupProcesses();
  });

  test('should create and track a job', async () => {
    console.log('Running test: should create and track a job');
    const job: TestJob = {
      name: 'test-job-1',
      args: ['3', 'arg1', 'arg2'] // 3 seconds TTL
    };

    console.log('Creating job...');
    const createdJob = await helper.createJob(job);
    console.log('Job created:', JSON.stringify(createdJob, null, 2));


    expect(createdJob).toHaveProperty('id');
    expect(createdJob.name).toBe(job.name);
    expect(createdJob.status).toBe('running');

    console.log('Waiting for job completion...');
    const completed = await helper.waitForJobCompletion(createdJob.id);
    console.log('Job completed:', completed);
    expect(completed).toBe(true);

    console.log('Getting final job status...');
    const jobs = await helper.getAllJobs();
    const finalJob = jobs.find((j: any) => j.id === createdJob.id);
    console.log('Final job status:', JSON.stringify(finalJob, null, 2));

    expect(finalJob).toBeDefined();
    expect(['completed', 'crashed']).toContain(finalJob.status);
    console.log('Test completed successfully');
  });

  test('should retry failed jobs once', async () => {
    console.log('Running test: should retry failed jobs once');
    const job: TestJob = {
      name: 'test-job-2',
      args: ['2', 'arg1'] // 2 seconds TTL
    };

    const createdJob = await helper.createJob(job);
    const completed = await helper.waitForJobCompletion(createdJob.id, 15000);
    expect(completed).toBe(true);

    const jobs = await helper.getAllJobs();
    const retryJob = jobs.find((j: any) => j.retryOf === createdJob.id);
    expect(retryJob).toBeDefined();
  });

  test('should provide job statistics', async () => {
    console.log('Running test: should provide job statistics');
    // Create multiple jobs with different characteristics
    const jobs: TestJob[] = [
      { name: 'job1', args: ['2'] },
      { name: 'job2', args: ['2', 'arg1'] },
      { name: 'job3', args: ['2', 'arg1', 'arg2'] }
    ];

    for (const job of jobs) {
      await helper.createJob(job);
    }

    // Wait for all jobs to complete
    await new Promise(resolve => setTimeout(resolve, 10000));

    const stats = await helper.getStats();
    expect(stats).toHaveProperty('totalJobs');
    expect(stats).toHaveProperty('successRate');
    expect(stats).toHaveProperty('characteristics');

    // Verify characteristics
    expect(stats.characteristics.nameLength).toBeDefined();
    expect(stats.characteristics.hasDigits).toBeDefined();
    expect(stats.characteristics.argCount).toBeDefined();
  });

  test('should handle concurrent job execution', async () => {
    console.log('Running test: should handle concurrent job execution');
    const jobs: TestJob[] = Array(5).fill(null).map((_, i) => ({
      name: `concurrent-job-${i}`,
      args: ['3']
    }));

    const createdJobs = await Promise.all(
      jobs.map(job => helper.createJob(job))
    );

    const completed = await Promise.all(
      createdJobs.map(job => helper.waitForJobCompletion(job.id))
    );

    expect(completed.every(Boolean)).toBe(true);

    const allJobs = await helper.getAllJobs();
    const concurrentJobs = allJobs.filter((j: any) =>
      createdJobs.some(cj => cj.id === j.id)
    );

    expect(concurrentJobs.length).toBe(jobs.length);
  });
}); 