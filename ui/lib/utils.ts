import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeSlot(day: string, start: string, end: string, id?: string): string {
  const idSuffix = id ? ` (${id})` : ""
  return `${day} ${start}–${end}${idSuffix}`
}

export function formatRoomName(name: string, id?: string): string {
  const idSuffix = id ? ` (${id})` : ""
  return `${name}${idSuffix}`
}

export function formatLectureChip(lectureTitle: string, lectureId: string, courseId: string): string {
  return `${lectureId} — ${lectureTitle} (${courseId})`
}

export function validateTimeFormat(time: string): boolean {
  return /^\d{2}:\d{2}$/.test(time)
}

export function compareTime(time1: string, time2: string): number {
  // Simple string comparison works for HH:mm format
  return time1.localeCompare(time2)
}

export function generateUniqueId(prefix: string, existingIds: string[]): string {
  let counter = 1
  let newId = `${prefix}${counter}`

  while (existingIds.includes(newId)) {
    counter++
    newId = `${prefix}${counter}`
  }

  return newId
}

export function checkCapacityWarnings(
  lectures: Array<{ enrollment: number }>,
  rooms: Array<{ capacity: number }>,
): string[] {
  const warnings: string[] = []
  const maxRoomCapacity = Math.max(...rooms.map((r) => r.capacity))

  lectures.forEach((lecture, index) => {
    if (lecture.enrollment > maxRoomCapacity) {
      warnings.push(
        `Lecture ${index + 1} enrollment (${lecture.enrollment}) exceeds maximum room capacity (${maxRoomCapacity})`,
      )
    }
  })

  return warnings
}
