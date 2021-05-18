import { action, makeAutoObservable, observable } from "mobx";
import { margonAPI } from "../api/margon-server-api";
import { IDialogs, IMargonChatMessage, ScreenName } from "../models/chat-models";


class DialogsStore {

    @observable
    public dialogs: IDialogs[] = []

    @observable
    public isDialogsLoading = true;

    constructor() {
        makeAutoObservable(this)
    }

    @action
    public setDialogList(value) {
        this.dialogs = value;
    }


    @action
    public setIsDialogLoading(value) {
        this.isDialogsLoading = value;
    }

    @action
    public markDialogActive(dialogId) {
        this.dialogs.map(x => x.isActive = dialogId == x.dialogId)
    }

    @action
    public setUserIsTyping(userId, IsTyping) {
        this.dialogs.map(x => {
            if (x.otherUserId == userId) {
                x.isUserTyping = IsTyping;
            }
        });

        if (IsTyping)
            setTimeout(() => this.setUserIsTyping(userId, false), 5000);
    }

    @action
    public updateDialogWithMessage(chatMessage: IMargonChatMessage) {
        this.dialogs.map(x => {
            if (x.dialogId == chatMessage.dialogId) {
                x.lastMessage = chatMessage.message
                x.lastMessageDateSent = Date.now()
                x.unreadMessageCount = chatMessage.userId === x.userId ? 0 : x.unreadMessageCount + 1
            }
        })
    };

    @action
    public setUnMessageCountZero(dialogId: string) {
        this.dialogs.map(x => {
            if (x.dialogId == dialogId) {
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
        }).catch((e) => console.log(e))
            .finally(() => {
                this.setIsDialogLoading(false);
            });
    }
}

export const dialogsStore = new DialogsStore();