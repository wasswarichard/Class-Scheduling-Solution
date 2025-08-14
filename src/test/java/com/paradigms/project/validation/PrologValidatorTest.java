package com.paradigms.project.validation;

import com.paradigms.project.exec.CommandResult;
import com.paradigms.project.exec.CommandRunner;
import com.paradigms.project.model.*;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PrologValidatorTest {

    static class FakeRunner implements CommandRunner {
        final int exitCode; final String out; final String err; final boolean timedOut;
        FakeRunner(int exitCode, String out, String err, boolean timedOut) {
            this.exitCode = exitCode; this.out = out; this.err = err; this.timedOut = timedOut;
        }
        @Override public CommandResult run(List<String> command, String stdin, Duration timeout) {
            return new CommandResult(exitCode, out, err, timedOut);
        }
    }

    private SchedulingProblem sampleProblem() {
        return new SchedulingProblem(
                List.of(new Course("C1", "Algorithms")),
                List.of(new Lecture("L1", "C1", "Intro", 50)),
                List.of(new Room("R1", "Room A", 60)),
                List.of(new TimeSlot("T1", "MON", "09:00", "10:00"))
        );
    }

    private Schedule sampleSchedule() {
        return new Schedule(List.of(new Assignment("L1", "R1", "T1")), 0.0);
    }

    @Test
    void toFactsProducesExpectedFacts() {
        String facts = PrologValidator.toFacts(sampleProblem(), sampleSchedule());
        assertTrue(facts.contains("room('R1', 60)."));
        assertTrue(facts.contains("lecture('L1', 'C1', 50)."));
        assertTrue(facts.contains("timeslot('T1', 'MON', '09:00', '10:00')."));
        assertTrue(facts.contains("assignment('L1', 'R1', 'T1')."));
    }

    @Test
    void validateParsesJsonResult() {
        String json = "{\"valid\":false,\"violations\":[{\"code\":\"capacity_exceeded\",\"message\":\"msg\",\"lectureId\":\"L1\",\"roomId\":\"R1\",\"timeSlotId\":\"T1\"}]}";
        PrologValidator validator = new PrologValidator(new FakeRunner(0, json, "", false), List.of("swipl"), Duration.ofSeconds(1));
        ValidationResult result = validator.validate(sampleProblem(), sampleSchedule());
        assertFalse(result.valid());
        assertEquals(1, result.violations().size());
        assertEquals("capacity_exceeded", result.violations().get(0).code());
    }

    @Test
    void validateErrorHandling() {
        PrologValidator timed = new PrologValidator(new FakeRunner(0, "", "", true), List.of("swipl"), Duration.ofMillis(10));
        RuntimeException t = assertThrows(RuntimeException.class, () -> timed.validate(sampleProblem(), sampleSchedule()));
        assertTrue(t.getMessage().toLowerCase().contains("timed"));

        PrologValidator badExit = new PrologValidator(new FakeRunner(1, "", "boom", false), List.of("swipl"), Duration.ofMillis(10));
        RuntimeException e = assertThrows(RuntimeException.class, () -> badExit.validate(sampleProblem(), sampleSchedule()));
        assertTrue(e.getMessage().toLowerCase().contains("exited"));

        PrologValidator empty = new PrologValidator(new FakeRunner(0, "\n", "", false), List.of("swipl"), Duration.ofMillis(10));
        RuntimeException n = assertThrows(RuntimeException.class, () -> empty.validate(sampleProblem(), sampleSchedule()));
        assertTrue(n.getMessage().toLowerCase().contains("no output"));
    }
}
