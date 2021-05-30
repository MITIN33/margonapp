export interface IDialogs {
    dialogId: string,
    name: string,
    photoUrl: string,
    lastMessage: string,
    lastMessageDateSent: number,
    unreadMessageCount: number,
    otherUserId: string,
    occupantsUserRef?: IChatUser[],
    isUserOnline?: boolean,
    isUserReadingChat?: boolean,
    isUserTyping?: boolean,
    isArchived?: boolean
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
    user: IChatUser,
    message: string,
    dialogId: string,
    readUserIds?: string[],
    deliveredUserIds?: string[],
    dateSent: number,
    attachments?: IAttachments,
    receiverUser?: IChatUser
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