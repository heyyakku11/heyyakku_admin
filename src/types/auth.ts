export interface LoginRequest{
    email:string,
    password:string
}

/** The session itself is an HttpOnly cookie; the body only carries the CSRF token for this session. */
export interface LoginResponse{
    csrfToken:string
}

/** The signed-in admin as the server sees them; fetched on load to restore the UI state. */
export interface SessionResponse{
    email: string
    role: string
    csrfToken: string
}

export interface RegisterRequest{
    email:string
    password:string
    secretCode:string
}

export interface RegistrationStepResponse{
    expiresInSeconds:number
}

export interface VerifyEmailRequest{
    token:string
}

export interface ForgotPasswordRequest{
    email:string
}

export interface ResetPasswordRequest{
    token:string
    newPassword:string
    confirmPassword:string
}

export interface ChangePasswordRequest{
    currentPassword:string
    newPassword:string
    confirmPassword:string
}
