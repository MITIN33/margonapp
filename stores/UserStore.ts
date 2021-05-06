import { makeAutoObservable } from 'mobx';
import { margonServer } from '../api/axios-instance';
import { asyncStorage } from '../models/async-storage';
import { UserLoginRequest, UserModel } from '../models/user-models';

class UserStore {


    //non-observable
    public user: UserModel = null;


    //observables
    public isUserSigned: boolean = false;
    public isUserloading: boolean = true;
    public userLoginRequest: UserLoginRequest = null;
    public USER_STORAGE_KEY = 'USER_STORAGE_KEY';

    constructor() {
        makeAutoObservable(this, { user: false });
    }


    public setLogin(value) {
        this.isUserSigned = value;
    }

    public setisUserLoading(value) {
        this.isUserloading = value;
    }

    public saveUserData(userModel: UserModel) {
        asyncStorage.saveData(this.USER_STORAGE_KEY, userModel);
        this.setLogin(true);
    }

    public loadUser() {
        asyncStorage.getData(this.USER_STORAGE_KEY)
            .then((user) => {
                if (user) {
                    this.user = user;
                    this.setLogin(true);
                }
            })
            .finally(() => {
                this.setisUserLoading(false);
            });
    }

    public Logout = () => {
        asyncStorage.removeKey(this.USER_STORAGE_KEY, () => {
            this.setLogin(false);
        })
    }
}

export const userstore = new UserStore();