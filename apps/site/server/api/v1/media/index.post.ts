/**
 * POST /api/v1/media
 *
 * Upload a file (image, document, etc.)
 * Requires authentication
 *
 * Request: multipart/form-data with 'file' field
 * - file: The file to upload (required)
 * - altText: Alternative text for accessibility (optional)
 * - folderId: Folder ID for organization (optional)
 *
 * Returns: Created media object
 * Requires: Authentication
 */

import { defineEventHandler, readMultipartFormData } from 'h3'
import { requireAuth } from '../../../middleware/auth'
import { uploadMedia } from '../../../services/media.service'
import { createSuccessResponse } from '../../../utils/response'
import { HTTPError } from '../../../utils/error'

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)

  // Parse multipart/form-data (support mock data for testing)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts = (event as any)._parts || (await readMultipartFormData(event))

  if (!parts || parts.length === 0) {
    throw HTTPError.BAD_REQUEST('No form data provided')
  }

  // Find the file part
  const filePart = parts.find((part) => part.name === 'file')

  if (!filePart) {
    throw HTTPError.BAD_REQUEST('No file provided')
  }

  // Get optional fields
  const altTextPart = parts.find((part) => part.name === 'altText')
  const folderIdPart = parts.find((part) => part.name === 'folderId')

  // Get file metadata
  const filename = filePart.filename || 'uploaded-file'
  const mimeType = filePart.type || 'application/octet-stream'
  const buffer = Buffer.from(filePart.data)

  // Prepare metadata
  const metadata = {
    filename,
    originalName: filename,
    mimeType,
    size: buffer.length,
    altText: altTextPart?.text.toString(),
    folderId: folderIdPart?.text.toString(),
  }

  // Get uploader ID from authenticated user
  const userId = event.context.user?.id

  // Upload file and create media record
  const mediaRecord = await uploadMedia(buffer, metadata, userId)

  // Return 201 Created with media data
  return createSuccessResponse(mediaRecord, 'File uploaded successfully')
})
