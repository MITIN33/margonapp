export interface UserLoginRequest {
    userName: string,
    password: string
}


export interface IUser {
    userName: string,
    displayName: string,
    photoUrl: string,
    userId: string,
    phoneNumber: string,
    settings: {
        maxRangeInMeteres: number
    }
}

export interface AuthResponse {
    expireAt: string,
    token: string
}
