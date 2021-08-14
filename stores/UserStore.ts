import { action, makeObservable, observable } from 'mobx';
import { firebaseApp } from '../api/firebase-config';
import { margonAPI } from '../api/margon-server-api';
import { asyncStorage } from '../models/async-storage';
import { IUser } from '../models/chat-models';
import { authStore } from './AuthStore';
class UserStore {

    @observable
    public loading: boolean = true;

    @observable
    public user: IUser;

    private USER_DATA_KEY = 'USER_DATA_KEY';

    constructor() {
        makeObservable(this);
    }


    @action
    public setIsUserLoading(value) {
        this.loading = value;
    }

    @action
    public setUser(value) {
        this.user = value;
    }

    public loadUser = async (user) => {
        var cacheUser = await asyncStorage.getData(this.USER_DATA_KEY);
        if (user === null || cacheUser === null) {
            authStore.setUserSignedIn(false);
        }
        else {
            this.setUser(cacheUser);
            authStore.setUserSignedIn(true);
        }

        //fetch and update the user props from server
        this.refreshUser();

    }

    public async refreshUser() {
        try {
            var response = await margonAPI.Me()
            this.setUser(response.data);
            asyncStorage.saveData(this.USER_DATA_KEY, response.data);
            return response.data
        }
        catch (err) {
            console.log(err)
        }
    }

    public async addUser(user) {
        //pull latest info of user and update the object
        try {
            var user = await margonAPI.getOrAddUser(user)
            this.setUser(user);
            authStore.setUserSignedIn(true);
        } catch (error) { }

    }

    public async updateUser(user: IUser) {
        try {
            var user = await margonAPI.updateUser(user)
            this.setUser(user);
            asyncStorage.saveData(this.USER_DATA_KEY, user);
        } catch (error) { throw error }
    }


    public Logout = () => {
        firebaseApp.auth().signOut().then(() => {
            asyncStorage.clearAllData(() => {
                this.setUser(null);
                authStore.setUserSignedIn(false);
            })
        })
    }
}

export const userstore = new UserStore();