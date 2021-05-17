import { action, makeAutoObservable, makeObservable, observable } from "mobx";
import { margonAPI } from "../api/margon-server-api";
import { IDialogs, IMargonChatMessage, ScreenName } from "../models/chat-models";

class ChatStore {

    @observable
    public dialogs: IDialogs[] = []

    @observable
    public isDialogsLoading = true;

    public messageForDialogs: Map<string, IMargonChatMessage[]> = new Map()
    private chatContinuationToken: string

    /**
     *
     */
    constructor() {
        makeObservable(this)
    }

    @action
    public setIsDialogLoading(value) {
        this.isDialogsLoading = value;
    }

    @action
    public setDialogList(value) {
        this.dialogs = value;
    }

    @action
    public updateDialogWithMessage(chatMessage: IMargonChatMessage, screenName: ScreenName) {
        this.dialogs.map(x => {
            if (x.dialogId == chatMessage.dialogId) {
                x.lastMessage = chatMessage.message
                x.lastMessageDateSent = Date.now()
                x.unreadMessageCount = screenName === ScreenName.ChatScreen ? 0 : x.unreadMessageCount + 1
            }
        })
    };

    @action
    public setUnReadCountToZero(dialogId) {
        this.dialogs.map(x => {
            if (x.dialogId === dialogId) {
                x.unreadMessageCount = 0
            }
        })
    };

    @action
    public markUserOnlineForDialog(userId: string, isUserOnline: boolean) {
        this.dialogs.map(x => {
            if (x.otherUserId == userId) {
                x.isUserOnline = isUserOnline
            }
        })
    };

    public loadDialogs() {
        this.setIsDialogLoading(true);
        margonAPI.Dialogs().then((response) => {
            if (response.data) {
                this.setDialogList(response.data['items']);
            }
        }).finally(() => {
            this.setIsDialogLoading(false);
        });
    }

    public async loadChatMessagesForDialogId(dialogId: string) {

        try {
            var response = await margonAPI.GetChatList(dialogId, null)
            let messages = [];
            if (response.data) {
                messages = response.data['items'];
                this.messageForDialogs.set(dialogId, messages)
                this.chatContinuationToken = response.data['continuationToken'];
            }
            return messages;
        } catch (error) {
            throw error;
        }
    }

    public async loadEarlierChatMessagesForDialogId(dialogId: string) {

        try {
            var response = await margonAPI.GetChatList(dialogId, this.chatContinuationToken)
            let messages = [];
            if (response.data) {
                messages = response.data['items'];
                this.chatContinuationToken = response.data['continuationToken'];
            }
            return messages;
        } catch (error) {
            throw error;
        }
    }
}


export const chatStore = new ChatStore();