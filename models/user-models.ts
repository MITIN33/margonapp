export interface IUser {
    userName?: string,
    displayName?: string,
    photoUrl?: string,
    userId?: string,
    phoneNumber?: string,
    settings?: {
        maxRangeInMeteres: number
    }
}