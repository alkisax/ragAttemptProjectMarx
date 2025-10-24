/* eslint-disable no-console */
import type { Response } from 'express'
import { ZodError } from 'zod'
import { DatabaseError, NotFoundError, ValidationError } from './errors.types'

interface HttpError extends Error {
  status?: number
}

export function handleControllerError(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      status: false,
      message: 'Validation failed',
      details: error.issues,
    })
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({
      status: false,
      message: error.message,
    })
  }

  if (error instanceof ValidationError) {
    return res.status(400).json({
      status: false,
      message: error.message,
    })
  }

  if (error instanceof DatabaseError) {
    return res.status(500).json({
      status: false,
      message: error.message || 'Database error',
    })
  }

  if (error instanceof Error) {
    // ✅ Narrowed to Error — safe to access message
    console.error('Error:', error.message)

    const httpError: HttpError = error
    const statusCode = httpError.status ?? 500

    return res.status(statusCode).json({
      status: false,
      message: error.message || 'Internal server error',
    })
  }

  // fallback for truly unknown non-Error values
  console.error('Unknown error object:', JSON.stringify(error))
  return res.status(500).json({
    status: false,
    message: 'Unknown error',
  })
}
