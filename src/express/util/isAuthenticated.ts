import { Request, Response, NextFunction } from "express"
import { UnauthorizedError } from "./UnauthorizedError"

/**
 * checks if the user is authenticated
 */
export function isAuthenticated() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await req.store.getAuthentication()
      return next()
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        res.status(e.statusCode).json({
          error: e.message,
          status: e.statusCode
        })
        return
      }
      throw e
    }
  }
}