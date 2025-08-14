"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Download, Upload, CheckCircle, AlertTriangle } from "lucide-react"
import type { z } from "zod"

interface JsonModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  data?: any
  schema?: z.ZodSchema<any>
  onImport?: (data: any) => void
  allowImport?: boolean
  allowExport?: boolean
}

export function JsonModal({
  isOpen,
  onClose,
  title,
  description,
  data,
  schema,
  onImport,
  allowImport = true,
  allowExport = true,
}: JsonModalProps) {
  const [jsonText, setJsonText] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const handleValidateJson = () => {
    try {
      // First, try to parse as JSON
      const parsed = JSON.parse(jsonText)

      // Then validate with schema if provided
      if (schema) {
        const result = schema.safeParse(parsed)
        if (result.success) {
          setValidationErrors([])
          setIsValid(true)
        } else {
          const errors = result.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`)
          setValidationErrors(errors)
          setIsValid(false)
        }
      } else {
        setValidationErrors([])
        setIsValid(true)
      }
    } catch (error) {
      setValidationErrors([error instanceof Error ? error.message : "Invalid JSON format"])
      setIsValid(false)
    }
  }

  const handleImport = () => {
    if (isValid && onImport) {
      try {
        const parsed = JSON.parse(jsonText)
        onImport(parsed)
        onClose()
        setJsonText("")
        setValidationErrors([])
        setIsValid(null)
      } catch (error) {
        setValidationErrors([error instanceof Error ? error.message : "Failed to import JSON"])
        setIsValid(false)
      }
    }
  }

  const handleExport = () => {
    if (data) {
      const formatted = JSON.stringify(data, null, 2)
      setJsonText(formatted)
    }
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonText)
    } catch (error) {
      console.warn("Failed to copy to clipboard:", error)
    }
  }

  const handleDownload = () => {
    if (!jsonText) return

    const blob = new Blob([jsonText], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/json") {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setJsonText(content)
        setValidationErrors([])
        setIsValid(null)
      }
      reader.readAsText(file)
    }
    // Reset the input
    event.target.value = ""
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={allowImport ? "import" : "export"} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            {allowImport && (
              <TabsTrigger value="import" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </TabsTrigger>
            )}
            {allowExport && (
              <TabsTrigger value="export" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </TabsTrigger>
            )}
          </TabsList>

          {allowImport && (
            <TabsContent value="import" className="flex-1 flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => document.getElementById("file-upload")?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button variant="outline" size="sm" onClick={handleValidateJson} disabled={!jsonText.trim()}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Validate JSON
                </Button>
                {isValid !== null && (
                  <Badge variant={isValid ? "default" : "destructive"}>{isValid ? "Valid" : "Invalid"}</Badge>
                )}
              </div>

              <div className="flex-1 flex flex-col">
                <Textarea
                  placeholder="Paste your JSON here or upload a file..."
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value)
                    setValidationErrors([])
                    setIsValid(null)
                  }}
                  className="flex-1 min-h-[300px] font-mono text-sm"
                />
              </div>

              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">Validation Errors:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index} className="text-sm">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={!isValid}>
                  Import
                </Button>
              </div>
            </TabsContent>
          )}

          {allowExport && (
            <TabsContent value="export" className="flex-1 flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleExport} disabled={!data}>
                  <Download className="h-4 w-4 mr-2" />
                  Generate JSON
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyToClipboard} disabled={!jsonText}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} disabled={!jsonText}>
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </div>

              <div className="flex-1 flex flex-col">
                <Textarea
                  value={jsonText}
                  readOnly
                  className="flex-1 min-h-[300px] font-mono text-sm bg-muted"
                  placeholder="Click 'Generate JSON' to export your data..."
                />
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
