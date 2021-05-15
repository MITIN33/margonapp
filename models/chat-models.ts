
export interface IDialogs {
    dialogId: string,
    name: string,
    photoUrl: string,
    lastMessage: string,
    lastMessageDateSent: number,
    unreadMessageCount: number,
    userId: string,
    otherUserId: string,
    isUserOnline: boolean
}


export interface IChatResponse {
    userId: string,
    message: string,
    dialogId: string,
    readUserIds: [],
    deliveredUserIds: [],
    dateSent: BigInteger,
    attachments: IAttachments,
    id: string
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
    readUserIds?: string,
    deliveredUserIds?: string,
    dateSent: number,
    attachments: IAttachments,
}

export enum MediaType {
    Image,
    Video
}

export enum ScreenName {
    HomeScreen,
    ChatScreen
}