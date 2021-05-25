import { action, makeObservable, observable } from "mobx";
import { firebaseApp } from "../api/firebase-config";

class AuthStore {

    //observables
    @observable
    public isUserSigned: boolean = false;

    public confirmationResult;

    constructor() {
        makeObservable(this)
    }

    @action
    public setUserSignedIn(value) {
        this.isUserSigned = value;
    }

    public async Token() {
        try {
            if (firebaseApp.auth().currentUser !== null) {
                var token = await firebaseApp.auth().currentUser.getIdToken();
                return token;
            }
        } catch (error) {
            console.error(error)
            this.setUserSignedIn(false);
        }
        return '';
    }
}

export const authStore = new AuthStore();