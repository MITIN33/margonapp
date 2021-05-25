import { action, makeObservable, observable } from 'mobx';
import { firebaseApp } from '../api/firebase-config';
import { margonAPI } from '../api/margon-server-api';
import { asyncStorage } from '../models/async-storage';
import { IUser } from '../models/user-models';
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
        if (cacheUser === null && user === null) {
            authStore.setUserSignedIn(false);
        }
        else {
            this.setUser(cacheUser);
            authStore.setUserSignedIn(true);
        }

        //fetch and update the user props from server
        margonAPI.Me()
            .then((response) => {
                this.setUser(response.data);
                asyncStorage.saveData(this.USER_DATA_KEY, response.data);
            })
            .catch(() => { })
    }

    public async addUser(user) {
        //pull latest info of user and update the object
        try {
            var user = await margonAPI.getOrAddUser(user)
            this.setUser(user);
            authStore.setUserSignedIn(true);
        } catch (error) { }

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