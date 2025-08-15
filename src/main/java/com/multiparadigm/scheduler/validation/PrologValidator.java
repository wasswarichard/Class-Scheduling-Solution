package com.multiparadigm.scheduler.validation;

import com.multiparadigm.scheduler.exec.CommandResult;
import com.multiparadigm.scheduler.exec.CommandRunner;
import com.multiparadigm.scheduler.model.*;
import com.multiparadigm.scheduler.util.JsonUtil;

import java.time.Duration;
import java.util.List;
import java.util.Objects;

/**
 * Invokes the external Prolog validator process to check hard scheduling constraints.
 * <p>
 * Input is provided as Prolog facts generated from a SchedulingProblem and a Schedule. The validator
 * is expected to print a JSON object matching {@link ValidationResult} to stdout.
 * Any timeout, non-zero exit code, or blank output is treated as an error.
 */
public class PrologValidator {
    private final CommandRunner runner;
    private final List<String> command;
    private final Duration timeout;

    public PrologValidator(CommandRunner runner, List<String> command, Duration timeout) {
        this.runner = Objects.requireNonNull(runner);
        this.command = List.copyOf(command);
        this.timeout = timeout == null ? Duration.ofSeconds(10) : timeout;
    }

    /**
     * Invoke the external Prolog validator with facts derived from the given problem and schedule.
     * @throws RuntimeException on timeout, non-zero exit, or empty output
     */
    public ValidationResult validate(SchedulingProblem problem, Schedule schedule) {
        String facts = toFacts(problem, schedule);
        CommandResult result;
        try {
            result = runner.run(command, facts, timeout);
        } catch (Exception e) {
            throw new RuntimeException("Failed to invoke Prolog validator: " + e.getMessage(), e);
        }
        if (result.timedOut()) {
            throw new RuntimeException("Prolog validator timed out");
        }
        if (result.exitCode() != 0) {
            throw new RuntimeException("Prolog validator exited with code " + result.exitCode() + ": " + result.stderr());
        }
        String stdout = result.stdout();
        if (stdout == null || stdout.isBlank()) {
            throw new RuntimeException("Prolog validator returned no output");
        }
        return JsonUtil.fromJson(stdout, ValidationResult.class);
    }

    /**
     * Convert a problem and a candidate schedule into Prolog facts consumable by the SWI-Prolog validator.
     * Escapes single quotes in IDs to keep facts valid.
     */
    public static String toFacts(SchedulingProblem problem, Schedule schedule) {
        StringBuilder sb = new StringBuilder();
        for (Room r : problem.rooms()) {
            sb.append(String.format("room('%s', %d).\n", esc(r.id()), r.capacity()));
        }
        for (Lecture l : problem.lectures()) {
            sb.append(String.format("lecture('%s', '%s', %d).\n", esc(l.id()), esc(l.courseId()), l.enrollment()));
        }
        for (TimeSlot t : problem.timeSlots()) {
            sb.append(String.format("timeslot('%s', '%s', '%s', '%s').\n", esc(t.id()), esc(t.day()), esc(t.start()), esc(t.end())));
        }
        for (Assignment a : schedule.assignments()) {
            sb.append(String.format("assignment('%s', '%s', '%s').\n", esc(a.lectureId()), esc(a.roomId()), esc(a.timeSlotId())));
        }
        return sb.toString();
    }

    private static String esc(String s) {
        if (s == null) return "";
        return s.replace("'", "\\'");
    }
}
