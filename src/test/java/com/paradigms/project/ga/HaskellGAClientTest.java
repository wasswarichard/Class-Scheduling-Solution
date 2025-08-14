package com.paradigms.project.ga;

import com.paradigms.project.exec.CommandResult;
import com.paradigms.project.exec.CommandRunner;
import com.paradigms.project.model.*;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class HaskellGAClientTest {

    static class FakeRunner implements CommandRunner {
        final int exitCode; final String out; final String err; final boolean timedOut;
        FakeRunner(int exitCode, String out, String err, boolean timedOut) {
            this.exitCode = exitCode; this.out = out; this.err = err; this.timedOut = timedOut;
        }
        @Override public CommandResult run(List<String> command, String stdin, Duration timeout) {
            return new CommandResult(exitCode, out, err, timedOut);
        }
    }

    @Test
    void parsesScheduleFromStdout() {
        CommandRunner runner = new FakeRunner(0, "{\"assignments\":[{\"lectureId\":\"L1\",\"roomId\":\"R1\",\"timeSlotId\":\"T1\"}],\"score\":0.5}", "", false);
        HaskellGAClient client = new HaskellGAClient(runner, List.of("haskell/ga-exec"), Duration.ofSeconds(2));
        SchedulingProblem problem = new SchedulingProblem(
                List.of(new Course("C1","Algo")),
                List.of(new Lecture("L1","C1","Intro", 10)),
                List.of(new Room("R1","Room", 20)),
                List.of(new TimeSlot("T1","MON","09:00","10:00"))
        );
        Schedule schedule = client.generate(problem);
        assertEquals(1, schedule.assignments().size());
        assertEquals("R1", schedule.assignments().get(0).roomId());
        assertEquals(0.5, schedule.score());
    }

    @Test
    void throwsOnTimeoutOrExitCode() {
        SchedulingProblem dummy = new SchedulingProblem(List.of(), List.of(), List.of(), List.of());
        HaskellGAClient timed = new HaskellGAClient(new FakeRunner(0, "", "", true), List.of("ga"), Duration.ofMillis(10));
        RuntimeException ex1 = assertThrows(RuntimeException.class, () -> timed.generate(dummy));
        assertTrue(ex1.getMessage().toLowerCase().contains("timed"));

        HaskellGAClient badExit = new HaskellGAClient(new FakeRunner(1, "", "boom", false), List.of("ga"), Duration.ofMillis(10));
        RuntimeException ex2 = assertThrows(RuntimeException.class, ()-> badExit.generate(dummy));
        assertTrue(ex2.getMessage().toLowerCase().contains("exited"));

        HaskellGAClient empty = new HaskellGAClient(new FakeRunner(0, "\n", "", false), List.of("ga"), Duration.ofMillis(10));
        RuntimeException ex3 = assertThrows(RuntimeException.class, ()-> empty.generate(dummy));
        assertTrue(ex3.getMessage().toLowerCase().contains("no output"));
    }
}
