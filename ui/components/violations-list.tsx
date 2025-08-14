"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Filter } from "lucide-react"
import type { ValidationResult, SchedulingProblem } from "@/lib/types"

interface ViolationsListProps {
  validation: ValidationResult | null
  problem: SchedulingProblem
  onFilterChange: (filters: { courseId?: string; roomId?: string; timeSlotId?: string }) => void
}

export function ViolationsList({ validation, problem, onFilterChange }: ViolationsListProps) {
  const handleFilterByLecture = (lectureId: string) => {
    const lecture = problem.lectures.find((l) => l.id === lectureId)
    if (lecture) {
      onFilterChange({ courseId: lecture.courseId })
    }
  }

  const handleFilterByRoom = (roomId: string) => {
    onFilterChange({ roomId })
  }

  const handleFilterByTimeSlot = (timeSlotId: string) => {
    const timeSlot = problem.timeSlots.find((t) => t.id === timeSlotId)
    if (timeSlot) {
      onFilterChange({ timeSlotId })
    }
  }

  if (!validation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No validation results available. Click "Revalidate" to check for constraint violations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (validation.valid && validation.violations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Schedule is valid! No constraint violations found.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validation Results</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant={validation.valid ? "default" : "destructive"}>
            {validation.valid ? "Valid with Warnings" : "Invalid"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {validation.violations.length} violation{validation.violations.length !== 1 ? "s" : ""} found
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {validation.violations.map((violation, index) => (
            <Alert key={index} variant={validation.valid ? "default" : "destructive"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{violation.code}</div>
                      <div className="text-sm">{violation.message}</div>
                    </div>
                  </div>

                  {/* Contextual filter buttons */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {violation.lectureId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFilterByLecture(violation.lectureId!)}
                        className="h-7 text-xs"
                      >
                        <Filter className="h-3 w-3 mr-1" />
                        Filter by Lecture: {violation.lectureId}
                      </Button>
                    )}
                    {violation.roomId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFilterByRoom(violation.roomId!)}
                        className="h-7 text-xs"
                      >
                        <Filter className="h-3 w-3 mr-1" />
                        Filter by Room: {violation.roomId}
                      </Button>
                    )}
                    {violation.timeSlotId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFilterByTimeSlot(violation.timeSlotId!)}
                        className="h-7 text-xs"
                      >
                        <Filter className="h-3 w-3 mr-1" />
                        Filter by Time: {violation.timeSlotId}
                      </Button>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
