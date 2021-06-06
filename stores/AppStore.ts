import { action, makeObservable, observable } from "mobx";

class AppSettings {
    @observable
    public isConnected: boolean;


    /**
     *
     */
    constructor() {
        makeObservable(this);
    }


    @action
    public setIsconnected(value){
        this.isConnected = value;
    }
}


export const appSettings = new AppSettings();