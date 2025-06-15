# Design of concurrent job manager for TGI sport

## Functional Requirements:

1. Allow to start a new job concurrently
2. monitor all jobs that are currently running, if they crash or complete successfully, handle that
3. NTH: if process crashes, try to re-run it once
4. Get a list of all jobs that were ever started and their status
5. Get a list of patterns or interesting behaviors that emerge from the statistics

## Non-functional requirements:

1. Allow to easily add more patterns, without modifying existing patterns
2. if crashing, restart the manager(using a watchdog), and read back into memory the data from last manager instance (=needs periodic dumping of memory to a file)
3. write audit logs - about API calls, about manager recovering from crash
4. Security - who is allowed to run jobs (API should be open only locally? or from a specific back office server?
5. versions (for API and for manager itself)
6. upgrading the manager on the fly (=writing DB to disk, installing new manager, reading DB from disk. if high availability is needed  - then both instances should be running with something like a load balancer in front of them. This was not a requirement.
7. Tests for the manager

## Apis:

POST /jobs (body contains details)

GET /jobs 

GET /stats

GET /healthCheck (NTH, needed for manager recovery 

## in-mem DB:



1. an array of all jobs ever executed, with these properties:
    1. pid
    2. name
    3. cmd-line arguments
    4. status
    5. starting time
    6. end time (optional)
    7. average cpu
    8. highest cpu
    9. average mem
    10. highest mem
    11. trend of mem (is it going up over time, indicating mem leak. find better name)
    12. average i/o operations
    13. rolling window average of i/o operations (indicating a burst of i/o ops in a short time)
    14. average networks calls
    15. rolling window average of network calls (indicating a retry mechanism in a short time)
    16. zombie time (optional. meaning a state where the process is doing nothing, e.g deadlock situation)
    17. exit code (optional)
    18. event viewer logs (optional)  - maybe not keep it in-mem 
    19. NTH: parent pid (optional, filled in case this instance is a re-run of previously failed job)


## Suggested metrics: 



1. per process name 
2. per hour in the day (perhaps 20:00 is when game starts and most crashes happen then)
3. per running time of processes (short lived processes, very long lived processes)
4. per status of process (all that failed, all that completed, all that became zombies)


## high level design:



* init using config.json
* based on Express, with 4 APIs
* A thread to periodically check the health of the currently running jobs, updating stats, and (NTH) handling retries
* an in-mem Map of jobs and their properties
* a pattern interface with Calc(...) function which returns this object:
    * {
    * "name": "Job name starts with 'x'",
    * "matchCount": 9,
    * "successRate": 0.33,
    * "differenceFromAverage": "-35%"
    * } \
 \
or this: \
{
    * "name": "Job name starts with 'x'",
    * "mostFailures": [“01:00-01:59”],
    * }
* GET /stats will calculate the average success rate, and then call all the patterns’ calc(), and add their responses to a response json
* A thread to periodically dump the in-mem DB to a file

## open questions:

1. no limit to the number of concurrent jobs right? (limited by OS and memory)
2. if retrying and failing, this counts as another fail, and not part of the original fail, although it’s probably the same reason. this skews the statistics, is that acceptable?
3. would be nice to have POST /jobs contain a property “reties” (stating how many retries allowed for this process)
