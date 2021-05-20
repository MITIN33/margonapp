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
    public setUserIsReading(userId, isUserReading) {
        this.dialogs.map(x => {
            if (userId == x.userId) {
                x.isUserReadingChat = isUserReading;
            }
        });
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
    public addMessageToDialog(chatMessage: IMargonChatMessage) {
        // console.log('selected dialog id :' + chatMessage.dialogId);
        var dialog = this.dialogs.find(x => x.dialogId == chatMessage.dialogId);
        if (dialog) {
            dialog.lastMessage = chatMessage.message
            dialog.lastMessageDateSent = Date.now()
            dialog.unreadMessageCount = chatMessage.user._id === dialog.userId ? 0 : dialog.unreadMessageCount + 1
        }
        else {
            dialog = this.createDialog(chatMessage);
            this.dialogs.push(dialog)
            this.saveDialogData(this.dialogs);
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

    public clearDialog() {
        asyncStorage.removeKey(this.DIALOG_KEY, () => { });
    }

    private createDialog(chatMessage: IMargonChatMessage) {
        var newDialog: IDialogs = {
            dialogId: chatMessage.dialogId,
            lastMessageDateSent: chatMessage.dateSent,
            isUserOnline: true,
            lastMessage: chatMessage.message,
            unreadMessageCount: chatMessage.user._id == userstore.user.userId ? 0 : 1,
            name: chatMessage.receiverUser.name,
            photoUrl: chatMessage.receiverUser.avatar,
            userId: chatMessage.user._id,
            otherUserId: chatMessage.receiverUser._id
        }
        return newDialog;
    }

    private saveDialogData(dialogs) {
        asyncStorage.saveData(this.DIALOG_KEY, dialogs)
    }
}

export const dialogsStore = new DialogsStore();