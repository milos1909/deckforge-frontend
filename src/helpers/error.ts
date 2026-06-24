const ERROR_MESSAGES: Record<string, string> = {
    USER_NOT_FOUND: 'Username or password is incorrect.',
    USERNAME_ALREADY_EXISTS: 'This username is already taken.',
    EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
    MISSING_FIELDS: 'Please fill in all required fields.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    NOT_FOUND: 'The requested item could not be found.',
    INVALID_TOKEN: 'Your session is invalid. Please log in again.',
    REFRESH_TOKEN_MISSING: 'Your session has expired. Please log in again.'
}

export function errorMessage(error: unknown, fallback = 'Something went wrong.') {
    if (!(error instanceof Error)) return fallback

    return ERROR_MESSAGES[error.message] ?? error.message ?? fallback
}
