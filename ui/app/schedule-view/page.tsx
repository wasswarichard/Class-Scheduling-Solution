"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AssignmentGrid } from "@/components/assignment-grid"
import { AssignmentList } from "@/components/assignment-list"
import { ViolationsList } from "@/components/violations-list"
import { ScheduleFilters as ScheduleFiltersComponent } from "@/components/schedule-filters"
import { LoadingState } from "@/components/loading-state"
import { ApiError } from "@/components/api-error"
import { JsonModal } from "@/components/json-modal"
import { Grid, List, AlertTriangle, Download, RefreshCw, Calendar, Users, Building, Clock } from "lucide-react"
import { validate } from "@/lib/api"
import { LocalStorage } from "@/lib/storage"
import { zSchedule } from "@/lib/validators"
import type { SchedulingProblem, Schedule, ValidationResult, ApiError as ApiErrorType } from "@/lib/types"

export default function ScheduleViewPage() {
  const [problem, setProblem] = useState<SchedulingProblem | null>(null)
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [filters, setFilters] = useState<{ courseId?: string; roomId?: string; day?: string }>({})
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<ApiErrorType | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)

  useEffect(() => {
    const loadedProblem = LocalStorage.loadProblem()
    const loadedSchedule = LocalStorage.loadSchedule()
    const loadedValidation = LocalStorage.loadValidation()

    setProblem(loadedProblem)
    setSchedule(loadedSchedule)
    setValidation(loadedValidation)
  }, [])

  const handleRevalidate = async () => {
    if (!problem || !schedule) return

    setError(null)
    setIsValidating(true)

    try {
      const result = await validate(problem, schedule)
      setValidation(result)
      LocalStorage.saveValidation(result)
    } catch (err) {
      setError(err as ApiErrorType)
    } finally {
      setIsValidating(false)
    }
  }

  const handleExportSchedule = () => {
    setShowExportModal(true)
  }

  if (!schedule || !problem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <div className="p-8 bg-muted/50 rounded-lg">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">No Schedule Available</h1>
            <p className="text-muted-foreground mb-6">Generate a schedule from the Problem Builder to view it here.</p>
            <Button asChild>
              <a href="/builder">Go to Problem Builder</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const violationCount = validation?.violations.length || 0
  const isValid = validation?.valid ?? null

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Schedule Viewer</h1>
            <p className="text-muted-foreground">View and analyze your generated schedule across multiple formats</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRevalidate} disabled={isValidating}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? "animate-spin" : ""}`} />
              Revalidate
            </Button>
            <Button variant="outline" onClick={handleExportSchedule}>
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Lectures</p>
                  <p className="text-2xl font-bold">{problem.lectures.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Rooms</p>
                  <p className="text-2xl font-bold">{problem.rooms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Time Slots</p>
                  <p className="text-2xl font-bold">{problem.timeSlots.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                {isValid === true ? (
                  <Badge variant="default" className="bg-green-600">
                    Valid
                  </Badge>
                ) : isValid === false ? (
                  <Badge variant="destructive">{violationCount} Issues</Badge>
                ) : (
                  <Badge variant="secondary">Not Validated</Badge>
                )}
                {schedule.score && (
                  <div className="ml-auto">
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-lg font-bold">{(schedule.score * 100).toFixed(1)}%</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && <ApiError error={error} onDismiss={() => setError(null)} />}

        {/* Loading State */}
        {isValidating && <LoadingState message="Revalidating schedule..." />}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter the schedule view by course, room, or day</CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleFiltersComponent problem={problem} filters={filters} onChange={setFilters} />
          </CardContent>
        </Card>

        {/* Schedule Views */}
        <Tabs defaultValue="grid" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="grid" className="flex items-center space-x-2">
              <Grid className="h-4 w-4" />
              <span>Grid View</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>List View</span>
            </TabsTrigger>
            <TabsTrigger value="violations" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Violations ({violationCount})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
            <AssignmentGrid problem={problem} schedule={schedule} filters={filters} />
          </TabsContent>

          <TabsContent value="list">
            <AssignmentList problem={problem} schedule={schedule} filters={filters} />
          </TabsContent>

          <TabsContent value="violations">
            <ViolationsList validation={validation} problem={problem} onFilterChange={setFilters} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Export Modal */}
      <JsonModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Schedule"
        description="Download or copy your schedule data as JSON"
        data={schedule}
        schema={zSchedule}
        allowImport={false}
        allowExport={true}
      />
    </div>
  )
}
