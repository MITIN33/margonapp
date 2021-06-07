export interface IDialogs {
    dialogId: string,
    name: string,
    photoUrl: string,
    lastMessage?: string,
    lastMessageDateSent?: number,
    unreadMessageCount?: number,
    otherUserId: string,
    isUserOnline?: boolean,
    isUserReadingChat?: boolean,
    isUserTyping?: boolean,
    blockedByUserIds?: string[]
}

export interface IUser {
    userName?: string,
    displayName?: string,
    photoUrl?: string,
    userId?: string,
    phoneNumber?: string,
    bio?: string,
    maxRangeInKm?: number,
    isDiscoverable?: number,
    blockedUserList?: IChatUser[]
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
    avatar: string,
    distance?: number
}

export enum MediaType {
    Image,
    Video
}

export enum ScreenName {
    HomeScreen,
    ChatScreen
}


export interface ISettingsState {
    imageUri?: string,
    availibilityFlag?: boolean,
    distance?: number,
    displayName?: string,
    editableBoxVisible: boolean,
    distanceOverlayVisible: boolean,
    visible: boolean,
    list: MgListItem[],
    loading: boolean
}

export interface MgListItem {
    title: string,
    Subtitle?: () => any,
    renderRightWidget?: () => any | undefined,
    action?: any | undefined
}