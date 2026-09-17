// Shared auth input validation (pure functions, safe for client + server).
//
// The forms use these for instant feedback; the Server Actions re-run the
// same checks because client-side validation is never trusted. Supabase
// remains authoritative for anything policy-related (password strength,
// existing accounts, confirmation state).

export const MIN_PASSWORD_LENGTH = 6;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthValidationError = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) {
    return "Enter your email address.";
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return "Enter a valid email address.";
  }
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) {
    return "Enter your password.";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return undefined;
}

export function validateLoginInput(input: {
  email: string;
  password: string;
}): AuthValidationError {
  return {
    email: validateEmail(input.email),
    password: input.password ? undefined : "Enter your password.",
  };
}

export function validateSignupInput(input: {
  email: string;
  password: string;
  confirmPassword: string;
}): AuthValidationError {
  const errors: AuthValidationError = {
    email: validateEmail(input.email),
    password: validatePassword(input.password),
  };
  if (!input.confirmPassword) {
    errors.confirmPassword = "Repeat your password.";
  } else if (input.confirmPassword !== input.password) {
    errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}

export function hasValidationErrors(errors: AuthValidationError): boolean {
  return (
    errors.email !== undefined ||
    errors.password !== undefined ||
    errors.confirmPassword !== undefined
  );
}

export function firstValidationError(
  errors: AuthValidationError,
): string | undefined {
  return errors.email ?? errors.password ?? errors.confirmPassword;
}
