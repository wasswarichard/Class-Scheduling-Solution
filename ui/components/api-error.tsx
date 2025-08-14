"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AlertTriangle, ChevronDown, ChevronRight, X } from "lucide-react"
import type { ApiError as ApiErrorType } from "@/lib/types"

interface ApiErrorProps {
  error: ApiErrorType
  onDismiss?: () => void
}

export function ApiError({ error, onDismiss }: ApiErrorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <AlertTitle>Error {error.status > 0 ? error.status : ""}</AlertTitle>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <AlertDescription className="mt-2">
          <div>{error.message}</div>
          {error.details && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-auto font-normal text-left">
                  {isOpen ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                  Technical Details
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">{error.details}</pre>
              </CollapsibleContent>
            </Collapsible>
          )}
        </AlertDescription>
      </div>
    </Alert>
  )
}
