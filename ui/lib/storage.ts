import type { SchedulingProblem, Schedule, ValidationResult } from "./types"

const STORAGE_KEYS = {
  LAST_PROBLEM: "scheduling-app-last-problem",
  LAST_SCHEDULE: "scheduling-app-last-schedule",
  LAST_VALIDATION: "scheduling-app-last-validation",
} as const

export class LocalStorage {
  static saveProblem(problem: SchedulingProblem): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_PROBLEM, JSON.stringify(problem))
    } catch (error) {
      console.warn("Failed to save problem to localStorage:", error)
    }
  }

  static loadProblem(): SchedulingProblem | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LAST_PROBLEM)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.warn("Failed to load problem from localStorage:", error)
      return null
    }
  }

  static saveSchedule(schedule: Schedule): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SCHEDULE, JSON.stringify(schedule))
    } catch (error) {
      console.warn("Failed to save schedule to localStorage:", error)
    }
  }

  static loadSchedule(): Schedule | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LAST_SCHEDULE)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.warn("Failed to load schedule from localStorage:", error)
      return null
    }
  }

  static saveValidation(validation: ValidationResult): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_VALIDATION, JSON.stringify(validation))
    } catch (error) {
      console.warn("Failed to save validation to localStorage:", error)
    }
  }

  static loadValidation(): ValidationResult | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LAST_VALIDATION)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.warn("Failed to load validation from localStorage:", error)
      return null
    }
  }

  static clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.warn("Failed to clear localStorage:", error)
    }
  }
}
