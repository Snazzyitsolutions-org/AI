export function getPasswordStrength(password: string) {
  if (!password) {
    return { score: 0, label: '' }
  }

  const checks = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const labels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong']

  return { score, label: labels[score] }
}
