# Scheduling Project (GA + Prolog)

This project demonstrates a simple course scheduling service that integrates three paradigms:
- A Spring Boot REST API (Java)
- A Genetic Algorithm for schedule generation (Haskell)
- A Prolog validator for hard-constraint checking (SWI-Prolog)

The service accepts a SchedulingProblem (courses, lectures, rooms, time slots), generates a candidate schedule using a Haskell-based GA, and validates it with a Prolog program. It exposes endpoints to generate, validate, or do both in one request.

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

## Data Contracts (JSON)

Key records are defined under `src/main/java/com/paradigms/project/model` and serialized with Jackson via `JsonUtil`:
- SchedulingProblem: `{courses, lectures, rooms, timeSlots}`
- Schedule: `{assignments: [{lectureId, roomId, timeSlotId}], score: number?}`
- ValidationResult: `{valid: boolean, violations: [...]}`

## Running Tests

- Unit and integration tests:
  - `./mvnw -q test`
- Notable tests:
  - `JsonUtilTest` validates JSON utilities
  - `HaskellGAClientTest` exercises GA client parsing behavior
  - `PrologValidatorTest` validates Prolog fact generation and parsing
  - `IntegrationFlowTest` covers end-to-end flow with sample data

Note: Tests that rely on external binaries may mock the command runner or provide test fixtures instead.

## External Tools

- Haskell GA
  - Input: JSON SchedulingProblem on stdin
  - Output: JSON Schedule on stdout
  - Example standalone run:
    ```bash
    cat haskell/genetic_schedule_e2e_test_data.json | haskell/ga-exec
    ```
- Prolog validator (SWI-Prolog)
  - Input: Prolog facts on stdin (see `PrologValidator.toFacts`)
  - Output: JSON ValidationResult on stdout

## Development Notes

- The `DefaultCommandRunner` enforces a timeout and captures stdout/stderr.
- `HaskellGAClient` and `PrologValidator` treat timeouts, non-zero exit codes, and blank outputs as errors.
- JSON serialization is centralized via `JsonUtil` to keep configuration consistent.

## License
Specify your license here (e.g., MIT), if applicable.

## Acknowledgements
This project combines paradigms for educational purposes: functional programming (Haskell), logic programming (Prolog), and object-oriented/Spring for orchestration.
