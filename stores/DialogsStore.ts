import { action, makeAutoObservable, observable } from "mobx";
import { margonAPI } from "../api/margon-server-api";
import { asyncStorage } from "../models/async-storage";
import { IChatUser, IDialogs, IMargonChatMessage, ScreenName } from "../models/chat-models";
import { locationStore } from "./LocationStore";
import { userstore } from "./UserStore";


class DialogsStore {


    DIALOG_KEY = 'DIALOG_DATA';

    @observable
    public dialogs: IDialogs[] = [];

    @observable
    public nearByUsers: IChatUser[] = [];

    @observable
    public isDialogsLoading = true;

    @observable
    public isLoading = false;

    private savingData = false;

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
    public setIsLoading(value) {
        this.isLoading = value;
    }

    @action
    public setNearByUser(value) {
        this.nearByUsers = value;
    }

    @action
    public setUserIsTyping(userId, IsTyping) {
        this.dialogs.forEach(x => {
            if (x.otherUserId === userId) {
                x.isUserTyping = IsTyping;
            }
        });

        if (IsTyping)
            setTimeout(() => this.setUserIsTyping(userId, false), 5000);
    }

    @action
    public addMessageToDialog(chatMessage: IMargonChatMessage) {
        var dialog = this.dialogs.find(x => x.dialogId == chatMessage.dialogId);
        if (dialog) {
            dialog.lastMessage = chatMessage.message
            dialog.lastMessageDateSent = Date.now()
            dialog.unreadMessageCount = chatMessage.user._id === userstore.user.userId ? 0 : dialog.unreadMessageCount + 1
        }
        else {
            console.log('Creating new dialog ' + chatMessage.user.name)
            dialog = this.createDialog(chatMessage);
            this.dialogs.push(dialog)
            this.saveDialogData(this.dialogs);
        }
        this.setUserIsTyping(dialog.otherUserId, false);
    };

    @action
    public setUnMessageCountZero(dialogId: string) {
        this.dialogs.forEach(x => {
            if (x.dialogId == dialogId) {
                x.unreadMessageCount = 0
            }
        })
    };

    @action
    public markUserOnlineForDialog(userId: string, isUserOnline: boolean) {
        this.dialogs.forEach(x => {
            if (x.otherUserId == userId) {
                x.isUserOnline = isUserOnline
            }
        })
    };

    public loadNearByUsers = () => {
        this.setIsLoading(true);
        locationStore.getCurrentLocationAsync()
            .then((location => {
                margonAPI.NearbyUsers(location.coords.longitude, location.coords.latitude)
                    .then((response) => {
                        if (response.data) {
                            var users = response.data['items']
                            this.setNearByUser(users)
                        }
                    })
                    .finally(() => {
                        this.setIsLoading(false)
                    })
            }))
    }

    public loadDialogs() {
        this.setIsDialogLoading(true);
        asyncStorage.getData(this.DIALOG_KEY)
            .then((data) => {
                if (data !== null) {
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

    private createDialog(chatMessage: IMargonChatMessage) {

        let user: IChatUser
        if (chatMessage.user._id == userstore.user.userId) {
            user = chatMessage.receiverUser;
        } else {
            user = chatMessage.user
        }

        var newDialog: IDialogs = {
            dialogId: chatMessage.dialogId,
            lastMessageDateSent: chatMessage.dateSent,
            isUserOnline: true,
            lastMessage: chatMessage.message,
            unreadMessageCount: chatMessage.user._id == userstore.user.userId ? 0 : 1,
            name: user.name,
            photoUrl: user.avatar,
            otherUserId: user._id
        }

        return newDialog;
    }

    private async saveDialogData(dialogs: IDialogs[]) {
        if (!this.savingData) {
            this.savingData = true;
            var list = dialogs.slice();
            list.forEach(x => x.isUserOnline = false);
            await asyncStorage.saveData(this.DIALOG_KEY, list)
            this.savingData = false;
        }
    }
}

export const dialogsStore = new DialogsStore();