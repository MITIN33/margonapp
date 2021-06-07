import { action, computed, makeAutoObservable, observable } from "mobx";
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
    public isDialogLoading = true;

    @observable
    public isLoadingNearByUsers = false;

    public selectedDialog: IDialogs = null;

    @action
    public setSelectedDialog(dialog) {
        this.selectedDialog = dialog;
    }

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
        this.isDialogLoading = value;
    }

    @action
    public setIsLoading(value) {
        this.isLoadingNearByUsers = value;
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
        }
        this.saveDialogData();
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

    @action
    public markDialogBlocked() {
        if (this.selectedDialog.blockedByUserIds.includes(userstore.user.userId)) {
            var filteredList = this.selectedDialog.blockedByUserIds.filter(x => x !== userstore.user.userId)
            this.selectedDialog.blockedByUserIds = filteredList;
        }
        else {
            this.selectedDialog.blockedByUserIds.push(userstore.user.userId)
        }
    }

    public isUserBlocked() {
        if (this.selectedDialog !== null) {
            return this.selectedDialog.blockedByUserIds.includes(this.selectedDialog.otherUserId);
        }
        return false;
    }

    public hasUserBlocked() {
        if (this.selectedDialog !== null && this.selectedDialog.blockedByUserIds) {
            return this.selectedDialog.blockedByUserIds.includes(userstore.user.userId);
        }
        return false;
    }

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
                        this.saveDialogData()
                    }
                })
                    .catch((e) => console.log(e))
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

    public async saveDialogData() {
        if (!this.savingData) {
            this.savingData = true;
            var list = this.dialogs.slice();
            list.forEach(x => x.isUserOnline = false);
            await asyncStorage.saveData(this.DIALOG_KEY, list)
            this.savingData = false;
        }
    }
}

export const dialogsStore = new DialogsStore();