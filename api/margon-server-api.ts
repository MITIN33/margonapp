import { authStore } from "../stores/AuthStore";
import { margonServer } from "./axios-instance";

class MargonAPI {

    public async Me() {
        var authtoken = await authStore.Token();
        var response = await margonServer.get('/me', { headers: { 'Authorization': `Bearer ${authtoken}` } });
        return response;
    }

    public async Login(userLoginRequest) {
        var response = await margonServer.post('/auth/token', userLoginRequest);
        return response;
    }

    public async SignUp(userSignRequest) {
        var response = await margonServer.post('/auth/signup', userSignRequest);
        return response;
    }

    public async Dialogs() {
        var authtoken = await authStore.Token();
        var response = await margonServer.get('/dialogs', { params: { limit: 10 }, headers: { 'Authorization': `Bearer ${authtoken}` } });
        return response;
    }

    public async GetChatList(dialogId: string, continuationToken: string) {
        var authtoken = await authStore.Token();
        var response = await margonServer.get(`/dialogs/${dialogId}/chats`, { params: { limit: 10, continuationToken }, headers: { 'Authorization': `Bearer ${authtoken}` } });
        return response;
    }
}


export const margonAPI = new MargonAPI();