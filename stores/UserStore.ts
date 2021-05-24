import { action, makeObservable, observable } from 'mobx';
import { firebaseApp } from '../api/firebase-config';
import { margonAPI } from '../api/margon-server-api';
import { asyncStorage } from '../models/async-storage';
import { clientConstants } from '../models/constants';
import { IUser } from '../models/user-models';
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

    public user: IUser;

    constructor() {
        makeObservable(this);
    }


    @action
    public setIsUserLoading(value) {
        this.isUserloading = value;
    }

    public setUser(value) {
        this.user = value;
    }

    @action
    public setIsFetchingNearbyUsers(value) {
        this.isFetchingNearbyUser = value;
    }


    @action
    public updateReadingChatMap(userId, value) {
        this.isUserReadingChatMap.set(userId, value);
    }

    public loadApp = async () => {
        if (firebaseApp.auth().currentUser === null) {
            authStore.setUserSignedIn(false)
            console.log('no user found')
            return;
        }

        //get the user from cache and set sign in true
        var cacheUser = await asyncStorage.getData(firebaseApp.auth().currentUser.uid);
        this.setUser(cacheUser);
        authStore.setUserSignedIn(true);

        //pull latest info of user and update the object
        margonAPI.getOrAddUser(this.getUserFirebaseApp())
            .then((user) => {
                this.setUser(user);
                asyncStorage.saveData(firebaseApp.auth().currentUser.uid, user)
            })
            .catch(() => { })
    }

    public Logout = () => {
        firebaseApp.auth().signOut().then(() => {
            asyncStorage.clearAllData(() => {
                this.user = null;
                authStore.setUserSignedIn(false);
            })
        })
    }

    public async validateCodeAndAddUser(code) {

        try {
            await authStore.confirmationResult.confirm(code);
        }
        catch (error) {
            throw new Error('Wrong code entered, please try again');
        }
        console.log('Code validated ');
        try {
            var user = await margonAPI.getOrAddUser(this.getUserFirebaseApp())
            asyncStorage.saveData(user.userId, user);
            this.setUser(user)
        } catch (error) {
            throw new Error('Unable to sign you in at the momemt, please try later');
        }

        authStore.setUserSignedIn(true);
    }


    private getUserFirebaseApp() {
        var firebaseUser = firebaseApp.auth().currentUser;
        const user: IUser = {
            displayName: firebaseUser.displayName,
            photoUrl: firebaseUser.photoURL ?? clientConstants.DEFAULT_IMAGE_URL,
            phoneNumber: firebaseUser.phoneNumber,
            userId: firebaseUser.uid,
            userName: firebaseUser.displayName,
            settings: {
                maxRangeInMeteres: 50000
            }
        }
        return user;
    }
}

export const userstore = new UserStore();