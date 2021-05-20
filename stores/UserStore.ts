import { action, makeObservable, observable } from 'mobx';
import { margonAPI } from '../api/margon-server-api';
import { asyncStorage } from '../models/async-storage';
import { clientConstants } from '../models/constants';
import { UserLoginRequest, UserModel } from '../models/user-models';
import { authStore } from './AuthStore';

class UserStore {

    @observable
    public isUserloading: boolean = true;

    @observable
    public isUserOnlineMap: Map<string, boolean> = new Map<string, boolean>();

    @observable
    public isUserReadingChatMap: Map<string, boolean> = new Map<string, boolean>();

    @observable
    public isFetchingNearbyUser: boolean;

    //non-observable
    public user: UserModel = null;
    public userLoginRequest: UserLoginRequest = null;

    constructor() {
        makeObservable(this);
    }


    @action
    public setIsUserLoading(value) {
        this.isUserloading = value;
    }

    @action
    public setIsFetchingNearbyUsers(value) {
        this.isFetchingNearbyUser = value;
    }


    @action
    public updateReadingChatMap(userId, value) {
        this.isUserReadingChatMap.set(userId, value);
    }

    public async fetchUser() {
        var response = await margonAPI.Me();
        this.user = response.data
        await this.saveUserInfo(this.user);
    }


    public init = async () => {
        this.user = await asyncStorage.getData(clientConstants.USER_STORAGE_KEY);
        authStore.setUserSignedIn(this.user !== null);
    }

    public setLoginData = async (authResponse) => {
        await authStore.saveTokenInfo(authResponse)
        await this.fetchUser();
        authStore.setUserSignedIn(true);
    }

    public saveUserInfo = async (userResponse) => {
        try {
            await asyncStorage.saveData(clientConstants.USER_STORAGE_KEY, userResponse);
        } catch (e) {
            console.error('Failed to save the data to the storage');
        }
    }

    public Logout = () => {
        authStore.setUserSignedIn(false);
    }
}

export const userstore = new UserStore();