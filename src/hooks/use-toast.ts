import * as React from "react"
import { toast as sonnerToast } from "sonner"

export interface ToastProps {
  id?: string
  title?: string
  description?: string
  action?: React.ReactNode
  duration?: number
  variant?: "default" | "destructive"
}

export function useToast() {
  const toast = React.useCallback((props: ToastProps) => {
    const { title, description, variant = "default", duration, ...rest } = props

    if (variant === "destructive") {
      return sonnerToast.error(title, {
        description,
        duration,
        ...rest,
      })
    }

    return sonnerToast(title, {
      description,
      duration,
      ...rest,
    })
  }, [])

  return { toast }
}

export const toast = (props: ToastProps) => {
  const { title, description, variant = "default", duration, ...rest } = props

  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      duration,
      ...rest,
    })
  }

  return sonnerToast(title, {
    description,
    duration,
    ...rest,
  })
}