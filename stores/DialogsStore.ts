import { action, makeAutoObservable, observable } from "mobx";
import { margonAPI } from "../api/margon-server-api";
import { asyncStorage } from "../models/async-storage";
import { IChatUser, IDialogs, IMargonChatMessage, ScreenName } from "../models/chat-models";
import { userstore } from "./UserStore";


class DialogsStore {


    DIALOG_KEY = 'DIALOG_DATA';

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
        // this.saveDialogData();
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
        var dialog = this.dialogs.find(x => x.dialogId == chatMessage.dialogId);
        if (dialog) {
            dialog.lastMessage = chatMessage.message
            dialog.lastMessageDateSent = Date.now()
            dialog.unreadMessageCount = chatMessage.user._id === dialog.userId ? 0 : dialog.unreadMessageCount + 1
        }
        else {
            var newDialog: IDialogs = {
                dialogId: chatMessage.dialogId,
                lastMessageDateSent: chatMessage.dateSent,
                isUserOnline: true,
                lastMessage: chatMessage.message,
                unreadMessageCount: 1,
                name: chatMessage.user.name,
                photoUrl: chatMessage.user.avatar,
                otherUserId: chatMessage.user._id,
                userId: userstore.user.userId
            }
            this.dialogs.push(newDialog)
        }
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
        asyncStorage.getData('DIALOG_DATA')
            .then((data) => {
                if (data) {
                    this.setDialogList(data);
                    this.setIsDialogLoading(false);
                }
                margonAPI.Dialogs().then((response) => {
                    if (response.data) {
                        var dialogsResponse = response.data['items']
                        this.setDialogList(dialogsResponse);
                        this.saveDialogData(dialogsResponse)
                    }
                }).
                    catch((e) => console.log(e))
                    .finally(() => {
                        this.setIsDialogLoading(false);
                    });
            })
            .catch((e) => {
                console.log('Error in reading dialog data ' + e)
            })
    }

    private saveDialogData(dialogs) {
        asyncStorage.saveData(this.DIALOG_KEY, dialogs)
    }
}

export const dialogsStore = new DialogsStore();