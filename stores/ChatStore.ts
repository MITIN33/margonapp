import { action, makeObservable, observable } from "mobx";
import { Platform } from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { margonAPI } from "../api/margon-server-api";
import { asyncStorage } from "../models/async-storage";
import { IDialogs, IMargonChatMessage } from "../models/chat-models";
import { dialogsStore } from "./DialogsStore";
import { userstore } from "./UserStore";

class ChatStore {

    @observable
    public dialogMessages: IMessage[] = []

    @observable
    public isOtherUserReadingChat: boolean;

    @observable
    public isUserTyping: boolean;

    @observable
    public isLoadingMessages: boolean;

    //private memebers
    private chatContinuationToken: string


    /**
     *
     */
    constructor() {
        makeObservable(this)
    }

    @action
    public setDialogMessages(messages) {
        this.dialogMessages = messages;
    }

    @action
    public setIsUserTyping(value) {
        this.isUserTyping = value;
    }

    @action
    public setIsLoadingMessage(value) {
        this.isLoadingMessages = value
    }

    @action
    public addMessage(chatMessage: IMessage) {
        var newMessageList = GiftedChat.append(
            this.dialogMessages,
            [chatMessage],
            Platform.OS !== 'web',
        )
        this.setDialogMessages(newMessageList);
    }

    public markMessageDelivered(chatMessage: IMessage) {
        var newList = []
        this.dialogMessages.map(x => {
            newList.push({
                ...x,
                pending: false,
                received: x.received,
                sent: true
            })
        })
        this.setDialogMessages(newList);
    }

    @action
    public markAllMessageRead(userId, isChatRead) {
        var newList = []
        this.dialogMessages.map(x => {
            newList.push({
                ...x,
                pending: false,
                received: true,
                sent: true
            })
        })

        this.setDialogMessages(newList);
    }

    public async loadChatMessagesForDialogId(dialog: IDialogs) {
        try {
            var response = await margonAPI.GetChatList(dialog.dialogId, null)
            if (response.data) {
                this.dialogMessages = this.convertToLocaLChatMessages(response.data['items']);
                this.chatContinuationToken = response.data['continuationToken'];
            }
        } catch (error) {
            throw error;
        }
    }

    public async loadEarlierChatMessagesForDialogId(dialog: IDialogs) {

        if (this.chatContinuationToken) {
            try {
                var response = await margonAPI.GetChatList(dialog.dialogId, this.chatContinuationToken)
                let messages: IMessage[] = [];
                if (response.data) {
                    messages = GiftedChat.prepend(
                        this.dialogMessages,
                        this.convertToLocaLChatMessages(response.data['items']),
                        Platform.OS !== 'web',
                    )
                    this.setDialogMessages(messages);
                    this.chatContinuationToken = response.data['continuationToken'];
                }
            } catch (error) {
                throw error;
            }
        }
    }

    public onMessageReceive = (message: IMargonChatMessage) => {
        var newMessageList = GiftedChat.append(
            this.dialogMessages,
            this.convertToLocaLChatMessages([message]),
            Platform.OS !== 'web',
        );
        this.setDialogMessages(newMessageList);
        this.setIsUserTyping(false);
    }


    private convertToLocaLChatMessages(margonChatMessages: IMargonChatMessage[]) {
        let messages: IMessage[] = [];
        margonChatMessages.map((message, k) => {
            var dialogForUser = dialogsStore.dialogs.find(x => x.dialogId == message.dialogId)
            if (dialogForUser) {
                messages.push({
                    _id: message.id,
                    createdAt: message.dateSent,
                    text: message.message,
                    user: this.getDialogUser(message.user._id),
                    sent: message.deliveredUserIds.includes(dialogForUser.otherUserId),
                    received: message.readUserIds.includes(dialogForUser.otherUserId)
                })
            }
        });

        return messages;
    }

    private getDialogUser(userId) {
        let user;
        const dialog = dialogsStore.dialogs.find(x => x.otherUserId == userId)
        if (dialog) {
            user = {
                _id: dialog.otherUserId,
                name: dialog.name,
                avatar: dialog.photoUrl
            }
        }
        else {
            user = {
                _id: userstore.user.userId,
                name: userstore.user.firstName,
                avatar: userstore.user.profilePicUrl
            };
        }
        return user
    }

}


export const chatStore = new ChatStore();