"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle } from "lucide-react"
import { formatTimeSlot, formatRoomName, formatLectureChip } from "@/lib/utils"
import type { SchedulingProblem, Schedule } from "@/lib/types"

interface AssignmentGridProps {
  problem: SchedulingProblem
  schedule: Schedule
  filters: {
    courseId?: string
    roomId?: string
    day?: string
  }
}

export function AssignmentGrid({ problem, schedule, filters }: AssignmentGridProps) {
  const { filteredTimeSlots, filteredRooms, gridData } = useMemo(() => {
    // Apply filters
    const filteredTimeSlots = problem.timeSlots.filter((slot) => {
      if (filters.day && slot.day !== filters.day) return false
      return true
    })

    const filteredRooms = problem.rooms.filter((room) => {
      if (filters.roomId && room.id !== filters.roomId) return false
      return true
    })

    // Create grid data structure
    const gridData: Record<string, Record<string, any[]>> = {}

    filteredTimeSlots.forEach((slot) => {
      gridData[slot.id] = {}
      filteredRooms.forEach((room) => {
        gridData[slot.id][room.id] = []
      })
    })

    // Populate grid with assignments
    schedule.assignments.forEach((assignment) => {
      const lecture = problem.lectures.find((l) => l.id === assignment.lectureId)
      const course = lecture ? problem.courses.find((c) => c.id === lecture.courseId) : null

      // Apply course filter
      if (filters.courseId && course?.id !== filters.courseId) return

      // Check if this assignment should be included based on filters
      const timeSlot = problem.timeSlots.find((t) => t.id === assignment.timeSlotId)
      const room = problem.rooms.find((r) => r.id === assignment.roomId)

      if (!timeSlot || !room) return
      if (filters.day && timeSlot.day !== filters.day) return
      if (filters.roomId && room.id !== filters.roomId) return

      if (gridData[assignment.timeSlotId] && gridData[assignment.timeSlotId][assignment.roomId]) {
        gridData[assignment.timeSlotId][assignment.roomId].push({
          assignment,
          lecture,
          course,
        })
      }
    })

    return { filteredTimeSlots, filteredRooms, gridData }
  }, [problem, schedule, filters])

  if (filteredTimeSlots.length === 0 || filteredRooms.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No data matches the current filters.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Grid</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Time Slot</TableHead>
                {filteredRooms.map((room) => (
                  <TableHead key={room.id} className="min-w-[200px]">
                    {formatRoomName(room.name, room.id)}
                    <div className="text-xs text-muted-foreground">Capacity: {room.capacity}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTimeSlots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell className="font-medium align-top">
                    <div className="space-y-1">
                      <div>{formatTimeSlot(slot.day, slot.start, slot.end)}</div>
                      <Badge variant="outline" className="text-xs">
                        {slot.id}
                      </Badge>
                    </div>
                  </TableCell>
                  {filteredRooms.map((room) => {
                    const assignments = gridData[slot.id][room.id] || []
                    const hasConflict = assignments.length > 1
                    const totalEnrollment = assignments.reduce((sum, item) => sum + (item.lecture?.enrollment || 0), 0)
                    const isOverCapacity = totalEnrollment > room.capacity

                    return (
                      <TableCell key={room.id} className="align-top">
                        <div className="space-y-2">
                          {assignments.length === 0 ? (
                            <div className="text-xs text-muted-foreground italic">Empty</div>
                          ) : (
                            assignments.map((item, index) => (
                              <div key={index} className="space-y-1">
                                <Badge
                                  variant={hasConflict || isOverCapacity ? "destructive" : "secondary"}
                                  className="text-xs block w-full text-center"
                                >
                                  {formatLectureChip(
                                    item.lecture?.title || "Unknown",
                                    item.lecture?.id || "?",
                                    item.course?.id || "?",
                                  )}
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  Enrollment: {item.lecture?.enrollment || 0}
                                </div>
                              </div>
                            ))
                          )}
                          {(hasConflict || isOverCapacity) && (
                            <div className="flex items-center space-x-1 text-red-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span className="text-xs">
                                {hasConflict && "Conflict"}
                                {hasConflict && isOverCapacity && " & "}
                                {isOverCapacity && "Over capacity"}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
