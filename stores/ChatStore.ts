import { action, makeAutoObservable, makeObservable, observable } from "mobx";
import { margonAPI } from "../api/margon-server-api";
import { IDialogs } from "../models/chat-models";

class ChatStore {

    @observable
    public dialogs: IDialogs[] = []

    @observable
    public isDialogsLoading = true;

    /**
     *
     */
    constructor() {
        makeObservable(this)
    }

    public loadDialogs() {
        this.setIsDialogLoading(true);
        margonAPI.Dialogs().then((response) => {
            if (response.data) {
                this.loadData(response.data['items']);
            }
        }).finally(() => {
            this.setIsDialogLoading(false);
        });
    }

    @action
    public setIsDialogLoading(value) {
        this.isDialogsLoading = value;
    }

    @action
    public setDialogs(value) {
        this.dialogs = value;
    };

    @action
    public updateDialogWithId(dialogObj: IDialogs, text) {
        this.dialogs.map(x=>{
            if(x.dialogId == dialogObj.dialogId){
                x.lastMessage = text,
                x.lastMessageDateSent = this.getDate(Date.now()),
                x.unreadMessageCount = 0
            }
        })
    };


    private loadData = (dialogs: IDialogs[]) => {
        let list = []
        dialogs.map((val, key) => {
            list.push({
                userId: val.userId,
                otherUserId: val.otherUserId,
                dialogId: val.dialogId,
                name: val.name,
                photoUrl: val.photoUrl,
                lastMessage: val.lastMessage,
                lastMessageDateSent: this.getDate(val.lastMessageDateSent),
                unreadMessageCount: val.unreadMessageCount
            });
        });

        this.dialogs = list;
    }

    private getDate(epchTime) {
        var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
        d.setUTCMilliseconds(epchTime);

        let currentDate = Date.now()
        if (Math.abs(currentDate - epchTime) > 86400000) {
            return d.toLocaleDateString();
        }
        return this.dateTOAMORPM(d);
    }

    private dateTOAMORPM(currentDateTime) {
        var hrs = currentDateTime.getHours();
        var mnts = currentDateTime.getMinutes();
        var AMPM = hrs >= 12 ? 'PM' : 'AM';
        hrs = hrs % 12;
        hrs = hrs ? hrs : 12;
        mnts = mnts < 10 ? '0' + mnts : mnts;
        var result = hrs + ':' + mnts + ' ' + AMPM;
        return result;
    }
}


export const chatStore = new ChatStore();