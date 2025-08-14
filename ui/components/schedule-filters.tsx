"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { SchedulingProblem } from "@/lib/types"

interface ScheduleFiltersProps {
  problem: SchedulingProblem
  filters: {
    courseId?: string
    roomId?: string
    day?: string
  }
  onChange: (filters: { courseId?: string; roomId?: string; day?: string }) => void
}

export function ScheduleFilters({ problem, filters, onChange }: ScheduleFiltersProps) {
  const handleCourseChange = (value: string) => {
    onChange({ ...filters, courseId: value === "all" ? undefined : value })
  }

  const handleRoomChange = (value: string) => {
    onChange({ ...filters, roomId: value === "all" ? undefined : value })
  }

  const handleDayChange = (value: string) => {
    onChange({ ...filters, day: value === "all" ? undefined : value })
  }

  const clearFilters = () => {
    onChange({})
  }

  const hasActiveFilters = filters.courseId || filters.roomId || filters.day
  const uniqueDays = [...new Set(problem.timeSlots.map((slot) => slot.day))].sort()

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium">Course:</label>
        <Select value={filters.courseId || "all"} onValueChange={handleCourseChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {problem.courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name} ({course.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium">Room:</label>
        <Select value={filters.roomId || "all"} onValueChange={handleRoomChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All rooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All rooms</SelectItem>
            {problem.rooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.name} ({room.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium">Day:</label>
        <Select value={filters.day || "all"} onValueChange={handleDayChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All days</SelectItem>
            {uniqueDays.map((day) => (
              <SelectItem key={day} value={day}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
