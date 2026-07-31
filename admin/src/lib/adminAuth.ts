// Admin UIDs — only these users can access the admin panel
// Add your Firebase UID here (Firebase Console → Authentication → Users → copy UID)
export const ADMIN_UIDS: string[] = [
  // Your UID will be fetched from the first authenticated user that accesses admin
  // For now, we use email-based check
]

export const ADMIN_EMAILS: string[] = [
  // Add your admin email(s) here
  // Example: 'admin@fitasist.uz'
  // We'll check against currently logged in user's email
]

export function isAdminUser(uid: string | null, email: string | null): boolean {
  if (!uid && !email) return false
  if (ADMIN_UIDS.length > 0 && uid && ADMIN_UIDS.includes(uid)) return true
  if (ADMIN_EMAILS.length > 0 && email && ADMIN_EMAILS.some(e => e.toLowerCase() === email.toLowerCase())) return true
  // If no admin list configured yet, allow first authenticated user (dev mode)
  if (ADMIN_UIDS.length === 0 && ADMIN_EMAILS.length === 0) return true
  return false
}
