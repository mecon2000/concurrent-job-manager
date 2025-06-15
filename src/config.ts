export const config = {
  processMonitoring: {
    intervalMs: 5000,  // Check processes every 5 seconds
  },
  memory: {
    maxAllowedMB: 800,  // Maximum memory per process in MB. above that - we consider it as a problem
  },
  retry: {
    enabled: true,  // Whether to automatically retry failed jobs
  }
}; 