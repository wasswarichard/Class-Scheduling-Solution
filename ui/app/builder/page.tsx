"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProblemForm } from "@/components/problem-form"
import { LoadingState } from "@/components/loading-state"
import { ApiError } from "@/components/api-error"
import { JsonModal } from "@/components/json-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Play, Zap, CheckCircle, FileText, Upload, Download, Calendar } from "lucide-react"
import { generate, generateAndValidate, validate } from "@/lib/api"
import { LocalStorage } from "@/lib/storage"
import { sampleProblem } from "@/lib/sample-data"
import { checkCapacityWarnings } from "@/lib/utils"
import { zSchedulingProblem, zSchedule } from "@/lib/validators"
import { useToast } from "@/hooks/use-toast"
import type {
  SchedulingProblem,
  Schedule,
  ApiError as ApiErrorType,
  LoadingState as LoadingStateType,
} from "@/lib/types"
// import { apiClient } from "@/lib/api"
export default function BuilderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [problem, setProblem] = useState<SchedulingProblem>({
    courses: [],
    lectures: [],
    rooms: [],
    timeSlots: [],
  })
  const [loadingState, setLoadingState] = useState<LoadingStateType>({ isLoading: false })
  const [error, setError] = useState<ApiErrorType | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])

  const [showProblemModal, setShowProblemModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showValidateModal, setShowValidateModal] = useState(false)

  // Load demo data if requested
  useEffect(() => {
    if (searchParams.get("demo") === "true") {
      setProblem(sampleProblem)
      toast({
        title: "Demo Data Loaded",
        description: "Sample scheduling problem has been loaded for you to try.",
        variant: "success",
      })
    } else {
      // Try to load last problem from localStorage
      const lastProblem = LocalStorage.loadProblem()
      if (lastProblem) {
        setProblem(lastProblem)
        toast({
          title: "Previous Data Restored",
          description: "Your last problem has been restored from local storage.",
          variant: "success",
        })
      }
    }
  }, [searchParams]) // Removed toast from dependencies

  // Update warnings when problem changes
  useEffect(() => {
    const newWarnings = checkCapacityWarnings(problem.lectures, problem.rooms)
    setWarnings(newWarnings)
  }, [problem.lectures, problem.rooms])

  const handleProblemChange = (newProblem: SchedulingProblem) => {
    setProblem(newProblem)
    LocalStorage.saveProblem(newProblem)
  }

  const handleLoadSampleData = () => {
    setProblem(sampleProblem)
    LocalStorage.saveProblem(sampleProblem)
    toast({
      title: "Sample Data Loaded",
      description: "Demo problem with courses, lectures, rooms, and time slots has been loaded.",
      variant: "success",
    })
  }

  const handleGenerate = async () => {
    console.log("Generating schedule...")
    setError(null)
    setLoadingState({ isLoading: true, operation: "Generating schedule..." })

    try {
      const schedule = await generate(problem)
      LocalStorage.saveSchedule(schedule)
      toast({
        title: "Schedule Generated",
        description: "Your schedule has been generated successfully!",
        variant: "success",
      })
      router.push("/schedule-view")
    } catch (err) {
      setError(err as ApiErrorType)
      console.error("Error generating schedule:", err)
      toast({
        title: "Generation Failed",
        description: "Failed to generate schedule. Please check your problem definition.",
        variant: "destructive",
      })
    } finally {
      setLoadingState({ isLoading: false })
    }
  }

  const handleGenerateAndValidate = async () => {
    setError(null)
    setLoadingState({ isLoading: true, operation: "Generating and validating schedule..." })

    try {
      const result = await generateAndValidate(problem)
      LocalStorage.saveSchedule(result.schedule)
      LocalStorage.saveValidation(result.validation)
      toast({
        title: "Schedule Generated & Validated",
        description: `Schedule created with ${result.validation.violations.length} validation issues.`,
        variant: result.validation.valid ? "success" : "default",
      })
      router.push("/schedule-view")
    } catch (err) {
      setError(err as ApiErrorType)
      toast({
        title: "Generation Failed",
        description: "Failed to generate and validate schedule.",
        variant: "destructive",
      })
    } finally {
      setLoadingState({ isLoading: false })
    }
  }

  const handleValidateExisting = async (scheduleData: Schedule) => {
    setError(null)
    setLoadingState({ isLoading: true, operation: "Validating schedule..." })

    try {
      const result = await validate(problem, scheduleData)
      LocalStorage.saveSchedule(scheduleData)
      LocalStorage.saveValidation(result)
      toast({
        title: "Schedule Validated",
        description: `Validation complete with ${result.violations.length} issues found.`,
        variant: result.valid ? "success" : "default",
      })
      router.push("/schedule-view")
    } catch (err) {
      setError(err as ApiErrorType)
      toast({
        title: "Validation Failed",
        description: "Failed to validate the schedule.",
        variant: "destructive",
      })
    } finally {
      setLoadingState({ isLoading: false })
    }
  }

  const handleImportProblem = (problemData: SchedulingProblem) => {
    setProblem(problemData)
    LocalStorage.saveProblem(problemData)
    toast({
      title: "Problem Imported",
      description: "Your problem data has been imported successfully.",
      variant: "success",
    })
  }

  const isFormValid =
    problem.courses.length > 0 &&
    problem.lectures.length > 0 &&
    problem.rooms.length > 0 &&
    problem.timeSlots.length > 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
             <div className="text-center space-y-6 mb-12">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-full">
            <Calendar className="h-12 w-12 text-primary" />
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-foreground">Schedule Generator</h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Generate and validate lecture schedules using a GA + Prolog backend. Optimize room assignments, time slots,
          and course scheduling with AI-powered algorithms.
        </p>

       

      
      </div>
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Problem Builder</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Define your scheduling problem by adding courses, lectures, rooms, and time slots. The system will generate
            an optimized schedule based on your constraints.
          </p>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-800 dark:text-orange-200">Capacity Warnings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-orange-700 dark:text-orange-300">
                    • {warning}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && <ApiError error={error} onDismiss={() => setError(null)} />}

        {/* Loading State */}
        {loadingState.isLoading && <LoadingState message={loadingState.operation} />}

        {/* Problem Form */}
        <ProblemForm problem={problem} onChange={handleProblemChange} />

        <Separator />

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Generate schedules, validate existing ones, or manage your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {/* Primary Actions */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={!isFormValid || loadingState.isLoading}
                  className="flex items-center space-x-2"
                >
                  <Zap className="h-5 w-5" />
                  <span>Generate Schedule</span>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleGenerateAndValidate}
                  disabled={!isFormValid || loadingState.isLoading}
                  className="flex items-center space-x-2 bg-transparent"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Generate & Validate</span>
                </Button>
              </div>

              {/* Secondary Actions */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Button variant="secondary" onClick={handleLoadSampleData} className="flex items-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>Load Sample Data</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setShowValidateModal(true)}
                  disabled={!isFormValid || loadingState.isLoading}
                  className="flex items-center space-x-2"
                >
                  <FileText className="h-5 w-5" />
                  <span>Validate Existing Schedule</span>
                </Button>
              </div>



            </div>
          </CardContent>
        </Card>
      </div>

      <JsonModal
        isOpen={showProblemModal}
        onClose={() => setShowProblemModal(false)}
        title="Problem Data"
        description="Import or export your scheduling problem configuration"
        data={problem}
        schema={zSchedulingProblem}
        onImport={handleImportProblem}
        allowImport={true}
        allowExport={true}
      />

      <JsonModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Data"
        description="Export your last generated schedule"
        data={LocalStorage.loadSchedule()}
        schema={zSchedule}
        allowImport={false}
        allowExport={true}
      />

      <JsonModal
        isOpen={showValidateModal}
        onClose={() => setShowValidateModal(false)}
        title="Validate Schedule"
        description="Import a schedule JSON to validate against your current problem"
        schema={zSchedule}
        onImport={handleValidateExisting}
        allowImport={true}
        allowExport={false}
      />
    </div>
  )
}
