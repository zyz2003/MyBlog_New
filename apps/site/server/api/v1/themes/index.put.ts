/**
 * PUT /api/v1/themes/active
 *
 * Set active theme
 * Requires authentication (admin role)
 *
 * Body:
 * - theme: string - Theme ID to activate
 *
 * Returns: Updated theme configuration
 */

import { defineEventHandler } from 'h3'
import { requireAuth } from '../../../middleware/auth'
import { setActiveTheme } from '../../../services/theme.service'
import { createSuccessResponse } from '../../../utils/response'
import { HTTPError } from '../../../utils/error'

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)

  // Parse request body - read from node.req.body for test compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = (event as any).node?.req?.body || (event as any)._body || {}
  const { theme } = body || {}

  if (!theme) {
    throw HTTPError.BAD_REQUEST('Theme ID is required')
  }

  // Set active theme
  const result = await setActiveTheme(theme)

  if (!result) {
    throw HTTPError.NOT_FOUND(`Theme '${theme}' not found`)
  }

  // Return success response
  return createSuccessResponse(result, 'Theme updated successfully')
})
