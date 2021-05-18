
export interface IDialogs {
    dialogId: string,
    name: string,
    photoUrl: string,
    lastMessage: string,
    lastMessageDateSent: number,
    unreadMessageCount: number,
    userId: string,
    otherUserId: string,
    isUserOnline: boolean,
    isActive: boolean,
    isUserTyping: boolean
}
export interface IChatRequest {
    message: string,
    dialogId: string,
    dateSent: number,
    attachments: IAttachments,
}


export interface IAttachments {
    id: string,
    url: string,
    type: MediaType
}

export interface IAuthResponse {
    token: string,
    refreshToken: string,
    expiresAt: number
}

export interface IMargonChatMessage {
    id?: string,
    userId: string,
    message: string,
    dialogId: string,
    readUserIds?: string[],
    deliveredUserIds?: string[],
    dateSent: number,
    file: string,
}

export interface IChatUser {
    _id: string,
    name: string,
    avatar: string
}

export enum MediaType {
    Image,
    Video
}

export enum ScreenName {
    HomeScreen,
    ChatScreen
}