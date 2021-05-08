import { makeAutoObservable } from 'mobx';
import { margonServer } from '../api/axios-instance';
import { asyncStorage } from '../models/async-storage';
import { AuthResponse, UserLoginRequest, UserModel } from '../models/user-models';

class UserStore {


    //non-observable
    public authToken: string = null;
    public user: UserModel = null;

    //observables
    public isUserSigned: boolean = false;
    public isUserloading: boolean = true;
    public userLoginRequest: UserLoginRequest = null;
    public USER_STORAGE_KEY = 'USER_STORAGE_KEY';
    public AUTH_STORAGE_KEY = 'AUTH_STORAGE_KEY';


    constructor() {
        makeAutoObservable(this, { authToken: false, user: false });
    }


    public setUserSignedIn(value) {
        this.isUserSigned = value;
    }

    public setIsUserLoading(value) {
        this.isUserloading = value;
    }

    public async fetchUser() {
        await this.loadTokenData()
        await this.loadUserData();

    }

    public loadTokenData = async () => {
        try {
            const authResponse = await asyncStorage.getData(this.AUTH_STORAGE_KEY)
            if (authResponse !== null) {
                if (Date.now > authResponse.expireAt) {
                    console.error('token expired logging out');
                    this.Logout();
                    return;
                }
                this.authToken = authResponse.token;
            } else {
                this.setUserSignedIn(false);
            }
        } catch (e) {
            alert('Failed to fetch the data from storage')
        }
    }

    public loadUserData = async () => {
        try {

            if (this.authToken == null) {
                console.log('token null');
                return;
            }
            const userResponse = await asyncStorage.getData(this.USER_STORAGE_KEY)
            if (userResponse !== null) {
                this.user = userResponse;
                this.setUserSignedIn(true);
            } else {
                var response = await margonServer.get('/me', { headers: { 'Authorization': `Bearer ${userstore.authToken}` } })
                this.user = response.data
                await this.saveUserInfo(this.user);
                this.setUserSignedIn(true);
            }
        }
        catch (e) {
            alert('Failed to fetch the data from storage')
        }
    }

    public saveTokenInfo = async (authResponse) => {
        try {
            await asyncStorage.saveData(this.AUTH_STORAGE_KEY, authResponse);
            this.setUserSignedIn(true);
        } catch (e) {
            console.error('Failed to save the data to the storage');
        }
    }

    public saveUserInfo = async (userResponse) => {
        try {
            await asyncStorage.saveData(this.USER_STORAGE_KEY, userResponse);
            console.log('Data successfully saved')
        } catch (e) {
            console.error('Failed to save the data to the storage');
        }
    }


    public Logout = () => {
        asyncStorage.removeKey(this.AUTH_STORAGE_KEY, () => { });
        asyncStorage.removeKey(this.USER_STORAGE_KEY, () => {
            this.setUserSignedIn(false);
            this.authToken = null;
            this.user = null;
        })
    }
}

export const userstore = new UserStore();