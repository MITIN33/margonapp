import { action, makeObservable, observable } from "mobx";
import { margonServer } from "../api/axios-instance";
import { asyncStorage } from "../models/async-storage";
import { IAuthResponse } from "../models/chat-models";
import { clientConstants } from "../models/constants";

class AuthStore {

    //observables
    @observable
    public isUserSigned: boolean = false;

    public auth: IAuthResponse;

    constructor() {
        makeObservable(this)
    }

    @action
    public setUserSignedIn(value) {
        if (!value) {
            asyncStorage.removeKey(clientConstants.AUTH_STORAGE_KEY, () => { });
            asyncStorage.removeKey(clientConstants.USER_STORAGE_KEY, () => { });
        }
        this.isUserSigned = value;
    }


    public saveTokenInfo = async (authResponse) => {
        await asyncStorage.saveData(clientConstants.AUTH_STORAGE_KEY, authResponse);
        this.auth = authResponse;
    }

    public async Token() {
        var authResponse: IAuthResponse = await asyncStorage.getData(clientConstants.AUTH_STORAGE_KEY);

        //if time to expire token is less than 5 mins refresht the token
        if (authResponse) {
            if (authResponse.expiresAt < Math.round(Date.now() / 1000)) {
                try {
                    console.log("Token expired")
                    var httpResponse = await margonServer.post('/auth/token', { refreshToken: authResponse.refreshToken, grantType: 2 })
                    if (httpResponse.data) {
                        await asyncStorage.saveData(clientConstants.AUTH_STORAGE_KEY, httpResponse.data)
                        authResponse = httpResponse.data;
                        console.log('Token re-acquired successfully');
                    }
                } catch (error) {
                    console.log("Unable to acquire token");
                    if (error.response.status == 401) {
                        this.setUserSignedIn(false);
                    }
                }
            }

            return authResponse.token;
        }
        else {
            this.setUserSignedIn(false);
        }
    }
}

export const authStore = new AuthStore();