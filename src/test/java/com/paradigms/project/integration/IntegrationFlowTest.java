package com.paradigms.project.integration;

import com.paradigms.project.exec.CommandResult;
import com.paradigms.project.exec.CommandRunner;
import com.paradigms.project.ga.HaskellGAClient;
import com.paradigms.project.model.*;
import com.paradigms.project.util.JsonUtil;
import com.paradigms.project.validation.PrologValidator;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class IntegrationFlowTest {

    static class GAStub implements CommandRunner {
        @Override public CommandResult run(List<String> command, String stdin, Duration timeout) {
            // Receive problem JSON and return a trivial schedule JSON (assign all lectures to first room and timeslot)
            SchedulingProblem p = JsonUtil.fromJson(stdin, SchedulingProblem.class);
            String r = p.rooms().isEmpty() ? "R-NA" : p.rooms().get(0).id();
            String t = p.timeSlots().isEmpty() ? "T-NA" : p.timeSlots().get(0).id();
            List<Assignment> asg = p.lectures().stream().map(l -> new Assignment(l.id(), r, t)).toList();
            String out = JsonUtil.toJson(new Schedule(asg, 0.0));
            return new CommandResult(0, out, "", false);
        }
    }

    static class PrologStub implements CommandRunner {
        @Override public CommandResult run(List<String> command, String stdin, Duration timeout) {
            // Always return valid result
            String out = "{\"valid\":true,\"violations\":[]}";
            return new CommandResult(0, out, "", false);
        }
    }

    @Test
    void endToEndWithFakes() {
        SchedulingProblem problem = new SchedulingProblem(
                List.of(new Course("C1", "Algorithms")),
                List.of(new Lecture("L1", "C1", "Intro", 50)),
                List.of(new Room("R1", "Room A", 60)),
                List.of(new TimeSlot("T1", "MON", "09:00", "10:00"))
        );

        HaskellGAClient ga = new HaskellGAClient(new GAStub(), List.of("ga"), Duration.ofSeconds(1));
        Schedule schedule = ga.generate(problem);
        assertEquals(1, schedule.assignments().size());

        PrologValidator validator = new PrologValidator(new PrologStub(), List.of("swipl"), Duration.ofSeconds(1));
        ValidationResult res = validator.validate(problem, schedule);
        assertTrue(res.valid());
        assertEquals(0, res.violations().size());
    }
}
