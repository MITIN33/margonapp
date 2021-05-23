export interface UserLoginRequest {
    userName: string,
    password: string
}


export interface IUser {
    userName: string,
    firstName: string,
    lastName: string,
    profilePicUrl: string,
    phone: string,
    email: string,
    userId: string
}

export interface AuthResponse {
    expireAt: string,
    token: string
}
