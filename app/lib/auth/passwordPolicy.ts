export const passwordPolicyItems = [
  "almeno 6 caratteri",
] as const;

export function validatePasswordStrength(password: string) {
  if (password.length < 6) {
    return "La password deve contenere almeno 6 caratteri.";
  }

  return null;
}
