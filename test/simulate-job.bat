@echo off
REM Simulate a job that randomly succeeds or fails
REM Takes time-to-live in seconds as first argument, followed by other args

REM Validate time-to-live argument
if "%~1"=="" (
  echo Error: Time-to-live argument required
  exit /b 1
)

set /a ttl=%~1
if %ttl% LSS 1 (
  echo Error: Time-to-live must be positive
  exit /b 1
)

REM Sleep for specified time using ping instead of timeout
ping 127.0.0.1 -n %ttl% > nul

REM Randomly succeed (0) or fail (1)
set /a exit_code=%RANDOM% %% 2

REM Echo the arguments for debugging
echo Running job with TTL: %ttl% seconds
echo Additional arguments: %*

exit /b %exit_code%