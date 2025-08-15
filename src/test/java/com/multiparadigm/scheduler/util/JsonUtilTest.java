package com.multiparadigm.scheduler.util;

import com.multiparadigm.scheduler.model.*;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class JsonUtilTest {

    @Test
    void roundTripSchedulingProblem() {
        SchedulingProblem problem = new SchedulingProblem(
                List.of(new Course("C1", "Algorithms")),
                List.of(new Lecture("L1", "C1", "Intro", 50)),
                List.of(new Room("R1", "Room A", 60)),
                List.of(new TimeSlot("T1", "MON", "09:00", "10:00"))
        );
        String json = JsonUtil.toJson(problem);
        SchedulingProblem back = JsonUtil.fromJson(json, SchedulingProblem.class);
        assertEquals(problem.courses().get(0).id(), back.courses().get(0).id());
        assertEquals(problem.lectures().get(0).enrollment(), back.lectures().get(0).enrollment());
        assertEquals(problem.rooms().get(0).capacity(), back.rooms().get(0).capacity());
        assertEquals(problem.timeSlots().get(0).start(), back.timeSlots().get(0).start());
    }

    @Test
    void roundTripSchedule() {
        Schedule schedule = new Schedule(List.of(new Assignment("L1", "R1", "T1")), 0.75);
        String json = JsonUtil.toJson(schedule);
        Schedule back = JsonUtil.fromJson(json, Schedule.class);
        assertEquals(schedule.assignments().size(), back.assignments().size());
        assertEquals(schedule.assignments().get(0).roomId(), back.assignments().get(0).roomId());
        assertEquals(schedule.score(), back.score());
    }
}
