"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EntityTable } from "@/components/entity-table"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Building, Clock } from "lucide-react"
import type { SchedulingProblem, Course, Lecture, Room, TimeSlot } from "@/lib/types"

interface ProblemFormProps {
  problem: SchedulingProblem
  onChange: (problem: SchedulingProblem) => void
}

export function ProblemForm({ problem, onChange }: ProblemFormProps) {
  const handleCoursesChange = (courses: Course[]) => {
    onChange({ ...problem, courses })
  }

  const handleLecturesChange = (lectures: Lecture[]) => {
    onChange({ ...problem, lectures })
  }

  const handleRoomsChange = (rooms: Room[]) => {
    onChange({ ...problem, rooms })
  }

  const handleTimeSlotsChange = (timeSlots: TimeSlot[]) => {
    onChange({ ...problem, timeSlots })
  }

  return (
    <div className="space-y-6">
      {/* Courses Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <CardTitle>Courses</CardTitle>
              <Badge variant="secondary" aria-label={`${problem.courses.length} courses`}>
                {problem.courses.length}
              </Badge>
            </div>
          </div>
          <CardDescription>Define the courses that will have lectures scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          <EntityTable
            type="course"
            data={problem.courses}
            onChange={handleCoursesChange}
            columns={[
              {
                key: "id",
                label: "Course ID",
                type: "text",
                required: true,
                helpText: "Unique identifier for the course (e.g., CS101, MATH200)",
              },
              {
                key: "name",
                label: "Course Name",
                type: "text",
                required: true,
                helpText: "Full name of the course",
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* Lectures Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" aria-hidden="true" />
              <CardTitle>Lectures</CardTitle>
              <Badge variant="secondary" aria-label={`${problem.lectures.length} lectures`}>
                {problem.lectures.length}
              </Badge>
            </div>
          </div>
          <CardDescription>Define individual lectures that need to be scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          <EntityTable
            type="lecture"
            data={problem.lectures}
            onChange={handleLecturesChange}
            columns={[
              {
                key: "id",
                label: "Lecture ID",
                type: "text",
                required: true,
                helpText: "Unique identifier for the lecture",
              },
              {
                key: "courseId",
                label: "Course",
                type: "select",
                required: true,
                options: problem.courses.map((c) => ({ value: c.id, label: `${c.name} (${c.id})` })),
                helpText: "Select which course this lecture belongs to",
              },
              {
                key: "title",
                label: "Lecture Title",
                type: "text",
                required: true,
                helpText: "Descriptive title for the lecture",
              },
              {
                key: "enrollment",
                label: "Enrollment",
                type: "number",
                required: true,
                min: 0,
                helpText: "Number of students enrolled in this lecture",
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* Rooms Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-purple-600" aria-hidden="true" />
              <CardTitle>Rooms</CardTitle>
              <Badge variant="secondary" aria-label={`${problem.rooms.length} rooms`}>
                {problem.rooms.length}
              </Badge>
            </div>
          </div>
          <CardDescription>Define available rooms with their capacities</CardDescription>
        </CardHeader>
        <CardContent>
          <EntityTable
            type="room"
            data={problem.rooms}
            onChange={handleRoomsChange}
            columns={[
              {
                key: "id",
                label: "Room ID",
                type: "text",
                required: true,
                helpText: "Unique identifier for the room",
              },
              {
                key: "name",
                label: "Room Name",
                type: "text",
                required: true,
                helpText: "Descriptive name for the room",
              },
              {
                key: "capacity",
                label: "Capacity",
                type: "number",
                required: true,
                min: 1,
                helpText: "Maximum number of students the room can accommodate",
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* Time Slots Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" aria-hidden="true" />
              <CardTitle>Time Slots</CardTitle>
              <Badge variant="secondary" aria-label={`${problem.timeSlots.length} time slots`}>
                {problem.timeSlots.length}
              </Badge>
            </div>
          </div>
          <CardDescription>Define available time slots for scheduling</CardDescription>
        </CardHeader>
        <CardContent>
          <EntityTable
            type="timeSlot"
            data={problem.timeSlots}
            onChange={handleTimeSlotsChange}
            columns={[
              {
                key: "id",
                label: "Slot ID",
                type: "text",
                required: true,
                helpText: "Unique identifier for the time slot",
              },
              {
                key: "day",
                label: "Day",
                type: "select",
                required: true,
                options: [
                  { value: "Mon", label: "Monday" },
                  { value: "Tue", label: "Tuesday" },
                  { value: "Wed", label: "Wednesday" },
                  { value: "Thu", label: "Thursday" },
                  { value: "Fri", label: "Friday" },
                  { value: "Sat", label: "Saturday" },
                  { value: "Sun", label: "Sunday" },
                ],
                helpText: "Day of the week for this time slot",
              },
              {
                key: "start",
                label: "Start Time",
                type: "time",
                required: true,
                helpText: "Start time in 24-hour format (HH:mm)",
              },
              {
                key: "end",
                label: "End Time",
                type: "time",
                required: true,
                helpText: "End time in 24-hour format (HH:mm)",
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
