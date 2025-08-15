package com.multiparadigm.scheduler.ga;

import com.multiparadigm.scheduler.exec.CommandResult;
import com.multiparadigm.scheduler.exec.CommandRunner;
import com.multiparadigm.scheduler.model.Schedule;
import com.multiparadigm.scheduler.model.SchedulingProblem;
import com.multiparadigm.scheduler.util.JsonUtil;

import java.time.Duration;
import java.util.List;
import java.util.Objects;

/**
 * Client wrapper around an external Haskell Genetic Algorithm process.
 * Sends a {@link SchedulingProblem} as JSON via stdin and
 * expects a {@link Schedule} JSON via stdout.
 */
public class HaskellGAClient {
    private final CommandRunner runner;
    private final List<String> command;
    private final Duration timeout;

    public HaskellGAClient(CommandRunner runner, List<String> command, Duration timeout) {
        this.runner = Objects.requireNonNull(runner);
        this.command = List.copyOf(command);
        this.timeout = timeout == null ? Duration.ofSeconds(10) : timeout;
    }

    /**
     * Invoke the external GA with the given problem and parse the resulting schedule.
     * @throws RuntimeException on timeout, non-zero exit, or empty output
     */
    public Schedule generate(SchedulingProblem problem) {
        String input = JsonUtil.toJson(problem);
        CommandResult result;
        try {
            result = runner.run(command, input, timeout);
        } catch (Exception e) {
            throw new RuntimeException("Failed to invoke Haskell GA: " + e.getMessage(), e);
        }
        if (result.timedOut()) {
            throw new RuntimeException("Haskell GA process timed out");
        }
        if (result.exitCode() != 0) {
            throw new RuntimeException("Haskell GA exited with code " + result.exitCode() + ": " + result.stderr());
        }
        String stdout = result.stdout();
        if (stdout == null || stdout.isBlank()) {
            throw new RuntimeException("Haskell GA returned no output");
        }
        return JsonUtil.fromJson(stdout, Schedule.class);
    }
}
