import { z } from "zod"

// Base entity validators
export const zCourse = z.object({
  id: z.string().min(1, "Course ID is required"),
  name: z.string().min(1, "Course name is required"),
})

export const zLecture = z.object({
  id: z.string().min(1, "Lecture ID is required"),
  courseId: z.string().min(1, "Course ID is required"),
  title: z.string().min(1, "Lecture title is required"),
  enrollment: z.number().min(0, "Enrollment must be non-negative"),
})

export const zRoom = z.object({
  id: z.string().min(1, "Room ID is required"),
  name: z.string().min(1, "Room name is required"),
  capacity: z.number().min(1, "Room capacity must be positive"),
})

export const zTimeSlot = z
  .object({
    id: z.string().min(1, "Time slot ID is required"),
    day: z.string().min(1, "Day is required"),
    start: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:mm format"),
    end: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:mm format"),
  })
  .refine((data) => data.start < data.end, {
    message: "Start time must be before end time",
    path: ["end"],
  })

export const zAssignment = z.object({
  lectureId: z.string().min(1, "Lecture ID is required"),
  roomId: z.string().min(1, "Room ID is required"),
  timeSlotId: z.string().min(1, "Time slot ID is required"),
})

export const zSchedule = z.object({
  assignments: z.array(zAssignment),
  score: z.number().nullable().optional(),
})

export const zViolation = z.object({
  code: z.string(),
  message: z.string(),
  lectureId: z.string().nullable().optional(),
  roomId: z.string().nullable().optional(),
  timeSlotId: z.string().nullable().optional(),
})

export const zValidationResult = z.object({
  valid: z.boolean(),
  violations: z.array(zViolation),
})

export const zSchedulingProblem = z
  .object({
    courses: z.array(zCourse).min(1, "At least one course is required"),
    lectures: z.array(zLecture).min(1, "At least one lecture is required"),
    rooms: z.array(zRoom).min(1, "At least one room is required"),
    timeSlots: z.array(zTimeSlot).min(1, "At least one time slot is required"),
  })
  .refine(
    (data) => {
      // Validate that all lectures reference existing courses
      const courseIds = new Set(data.courses.map((c) => c.id))
      return data.lectures.every((l) => courseIds.has(l.courseId))
    },
    {
      message: "All lectures must reference existing courses",
      path: ["lectures"],
    },
  )
  .refine(
    (data) => {
      // Validate unique IDs within each entity type
      const courseIds = data.courses.map((c) => c.id)
      const lectureIds = data.lectures.map((l) => l.id)
      const roomIds = data.rooms.map((r) => r.id)
      const timeSlotIds = data.timeSlots.map((t) => t.id)

      return (
        new Set(courseIds).size === courseIds.length &&
        new Set(lectureIds).size === lectureIds.length &&
        new Set(roomIds).size === roomIds.length &&
        new Set(timeSlotIds).size === timeSlotIds.length
      )
    },
    {
      message: "All IDs must be unique within their entity type",
    },
  )

export const zGenerateAndValidateResponse = z.object({
  schedule: zSchedule,
  validation: zValidationResult,
})

// Validation request schemas
export const zValidateRequest = z.object({
  problem: zSchedulingProblem,
  schedule: zSchedule,
})
