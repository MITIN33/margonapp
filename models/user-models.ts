export interface UserLoginRequest {
    userName: string,
    password: string
}


export interface UserModel {
    userName: string,
    firstName: string,
    lastName: string,
    profilePicUrl: string,
    phone: string,
    email: string
}

export interface AuthResponse {
    expireAt: string,
    token: string
}