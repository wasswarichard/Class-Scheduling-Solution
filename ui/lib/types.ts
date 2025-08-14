// Core data models for the scheduling application
export interface Course {
  id: string
  name: string
}

export interface Lecture {
  id: string
  courseId: string
  title: string
  enrollment: number
}

export interface Room {
  id: string
  name: string
  capacity: number
}

export interface TimeSlot {
  id: string
  day: string
  start: string // HH:mm format
  end: string // HH:mm format
}

export interface Assignment {
  lectureId: string
  roomId: string
  timeSlotId: string
}

export interface Schedule {
  assignments: Assignment[]
  score?: number | null
}

export interface Violation {
  code: string
  message: string
  lectureId?: string | null
  roomId?: string | null
  timeSlotId?: string | null
}

export interface ValidationResult {
  valid: boolean
  violations: Violation[]
}

export interface SchedulingProblem {
  courses: Course[]
  lectures: Lecture[]
  rooms: Room[]
  timeSlots: TimeSlot[]
}

// API response types
export interface GenerateAndValidateResponse {
  schedule: Schedule
  validation: ValidationResult
}

// UI state types
export interface ApiError {
  status: number
  message: string
  details?: string
}

export interface LoadingState {
  isLoading: boolean
  operation?: string
}
