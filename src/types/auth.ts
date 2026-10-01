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