"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import type { SchedulingProblem, Schedule } from "@/lib/types"

interface AssignmentListProps {
  problem: SchedulingProblem
  schedule: Schedule
  filters: {
    courseId?: string
    roomId?: string
    day?: string
  }
}

type SortField = "lectureId" | "courseId" | "roomId" | "timeSlotId" | "day" | "enrollment"
type SortDirection = "asc" | "desc"

export function AssignmentList({ problem, schedule, filters }: AssignmentListProps) {
  const [sortField, setSortField] = useState<SortField>("lectureId")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedAssignments = useMemo(() => {
    const enrichedAssignments = schedule.assignments
      .map((assignment) => {
        const lecture = problem.lectures.find((l) => l.id === assignment.lectureId)
        const course = lecture ? problem.courses.find((c) => c.id === lecture.courseId) : null
        const room = problem.rooms.find((r) => r.id === assignment.roomId)
        const timeSlot = problem.timeSlots.find((t) => t.id === assignment.timeSlotId)

        return {
          assignment,
          lecture,
          course,
          room,
          timeSlot,
        }
      })
      .filter((item) => {
        // Apply filters
        if (filters.courseId && item.course?.id !== filters.courseId) return false
        if (filters.roomId && item.room?.id !== filters.roomId) return false
        if (filters.day && item.timeSlot?.day !== filters.day) return false
        return true
      })

    // Sort the assignments
    return enrichedAssignments.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case "lectureId":
          aValue = a.lecture?.id || ""
          bValue = b.lecture?.id || ""
          break
        case "courseId":
          aValue = a.course?.id || ""
          bValue = b.course?.id || ""
          break
        case "roomId":
          aValue = a.room?.id || ""
          bValue = b.room?.id || ""
          break
        case "timeSlotId":
          aValue = a.timeSlot?.id || ""
          bValue = b.timeSlot?.id || ""
          break
        case "day":
          aValue = a.timeSlot?.day || ""
          bValue = b.timeSlot?.day || ""
          break
        case "enrollment":
          aValue = a.lecture?.enrollment || 0
          bValue = b.lecture?.enrollment || 0
          break
        default:
          aValue = ""
          bValue = ""
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      const comparison = String(aValue).localeCompare(String(bValue))
      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [schedule.assignments, problem, filters, sortField, sortDirection])

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sortField === field
    const Icon = isActive ? (sortDirection === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown

    return (
      <Button variant="ghost" size="sm" onClick={() => handleSort(field)} className="h-auto p-1 font-medium">
        {children}
        <Icon className="ml-1 h-3 w-3" />
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment List</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedAssignments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No assignments match the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortButton field="lectureId">Lecture ID</SortButton>
                  </TableHead>
                  <TableHead>Lecture Title</TableHead>
                  <TableHead>
                    <SortButton field="courseId">Course</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="enrollment">Enrollment</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="roomId">Room</SortButton>
                  </TableHead>
                  <TableHead>Room Capacity</TableHead>
                  <TableHead>
                    <SortButton field="day">Day</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="timeSlotId">Time Slot</SortButton>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAssignments.map((item, index) => {
                  const isOverCapacity = (item.lecture?.enrollment || 0) > (item.room?.capacity || 0)

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <Badge variant="outline">{item.lecture?.id || "Unknown"}</Badge>
                      </TableCell>
                      <TableCell>{item.lecture?.title || "Unknown"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.course?.name || "Unknown"}</Badge>
                        <div className="text-xs text-muted-foreground mt-1">{item.course?.id}</div>
                      </TableCell>
                      <TableCell>
                        <span className={isOverCapacity ? "text-red-600 font-medium" : ""}>
                          {item.lecture?.enrollment || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>{item.room?.name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">{item.room?.id}</div>
                      </TableCell>
                      <TableCell>
                        <span className={isOverCapacity ? "text-red-600 font-medium" : ""}>
                          {item.room?.capacity || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.timeSlot?.day || "Unknown"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {item.timeSlot?.start || "?"} - {item.timeSlot?.end || "?"}
                        </div>
                        <div className="text-xs text-muted-foreground">{item.timeSlot?.id}</div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
