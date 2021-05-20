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
    public messagePerDialogsMap: Map<string, IMessage[]> = new Map()

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
    public setMessageForDialogId(dialogId, messages) {
        this.messagePerDialogsMap.set(dialogId, messages);
    }

    @action
    public setIsUserTyping(value) {
        this.isUserTyping = value;
    }

    @action
    public setIsLoadingMessage(value) {
        this.isLoadingMessages = value
    }

    public markMessageSent(dialogId: string, chatMessage: IMessage[]) {
        if (dialogId)
            this.setMessageForDialogId(dialogId, GiftedChat.append(
                this.messagePerDialogsMap.get(dialogId),
                chatMessage,
                Platform.OS !== 'web'
            ));
    }

    public markMessageDelivered(dialogId: string, chatMessage: IMessage[]) {
        if (this.messagePerDialogsMap.has(dialogId)) {
            console.log('dialog present: ' + dialogId)
            var messages = this.messagePerDialogsMap.get(dialogId).slice();
            var dialogForUser = dialogsStore.dialogs.find(x => x.dialogId == dialogId)
            messages.map((x) => {
                if (x._id === chatMessage[0]._id) {
                    x.pending = false
                    x.received = dialogForUser.isUserReadingChat
                    x.sent = true
                }
            })
            this.setMessageForDialogId(dialogId, messages);
        } else {
            console.log('dialog absent: ' + dialogId)
            this.setMessageForDialogId(dialogId, chatMessage);
        }
    }

    public markAllMessageRead = (userId, isChatRead) => {
        dialogsStore.setUserIsReading(userId, isChatRead);
        if (isChatRead) {
            var dialogForUser = dialogsStore.dialogs.find(x => x.otherUserId === userId);
            var messages = this.messagePerDialogsMap.get(dialogForUser.dialogId)
            var newMessageList = []
            if (messages) {
                messages.map(message => {
                    newMessageList.push({ ...message, pending: false, sent: true, received: dialogForUser.isUserReadingChat })
                })
                this.setMessageForDialogId(dialogForUser.dialogId, newMessageList);
            }
        }
    }

    public async loadChatMessagesForDialogId(dialog: IDialogs) {
        try {
            var response = await margonAPI.GetChatList(dialog.dialogId, null)
            let messages: IMessage[] = [];
            if (response.data) {
                messages = this.convertToLocaLChatMessages(response.data['items']);
                this.setMessageForDialogId(dialog.dialogId, messages)
                this.chatContinuationToken = response.data['continuationToken'];
            }
        } catch (error) {
            throw error;
        }
    }

    public async loadEarlierChatMessagesForDialogId(dialog: IDialogs) {

        try {
            var response = await margonAPI.GetChatList(dialog.dialogId, this.chatContinuationToken)
            let messages: IMessage[] = [];
            if (response.data) {
                messages = GiftedChat.prepend(
                    this.messagePerDialogsMap.get(dialog.dialogId),
                    this.convertToLocaLChatMessages(response.data['items']),
                    Platform.OS !== 'web',
                )
                this.setMessageForDialogId(dialog.dialogId, messages)
                this.chatContinuationToken = response.data['continuationToken'];
            }
        } catch (error) {
            throw error;
        }
    }

    public onMessageReceive = (message: IMargonChatMessage) => {

        var newMessageList = GiftedChat.append(
            this.messagePerDialogsMap.get(message.dialogId),
            this.convertToLocaLChatMessages([message]),
            Platform.OS !== 'web',
        );
        this.setIsUserTyping(false);
        this.setMessageForDialogId(message.dialogId, newMessageList);
    }


    /*
    *Private methods
    */

    private saveChatToLocalStore(messagePerDialogMap) {
        asyncStorage.saveData('CHAT_DATA', messagePerDialogMap)
    }

    private async loadchatForDialogFromLocalStore() {
        try {
            this.messagePerDialogsMap = await asyncStorage.getData('CHAT_DATA')
        } catch (error) {
            throw error;
        }
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