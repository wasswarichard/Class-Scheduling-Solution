import type { z } from "zod"
import type { SchedulingProblem, Schedule, ValidationResult, GenerateAndValidateResponse, ApiError } from "./types"
import { zSchedule, zValidationResult, zGenerateAndValidateResponse, zValidateRequest } from "./validators"

const API_BASE_URL = "http://localhost:8080"
const API_TIMEOUT = 10000 // 10 seconds

class ApiClient {
  private async fetchJson<T>(url: string, schema: z.ZodSchema<T>, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    const fullUrl = `${API_BASE_URL}${url}`

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...options.headers,
        },
        signal: controller.signal,
      })
      console.log("API Response:", response)

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        let details: string | undefined

        try {
          const errorBody = await response.text()
          if (errorBody) {
            details = errorBody
            // Try to parse as JSON for better error messages
            try {
              const parsed = JSON.parse(errorBody)
              if (parsed.message) {
                errorMessage = parsed.message
              }
            } catch {
              // Keep the raw text as details
            }
          }
        } catch {
          // Ignore errors reading response body
        }

        const error: ApiError = {
          status: response.status,
          message: errorMessage,
          details,
        }
        throw error
      }

      const data = await response.json()

      // Validate response with Zod schema
      try {
        return schema.parse(data)
      } catch (validationError) {
        const error: ApiError = {
          status: 422,
          message: "Invalid response format from server",
          details: validationError instanceof Error ? validationError.message : "Unknown validation error",
        }
        throw error
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof DOMException && error.name === "AbortError") {
        const timeoutError: ApiError = {
          status: 408,
          message: "Request timed out",
          details: `Request exceeded ${API_TIMEOUT / 1000} second timeout`,
        }
        throw timeoutError
      }

      // Re-throw ApiError instances
      if (error && typeof error === "object" && "status" in error) {
        throw error
      }

      // Handle network errors
      const networkError: ApiError = {
        status: 0,
        message: "Network error",
        details: error instanceof Error ? error.message : "Unknown network error",
      }
      throw networkError
    }
  }

  async generate(problem: SchedulingProblem): Promise<Schedule> {
    return this.fetchJson("/api/schedule/generate", zSchedule, {
      method: "POST",
      body: JSON.stringify(problem),
    })
  }

  async validate(problem: SchedulingProblem, schedule: Schedule): Promise<ValidationResult> {
    const requestBody = { problem, schedule }

    // Validate request body before sending
    try {
      zValidateRequest.parse(requestBody)
    } catch (validationError) {
      const error: ApiError = {
        status: 400,
        message: "Invalid request data",
        details: validationError instanceof Error ? validationError.message : "Unknown validation error",
      }
      throw error
    }

    return this.fetchJson("/api/schedule/validate", zValidationResult, {
      method: "POST",
      body: JSON.stringify(requestBody),
    })
  }

  async generateAndValidate(problem: SchedulingProblem): Promise<GenerateAndValidateResponse> {
    return this.fetchJson("/api/schedule/generate-and-validate", zGenerateAndValidateResponse, {
      method: "POST",
      body: JSON.stringify(problem),
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export individual functions for convenience (bound wrappers to preserve context)
export const generate = (problem: SchedulingProblem) => apiClient.generate(problem)
export const validate = (problem: SchedulingProblem, schedule: Schedule) => apiClient.validate(problem, schedule)
export const generateAndValidate = (problem: SchedulingProblem) => apiClient.generateAndValidate(problem)
