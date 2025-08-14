"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Plus, Trash2, AlertCircle, HelpCircle } from "lucide-react"
import { generateUniqueId, validateTimeFormat, compareTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Column {
  key: string
  label: string
  type: "text" | "number" | "select" | "time"
  required?: boolean
  min?: number
  options?: Array<{ value: string; label: string }>
  helpText?: string
}

interface EntityTableProps {
  type: string
  data: any[]
  onChange: (data: any[]) => void
  columns: Column[]
}

export function EntityTable({ type, data, onChange, columns }: EntityTableProps) {
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({})
  const { toast } = useToast()

  useEffect(() => {
    const validateRow = (row: any, index: number, allData: any[]): Record<string, string> => {
      const rowErrors: Record<string, string> = {}

      columns.forEach((column) => {
        const value = row[column.key]

        // Required field validation
        if (column.required && (!value || value === "")) {
          rowErrors[column.key] = `${column.label} is required`
          return
        }

        // Type-specific validation
        if (value) {
          switch (column.type) {
            case "number":
              const num = Number(value)
              if (isNaN(num)) {
                rowErrors[column.key] = "Must be a valid number"
              } else if (column.min !== undefined && num < column.min) {
                rowErrors[column.key] = `Must be at least ${column.min}`
              }
              break

            case "time":
              if (!validateTimeFormat(value)) {
                rowErrors[column.key] = "Must be in HH:mm format"
              }
              break
          }
        }
      })

      // Time slot specific validation
      if (type === "timeSlot" && row.start && row.end) {
        if (validateTimeFormat(row.start) && validateTimeFormat(row.end)) {
          if (compareTime(row.start, row.end) >= 0) {
            rowErrors.end = "End time must be after start time"
          }
        }
      }

      // ID uniqueness validation
      const idColumn = columns.find((c) => c.key === "id")
      if (idColumn && row.id) {
        const duplicateIndex = allData.findIndex((item, i) => i !== index && item.id === row.id)
        if (duplicateIndex !== -1) {
          rowErrors.id = "ID must be unique"
        }
      }

      return rowErrors
    }

    const allErrors: Record<string, Record<string, string>> = {}
    data.forEach((row, index) => {
      const rowErrors = validateRow(row, index, data)
      if (Object.keys(rowErrors).length > 0) {
        allErrors[index] = rowErrors
      }
    })
    setErrors(allErrors)
  }, [data, columns, type])

  const addRow = () => {
    const existingIds = data.map((item) => item.id).filter(Boolean)
    const newId = generateUniqueId(type.charAt(0), existingIds)

    const newRow: any = { id: newId }
    columns.forEach((column) => {
      if (column.key !== "id") {
        switch (column.type) {
          case "number":
            newRow[column.key] = column.min || 0
            break
          case "select":
            newRow[column.key] = column.options?.[0]?.value || ""
            break
          default:
            newRow[column.key] = ""
        }
      }
    })

    const newData = [...data, newRow]
    onChange(newData)

    toast({
      title: "Row Added",
      description: `New ${type} added successfully`,
      variant: "success",
    })
  }

  const removeRow = (index: number) => {
    const newData = data.filter((_, i) => i !== index)
    onChange(newData)

    toast({
      title: "Row Removed",
      description: `${type} removed successfully`,
      variant: "success",
    })
  }

  const updateRow = (index: number, field: string, value: any) => {
    const newData = [...data]
    newData[index] = { ...newData[index], [field]: value }
    onChange(newData)
  }

  const renderCell = (row: any, column: Column, rowIndex: number) => {
    const value = row[column.key]
    const hasError = errors[rowIndex]?.[column.key]
    const cellId = `${type}-${rowIndex}-${column.key}`

    switch (column.type) {
      case "select":
        return (
          <Select value={value || ""} onValueChange={(newValue) => updateRow(rowIndex, column.key, newValue)}>
            <SelectTrigger
              className={hasError ? "border-red-500" : ""}
              aria-describedby={hasError ? `${cellId}-error` : undefined}
              aria-invalid={hasError ? "true" : "false"}
            >
              <SelectValue placeholder={`Select ${column.label}`} />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => updateRow(rowIndex, column.key, Number(e.target.value))}
            min={column.min}
            className={hasError ? "border-red-500" : ""}
            aria-describedby={hasError ? `${cellId}-error` : undefined}
            aria-invalid={hasError ? "true" : "false"}
            aria-label={`${column.label} for row ${rowIndex + 1}`}
          />
        )

      case "time":
        return (
          <Input
            type="time"
            value={value || ""}
            onChange={(e) => updateRow(rowIndex, column.key, e.target.value)}
            className={hasError ? "border-red-500" : ""}
            aria-describedby={hasError ? `${cellId}-error` : undefined}
            aria-invalid={hasError ? "true" : "false"}
            aria-label={`${column.label} for row ${rowIndex + 1}`}
          />
        )

      default:
        return (
          <Input
            type="text"
            value={value || ""}
            onChange={(e) => updateRow(rowIndex, column.key, e.target.value)}
            className={hasError ? "border-red-500" : ""}
            aria-describedby={hasError ? `${cellId}-error` : undefined}
            aria-invalid={hasError ? "true" : "false"}
            aria-label={`${column.label} for row ${rowIndex + 1}`}
          />
        )
    }
  }

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="space-y-2">
            <p>No {type}s added yet.</p>
            <p className="text-sm">Click "Add {type}" below to get started.</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={column.key}>
                        <div className="flex items-center space-x-1">
                          <span>
                            {column.label}
                            {column.required && <span className="text-red-500 ml-1">*</span>}
                          </span>
                          {column.helpText && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{column.helpText}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="w-[100px]">
                      <span className="sr-only">Actions</span>
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((column) => {
                        const hasError = errors[rowIndex]?.[column.key]
                        const cellId = `${type}-${rowIndex}-${column.key}`

                        return (
                          <TableCell key={column.key} className="relative">
                            {renderCell(row, column, rowIndex)}
                            {hasError && (
                              <div className="absolute -bottom-1 left-0 right-0 z-10">
                                <Badge
                                  variant="destructive"
                                  className="text-xs h-5"
                                  id={`${cellId}-error`}
                                  role="alert"
                                >
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {hasError}
                                </Badge>
                              </div>
                            )}
                          </TableCell>
                        )
                      })}
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRow(rowIndex)}
                              aria-label={`Remove ${type} ${rowIndex + 1}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Remove this {type}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        </div>
      )}

      <Button onClick={addRow} variant="outline" className="w-full bg-transparent" aria-label={`Add new ${type}`}>
        <Plus className="h-4 w-4 mr-2" />
        Add {type}
      </Button>
    </div>
  )
}
