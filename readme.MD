# Job Manager for TGI Sport

## Overview

A concurrent job management system designed to monitor, track, and analyze running processes with detailed statistics and pattern detection capabilities.

**Please see the design.MD for explanations on what i suggest to do in a production grade system (not all of it was implemented)**

## Prerequisites

- Node.js (tested on v22.14.0)
- `jq` command-line tool (required for the scripts)
  - Install on Windows using: `winget install jq`

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Configuration

The system is configured through `config.ts`, pretty self explanatory 

## Running the Application

1. Start the server:
```bash
scripts/buildAndRunServer.bat
```

2. The server will be available at `http://localhost:3000` (default port)

## API Endpoints

- `POST /jobs` - Start a new job
- `GET /jobs` - List all jobs
- `GET /stats` - Get statistical analysis
- `GET /healthCheck` - Check system health (Not implemented, as it was not requested, but needed for production grade system)

## Scripts

The repository includes several utility scripts that send api requests to the server. Use them to manually test the system
They require `jq` to run properly. 

## Testing

Note: The test suite is currently incomplete as it was considered overkill for a home task. Basic functionality can be tested manually using the provided scripts.

## What's Not Implemented

The following features from the design document are not implemented in the current codebase:
1. full data about the processes we spawn (see the list in the design doc)
2. persistancy for the manager itself (in case of crash or upgrade)
3. Health check endpoint
4. The tests
5. On-the-fly upgrade mechanism
6. Event viewer logs integration