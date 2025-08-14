import type { SchedulingProblem, Schedule } from "./types"

export const sampleProblem: SchedulingProblem = {
  courses: [{ id: "c1", name: "Course 1" }],
  lectures: [
    { id: "l1", courseId: "c1", title: "Intro", enrollment: 30 },
    { id: "l2", courseId: "c1", title: "Advanced", enrollment: 25 },
  ],
  rooms: [
    { id: "r1", name: "Room A", capacity: 50 },
    { id: "r2", name: "Room B", capacity: 20 },
  ],
  timeSlots: [
    { id: "t1", day: "Mon", start: "09:00", end: "10:00" },
    { id: "t2", day: "Tue", start: "10:00", end: "11:00" },
  ],
}

export const sampleSchedule: Schedule = {
  assignments: [
    { lectureId: "l1", roomId: "r1", timeSlotId: "t1" },
    { lectureId: "l2", roomId: "r1", timeSlotId: "t2" },
  ],
  score: 0.87,
}
