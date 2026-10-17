export interface LoginRequest{
    email:string,
    password:string
}

export interface LoginResponse{
    accessToken:string
    refreshToken:string
    accessTokenExpiry:number
    refreshTokenExpiry:number
    email: string
    role: string
}

export interface RefreshRequest{
    refreshToken:string
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
