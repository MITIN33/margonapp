import { action, makeAutoObservable, makeObservable, observable } from 'mobx';
import { ToastAndroid } from 'react-native';
import { margonServer } from '../api/axios-instance';
import { margonAPI } from '../api/margon-server-api';
import { chatHubClient } from '../chats/chat-client';
import { asyncStorage } from '../models/async-storage';
import { AuthResponse, UserLoginRequest, UserModel } from '../models/user-models';

class UserStore {

    //observables
    @observable
    public isUserSigned: boolean = false;

    @observable
    public isUserloading: boolean = true;


    //non-observable
    public user: UserModel = null;
    public userLoginRequest: UserLoginRequest = null;
    public USER_STORAGE_KEY = 'USER_STORAGE_KEY';
    public AUTH_STORAGE_KEY = 'AUTH_STORAGE_KEY';

    constructor() {
        makeObservable(this);
    }


    @action
    public setUserSignedIn(value) {
        this.isUserSigned = value;
    }

    @action
    public setIsUserLoading(value) {
        this.isUserloading = value;
    }

    public async fetchUser() {
        var response = await margonAPI.Me();
        this.user = response.data
        await this.saveUserInfo(this.user);
        this.setUserSignedIn(true);
    }


    public init = async () => {
        await this.loadTokenData();
        this.user = await asyncStorage.getData(this.USER_STORAGE_KEY);
        if (this.user) {
            chatHubClient.createConnection(this.user.userId, margonAPI.authToken)
                .catch(() => {
                    ToastAndroid.show('Slow connection problem', ToastAndroid.SHORT);
                })
        }
        this.setUserSignedIn(this.user !== null);
    }

    public loadTokenData = async () => {
        try {
            const authResponse = await asyncStorage.getData(this.AUTH_STORAGE_KEY)
            if (authResponse !== null) {
                if (Date.now() > authResponse.expireAt) {
                    console.error('token expired logging out');
                    this.Logout();
                    return;
                }
                margonAPI.authToken = authResponse.token;
            }
        } catch (e) {
            alert('Failed to fetch the data from storage')
        }
    }

    public saveTokenInfo = async (authResponse) => {
        try {
            if (authResponse) {
                await asyncStorage.saveData(this.AUTH_STORAGE_KEY, authResponse);
                margonAPI.authToken = authResponse.token
            }
        } catch (e) {
            console.error('Failed to save the data to the storage:' + e.message);
        }
    }

    public saveUserInfo = async (userResponse) => {
        try {
            await asyncStorage.saveData(this.USER_STORAGE_KEY, userResponse);
        } catch (e) {
            console.error('Failed to save the data to the storage');
        }
    }


    public Logout = () => {
        asyncStorage.removeKey(this.AUTH_STORAGE_KEY, () => { });
        asyncStorage.removeKey(this.USER_STORAGE_KEY, () => {
            this.setUserSignedIn(false);
            this.user = null;
        })
    }
}

export const userstore = new UserStore();