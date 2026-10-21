export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  google_not_configured:
    'Google sign-in is not configured yet. Add your Google OAuth credentials in backend/.env and restart the server.',
  google_cancelled: 'Google sign-in was cancelled. You can try again or sign in with email.',
  google_failed: "We couldn't complete Google sign-in. Please try again.",
  google_email_unverified:
    "Google didn't confirm this email address. Please try another Google account.",
  google_account_conflict:
    'This email is linked to a different Google account. Please use another sign-in method.',
}

export function getAuthErrorMessage(code: string | null): string | null {
  if (!code) return null
  return AUTH_ERROR_MESSAGES[code] || "We couldn't complete that sign-in. Please try again."
}
