# Scheduling Project (GA + Prolog)

This project demonstrates a simple course scheduling service that integrates three paradigms:
- A Spring Boot REST API (Java)
- A Genetic Algorithm for schedule generation (Haskell)
- A Prolog validator for hard-constraint checking (SWI-Prolog)

The service accepts a SchedulingProblem (courses, lectures, rooms, time slots), generates a candidate schedule using a Haskell-based GA, and validates it with a Prolog program. It exposes endpoints to generate, validate, or do both in one request.

## Quick Start

- Start the whole stack (backend + UI) with Docker Compose:
  - ./run.sh
  - Or: docker compose up --build
- Backend API: http://localhost:8080 (e.g., POST /api/schedule/generate)
- UI: http://localhost:3000

## Start the project (run everything)

Prerequisites:
- Docker Desktop or Docker Engine with the Docker Compose plugin

Run everything (backend + UI):
- macOS/Linux:
  - Make the script executable once: `chmod +x ./run.sh`
  - Start: `./run.sh`
- Windows (PowerShell):
  - `docker compose up --build`

What the command does:
- Builds both images (backend and UI)
- Starts both containers on a shared network
- Exposes ports: backend at http://localhost:8080, UI at http://localhost:3000

Stop the project:
- Press Ctrl+C in the terminal running the stack
- Then optionally clean up containers/networks/images: `docker compose down`

Notes:
- You can also skip rebuilding on subsequent runs: `docker compose up` (without `--build`) if nothing changed.
- If ports 8080 or 3000 are in use, stop the conflicting process or change the ports in docker-compose.yml.

## Architecture Overview

- Java (Spring Boot)
  - Web layer: REST controller under `/api/schedule`
  - Service layer: Orchestrates GA generation and Prolog validation
  - Exec layer: Runs external commands with timeouts and captures stdout/stderr
  - Model: Problem domain records (Course, Lecture, Room, TimeSlot, Schedule, etc.)
  - Utility: JSON utilities powered by Jackson
- Haskell
  - `haskell/GeneticSchedule.hs`: Parses the input JSON problem, runs a small GA step, and prints JSON schedule
  - `haskell/ga-exec`: Wrapper executable or script to run the Haskell GA (see notes below)
- Prolog (SWI-Prolog)
  - `prolog/validator.pl`: Reads Prolog facts on stdin and prints JSON validation results to stdout

## Endpoints

Base path: `/api/schedule` (consumes/produces `application/json`)

- POST `/generate`
  - Body: SchedulingProblem JSON
  - Response: Schedule JSON
- POST `/validate`
  - Body: `{ "problem": SchedulingProblem, "schedule": Schedule }`
  - Response: ValidationResult JSON (`{valid: boolean, violations: [...]}`)
- POST `/generate-and-validate`
  - Body: SchedulingProblem JSON
  - Response: `{ "schedule": Schedule, "validation": ValidationResult }`

See `src/main/java/com/paradigms/project/web/SchedulingController.java` for signatures and DTOs.

## Building and Running

Requirements:
- Java 17+
- Maven 3.8+
- SWI-Prolog installed and available on PATH (for the validator)
- GHC or a Haskell toolchain to build the GA executable, or use `stack`/`cabal` as preferred

Steps:
1. Build the project
   - `./mvnw -q -DskipTests package`
2. Build the Haskell GA (example using GHC)
   - `ghc -O2 -o haskell/ga-exec haskell/GeneticSchedule.hs`
   - Ensure the resulting `haskell/ga-exec` binary is executable and referenced by the Java configuration
3. Run the Spring Boot app
   - `./mvnw spring-boot:run`

Configuration (application.properties):
- You can wire external command paths and timeouts via Spring config or explicit bean wiring. By default, tests construct clients with explicit commands. If you introduce Spring beans for GA/Prolog clients, document their properties here.

## Run everything with Docker Compose

Prerequisites:
- Docker and Docker Compose plugin installed

Commands:
- Build and start all services:
  - `./run.sh` (recommended) or `docker compose up --build`
- Access the UI: http://localhost:3000
- Backend API: http://localhost:8080 (e.g., POST http://localhost:8080/api/schedule/generate)

Notes:
- The backend image installs SWI-Prolog and GHC (runghc) so the included `haskell/ga-exec` wrapper runs automatically; you don't need to install Stack or GHC on your host when using Docker.
- CORS is configured to allow the UI origin by default. You can change it via env var `APP_CORS_ALLOWED_ORIGINS` in `docker-compose.yml`.
- To change backend port, set `SERVER_PORT` env var in compose, and update UI env `NEXT_PUBLIC_BACKEND_URL` if the UI uses it.

## Run UI only (development)

From `ui/`:
- `npm install`
- `npm run dev`

Then point the UI to a running backend at http://localhost:8080. If the UI expects `NEXT_PUBLIC_BACKEND_URL`, export it before running: `export NEXT_PUBLIC_BACKEND_URL=http://localhost:8080`.

## Local Development (backend only)

