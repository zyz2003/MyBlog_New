/**
 * Server plugin: validates critical environment variables at startup.
 * Runs only in production to prevent insecure configurations.
 */
export default defineNitroPlugin(() => {
  if (process.env.NODE_ENV !== 'production') return

  const secret = process.env.JWT_SECRET
  if (!secret || secret === 'dev-secret-change-in-production') {
    throw new Error(
      '[FATAL] JWT_SECRET environment variable must be set to a secure value in production. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"',
    )
  }
})
