
export interface IDialogs {
    dialogId: string,
    name: string,
    photoUrl: string,
    lastMessage: string,
    lastMessageDateSent: string,
    unreadMessageCount: number,
    userId: string,
    otherUserId: string
}


export interface IChatResponse{
    userId: string,
    message: string,
    dialogId: string,
    readUserIds: [],
    deliveredUserIds: [],
    dateSent: BigInteger,
    attachments: IAttachments,
    id: string
}

export interface IChatRequest{
    message: string,
    dialogId: string,
    dateSent: number,
    attachments: IAttachments,
}


export interface IAttachments{
    id: string,
    url: string,
    type: MediaType
}


export enum MediaType {
    Image,
    Video
}