- Ensure tools are available on your machine:
  - SWI-Prolog: `swipl --version`
  - Haskell GA binary: ensure `haskell/ga-exec` exists and is executable (see build above)
- Run backend:
  - `./mvnw spring-boot:run`
- Override commands/timeout via properties or env:
  - `--app.haskell.ga.command=haskell/ga-exec`
  - `--app.prolog.validator.command="swipl -q -s prolog/validator.pl -t main"`
  - `--app.process.timeout.seconds=20`
  - `--app.cors.allowed-origins=http://localhost:3000`

## Environment Variables and Configuration

These map to Spring properties configured in `ProjectConfig`:
- APP_HASKELL_GA_COMMAND -> `app.haskell.ga.command` (default: `haskell/ga-exec`)
- APP_PROLOG_VALIDATOR_COMMAND -> `app.prolog.validator.command` (default: `swipl -q -s prolog/validator.pl -t main`)
- APP_PROCESS_TIMEOUT_SECONDS -> `app.process.timeout.seconds` (default: 10)
- APP_CORS_ALLOWED_ORIGINS -> `app.cors.allowed-origins` (default: `*`)
- SERVER_PORT -> `server.port` (default: 8080)

In Docker, these are already wired in the Dockerfile entrypoint and docker-compose.yml.

## Example API Usage (curl)

- Generate schedule:
  - `curl -sS -X POST http://localhost:8080/api/schedule/generate -H 'Content-Type: application/json' -d '{"courses":[],"lectures":[],"rooms":[],"timeSlots":[]}'`
- Validate schedule:
  - `curl -sS -X POST http://localhost:8080/api/schedule/validate -H 'Content-Type: application/json' -d '{"problem":{"courses":[],"lectures":[],"rooms":[],"timeSlots":[]},"schedule":{"assignments":[]}}'`
- Generate and validate:
  - `curl -sS -X POST http://localhost:8080/api/schedule/generate-and-validate -H 'Content-Type: application/json' -d '{"courses":[],"lectures":[],"rooms":[],"timeSlots":[]}'`

## Data Contracts (JSON)

Key records are defined under `src/main/java/com/paradigms/project/model` and serialized with Jackson via `JsonUtil`:
- SchedulingProblem: `{courses, lectures, rooms, timeSlots}`
- Schedule: `{assignments: [{lectureId, roomId, timeSlotId}], score: number?}`
- ValidationResult: `{valid: boolean, violations: [...]}`

## Toolchain Notes

- Haskell GA
  - Input: JSON SchedulingProblem on stdin
  - Output: JSON Schedule on stdout
  - Example standalone run:
    - `cat haskell/genetic_schedule_e2e_test_data.json | haskell/ga-exec`
- Prolog validator (SWI-Prolog)
  - Input: Prolog facts on stdin (see `PrologValidator.toFacts`)
  - Output: JSON ValidationResult on stdout
- Installing SWI-Prolog locally (Debian/Ubuntu):
  - `sudo apt-get update && sudo apt-get install -y swipl`

## Running Tests

- Unit and integration tests:
  - `./mvnw -q test`
- Notable tests:
  - `JsonUtilTest` validates JSON utilities
  - `HaskellGAClientTest` exercises GA client parsing behavior
  - `PrologValidatorTest` validates Prolog fact generation and parsing
  - `IntegrationFlowTest` covers end-to-end flow with sample data

Note: Tests that rely on external binaries may mock the command runner or provide test fixtures instead.

## Repository Structure

- Backend (Spring Boot): `src/main/java/com/paradigms/project` and `src/test/java/...`
- Haskell GA: `haskell/`
- Prolog validator: `prolog/`
- UI (Next.js): `ui/`
- Containerization: `Dockerfile`, `ui/Dockerfile`, `docker-compose.yml`, `run.sh`
- Build: `pom.xml`, `mvnw`, `mvnw.cmd`

## Troubleshooting

- Backend cannot find ga-exec:
  - Ensure `haskell/ga-exec` exists and is executable: `chmod +x haskell/ga-exec`
  - Override path via `APP_HASKELL_GA_COMMAND` or `--app.haskell.ga.command`
- Prolog not installed (local dev):
  - Install SWI-Prolog (see Toolchain Notes), or run with Docker Compose.
- CORS errors from UI:
  - Set `APP_CORS_ALLOWED_ORIGINS` to include your UI origin (comma-separated).
- Timeouts when invoking external tools:
  - Increase `APP_PROCESS_TIMEOUT_SECONDS`.
- Ports already in use:
  - Change `SERVER_PORT` (backend) or `PORT` (UI) and update compose/env accordingly.

## Development Notes

- The `DefaultCommandRunner` enforces a timeout and captures stdout/stderr.
- `HaskellGAClient` and `PrologValidator` treat timeouts, non-zero exit codes, and blank outputs as errors.
- JSON serialization is centralized via `JsonUtil` to keep configuration consistent.

## License
Specify your license here (e.g., MIT), if applicable.

## Acknowledgements
This project combines paradigms for educational purposes: functional programming (Haskell), logic programming (Prolog), and object-oriented/Spring for orchestration.
