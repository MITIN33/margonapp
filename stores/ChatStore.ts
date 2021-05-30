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

    public selectedDialog: IDialogs;

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

    public addMessage(chatMessage: IMessage) {
        var newMessageList = GiftedChat.append(
            this.dialogMessages,
            [chatMessage],
            Platform.OS !== 'web',
        )
        this.setDialogMessages(newMessageList);
    }

    public markMessageDelivered(dialogId: string) {
        var newList = []
        var dialogForUser = dialogsStore.dialogs.find(x => x.dialogId == dialogId);
        this.dialogMessages.map(x => {
            newList.push({
                ...x,
                pending: false,
                sent: true
            })
        })
        this.setDialogMessages(newList);
    }

    public markMessageRead(userId, dialogId) {
        if (this.selectedDialog && this.selectedDialog.dialogId === dialogId) {
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
    }

    public async sendMessage(message) {
        var messageResponse = await margonAPI.SendMessage(message);
        return messageResponse.data;
    }

    public async loadChatMessagesForDialogId(dialog: IDialogs) {
        try {

            if (dialog.dialogId) {
                this.setIsLoadingMessage(true);
                asyncStorage.getData(dialog.dialogId)
                    .then((data) => {
                        if (data !== null) {
                            this.setDialogMessages(data);
                            this.setIsLoadingMessage(false);
                        }
                        margonAPI.GetChatList(dialog.dialogId, null)
                            .then((response) => {
                                if (response.data) {
                                    this.setDialogMessages(this.convertToLocaLChatMessages(response.data['items']));
                                    this.chatContinuationToken = response.data['continuationToken'];
                                    this.saveChat(dialog.dialogId, this.dialogMessages);
                                }
                            })
                    }).finally(() => this.setIsLoadingMessage(false));
            }
        } catch (error) {
            console.log(error)
            // this.setIsLoadingMessage(false)
        }
    }

    public unloadChatData(){
        this.saveChat(this.selectedDialog.dialogId, this.dialogMessages)
        this.setDialogMessages([])
        this.selectedDialog = null
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
                    this.saveChat(dialog.dialogId, this.dialogMessages);
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

    public saveChat(dialogId: string, messages: IMessage[]) {
        if (dialogId)
            asyncStorage.saveData(dialogId, messages);
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
                name: userstore.user.displayName,
                avatar: userstore.user.photoUrl
            };
        }
        return user
    }

}


export const chatStore = new ChatStore();